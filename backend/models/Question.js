const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: { type: String, required: true }, // e.g., 'DBMS', 'React'
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  topic: { type: String, required: true } // e.g., 'Normalization', 'Joins'
});

module.exports = mongoose.model('Question', questionSchema);