module.exports = {
  decrypt: function(message) {
    //results['raw'] = '';
    //for (var i = 0; i < message.length; i++)
    //  results['raw'] += message[i] + ',';
    //  //remote ENTER characters
    //  if(message[i] != '13')
    //    //remote start of packet
    //    if(message[i] != '40')
    //      //remote end of packet
    //      if(message[i] != '41')
    //        content += '  ' + message[i];
    //results['raw']  = results['raw'].substring(0, results['raw'].length - 1)
    var message_array = message
    return {
        sop: message_array[0]
      , prot: ''
      , len: ''
      , ref: ''
      , cmd: ''
      , data: ''
      , crc: ''
      , eop: ''
      //, unit_id: ''
      //, lat: ''
      //, lng: ''
      , raw: message
      }
  },
  encrypt: function(hash) {
    return '40 22 44 55 66 77 23 44 13'
  }
}
