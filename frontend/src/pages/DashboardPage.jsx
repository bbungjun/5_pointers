import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [drafts] = useState([
    { id: 'draft1', title: 'Wedding Invitation (Draft)' },
    { id: 'draft2', title: 'Birthday Party (Draft)' },
  ]);
  const [published] = useState([
    { id: 'pub1', title: 'My Portfolio Site' },
  ]);

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'exists' : 'missing');
      if (token) console.log('Token preview:', token.substring(0, 20) + '...');
      
      const subdomain = randomId();
      const response = await fetch('http://localhost:3000/users/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subdomain, title: 'Untitled' })
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response:', responseText);
      
      if (response.ok) {
        const page = JSON.parse(responseText);
        navigate(`/editor/${page.id}`);
      } else {
        console.error('API Error:', response.status, responseText);
      }
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PageLego</h1>
              <p className="text-gray-600">Welcome back, {user.nickname}!</p>
            </div>
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create New Button */}
        <div className="mb-8">
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Page
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drafts Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Drafts</h3>
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                {drafts.length}
              </span>
            </div>
            <div className="space-y-3">
              {drafts.map(draft => (
                <div 
                  key={draft.id} 
                  className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg cursor-pointer transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{draft.title}</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
              {drafts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No drafts yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Published Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Published</h3>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                {published.length}
              </span>
            </div>
            <div className="space-y-3">
              {published.map(pub => (
                <div 
                  key={pub.id} 
                  className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg cursor-pointer transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{pub.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Live</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              {published.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <p>No published pages yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;