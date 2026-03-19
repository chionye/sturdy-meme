const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize, Admin } = require('./models');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/votes');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/votes', voteRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'EOPANSE Voting API' }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const createDefaultAdmin = async () => {
  try {
    const existing = await Admin.findOne({ where: { email: 'admin@eopanse.com.ng' } });
    if (!existing) {
      await Admin.create({
        name: 'EOPANSE Admin',
        email: 'admin@eopanse.com.ng',
        password: 'Admin@2024',
        role: 'superadmin',
      });
      console.log('Default admin created: admin@eopanse.com.ng / Admin@2024');
    }
  } catch (err) {
    console.error('Could not create default admin:', err.message);
  }
};

sequelize.sync({ alter: false })
  .then(async () => {
    console.log('Database connected and synced');
    await createDefaultAdmin();
    app.listen(PORT, () => console.log(`EOPANSE API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
