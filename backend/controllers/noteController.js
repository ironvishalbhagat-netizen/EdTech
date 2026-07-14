const Note = require('../models/Note');
const Groq = require('groq-sdk');

// Groq client initialize karein
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// AI Note Generate karna
exports.generateNote = async (req, res) => {
  try {
    const { userId, topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    // Groq API Call
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert educational AI assistant. Generate comprehensive, easy-to-understand study notes on the given topic. Use bullet points, bold text, and clear headings. Keep it informative but concise."
        },
        {
          role: "user",
          content: `Generate detailed study notes for: ${topic}`
        }
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0.5,
    });

    const content = chatCompletion.choices[0]?.message?.content || "Could not generate notes.";

    const newNote = new Note({ student: userId, topic, content });
    await newNote.save();

    res.status(201).json({ message: 'Note generated successfully', note: newNote });
  } catch (error) {
    console.log("❌ GROQ API ERROR:", error);
    res.status(500).json({ message: 'Error generating note', error: error.message });
  }
};

// User ke saare notes fetch karna
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ student: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.log("❌ FETCH NOTES ERROR:", error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// Note Delete karna
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.log("❌ DELETE NOTE ERROR:", error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

// NAYA FUNCTION: Note ka status Completed/Incomplete toggle karne ke liye
exports.toggleNoteStatus = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Status ko flip karna
    note.isCompleted = !note.isCompleted;
    await note.save();
    
    res.status(200).json({ message: 'Note status updated', note });
  } catch (error) {
    console.log("❌ TOGGLE STATUS ERROR:", error);
    res.status(500).json({ message: 'Error updating note status', error: error.message });
  }
};