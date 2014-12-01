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

    var cmd = message[6]

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

    var id_length = (message[6]>>6)+1
    var id_set = []
    for(i = 0;i<id_length;i++)
      id_set.push(message[8 + i])

    var id = 0
    for($i = id_set.length - 1; $i>=0; $i--){
      id = (id<<8) + id_set[$i]
    }
    var data = {}

    data.action = action
    data.inputs = (message[7]& 0xF)
    data.outputs = (message[7] & 0x70)>>4
    data.id = id
    data.time = ''
    data.lat = ''
    data.lng = ''
    data.alt = ''
    data.speed = ''
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
      , len: len
      , ref: ref
      , flg: flg
      , cmd: cmd
      , datalogger: ''
      , id_length: id_length
      , id_set: id_set
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
