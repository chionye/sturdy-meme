const { User, Vote, VoteOption, VoteRecord, Payment, Admin, sequelize } = require('../models');
const { sendWelcomeEmail, sendVotingLinkEmail } = require('../services/emailService');
const { Op } = require('sequelize');
const { getStateCode } = require('../config/states');

// ===================== USER MANAGEMENT =====================

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { userCode: { [Op.like]: `%${search}%` } },
        { businessName: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({ total: count, page: parseInt(page), pages: Math.ceil(count / limit), users: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Payment,
          as: 'payments',
          order: [['createdAt', 'DESC']],
        },
        {
          model: VoteRecord,
          as: 'voteRecords',
          include: [
            { model: Vote, as: 'vote', attributes: ['id', 'title', 'status'] },
            { model: VoteOption, as: 'option', attributes: ['id', 'title'] },
          ],
        },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, businessName, address, city, state, status } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (businessName) updates.businessName = businessName;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (status) updates.status = status;

    if (state && state !== user.state) {
      const stateCode = getStateCode(state);
      if (!stateCode) return res.status(400).json({ message: 'Invalid state' });
      const count = await User.count({ where: { stateCode, id: { [Op.ne]: user.id } } });
      updates.state = state;
      updates.stateCode = stateCode;
      updates.userCode = `${stateCode}${count + 1}`;
    }

    await user.update(updates);

    // Activate user if status changed to active
    if (status === 'active' && user.status !== 'active') {
      await sendWelcomeEmail({ ...user.toJSON(), ...updates });
    }

    res.json({ message: 'User updated', user: { ...user.toJSON(), ...updates } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ status: 'suspended' });
    res.json({ message: 'User suspended' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const activateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ status: 'active' });
    await sendWelcomeEmail(user);
    res.json({ message: 'User activated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await VoteRecord.destroy({ where: { userId: user.id } });
    await Payment.destroy({ where: { userId: user.id } });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendVotingLink = async (req, res) => {
  try {
    const { userId, voteId } = req.body;
    const user = await User.findByPk(userId);
    const vote = await Vote.findByPk(voteId);
    if (!user || !vote) return res.status(404).json({ message: 'User or vote not found' });

    const votingUrl = `${process.env.CLIENT_URL}/vote/${vote.shareToken}?ref=${user.votingLink}`;
    await sendVotingLinkEmail(user, vote, votingUrl);
    res.json({ message: 'Voting link sent', votingUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserVotingLink = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['id', 'name', 'votingLink'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { voteId } = req.query;
    let link = `${process.env.CLIENT_URL}/dashboard`;
    if (voteId) {
      const vote = await Vote.findByPk(voteId);
      if (vote) link = `${process.env.CLIENT_URL}/vote/${vote.shareToken}?ref=${user.votingLink}`;
    }
    res.json({ votingLink: link, userCode: user.votingLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== VOTE MANAGEMENT =====================

const createVote = async (req, res) => {
  try {
    const { title, description, startDate, endDate, pricePerVote, isFree, maxVotesPerUser, category, options } = req.body;

    if (!title || !startDate || !endDate || !options || options.length < 2) {
      return res.status(400).json({ message: 'Title, dates and at least 2 options are required' });
    }

    const vote = await Vote.create({
      title,
      description,
      startDate,
      endDate,
      pricePerVote: isFree ? 0 : parseFloat(pricePerVote || 0),
      isFree: !!isFree,
      maxVotesPerUser: maxVotesPerUser || null,
      category,
      adminId: req.admin.id,
      status: 'draft',
    });

    const createdOptions = await VoteOption.bulkCreate(
      options.map((opt) => ({ voteId: vote.id, title: opt.title, description: opt.description, image: opt.image }))
    );

    res.status(201).json({ message: 'Vote created', vote, options: createdOptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllVotes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Vote.findAndCountAll({
      where,
      include: [
        { model: VoteOption, as: 'options' },
        { model: Admin, as: 'admin', attributes: ['id', 'name', 'email'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ total: count, pages: Math.ceil(count / limit), votes: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVoteById = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id, {
      include: [
        { model: VoteOption, as: 'options', include: [{ model: VoteRecord, as: 'records' }] },
        { model: Admin, as: 'admin', attributes: ['id', 'name'] },
      ],
    });
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    // Calculate stats
    const totalVotes = vote.options.reduce((sum, opt) => sum + (opt.records ? opt.records.length : 0), 0);
    const totalRevenue = await VoteRecord.sum('amount', { where: { voteId: vote.id } }) || 0;

    // Leaderboard
    const leaderboard = vote.options
      .map((opt) => ({
        id: opt.id,
        title: opt.title,
        image: opt.image,
        votes: opt.records ? opt.records.length : 0,
        percentage: totalVotes > 0 ? ((opt.records ? opt.records.length : 0) / totalVotes * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    res.json({ vote, totalVotes, totalRevenue, leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateVote = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    const { title, description, startDate, endDate, pricePerVote, isFree, maxVotesPerUser, status, category } = req.body;
    await vote.update({ title, description, startDate, endDate, pricePerVote, isFree, maxVotesPerUser, status, category });
    res.json({ message: 'Vote updated', vote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteVote = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });
    await VoteRecord.destroy({ where: { voteId: vote.id } });
    await VoteOption.destroy({ where: { voteId: vote.id } });
    await vote.destroy();
    res.json({ message: 'Vote deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVoteResults = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id, {
      include: [{ model: VoteOption, as: 'options' }],
    });
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    const results = await Promise.all(
      vote.options.map(async (opt) => {
        const voteCount = await VoteRecord.count({ where: { voteOptionId: opt.id } });
        const revenue = await VoteRecord.sum('amount', { where: { voteOptionId: opt.id } }) || 0;

        // Top voters for this option
        const topVoters = await VoteRecord.findAll({
          where: { voteOptionId: opt.id },
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'userCode', 'email'] }],
          attributes: ['userId', [sequelize.fn('COUNT', sequelize.col('VoteRecord.id')), 'voteCount'], [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']],
          group: ['userId', 'user.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('VoteRecord.id')), 'DESC']],
          limit: 10,
          raw: false,
        });

        return {
          id: opt.id,
          title: opt.title,
          image: opt.image,
          votes: voteCount,
          revenue,
          topVoters,
        };
      })
    );

    const totalVotes = results.reduce((s, r) => s + r.votes, 0);
    const ranked = results
      .map((r) => ({ ...r, percentage: totalVotes > 0 ? (r.votes / totalVotes * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.votes - a.votes);

    res.json({ vote, results: ranked, totalVotes, winner: ranked[0] || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== ANALYTICS =====================

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const pendingUsers = await User.count({ where: { status: 'pending' } });
    const suspendedUsers = await User.count({ where: { status: 'suspended' } });

    const totalVotes = await Vote.count();
    const activeVotes = await Vote.count({ where: { status: 'active' } });
    const endedVotes = await Vote.count({ where: { status: 'ended' } });

    const totalVotesCast = await VoteRecord.count();

    const registrationRevenue = await Payment.sum('amount', {
      where: { type: 'registration', status: 'completed' },
    }) || 0;
    const voteRevenue = await Payment.sum('amount', {
      where: { type: 'vote', status: 'completed' },
    }) || 0;

    // Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentUsers = await User.findAll({
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true,
    });

    const recentPayments = await Payment.findAll({
      where: { createdAt: { [Op.gte]: sixMonthsAgo }, status: 'completed' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
      raw: true,
    });

    // Active votes with leaderboard preview
    const activeVotesList = await Vote.findAll({
      where: { status: 'active' },
      include: [{ model: VoteOption, as: 'options' }],
      limit: 5,
    });

    res.json({
      users: { total: totalUsers, active: activeUsers, pending: pendingUsers, suspended: suspendedUsers },
      votes: { total: totalVotes, active: activeVotes, ended: endedVotes, cast: totalVotesCast },
      revenue: { registration: registrationRevenue, votes: voteRevenue, total: registrationRevenue + voteRevenue },
      charts: { userGrowth: recentUsers, revenueGrowth: recentPayments },
      activeVotes: activeVotesList,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFinancials = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'userCode'] }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totals = await Payment.findAll({
      where: { status: 'completed' },
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    res.json({ total: count, pages: Math.ceil(count / limit), payments: rows, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const payment = await Payment.findOne({ where: { reference } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    await payment.update({ status: 'completed' });

    if (payment.type === 'registration' && payment.userId) {
      const user = await User.findByPk(payment.userId);
      if (user && user.status === 'pending') {
        await user.update({ status: 'active' });
        await sendWelcomeEmail(user);
      }
    }

    res.json({ message: 'Payment confirmed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password, currentPassword } = req.body;
    const admin = req.admin;

    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const valid = await admin.validatePassword(currentPassword);
      if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
      await admin.update({ name, email, password });
    } else {
      await admin.update({ name, email });
    }

    res.json({ message: 'Profile updated', admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRegistrationFee = async (req, res) => {
  res.json({ fee: parseFloat(process.env.REGISTRATION_FEE || 5000) });
};

module.exports = {
  getAllUsers, getUserById, updateUser, suspendUser, activateUser, deleteUser,
  sendVotingLink, getUserVotingLink,
  createVote, getAllVotes, getVoteById, updateVote, deleteVote, getVoteResults,
  getDashboardAnalytics, getFinancials, confirmPayment, updateAdminProfile, getRegistrationFee,
};
