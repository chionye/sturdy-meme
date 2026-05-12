const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    field: 'end_date',
  },
  location: {
    type: DataTypes.STRING,
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
    defaultValue: 'upcoming',
  },
}, {
  tableName: 'events',
  timestamps: true,
});

module.exports = Event;
