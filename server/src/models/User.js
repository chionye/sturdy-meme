const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'business_name',
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stateCode: {
    type: DataTypes.STRING(5),
    allowNull: false,
    field: 'state_code',
  },
  userCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    field: 'user_code',
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'pending'),
    defaultValue: 'pending',
  },
  votingLink: {
    type: DataTypes.STRING,
    field: 'voting_link',
  },
  profileImage: {
    type: DataTypes.STRING,
    field: 'profile_image',
  },
  cacNumber: {
    type: DataTypes.STRING,
    field: 'cac_number',
  },
  cacCertificate: {
    type: DataTypes.STRING,
    field: 'cac_certificate',
  },
  guarantor1Name: {
    type: DataTypes.STRING,
    field: 'guarantor_1_name',
  },
  guarantor1Email: {
    type: DataTypes.STRING,
    field: 'guarantor_1_email',
  },
  guarantor1Code: {
    type: DataTypes.STRING,
    field: 'guarantor_1_code',
  },
  guarantor2Name: {
    type: DataTypes.STRING,
    field: 'guarantor_2_name',
  },
  guarantor2Email: {
    type: DataTypes.STRING,
    field: 'guarantor_2_email',
  },
  guarantor2Code: {
    type: DataTypes.STRING,
    field: 'guarantor_2_code',
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    field: 'whatsapp_number',
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    afterCreate: async (user) => {
      await user.update({ userCode: `${user.stateCode}${user.id}` });
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
