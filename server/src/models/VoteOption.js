const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VoteOption = sequelize.define('VoteOption', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.STRING,
  },
  totalVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_votes',
  },
}, {
  tableName: 'vote_options',
  timestamps: true,
});

module.exports = VoteOption;
