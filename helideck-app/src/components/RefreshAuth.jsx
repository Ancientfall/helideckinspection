import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const RefreshAuth = () => {
  const { user } = useAuth();
  
  const refreshUserData = async () => {
    try {
      // Fetch fresh user data from backend
      const freshUserData = await userAPI.getCurrentUserInfo();
      
      // Update localStorage with fresh data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...freshUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Reload page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing user data:', error);
      alert('Error refreshing user data. Please try logging out and back in.');
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-yellow-50 p-4 rounded-lg shadow-lg border border-yellow-200 z-50">
      <p className="text-sm text-yellow-800 mb-2">
        If you're not seeing the correct permissions, click below to refresh:
      </p>
      <button
        onClick={refreshUserData}
        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
      >
        Refresh Permissions
      </button>
    </div>
  );
};

export default RefreshAuth;