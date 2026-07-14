const express = require('express');
const router = express.Router();

// Controller se saare functions import kar rahe hain
const { 
  submitDiagnosticTest, 
  getProgress, 
  generateQuiz, 
  submitQuiz, 
  getAllRoadmaps, 
  deleteRoadmap 
} = require('../controllers/assessmentController');

// ------------------------------------
// PURANE ROUTES
// ------------------------------------
router.post('/submit-test', submitDiagnosticTest);
router.get('/progress/:userId', getProgress);

// ------------------------------------
// NAYE AI ROADMAP ROUTES
// ------------------------------------
router.post('/generate-quiz', generateQuiz);
router.post('/submit-quiz', submitQuiz);

// YEH WALA ROUTE REFRESH HONE PAR CARDS KO WAPAS LATA HAI
router.get('/get-all-roadmaps/:userId', getAllRoadmaps); 

router.delete('/delete-roadmap/:id', deleteRoadmap);

module.exports = router;