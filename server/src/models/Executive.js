const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Executive = sequelize.define('Executive', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  businessName: {
    type: DataTypes.STRING,
    field: 'business_name',
  },
  office: {
    type: DataTypes.STRING,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isBoardMember: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_board_member',
  },
  image: {
    type: DataTypes.STRING,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'executives',
  timestamps: true,
});

module.exports = Executive;
