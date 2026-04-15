const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Vote = sequelize.define('Vote', {
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
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date',
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date',
  },
  pricePerVote: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'price_per_vote',
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_free',
  },
  maxVotesPerUser: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    field: 'max_votes_per_user',
  },
  shareToken: {
    type: DataTypes.STRING,
    unique: true,
    field: 'share_token',
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'ended', 'cancelled'),
    defaultValue: 'draft',
  },
  category: {
    type: DataTypes.STRING,
  },
  bannerImage: {
    type: DataTypes.STRING,
    field: 'banner_image',
  },
  adminId: {
    type: DataTypes.INTEGER,
    field: 'admin_id',
  },
  allowNonMembers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'allow_non_members',
  },
  nonMemberPricePerVote: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'non_member_price_per_vote',
  },
  nonMemberIsFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'non_member_is_free',
  },
}, {
  tableName: 'votes',
  timestamps: true,
  hooks: {
    beforeCreate: (vote) => {
      if (!vote.shareToken) {
        vote.shareToken = uuidv4();
      }
    },
  },
});

module.exports = Vote;
