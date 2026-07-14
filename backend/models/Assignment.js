const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['text', 'file', 'link'], required: true },
  content: { type: String }, // Agar text/link hai
  fileUrl: { type: String }, // Agar file hai
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);