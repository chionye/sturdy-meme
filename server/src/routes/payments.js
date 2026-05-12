const express = require('express');
const router = express.Router();
const { authUser, authAdmin } = require('../middleware/auth');
const {
  getPaymentTypes, initiateMemberPayment, verifyMemberPayment,
  getUserPayments, getAllMemberPayments,
} = require('../controllers/paymentController');

// Public
router.get('/types', getPaymentTypes);

// User routes
router.post('/initiate', authUser, initiateMemberPayment);
router.post('/verify', authUser, verifyMemberPayment);
router.get('/my', authUser, getUserPayments);

// Admin routes
router.get('/all', authAdmin, getAllMemberPayments);

module.exports = router;
