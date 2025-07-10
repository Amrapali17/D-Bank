const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); // make sure this file exists

const router = express.Router();

// Use environment variable for security
const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey123!';


// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed!' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});


// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `https://decentralized-banking-app.vercel.app/reset-password/${token}`;

    await sendEmail(email, 'Password Reset', `
      <p>You requested a password reset.</p>
      <p>Click the link below to set a new password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `);

    res.status(200).json({ message: 'Password reset link sent to email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending reset link.' });
  }
});


// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;
