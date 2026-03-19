const sequelize = require('../config/database');
const Admin = require('./Admin');
const User = require('./User');
const Vote = require('./Vote');
const VoteOption = require('./VoteOption');
const VoteRecord = require('./VoteRecord');
const Payment = require('./Payment');

// Associations
Vote.hasMany(VoteOption, { foreignKey: 'vote_id', as: 'options' });
VoteOption.belongsTo(Vote, { foreignKey: 'vote_id', as: 'vote' });

Vote.hasMany(VoteRecord, { foreignKey: 'vote_id', as: 'records' });
VoteRecord.belongsTo(Vote, { foreignKey: 'vote_id', as: 'vote' });

VoteOption.hasMany(VoteRecord, { foreignKey: 'vote_option_id', as: 'records' });
VoteRecord.belongsTo(VoteOption, { foreignKey: 'vote_option_id', as: 'option' });

User.hasMany(VoteRecord, { foreignKey: 'user_id', as: 'voteRecords' });
VoteRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Admin.hasMany(Vote, { foreignKey: 'admin_id', as: 'votes' });
Vote.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

module.exports = { sequelize, Admin, User, Vote, VoteOption, VoteRecord, Payment };
