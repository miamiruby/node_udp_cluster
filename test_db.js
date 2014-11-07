var fs = require('fs');
var ap = require('./lib/ap');
eval(fs.readFileSync('db.js')+'');
eval(fs.readFileSync('models.js')+'');


User.findAll().on('success',function(users) {
  ap(users[1])
})
