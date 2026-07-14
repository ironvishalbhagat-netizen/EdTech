const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  message: { type: String, required: true },
  teacherName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);