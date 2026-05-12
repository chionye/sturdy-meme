const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HeroSlide = sequelize.define('HeroSlide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
  subtitle: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'hero_slides',
  timestamps: true,
});

module.exports = HeroSlide;
