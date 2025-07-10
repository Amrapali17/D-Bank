const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    userId: req.user.userId,
  });
});

module.exports = router;
