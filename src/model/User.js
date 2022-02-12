const { DataTypes, Model } = require('sequelize');
const db = require('../database/db');

class User extends Model {}

User.init({
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize: db,
  modelName: 'User'
});

module.exports = User;
