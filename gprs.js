var ArrayBuffers = require("array-buffers");
module.exports = {
  crc16: function(msg){
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

    var data = []
    for($i = 7;$i < message.length - 3; $i++)
      data.push(message[$i])

    var commands = module.exports.commands()

    var action = ''
    if(message[6] >= 0 && message[6] <=12)
      action = commands[message[6]]

    var crc = message[message.length - 3] + (message[message.length - 2]<<8)

    var imei = 0
    for($i = data.length - 2; $i>=0; $i--)
      imei = (imei<<8) + data[$i]

    var packet = {
      sop: message[0]
      , prot: message[1]
      , len: message[2] + (message[3]<<8)
      , ref: message[4] + (message[5]<<8)
      , cmd: message[6]
      , data: {
        action: action
        , imei: imei
        , type: data[data.length - 1]
        , crc: message[message.length - 3] + (message[message.length - 2]<<8)
        //, raw: data
      }
      , crc: crc
      , eop: message[message.length - 1]
      //, raw: message
    }

    // validate valid packet
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
