const { Vote, VoteOption, VoteRecord, User, Payment, sequelize } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { verifyPayment } = require('../services/paystackService');

// Get all active/upcoming votes for users
const getPublicVotes = async (req, res) => {
  try {
    const now = new Date();
    const votes = await Vote.findAll({
      where: {
        status: { [Op.in]: ['active', 'ended'] },
        endDate: { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
      },
      include: [{ model: VoteOption, as: 'options', attributes: ['id', 'title', 'image', 'totalVotes'] }],
      order: [
        [sequelize.literal(`CASE WHEN status = 'active' THEN 0 ELSE 1 END`), 'ASC'],
        ['endDate', 'ASC'],
      ],
    });

    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single vote by share token (public)
const getVoteByToken = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      where: { shareToken: req.params.token },
      include: [{ model: VoteOption, as: 'options', attributes: ['id', 'title', 'description', 'image', 'totalVotes'] }],
    });
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    res.json(vote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cast a vote
const castVote = async (req, res) => {
  try {
    const { voteId, voteOptionId, quantity = 1, transactionRef } = req.body;
    const userId = req.user.id;

    const vote = await Vote.findByPk(voteId);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });
    if (vote.status !== 'active') return res.status(400).json({ message: 'This vote is not active' });

    const now = new Date();
    if (now < new Date(vote.startDate)) return res.status(400).json({ message: 'Vote has not started yet' });
    if (now > new Date(vote.endDate)) return res.status(400).json({ message: 'Vote has ended' });

    const option = await VoteOption.findOne({ where: { id: voteOptionId, voteId } });
    if (!option) return res.status(404).json({ message: 'Vote option not found' });

    // Check max votes per user
    if (vote.maxVotesPerUser) {
      const userVoteCount = await VoteRecord.count({ where: { voteId, userId } });
      if (userVoteCount + quantity > vote.maxVotesPerUser) {
        return res.status(400).json({
          message: `You can only vote ${vote.maxVotesPerUser} time(s) in this election`,
        });
      }
    }

    const amount = vote.isFree ? 0 : vote.pricePerVote * quantity;

    // If paid vote, verify payment via Paystack
    if (!vote.isFree && amount > 0) {
      if (!transactionRef) {
        return res.status(400).json({ message: 'Payment reference required' });
      }

      const paystackResult = await verifyPayment(transactionRef);
      if (!paystackResult.status || paystackResult.data?.status !== 'success') {
        return res.status(400).json({ message: 'Payment verification failed. Please complete payment first.' });
      }

      const amountPaid = paystackResult.data.amount / 100;
      if (amountPaid < amount) {
        return res.status(400).json({ message: `Incomplete payment. Expected ₦${amount}, got ₦${amountPaid}` });
      }

      // Prevent double-use of same reference
      const existing = await Payment.findOne({ where: { reference: transactionRef } });
      if (existing) {
        return res.status(400).json({ message: 'Payment reference already used' });
      }

      await Payment.create({
        userId,
        amount,
        type: 'vote',
        reference: transactionRef,
        status: 'completed',
        description: `Vote: ${vote.title}`,
        metadata: { voteId, voteOptionId },
      });
    }

    // Create vote records (one per vote)
    const records = [];
    for (let i = 0; i < quantity; i++) {
      records.push({ voteId, voteOptionId, userId, amount: vote.isFree ? 0 : vote.pricePerVote, transactionRef });
    }
    await VoteRecord.bulkCreate(records);

    // Update option vote count
    await option.increment('totalVotes', { by: quantity });

    res.json({ message: `Successfully cast ${quantity} vote(s)`, amount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's vote history
const getUserVoteHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await VoteRecord.findAll({
      where: { userId },
      include: [
        { model: Vote, as: 'vote', attributes: ['id', 'title', 'status', 'endDate', 'startDate'] },
        { model: VoteOption, as: 'option', attributes: ['id', 'title', 'totalVotes'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Group by vote
    const grouped = {};
    records.forEach((r) => {
      if (!grouped[r.voteId]) {
        grouped[r.voteId] = {
          vote: r.vote,
          options: {},
          totalVotes: 0,
          totalSpent: 0,
        };
      }
      const key = r.voteOptionId;
      if (!grouped[r.voteId].options[key]) {
        grouped[r.voteId].options[key] = { option: r.option, count: 0, spent: 0 };
      }
      grouped[r.voteId].options[key].count += 1;
      grouped[r.voteId].options[key].spent += parseFloat(r.amount);
      grouped[r.voteId].totalVotes += 1;
      grouped[r.voteId].totalSpent += parseFloat(r.amount);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get leaderboard for a vote
const getVoteLeaderboard = async (req, res) => {
  try {
    const vote = await Vote.findByPk(req.params.id, {
      include: [{ model: VoteOption, as: 'options', attributes: ['id', 'title', 'image', 'totalVotes'] }],
    });
    if (!vote) return res.status(404).json({ message: 'Vote not found' });

    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.totalVotes, 0);
    const leaderboard = vote.options
      .map((opt) => ({
        id: opt.id,
        title: opt.title,
        image: opt.image,
        votes: opt.totalVotes,
        percentage: totalVotes > 0 ? ((opt.totalVotes / totalVotes) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.votes - a.votes);

    res.json({ vote: { id: vote.id, title: vote.title, status: vote.status, endDate: vote.endDate }, leaderboard, totalVotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resolve voting link token
const resolveVotingLink = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { votingLink: token }, attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'Invalid voting link' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account not active' });
    res.json({ valid: true, user: { id: user.id, name: user.name, userCode: user.userCode } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPublicVotes, getVoteByToken, castVote, getUserVoteHistory, getVoteLeaderboard, resolveVotingLink };
