var Sequelize = require('sequelize')

var db = new Sequelize('guarddog_dev', 'pkruger', '', {
dialect: 'postgres'
})

db
  .authenticate()
  .complete(function(err) {
      if (!!err) {
        console.error('Unable to connect to the database:', err)
      }
  })

