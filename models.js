var User = db.define('User', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
}, {
  tableName: 'users',
  timestamps: false
})
