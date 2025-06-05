// App.jsx - Main application wrapper with ToastProvider and NotificationProvider
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastSystem';
import { NotificationProvider } from './components/NotificationCenter';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import HelicardManagementView from './components/HelicardManagementView';
import FacilitiesOverview from './components/FacilitiesOverview';
import NOTAMsOverview from './components/NOTAMsOverview';
import NewInspection from './pages/NewInspection';
import FacilityDetails from './pages/FacilityDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import { initializeDefaultUsers } from './utils/userUtils';

const App = () => {
  useEffect(() => {
    initializeDefaultUsers();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities-overview"
                element={
                  <ProtectedRoute>
                    <FacilitiesOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notams"
                element={
                  <ProtectedRoute>
                    <NOTAMsOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/helicards"
                element={
                  <ProtectedRoute>
                    <HelicardManagementView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-inspection"
                element={
                  <ProtectedRoute requiredPermission="create_inspection">
                    <NewInspection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facility/:id"
                element={
                  <ProtectedRoute>
                    <FacilityDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
