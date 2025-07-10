const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate emails
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiration: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
