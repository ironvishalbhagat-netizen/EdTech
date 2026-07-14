import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      toast.success(response.data.message || 'Login Successful!');
      
      // Token aur Role dono save karenge
      const userRole = response.data.role;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', userRole); 
      
      // ROLE KE HISAAB SE REDIRECT
      setTimeout(() => {
        if (userRole === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1500); 

    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-2">Log in to continue your learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              onChange={handleChange} 
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="john@example.com" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <span className="text-xs text-indigo-600 hover:underline cursor-pointer">Forgot password?</span>
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors pr-10"
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-md transition-colors mt-2 shadow-sm"
          >
            Log In
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <span 
            className="text-indigo-600 hover:underline cursor-pointer font-medium" 
            onClick={() => navigate('/register')}
          >
            Sign up
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;