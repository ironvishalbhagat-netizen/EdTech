const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: [{
    title: { type: String, required: true },
    contentUrl: { type: String }, // PDF, Video, or Text link
    isAIEnabled: { type: Boolean, default: true } // AI summary/notes ke liye
  }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);