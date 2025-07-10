const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey123!';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // now req.user.userId is available
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken };
