// components/Dashboard.jsx - Enhanced Dashboard with toast notifications
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Search, Upload, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastSystem';

const Dashboard = () => {
  const toast = useToast();
  const [activeNotams, setActiveNotams] = useState([]);
  const [metrics, setMetrics] = useState({
    activeFacilities: 47,
    inspectionsDue: 12,
    complianceRate: 96.5,
    activeNotams: 5
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate NOTAM updates
      if (Math.random() > 0.8) {
        toast.warning('New NOTAM received for Ocean Blacklion', {
          action: () => console.log('View NOTAM'),
          actionLabel: 'View Details'
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <NotamAlert />
          <MetricsDashboard metrics={metrics} />
          <QuickActions />
          <RecentInspections />
          <DocumentUpload />
        </main>
      </div>
    </div>
  );
};

// Enhanced Sidebar with toast on navigation
const Sidebar = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', badge: null },
        { id: 'facilities', label: 'Facilities & Inspections', icon: '🚁', badge: null },
        { id: 'notams', label: 'NOTAMs', icon: '⚠️', badge: 2 },
        { id: 'helicards', label: 'Helicards', icon: '📄', badge: null }
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'reports', label: 'Reports', icon: '📊', badge: null },
        { id: 'archive', label: 'Archive', icon: '📁', badge: null },
        { id: 'schedule', label: 'Schedule', icon: '📅', badge: null },
        { id: 'analytics', label: 'Analytics', icon: '📈', badge: null },
        { id: 'settings', label: 'Settings', icon: '⚙️', badge: null }
      ]
    }
  ];

  const handleNavClick = (itemId, itemLabel) => {
    setActiveSection(itemId);
    
    // Handle navigation
    if (itemId === 'facilities') {
      navigate('/facilities-overview');
    } else if (itemId === 'notams') {
      navigate('/notams');
    } else if (itemId === 'helicards') {
      navigate('/helicards');
    } else if (itemId !== 'dashboard') {
      // Show loading toast for unimplemented sections
      toast.info(`${itemLabel} section coming soon...`);
    }
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="p-6 bg-black/20 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center font-bold text-xl">
            bp
          </div>
          <div>
            <h1 className="text-xl font-semibold">HIMS</h1>
            <p className="text-xs text-gray-400">Helideck Inspection Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            {section.items.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                active={activeSection === item.id}
                onClick={() => handleNavClick(item.id, item.label)}
              />
            ))}
          </div>
        ))}
      </nav>
      
      <UserProfile />
    </aside>
  );
};

const NavItem = ({ icon, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-6 py-3 text-sm transition-colors relative
      ${active 
        ? 'bg-green-600/20 text-green-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-green-600' 
        : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
  >
    <span className="text-xl mr-3">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
        {badge}
      </span>
    )}
  </button>
);

