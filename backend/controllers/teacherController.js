const Batch = require('../models/Batch');
const User = require('../models/User');
const Progress = require('../models/Progress'); // Student tracking ke liye
const Assignment = require('../models/Assignment'); 
const Notice = require('../models/Notice');
const Submission = require('../models/Submission'); // Yeh line top par add karein

// 1. Teacher ke liye naya Batch create karna
exports.createBatch = async (req, res) => {
  try {
    const { batchName, description, teacherId } = req.body;
    const batchCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newBatch = new Batch({
      batchName,
      description,
      teacher: teacherId,
      batchCode
    });

    await newBatch.save();
    res.status(201).json({ message: 'Batch created successfully', batch: newBatch });
  } catch (error) {
    console.error("❌ BATCH CREATION ERROR:", error);
    res.status(500).json({ message: 'Error creating batch', error: error.message });
  }
};

// 2. Student ka Batch Join karna (Code ke zariye)
exports.joinBatch = async (req, res) => {
  try {
    const { batchCode, studentId } = req.body;

    const batch = await Batch.findOne({ batchCode: batchCode.toUpperCase() });
    if (!batch) {
      return res.status(404).json({ message: 'Invalid Batch Code!' });
    }

    if (batch.students.includes(studentId)) {
      return res.status(400).json({ message: 'You are already in this batch!' });
    }

    batch.students.push(studentId);
    await batch.save();

    res.status(200).json({ 
      message: 'Successfully joined the batch!', 
      batchName: batch.batchName, 
      batchId: batch._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining batch', error: error.message });
  }
};

// 3. Teacher ke saare Batches fetch karna
exports.getTeacherBatches = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const batches = await Batch.find({ teacher: teacherId }).populate('students', 'name email');
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error: error.message });
  }
};

// 4. Batch ke Students ko Track karna (UPDATED FOR SUBMISSIONS)
exports.getBatchStudentsProgress = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId).populate('students', 'name email');

    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const studentsWithProgress = await Promise.all(
      batch.students.map(async (student) => {
        const progress = await Progress.find({ student: student._id });
        // NAYA: Student ke is batch ke saare submissions fetch karo
        const submissions = await Submission.find({ studentId: student._id, batchId: batchId }).populate('assignmentId', 'title');
        
        return {
          studentDetails: student,
          roadmaps: progress,
          submissions: submissions // Naya field add kiya
        };
      })
    );

    res.status(200).json({ batchName: batch.batchName, students: studentsWithProgress });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student progress', error: error.message });
  }
};

// 5. Assignment Upload
exports.createAssignment = async (req, res) => {
  try {
    const { batchId, title, description, type, content, deadline } = req.body;
    let fileUrl = req.file ? req.file.path : null;

    const newAssignment = new Assignment({
      batchId, title, description, type, content, fileUrl, deadline
    });
    await newAssignment.save();
    res.status(201).json({ message: 'Assignment uploaded!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 6. Notice Post
exports.postNotice = async (req, res) => {
  try {
    const { batchId, message, teacherName } = req.body;
    const newNotice = new Notice({ batchId, message, teacherName });
    await newNotice.save();
    res.status(201).json({ message: 'Notice posted!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 7. Get Data for Student/Teacher
exports.getBatchData = async (req, res) => {
  try {
    const { batchId } = req.params;
    const assignments = await Assignment.find({ batchId });
    const notices = await Notice.find({ batchId });
    res.json({ assignments, notices });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 8. NEW FUNCTION: Student ke enrolled batches fetch karna
exports.getStudentBatches = async (req, res) => {
  try {
    const { studentId } = req.params;
    const batches = await Batch.find({ students: studentId });
    res.json(batches);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// 9. NEW FUNCTION: Student Assignment Submit Karega
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, batchId } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    if (!fileUrl) return res.status(400).json({ message: 'File upload is required' });

    const newSubmission = new Submission({
      assignmentId, studentId, batchId, fileUrl
    });
    
    await newSubmission.save();
    res.status(201).json({ message: 'Assignment submitted successfully!', submission: newSubmission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};