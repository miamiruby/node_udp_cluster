var moment = require('moment')
require('moment-timezone')
module.exports = {
  clean_packet: function(packet){
    //convert packet to array
    var cleaned_packet = []
    for(i=0;i<packet.length;i++)
      cleaned_packet[i] = packet[i]
    //find first 123 and remove all garbage before it
    cleaned_packet = cleaned_packet.slice(cleaned_packet.indexOf(123),cleaned_packet.length)
    //find length of packet and remove garbage at end
    var length_of_packet = cleaned_packet[2] + (cleaned_packet[3]<<8)
    cleaned_packet = cleaned_packet.slice(0,length_of_packet)

    return cleaned_packet
  }
  , crc16: function(msg){
    var packet = []
    for(i=0;i<msg.length;i++)
      packet[i] = msg[i]
    var inner_packet = packet.slice(1, msg.length - 3)
    var x
    , crc = 0
    for (i=0; i < inner_packet.length; i++){
      x = ((crc >> 8) ^ inner_packet[i]) & 0xFF;
      x ^= x >> 4;
      crc = (crc << 8)^ (x << 12) ^ (x << 5) ^ x;
    }
    return (crc & 0xFFFF)
  }
  ,commands: function(){
    return {
      0: 'position'
      , 1: 'free_text_message'
      , 2: 'format_message' // Format (fields of a type and length) message
      , 3: 'coded_message'
      , 4: 'ibutton_data'
      , 5: 'files_transfer'
      , 6: 'compressed_positions'
      , 7: 'acknowledge_messages'
      , 8: 'external_messages' //External messages from devices like Refrigeration
      , 9: 'compressed_positions'  //Compressed positions with Coded message
      , 10: 'ibutton_data'   //iButton data with additional chain of compressed positions
      , 11: 'setup_requests'  //Setup requests and answers using IMEI
      , 12: 'firmware_request'  //Firmware request and answer using IMEI
    }
  }
  , decrypt: function(message) {
    message = module.exports.clean_packet(message)

    var data = []
    for($i = 7;$i < message.length - 3; $i++)
      data.push(message[$i])

    var commands = module.exports.commands()

    var cmd_position = 6
    var cmd = message[cmd_position]

    var action = ''
    if(message[6] >= 0 && message[6] <=12)
      action = commands[message[6]]

    var crc = message[message.length - 3] + (message[message.length - 2]<<8)

    var imei = 0
    for($i = data.length - 2; $i>=0; $i--)
      imei = (imei<<8) + data[$i]

    var prot_flag = (message[1] & 0xF)

    var ack_flag = false
    if(message[1] & 0x20)
      var ack_flag = true

    var cellid_flag = false
    if(message[1] & 0x40)
      var cellid_flag = true

    var gps_flag = false
    if(message[1] & 0x80)
      var gps_flag = true

    var len = message[2] + (message[3]<<8)

    var ref = message[4]

    var flg = message[5]

    var odometer_flag = false
    if(flg & 0x4)
      odometer_flag = true

    var headed_south = message[5] & 1
    var headed_west = message[5] & 2

    if(headed_south == 0)
      var north_or_south = 'north'
    else
      var north_or_south = 'south'

    if(headed_west == 0)
      var east_or_west = 'east'
    else
      var east_or_west = 'west'

    var datalogger = message[6] & 0x20

    var id_position = 8
    var id_length = (message[cmd_position]>>6)+1

    var id_set = []
    for(i = 0;i<id_length;i++)
      id_set.push(message[8 + i])

    var id = 0
    for($i = id_set.length - 1; $i>=0; $i--){
      id = (id<<8) + id_set[$i]
    }

    var time_position = id_position + id_length
    var time_length = 4
    var time_set = [message[time_position]
      , message[time_position+1]
      , message[time_position+2]
      , message[time_position+3]
    ]
    //var time_since = parseInt(message[time_position].toString()
    //  + message[time_position+1].toString()
    //  + message[time_position+2].toString()
    //  + message[time_position+3].toString())
    var time_since = 0
    for($i = time_set.length - 1; $i>=0; $i--){
      time_since = (time_since<<8) + id_set[$i]
    }
    var time_since = time_set[0]+(time_set[1]<<8)+(time_set[2]<<16)+(time_set[3]<<24)
    var time = moment([2000, 0, 1])
      .add(time_since, 'seconds')
      .tz('America/New_York')
      .format('ddd MMM DD YYYY HH:mm:ss z');
    var unixtime = moment([2000, 0, 1])
      .add(time_since, 'seconds')
      .tz('America/New_York')
      .format('x');//'ddd MMM DD YYYY HH:mm:ss z');

    var lat_position = time_position + time_length
    var lat_length = 3
    var lat_set = [message[lat_position]
      , message[lat_position+1]
      , message[lat_position+2]
    ]
    var lat = ''
    for($i = lat_set.length - 1; $i>=0; $i--){
      lat = (lat<<8) + lat_set[$i]
    }
    var lat = (lat/3600/32).toFixed(6)

    var lng_position = lat_position + lat_length
    var lng_length = 3
    var lng_set = [message[lng_position]
      , message[lng_position+1]
      , message[lng_position+2]
    ]
    var lng = ''
    for($i = lng_set.length - 1; $i>=0; $i--){
      lng = (lng<<8) + lng_set[$i]
    }
    var lng = ((lng/3600)/25).toFixed(6)

    var alt_position = lng_position + lng_length
    var alt_length = 2
    var alt_set = [message[alt_position]
      , message[alt_position+1]
    ]
    var alt = ''
    for($i = alt_set.length - 1; $i>=0; $i--){
      alt = (alt<<8) + alt_set[$i]
    }

    var speed_position = alt_position + alt_length
    var speed_length = 1
    var speed = message[speed_position]
    var next_position = speed_position + speed_length

    odometer_set = []
    var odometer = ''
    if(odometer_flag == true){
      var odometer_length = 4
      odometer_set = [message[next_position]
        , message[next_position+1]
        , message[next_position+2]
        , message[next_position+3]
      ]
      for($i = odometer_set.length - 1; $i>=0; $i--){
        odometer = (odometer<<8) + odometer_set[$i]
      }
      var next_position = next_position + odometer_length
    }
    console.log(next_position)

    var data = {}
    data.action = action
    data.inputs = (message[7]& 0xF)
    data.outputs = (message[7] & 0x70)>>4
    data.id = id
    data.time = time
    data.unixtime = unixtime
    data.lat = lat
    data.lng = lng
    data.alt = alt
    data.speed = speed
    if(odometer_flag)
      data.odometer = odometer
    else
      data.odometer = ''
    data.cellid = ''
    data.cod = ''
    data.csigs = ''
    data.ibtn = ''
    data.bat = ''
    data.params = ''

    var packet = {
        sop: message[0]
      , prot: prot_flag
      , ack_flag: ack_flag
      , cellid_flag: cellid_flag
      , gps_flag: gps_flag
      , odometer_flag: odometer_flag
      , len: len
      , ref: ref
      , flg: flg
      , cmd: cmd
      , datalogger: datalogger
      , id_length: id_length
      , id_position: id_position
      , id_set: id_set
      , time_position: time_position
      , time_set: time_set
      , time_since: time_since
      , lat_set: lat_set
      , lng_set: lng_set
      , alt_set: alt_set
      , odometer_set: odometer_set
      , headed_south: headed_south
      , north_or_south: north_or_south
      , east_or_west: east_or_west
      , data: data
      , crc: crc
      , eop: message[message.length - 1]
      //, raw: message
    }

    // validate valid packet
    console.log(packet)
    if(packet.sop == 123 && packet.prot == 1 && packet.eop == 125){

      //validate packet was not modified
      if(module.exports.crc16(message) == crc){
        var results = { data: packet.data }
      } else {
        var results = { err: 'CRC Invalid', data: {} }
      }

    } else {

      var results = { err: 'Invalid Packet', data: {} }

    }

    return results
  },
  encrypt: function(hash) {
    return '40 22 44 55 66 77 23 44 13'
  }
}
