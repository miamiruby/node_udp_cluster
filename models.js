var User = db.define('User', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
}, {
  tableName: 'users',
  timestamps: false
})

var Unit = db.define('Unit', {
  name: Sequelize.STRING,
  account_id: Sequelize.INTEGER
}, {
  tableName: 'units',
  timestamps: false
})
