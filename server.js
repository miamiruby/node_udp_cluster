//NODE_DEBUG=cluster node server.js
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var nconf = require('nconf');
var config = nconf
config.argv()
      .env()
      .file({ file: './config.json' });



//console.log('name: ' + config.get('name'));
//console.log('NODE_ENV: ' + config.get('NODE_ENV'));
//console.log('database: ' + config.get('database:name'));
//process.exit(1);

var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/'+ config.get('NODE_ENV')+ '.log' })
  ]
});

if (cluster.isMaster) {

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    logger.error('worker ' + worker.process.pid + ' died');
  });

} else {

  var PORT = config.get('port');
  var dgram = require('dgram');
  var server = dgram.createSocket('udp4');

  server.on('listening', function () {
      var address = server.address();
      logger.info('UDP Server listening on ' + address.address + ":" + address.port);
  });

  server.on('message', function (message, remote) {
    //winston.profile('worker');
    var header = 'Worker ' + cluster.worker.id + ': ' + remote.address + ':' + remote.port +' - ';
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
    logger.info(header);
    //winston.profile('Worker '+cluster.worker.id);
    //logger.info(results);
  });

  server.bind(PORT);
}
