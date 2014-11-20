//NODE_DEBUG=cluster node server.js
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var nconf = require('nconf');
var winston = require('winston');
var gprs = require("./gprs");


var config = nconf
config.argv()
      .env()
      .file({ file: './config.json' });

//console.log('name: ' + config.get('name'));
//console.log('NODE_ENV: ' + config.get('NODE_ENV'));
//console.log('database: ' + config.get('database:name'));
//process.exit(1);

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/'+ config.get('NODE_ENV')+ '.log' })
  ]
});

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
    var data = gprs.decrypt(message)
    logger.info('m: ' + message)
    logger.info('Worker ' + cluster.worker.id + ': ' + remote.address + ':' + remote.port +' -> ' + JSON.stringify(data, null, 2));
    //logger.info('Worker ' + cluster.worker.id + ': ' + remote.address + ':' + remote.port +' -> ' + data);
  });

  server.bind(PORT);
}
