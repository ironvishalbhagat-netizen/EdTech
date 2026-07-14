const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  createBatch, 
  joinBatch, 
  getTeacherBatches, 
  getBatchStudentsProgress,
  createAssignment,
  postNotice,
  getBatchData,
  getStudentBatches // <-- Naya function yahan import kiya hai
} = require('../controllers/teacherController');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Batch Routes
router.post('/create-batch', createBatch);
router.post('/join-batch', joinBatch);
router.get('/my-batches/:teacherId', getTeacherBatches);
router.get('/batch-analytics/:batchId', getBatchStudentsProgress);
router.get('/student-batches/:studentId', getStudentBatches); // <-- Yeh naya route add kiya hai

// Assignment & Notice Routes
// 'file' is the field name expected from frontend FormData
router.post('/upload-assignment', upload.single('file'), createAssignment);
router.post('/post-notice', postNotice);
router.get('/batch-data/:batchId', getBatchData);

module.exports = router;