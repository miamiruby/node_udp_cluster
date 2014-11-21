module.exports = {
  decrypt: function(message) {
    var data = []
    for($i = 7;$i < message.length - 3; $i++)
      data.push(message[$i])
    return {
        sop: message[0]
      , prot: message[1]
      , len: message[2] + (message[3] * 256)
      , ref: message[4] + (message[5] * 256)
      , cmd: message[6]
      , data: data
      , crc: message[message.length - 3] + (message[message.length - 2] * 256)
      , eop: message[message.length - 1]
      , raw: message
      }
  },
  encrypt: function(hash) {
    return '40 22 44 55 66 77 23 44 13'
  }
}
