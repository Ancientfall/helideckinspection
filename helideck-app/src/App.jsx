// App.jsx - Main application wrapper with ToastProvider and NotificationProvider
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastSystem';
import { NotificationProvider } from './components/NotificationCenter';
import Dashboard from './components/Dashboard';
import HelicardManagementView from './components/HelicardManagementView';
import FacilitiesOverview from './components/FacilitiesOverview';
import NOTAMsOverview from './components/NOTAMsOverview';
import NewInspection from './pages/NewInspection';
import FacilityDetails from './pages/FacilityDetails';

const App = () => {
  return (
    <NotificationProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/facilities-overview" element={<FacilitiesOverview />} />
            <Route path="/notams" element={<NOTAMsOverview />} />
            <Route path="/helicards" element={<HelicardManagementView />} />
            <Route path="/new-inspection" element={<NewInspection />} />
            <Route path="/facility/:id" element={<FacilityDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </NotificationProvider>
  );
};

export default App;
