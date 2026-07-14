const express = require('express');
const router = express.Router();
const { generateNote, getNotes, deleteNote, toggleNoteStatus } = require('../controllers/noteController');

// Route to generate a new note
router.post('/generate', generateNote);

// Route to get all notes of a specific user
router.get('/:userId', getNotes);

// Route to delete a note by its ID
router.delete('/:id', deleteNote);

// NAYA ROUTE: Status toggle karne ke liye
router.put('/toggle-status/:id', toggleNoteStatus);

module.exports = router;