const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VoteRecord = sequelize.define('VoteRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  voteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vote_id',
  },
  voteOptionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vote_option_id',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  transactionRef: {
    type: DataTypes.STRING,
    field: 'transaction_ref',
  },
  voterEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'voter_email',
  },
}, {
  tableName: 'vote_records',
  timestamps: true,
});

module.exports = VoteRecord;
