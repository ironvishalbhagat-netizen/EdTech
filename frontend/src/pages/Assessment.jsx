import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Brain, CheckCircle, ArrowRight } from 'lucide-react';

// Dummy Questions for Diagnostic Test
const diagnosticQuestions = [
  {
    id: 1,
    subject: 'DBMS',
    topic: 'SQL Basics',
    questionText: 'Which SQL statement is used to extract data from a database?',
    options: ['EXTRACT', 'SELECT', 'GET', 'OPEN'],
    correctAnswer: 'SELECT'
  },
  {
    id: 2,
    subject: 'DBMS',
    topic: 'Joins',
    questionText: 'Which JOIN returns all rows from the right table, even if there are no matches in the left table?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'],
    correctAnswer: 'RIGHT JOIN'
  },
  {
    id: 3,
    subject: 'DBMS',
    topic: 'Normalization',
    questionText: 'What is the primary goal of Database Normalization?',
    options: ['Increase redundancy', 'Reduce data redundancy', 'Improve UI', 'Increase database size'],
    correctAnswer: 'Reduce data redundancy'
  }
];

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleOptionSelect = (option) => {
    setAnswers({ ...answers, [currentStep]: option });
  };

  const handleNext = async () => {
    if (currentStep < diagnosticQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate score and submit
      submitTest();
    }
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    let score = 0;
    let weakTopics = [];
    let strongTopics = [];

    diagnosticQuestions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score += 1;
        strongTopics.push(q.topic);
      } else {
        weakTopics.push(q.topic);
      }
    });

    try {
      const token = localStorage.getItem('token');
      // Basic token decoding to get User ID safely
      let userId = null;
      if (token) {
        const payload = token.split('.')[1];
        userId = JSON.parse(atob(payload)).id;
      }

      const response = await axios.post('http://localhost:5000/api/assessment/submit-test', {
        userId,
        score,
        maxScore: diagnosticQuestions.length,
        weakTopics,
        strongTopics,
        subject: 'DBMS'
      });

      setResult(response.data);
      toast.success('Assessment Completed!');
    } catch (error) {
      toast.error('Error submitting test');
      console.error(error);
    }
    setIsSubmitting(false);
  };

  // ---------------------------------------------------------
  // UI 1: RESULTS DASHBOARD (Shows after test is submitted)
  // ---------------------------------------------------------
  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Assessment Complete!</h2>
          <p className="text-gray-500 mb-6">Based on your performance, here is your assigned level:</p>
          
          <div className="inline-block px-6 py-2 bg-indigo-100 text-indigo-800 rounded-full text-xl font-semibold mb-8">
            {result.level} Level
          </div>

          <div className="text-left bg-slate-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Brain className="mr-2 text-indigo-600" size={20}/> Your AI Learning Roadmap
            </h3>
            
            <ul className="space-y-3">
              {result.roadmap && result.roadmap.length > 0 ? (
                result.roadmap.map((task, i) => (
                  <li key={i} className="flex items-center text-gray-700 bg-white p-3 rounded shadow-sm border border-gray-100">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {i + 1}
                    </span>
                    {task.taskName}
                  </li>
                ))
              ) : (
                <li className="text-gray-600">Great job! You mastered all topics. Proceed to advanced modules.</li>
              )}
            </ul>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // UI 2: QUIZ INTERFACE (Shows while taking the test)
  // ---------------------------------------------------------
  const question = diagnosticQuestions[currentStep];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Toaster position="top-right" />
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Brain className="mr-2 text-indigo-600" /> AI Skill Assessment
          </h2>
          <span className="text-sm font-medium text-gray-500">
            Question {currentStep + 1} of {diagnosticQuestions.length}
          </span>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2 block">
            {question.subject} • {question.topic}
          </span>
          <h3 className="text-2xl font-medium text-gray-800">{question.questionText}</h3>
        </div>

        {/* Options List */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                answers[currentStep] === option 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-100 hover:border-indigo-300 hover:bg-slate-50 text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Next / Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!answers[currentStep] || isSubmitting}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isSubmitting 
              ? 'Analyzing...' 
              : currentStep === diagnosticQuestions.length - 1 ? 'Finish Assessment' : 'Next Question'
            }
            {!isSubmitting && <ArrowRight className="ml-2" size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Assessment;