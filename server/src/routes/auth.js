const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, getMe, getAdminMe } = require('../controllers/authController');
const { authUser, authAdmin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/me', authUser, getMe);
router.get('/admin/me', authAdmin, getAdminMe);

module.exports = router;
