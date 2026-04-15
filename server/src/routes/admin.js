const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const {
  getAllUsers, getUserById, updateUser, suspendUser, activateUser, deleteUser,
  sendVotingLink, getUserVotingLink,
  createVote, getAllVotes, getVoteById, updateVote, deleteVote, getVoteResults,
  getDashboardAnalytics, getFinancials, confirmPayment, updateAdminProfile, getRegistrationFee,
} = require('../controllers/adminController');

// Public admin routes (no auth required)
router.get('/settings/registration-fee', getRegistrationFee);

// All admin routes require auth
router.use(authAdmin);

// Analytics
router.get('/dashboard', getDashboardAnalytics);
router.get('/financials', getFinancials);
router.post('/payments/confirm', confirmPayment);
router.put('/profile', updateAdminProfile);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/send-voting-link', sendVotingLink);
router.get('/users/:id/voting-link', getUserVotingLink);

// Vote management
router.post('/votes', createVote);
router.get('/votes', getAllVotes);
router.get('/votes/:id', getVoteById);
router.put('/votes/:id', updateVote);
router.delete('/votes/:id', deleteVote);
router.get('/votes/:id/results', getVoteResults);

module.exports = router;
