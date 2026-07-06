const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Log = require('../models/Log');
const auth = require('../middleware/auth');

// POST /admin/login - Authenticate admin & return token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'fallback_secret_for_mobimax',
      { expiresIn: '24h' }
    );

    // Write login log
    await Log.create({
      action: 'ADMIN_LOGIN',
      details: `Successful login for admin: ${admin.email}`,
      admin: admin._id,
      ip: req.ip
    });

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET /admin/me - Verify token & return admin user
router.get('/me', auth, (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email
    }
  });
});

module.exports = router;
