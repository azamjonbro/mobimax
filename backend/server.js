require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();

// Security HTTP headers with configurations allowing image loading from local uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiter: Max 200 requests per 15 minutes from an IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// CORS configuration (allow local dev server connections)
app.use(cors({
  origin: '*', // For development flexibility; can restrict to specific domains in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize MongoDB inputs against query injection
app.use(mongoSanitize());

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), dbState: mongoose.connection.readyState });
});

// Serve spa routing fallbacks if needed (optional)
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Port and MongoDB connection
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ratsiya';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB successfully connected.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
