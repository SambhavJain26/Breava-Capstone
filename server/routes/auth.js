const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// In-memory user store for development resilience when MongoDB is offline
const inMemoryUsers = new Map();

// Helper to check if MongoDB is active
const isDbConnected = () => mongoose.connection.readyState === 1;

// Register Endpoint
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please provide all required fields.' });
  }

  try {
    if (isDbConnected()) {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });

      user = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = { user: { id: user.id } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'breava_secretkey22',
        { expiresIn: '8h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      // In-memory fallback
      if (inMemoryUsers.has(email)) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const mockId = 'usr_' + Date.now();
      const mockUser = { id: mockId, _id: mockId, name, email, password: hashedPassword };
      inMemoryUsers.set(email, mockUser);
      inMemoryUsers.set(mockId, mockUser);

      const payload = { user: { id: mockId } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'breava_secretkey22',
        { expiresIn: '8h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    }
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ msg: 'Server error during registration.' });
  }
});

// Login Endpoint
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password.' });
  }

  try {
    if (isDbConnected()) {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      const payload = { user: { id: user.id } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'breava_secretkey22',
        { expiresIn: '8h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      // In-memory fallback
      let user = inMemoryUsers.get(email);
      if (!user) {
        // Auto-seed for dev/demo if not registered
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const mockId = 'usr_demo';
        user = { id: mockId, _id: mockId, name: email.split('@')[0], email, password: hashedPassword };
        inMemoryUsers.set(email, user);
        inMemoryUsers.set(mockId, user);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      const payload = { user: { id: user.id } };
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'breava_secretkey22',
        { expiresIn: '8h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    }
  } catch (err) {
    console.error('Signin error:', err.message);
    res.status(500).json({ msg: 'Server error during authentication.' });
  }
});

// Get user profile (Protected)
router.get('/me', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ msg: 'User profile not found.' });
      res.json(user);
    } else {
      const user = inMemoryUsers.get(req.user.id);
      if (!user) {
        return res.json({ id: req.user.id, name: 'Dr. Sarah Connor', email: 'clinician@breava.health' });
      }
      res.json({ id: user.id, name: user.name, email: user.email });
    }
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ msg: 'Server error fetching user profile.' });
  }
});

module.exports = router;
