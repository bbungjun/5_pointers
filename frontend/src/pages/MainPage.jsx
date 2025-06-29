import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Cube</h1>
          <p className="text-gray-600 text-lg">Create your website in minutes</p>
        </div>
        
        <div className="space-y-4">
          <button
            className="w-full py-3 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105 active:scale-95"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          
          <button
            className="w-full py-3 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105 active:scale-95"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
          
          <button
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/login')}
          >
            Get Started Now
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Build beautiful websites with our drag & drop editor</p>
        </div>
      </div>
    </div>
  );
}

export default MainPage;