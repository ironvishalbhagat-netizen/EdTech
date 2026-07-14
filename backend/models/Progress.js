const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  topic: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  strongTopics: [String],
  weakTopics: [String],
  dailyTasks: [{
    taskName: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
  completionPercentage: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);