const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('registration', 'vote', 'conference_fee', 'yearly_dues', 'funeral_levy', 'other'),
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  metadata: {
    type: DataTypes.JSON,
  },
  description: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'payments',
  timestamps: true,
});

module.exports = Payment;
