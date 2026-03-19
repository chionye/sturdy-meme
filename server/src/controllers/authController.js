const jwt = require('jsonwebtoken');
const { User, Admin, Payment } = require('../models');
const { getStateCode } = require('../config/states');
const { sendWelcomeEmail, sendRegistrationPendingEmail } = require('../services/emailService');
const { verifyPayment } = require('../services/paystackService');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// User Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, businessName, address, city, state } = req.body;

    if (!name || !email || !phone || !password || !businessName || !address || !city || !state) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const stateCode = getStateCode(state);
    if (!stateCode) return res.status(400).json({ message: 'Invalid state selected' });

    // Count users from same state to generate unique code
    const stateUserCount = await User.count({ where: { stateCode } });
    const userCode = `${stateCode}${stateUserCount + 1}`;

    // Generate voting link token
    const votingToken = uuidv4();
    const votingLink = `${process.env.CLIENT_URL}/vote-link/${votingToken}`;

    const user = await User.create({
      name,
      email,
      phone,
      password,
      businessName,
      address,
      city,
      state,
      stateCode,
      userCode,
      votingLink: votingToken,
      status: 'pending',
    });

    // Create pending payment record
    const ref = `REG-${Date.now()}-${user.id}`;
    await Payment.create({
      userId: user.id,
      amount: parseFloat(process.env.REGISTRATION_FEE || 5000),
      type: 'registration',
      reference: ref,
      status: 'pending',
      description: 'Registration fee',
    });

    await sendRegistrationPendingEmail(user);

    res.status(201).json({
      message: 'Registration successful. Complete payment to activate your account.',
      userId: user.id,
      userCode,
      registrationFee: parseFloat(process.env.REGISTRATION_FEE || 5000),
      paymentRef: ref,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.validatePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Account pending activation. Contact admin.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact admin.' });
    }

    const token = generateToken(user.id, 'user');
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        state: user.state,
        stateCode: user.stateCode,
        businessName: user.businessName,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await admin.validatePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(admin.id, admin.role);
    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  const user = req.user;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    businessName: user.businessName,
    address: user.address,
    city: user.city,
    state: user.state,
    stateCode: user.stateCode,
    userCode: user.userCode,
    votingLink: user.votingLink,
    status: user.status,
    createdAt: user.createdAt,
  });
};

// Get current admin
const getAdminMe = async (req, res) => {
  const admin = req.admin;
  res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
};

// Verify Paystack registration payment and activate account
const verifyRegistrationPayment = async (req, res) => {
  try {
    const { reference, userId } = req.body;
    if (!reference || !userId) return res.status(400).json({ message: 'reference and userId required' });

    const result = await verifyPayment(reference);
    if (!result.status || result.data?.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful. Please try again.' });
    }

    const amountPaid = result.data.amount / 100; // Paystack returns kobo
    const expectedFee = parseFloat(process.env.REGISTRATION_FEE || 5000);
    if (amountPaid < expectedFee) {
      return res.status(400).json({ message: `Incomplete payment. Expected ${expectedFee}, got ${amountPaid}` });
    }

    // Update payment record
    await Payment.update(
      { status: 'completed', reference },
      { where: { userId, type: 'registration', status: 'pending' } }
    );

    // Activate user
    await User.update({ status: 'active' }, { where: { id: userId } });

    const user = await User.findByPk(userId);
    await sendWelcomeEmail(user);

    res.json({ message: 'Payment verified! Your account is now active.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

module.exports = { registerUser, loginUser, loginAdmin, getMe, getAdminMe, verifyRegistrationPayment };
