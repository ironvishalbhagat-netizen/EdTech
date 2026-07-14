import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment'; 
import TeacherDashboard from './pages/TeacherDashboard'; // ✅ Path theek kar diya hai

function App() {
  return (
    <Routes>
      {/* Default route user ko register page par bhej dega */}
      <Route path="/" element={<Navigate to="/register" />} />
      
      {/* Authentication Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      {/* Main App Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/assessment" element={<Assessment />} /> 
      
      {/* Teacher Routes */}
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} /> 
    </Routes>
  );
}

export default App;