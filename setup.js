//to setup a config run this
//node setup_config.js

var nconf = require('nconf');

nconf.use('file', { file: './config.json' });
nconf.load();
nconf.set('name', 'guarddog_gateway');
nconf.set('NODE_ENV', 'development');
nconf.set('port', '1732');
nconf.set('database:name', 'gateway_dev');
nconf.set('database:username', 'gateway_dev');
nconf.set('database:password', 'chocolate');

nconf.save(function (err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Configuration saved successfully.');
});
