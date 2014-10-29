var PORT = 1732;
//var HOST = '127.0.0.1';
var HOST = '172.16.3.234';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
  var header = remote.address + ':' + remote.port +' - ';
  var content = 'c: ';
  var results = [];
  results['raw'] = '';
  for (var i = 0; i < message.length; i++)
    results['raw'] += message[i] + ',';
    //remote ENTER characters
    if(message[i] != '13')
      //remote start of packet
      if(message[i] != '40')
        //remote end of packet
        if(message[i] != '41')
          content += '  ' + message[i];
  console.log(header);
  console.log(content);
  console.log(results);
});

server.bind(PORT, HOST);
