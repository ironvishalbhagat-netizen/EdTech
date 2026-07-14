const User = require('../models/User');
const Progress = require('../models/Progress');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ==========================================
// DIAGNOSTIC TEST FUNCTIONS (PURANE)
// ==========================================

exports.submitDiagnosticTest = async (req, res) => {
  try {
    const { userId, score, maxScore, weakTopics, strongTopics, subject } = req.body;
    const percentage = (score / maxScore) * 100;
    let assignedLevel = 'Beginner';
    if (percentage >= 80) assignedLevel = 'Advanced';
    else if (percentage >= 50) assignedLevel = 'Intermediate';

    await User.findByIdAndUpdate(userId, { level: assignedLevel });
    const roadmapTasks = weakTopics.map((topic) => ({ taskName: `Learn basics of ${topic}`, isCompleted: false }));

    await Progress.findOneAndDelete({ student: userId });
    const progress = new Progress({ 
      student: userId, 
      topic: subject || "Diagnostic Path",
      content: `Diagnostic Test Result Path for ${assignedLevel} level.`,
      strongTopics, 
      weakTopics, 
      dailyTasks: roadmapTasks, 
      completionPercentage: 0 
    });
    await progress.save();

    res.status(200).json({ message: 'Assessment completed', level: assignedLevel, roadmap: roadmapTasks });
  } catch (error) {
    console.log("❌ TEST SUBMIT ERROR:", error);
    res.status(500).json({ message: 'Error processing test', error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.findOne({ student: userId });
    if (!progress) return res.status(404).json({ message: "No roadmap found" });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// INTERACTIVE ROADMAP & QUIZ FUNCTIONS (NAYE)
// ==========================================

// 1. Generate 15 MCQs using AI (Optimized for Free Tier / No 413 Error)
exports.generateQuiz = async (req, res) => {
  try {
    const { topic } = req.body;
    
    const prompt = `Generate exactly 15 high-quality MCQs for "${topic}" ranging from basic to advanced. 
    Return ONLY a valid JSON array format: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "..."}]. 
    Strictly NO markdown, NO text, NO \`\`\`json tags. Just the raw array. Ensure the array is fully closed.`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 4000, 
    });

    let rawContent = completion.choices[0].message.content.trim();
    
    // Markdown Cleaning Logic
    if (rawContent.startsWith('```json')) {
      rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
    }

    if (!rawContent.endsWith(']')) {
        throw new Error("AI output was cut off. Please try searching again.");
    }

    const quiz = JSON.parse(rawContent);
    res.status(200).json({ quiz });
    
  } catch (error) {
    console.error("❌ QUIZ GENERATION ERROR:", error.message);
    res.status(500).json({ message: 'Error generating quiz', error: error.message });
  }
};

// 2. Submit Quiz & Generate Detailed Roadmap (FIXED: Saves 'content' field for PDF)
exports.submitQuiz = async (req, res) => {
  try {
    const { userId, answers, topic } = req.body;
    
    const prompt = `Based on these quiz answers for ${topic}, generate a detailed step-by-step learning roadmap. Return ONLY the text for a structured plan, no extra formatting.`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      max_tokens: 4000,
    });

    const roadmapContent = completion.choices[0].message.content;
    
    // Yahan topic aur content dono store ho rhe hain taaki Card aur PDF empty na aaye
    const newRoadmap = new Progress({
      student: userId,
      topic: topic || "General Development",
      content: roadmapContent, 
      dailyTasks: [{ taskName: roadmapContent, isCompleted: false }]
    });
    await newRoadmap.save();

    res.status(200).json({ message: 'Roadmap generated successfully!', roadmap: newRoadmap });
  } catch (error) {
    console.error("❌ ROADMAP GENERATION ERROR:", error);
    res.status(500).json({ message: 'Error generating roadmap', error: error.message });
  }
};

// 3. Get All Roadmaps For Cards Display
exports.getAllRoadmaps = async (req, res) => {
  try {
    const { userId } = req.params;
    const roadmaps = await Progress.find({ student: userId }).sort({ createdAt: -1 });
    res.status(200).json(roadmaps);
  } catch (error) {
    console.error("❌ FETCH ROADMAPS ERROR:", error);
    res.status(500).json({ message: 'Error fetching roadmaps', error: error.message });
  }
};

// 4. Delete Saved Roadmap Card
exports.deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    await Progress.findByIdAndDelete(id);
    res.status(200).json({ message: 'Roadmap card deleted successfully!' });
  } catch (error) {
    console.error("❌ DELETE ROADMAP ERROR:", error);
    res.status(500).json({ message: 'Error deleting roadmap card', error: error.message });
  }
};