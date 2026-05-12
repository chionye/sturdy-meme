const { Payment, User, sequelize } = require('../models');
const { verifyPayment } = require('../services/paystackService');

const paymentTypes = {
  conference_fee: { label: 'Conference Fee', defaultAmount: 0 },
  yearly_dues: { label: 'Yearly Dues', defaultAmount: 0 },
  funeral_levy: { label: 'Funeral Levy', defaultAmount: 0 },
  other: { label: 'Other Payment', defaultAmount: 0 },
};

// Get configurable payment types and amounts
const getPaymentTypes = async (req, res) => {
  try {
    res.json({
      types: paymentTypes,
      amounts: {
        conference_fee: parseFloat(process.env.CONFERENCE_FEE || 10000),
        yearly_dues: parseFloat(process.env.YEARLY_DUES || 5000),
        funeral_levy: parseFloat(process.env.FUNERAL_LEVY || 3000),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Initialize a member payment
const initiateMemberPayment = async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const userId = req.user.id;

    if (!type || !paymentTypes[type]) {
      return res.status(400).json({ message: 'Invalid payment type' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let finalAmount = amount;
    if (!finalAmount || finalAmount <= 0) {
      finalAmount = parseFloat(process.env[type.toUpperCase()]) || 0;
    }

    if (finalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const ref = `${type.toUpperCase()}-${Date.now()}-${userId}`;

    const payment = await Payment.create({
      userId,
      amount: finalAmount,
      type,
      reference: ref,
      status: 'pending',
      description: description || paymentTypes[type].label,
    });

    res.status(201).json({
      message: 'Payment initiated',
      payment: {
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        reference: payment.reference,
        description: payment.description,
        status: payment.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify member payment
const verifyMemberPayment = async (req, res) => {
  try {
    const { reference, paymentRef } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!reference) return res.status(400).json({ message: 'Reference is required' });

    const result = await verifyPayment(reference);
    if (!result.status || result.data?.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const payment = await Payment.findOne({
      where: { reference: paymentRef || reference, userId },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    await payment.update({ status: 'completed', reference });

    res.json({ message: 'Payment confirmed successfully', payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's payment history
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: {
        userId,
        type: { [require('sequelize').Op.notIn]: ['registration', 'vote'] },
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: get all member payments
const getAllMemberPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {
      type: { [require('sequelize').Op.notIn]: ['registration', 'vote'] },
    };
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'userCode'] }],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ total: count, pages: Math.ceil(count / limit), payments: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPaymentTypes, initiateMemberPayment, verifyMemberPayment,
  getUserPayments, getAllMemberPayments,
};
