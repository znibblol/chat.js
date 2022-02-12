const { Sequelize } = require('sequelize');

const db = new Sequelize({
  dialect: 'sqlite',
  storage: './src/database/chatup_db.sqlite'
});

module.exports = db;
