var cl = (function () {
    return function(){
        console.log('Starting client')
        var PORT = 1732;
        //var HOST = '10.143.80.62';
        var HOST = '127.0.0.1';
        var dgram = require('dgram');
        //var message = new Buffer('40,20,36,130,178,41,  Turn OFF Engine');

        //v2
        var message = new Buffer('123,1,19,0,1,0,12,1,120,249,33,184,63,1,0,0,142,211,125', "binary");
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + HOST +':'+ PORT);
            console.log('Bytes: ' + bytes);
            client.close()
        });
    }
})();

var cnt = process.argv[2] ? process.argv[2] : 1
for($i=0;$i < cnt;$i++)
  cl();
