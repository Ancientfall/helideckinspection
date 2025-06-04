import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewInspection from './pages/NewInspection';
import FacilityDetails from './pages/FacilityDetails';

const App = () => (
  <Router>
    <div className="flex h-screen">
      <div className="flex-1 p-4 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inspection/new" element={<NewInspection />} />
          <Route path="/facility/:id" element={<FacilityDetails />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;
