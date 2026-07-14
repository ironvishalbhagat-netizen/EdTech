const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'teacher'], 
    default: 'student' // Naya Field: Role define karne ke liye
  },
  level: { 
    type: String, 
    default: 'Beginner' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);