import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { hasPermission as checkPermission, ROLES } from '../constants/roles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { token, user: userData } = response;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Use the role from user object, defaulting to SUPPLIER if not set
    const userRole = user.role || ROLES.SUPPLIER;
    
    return checkPermission(userRole, permission);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    
    const userRole = user.role || ROLES.SUPPLIER;
    return roles.includes(userRole);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};