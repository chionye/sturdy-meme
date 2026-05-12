const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authAdmin } = require('../middleware/auth');
const { authUser } = require('../middleware/auth');
const {
  getAllExecutives, createExecutive, updateExecutive, deleteExecutive,
  getEventById, getAllEvents, createEvent, updateEvent, deleteEvent,
  getAllHeroSlides, getActiveHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
} = require('../controllers/contentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// Public routes
router.get('/executives', getAllExecutives);
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.get('/hero-slides/active', getActiveHeroSlides);

// Admin routes
router.post('/executives', authAdmin, upload.single('image'), createExecutive);
router.put('/executives/:id', authAdmin, upload.single('image'), updateExecutive);
router.delete('/executives/:id', authAdmin, deleteExecutive);

router.post('/events', authAdmin, upload.array('images', 10), createEvent);
router.put('/events/:id', authAdmin, upload.array('images', 10), updateEvent);
router.delete('/events/:id', authAdmin, deleteEvent);

router.get('/hero-slides', authAdmin, getAllHeroSlides);
router.post('/hero-slides', authAdmin, upload.single('image'), createHeroSlide);
router.put('/hero-slides/:id', authAdmin, upload.single('image'), updateHeroSlide);
router.delete('/hero-slides/:id', authAdmin, deleteHeroSlide);

module.exports = router;