const Header = () => {
  const toast = useToast();
  
  const handleNotificationClick = () => {
    toast.info('You have 5 unread notifications');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button 
          onClick={handleNotificationClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

// Enhanced NOTAM Alert with toast
const NotamAlert = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  
  const handleAcknowledge = () => {
    setVisible(false);
    toast.success('NOTAM acknowledged');
  };
  
  const handleViewDetails = () => {
    navigate('/notams');
  };
  
  if (!visible) return null;
  
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-xl p-5 mb-6 flex items-center gap-5">
      <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white text-2xl">
        <AlertTriangle />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900">Critical NOTAM - Black Hornet Platform</h3>
        <p className="text-amber-800 text-sm mt-1">
          Helideck temporarily restricted due to crane operations. Expected clearance: 15:00 UTC
        </p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={handleViewDetails}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          View Details
        </button>
        <button 
          onClick={handleAcknowledge}
          className="px-4 py-2 bg-white text-amber-700 border border-amber-300 rounded-lg font-medium hover:bg-amber-50 transition-colors"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

const MetricsDashboard = ({ metrics }) => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <MetricCard 
        title="Active Facilities" 
        value={metrics.activeFacilities} 
        icon="🚁" 
        color="green" 
        onClick={() => navigate('/facilities-overview')}
      />
      <MetricCard 
        title="Inspections Due" 
        value={metrics.inspectionsDue} 
        icon="📋" 
        color="yellow" 
        onClick={() => navigate('/facilities-overview')}
      />
      <MetricCard 
        title="Compliance Rate" 
        value={`${metrics.complianceRate}%`} 
        icon="✓" 
        color="blue" 
      />
      <MetricCard 
        title="Active NOTAMs" 
        value={metrics.activeNotams} 
        icon="⚠️" 
        color="red" 
        onClick={() => navigate('/notams')}
      />
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, onClick }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Quick Actions with toast notifications
const QuickActions = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  const handleNewInspection = () => {
    navigate('/new-inspection');
  };
  
  const handleUploadHelicard = () => {
    navigate('/helicards');
    // Could also show a toast to indicate to open the upload modal
    setTimeout(() => {
      toast.info('Click "Upload New Helicard" to add a new document');
    }, 500);
  };
  
  const handleGenerateReport = () => {
    const loadingId = Date.now();
    toast.loading('Generating report...', { id: loadingId });
    
    setTimeout(() => {
      toast.remove(loadingId);
      toast.success('Report generated successfully!', {
        action: () => console.log('Download report'),
        actionLabel: 'Download'
      });
    }, 2000);
  };
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={handleNewInspection}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3"
        >
          <Plus className="w-5 h-5 text-green-600" />
          <span className="font-medium">New Inspection</span>
        </button>
        <button 
          onClick={handleUploadHelicard}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3"
        >
          <Upload className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Upload Helicard</span>
        </button>
        <button 
          onClick={handleGenerateReport}
          className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3"
        >
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="font-medium">Generate Report</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Recent Inspections with toast actions
const RecentInspections = () => {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [inspections] = useState([
    {
      id: 1,
      facility: 'Ocean Blacklion',
      type: 'Helideck CAP 437',
      inspector: 'BMT Group',
      date: '2024-01-15',
      status: 'current'
    },
    {
      id: 2,
      facility: 'Black Hornet',
      type: 'Fuel Assessment',
      inspector: 'PHI Aviation',
      date: '2024-01-10',
      status: 'current'
    },
    {
      id: 3,
      facility: 'Platform Alpha',
      type: 'Friction Test',
      inspector: 'BMT Group',
      date: '2023-12-20',
      status: 'due'
    }
  ]);

  const handleViewInspection = (inspection) => {
    toast.info(`Loading inspection for ${inspection.facility}...`);
  };

  const handleScheduleInspection = (facility) => {
    toast.success(`Inspection scheduled for ${facility}`, {
      action: () => console.log('View calendar'),
      actionLabel: 'View Calendar'
    });
  };

  const statusConfig = {
    current: { color: 'bg-green-50 text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Current' },
    due: { color: 'bg-amber-50 text-amber-700', icon: <Clock className="w-4 h-4" />, label: 'Due Soon' },
    overdue: { color: 'bg-red-50 text-red-700', icon: <AlertTriangle className="w-4 h-4" />, label: 'Overdue' }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Inspections</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['all', 'helideck', 'fuel', 'friction'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all
                ${filter === type 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Facility
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Inspector
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection) => {
              const status = statusConfig[inspection.status];
              return (
                <tr key={inspection.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">{inspection.facility}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{inspection.type}</td>
                  <td className="py-4 px-4 text-gray-600">{inspection.inspector}</td>
                  <td className="py-4 px-4 text-gray-600">{inspection.date}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {inspection.status === 'current' ? (
                      <button 
                        onClick={() => handleViewInspection(inspection)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        View
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleScheduleInspection(inspection.facility)}
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                      >
                        Schedule
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Document Upload with toast notifications
const DocumentUpload = () => {
  const toast = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
      const loadingId = Date.now();
      toast.loading(`Uploading ${files.length} file(s)...`, { id: loadingId });
      
      // Simulate upload
      setTimeout(() => {
        toast.remove(loadingId);
        toast.success(`Successfully uploaded ${files.length} document(s)!`);
      }, 2000);
    }
  };

  const handleFileSelect = () => {
    toast.info('Opening file selector...');
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl p-8 border-2 border-dashed transition-all cursor-pointer
        ${isDragging 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
          <Upload className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Inspection Documents</h3>
        <p className="text-gray-500 mb-6">Drag and drop files here or click to browse</p>
        <button 
          onClick={handleFileSelect}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Select Files
        </button>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const toast = useToast();
  
  const handleLogout = () => {
    toast.info('Logging out...');
    setTimeout(() => {
      console.log('Logout complete');
    }, 1000);
  };
  
  return (
    <div className="p-6 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
          JD
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-xs text-gray-400">Inspector</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;