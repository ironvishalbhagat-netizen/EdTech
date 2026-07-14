const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Jis teacher ne banaya
    required: true 
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Jo students join karenge
  }],
  batchCode: { 
    type: String, 
    required: true, 
    unique: true // 6-digit unique code
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);