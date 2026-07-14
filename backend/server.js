const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Multer import kiya
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON data parse karne ke liye

// Uploaded files ko static serve karne ke liye
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error: ', err));

// ==========================================
// API ROUTES
// ==========================================

// 1. Auth Routes (Register, Login)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 2. Assessment Routes (Diagnostic Test, Level Assignment)
const assessmentRoutes = require('./routes/assessmentRoutes');
app.use('/api/assessment', assessmentRoutes);

// 3. Notes Routes (AI Study Material)
const noteRoutes = require('./routes/noteRoutes');
app.use('/api/notes', noteRoutes);

// 4. User Routes (Profile Settings)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// 5. Teacher Routes (Batch Management & Tracking)
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teacher', teacherRoutes);

// ==========================================

// Default Test Route
app.get('/', (req, res) => {
  res.json({ message: 'EdTech Platform API is running perfectly!' });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});