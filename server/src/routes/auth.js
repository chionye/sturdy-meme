const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, loginAdmin, getMe, getAdminMe, verifyRegistrationPayment } = require('../controllers/authController');
const { authUser, authAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/register', upload.single('file'), registerUser);
router.post('/verify-payment', verifyRegistrationPayment);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/me', authUser, getMe);
router.get('/admin/me', authAdmin, getAdminMe);

module.exports = router;
