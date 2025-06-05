import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Download, Search, RefreshCw, TrendingUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastSystem';
import { useNotifications } from './NotificationCenter';
import { useAuth } from '../contexts/AuthContext';

const NotificationBellButton = () => {
  const notifications = useNotifications();
  
  return (
    <button
      onClick={notifications.toggleCenter}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-700" />
      {notifications.unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
        </span>
      )}
    </button>
  );
};

// Facilities Overview Dashboard Component with Sidebar Layout
const FacilitiesOverview = () => {
  const toast = useToast();
  const [facilities] = useState([
    {
      id: 1,
      name: 'bp - Argos',
      type: 'Fixed',
      inspections: {
        helideckInspection: { date: '2023-06-22', provider: 'BMT', frequency: 'Annual' },
        fuelInspection: { date: '2023-08-08', provider: 'PHI', frequency: 'Annual' },
        frictionTest: { date: '2023-06-23', provider: 'BMT', frequency: '2-year', lastValue: 0.72 },
        barrierHealth: { date: '2023-06-29', provider: 'BP', frequency: 'Annual' },
        erpReview: { date: '2023-05-02', provider: 'HLO', frequency: 'Quarterly' },
        phiHelideckPlate: { date: '2023-06-29', provider: 'PHI', frequency: 'Annual' },
        brsHelideckPlate: { date: '2023-08-23', provider: 'Bristow', frequency: 'Annual' }
      },
      notes: '2 yr Friction.'
    },
    {
      id: 2,
      name: 'bp - Atlantis',
      type: 'Fixed',
      inspections: {
        helideckInspection: { date: '2023-05-03', provider: 'BMT', frequency: 'Annual' },
        fuelInspection: { date: '2023-08-24', provider: 'PHI', frequency: 'Annual' },
        frictionTest: { date: '2024-05-03', provider: 'BMT', frequency: 'Annual', lastValue: 0.58 },
        barrierHealth: { date: '2023-04-24', provider: 'BP', frequency: 'Annual' },
        erpReview: { date: '2023-05-02', provider: 'HLO', frequency: 'Quarterly' },
        phiHelideckPlate: { date: '2023-08-26', provider: 'PHI', frequency: 'Annual' },
        brsHelideckPlate: { date: '2023-06-29', provider: 'Bristow', frequency: 'Annual' }
      }
    },
    {
      id: 3,
      name: 'bp - Mad Dog',
      type: 'Fixed',
      inspections: {
        helideckInspection: { date: '2023-07-29', provider: 'BMT', frequency: 'Annual' },
        fuelInspection: { date: '2023-08-29', provider: 'PHI', frequency: 'Annual' },
        frictionTest: { date: '2022-07-29', provider: 'BMT', frequency: '2-year', lastValue: 0.68 },
        barrierHealth: { date: '2023-07-20', provider: 'BP', frequency: 'Annual' },
        erpReview: { date: '2023-05-07', provider: 'HLO', frequency: 'Quarterly' },
        phiHelideckPlate: { date: '2023-09-02', provider: 'PHI', frequency: 'Annual' },
        brsHelideckPlate: { date: '2023-06-06', provider: 'Bristow', frequency: 'Annual' }
      },
      notes: '2 yr Friction.'
    },
    {
      id: 4,
      name: 'Vessel - Blackhornet',
      type: 'Vessel',
      inspections: {
        helideckInspection: { date: '2023-09-05', provider: 'BMT', frequency: 'Annual' },
        fuelInspection: { date: '2023-09-14', provider: 'PHI', frequency: 'Annual' },
        frictionTest: { date: '2023-09-05', provider: 'BMT', frequency: '2-year', lastValue: 0.71 },
        barrierHealth: { date: null, provider: 'N/A', frequency: 'N/A' },
        erpReview: { date: '2023-04-04', provider: 'HLO', frequency: 'Quarterly' },
        phiHelideckPlate: { date: '2023-01-23', provider: 'PHI', frequency: 'Annual' },
        brsHelideckPlate: { date: '2022-10-24', provider: 'Bristow', frequency: 'Annual' }
      },
      notes: '2 yr Friction'
    },
    {
      id: 5,
      name: 'Vessel - Blacklion',
      type: 'Vessel',
      inspections: {
        helideckInspection: { date: '2022-08-11', provider: 'BMT', frequency: 'Annual' },
        fuelInspection: { date: '2023-06-02', provider: 'PHI', frequency: 'Annual' },
        frictionTest: { date: '2023-08-11', provider: 'BMT', frequency: '2-year', lastValue: 0.69 },
        barrierHealth: { date: null, provider: 'N/A', frequency: 'N/A' },
        erpReview: { date: '2023-04-04', provider: 'HLO', frequency: 'Quarterly' },
        phiHelideckPlate: { date: '2023-09-01', provider: 'PHI', frequency: 'Annual' },
        brsHelideckPlate: { date: '2022-10-23', provider: 'Bristow', frequency: 'Annual' }
      },
      notes: 'Delayed due netting to be replaced. Corrosion control challenges. 2 yr Friction.'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Calculate days until due
  const calculateDaysUntilDue = (lastDate, frequency) => {
    if (!lastDate) return -999;
    
    const last = new Date(lastDate);
    const now = new Date();
    let nextDue = new Date(last);
    
    switch (frequency) {
      case 'Annual':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      case '2-year':
        nextDue.setFullYear(nextDue.getFullYear() + 2);
        break;
      case 'Quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      default:
        return 999;
    }
    
    const diffTime = nextDue - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status color based on days until due
  const getStatusColor = (days) => {
    if (days < 0) return 'overdue';
    if (days <= 30) return 'due-soon';
    if (days <= 60) return 'warning';
    if (days <= 90) return 'upcoming';
    return 'current';
  };

  // Get status config
  const statusConfig = {
    overdue: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: '🔴' },
    'due-soon': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: '🟠' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: '🟡' },
    upcoming: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: '🔵' },
    current: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: '🟢' }
  };

  // Check for upcoming inspections on mount only
  useEffect(() => {
    const upcoming = [];
    
    facilities.forEach(facility => {
      Object.entries(facility.inspections).forEach(([type, inspection]) => {
        if (inspection.date) {
          const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
          if (days <= 90 && days >= 0) {
            upcoming.push({
              facility: facility.name,
              type: type.replace(/([A-Z])/g, ' $1').trim(),
              daysUntil: days,
              dueDate: new Date(new Date(inspection.date).setFullYear(new Date(inspection.date).getFullYear() + 1))
            });
          }
        }
      });
    });
    
    setNotifications(upcoming.sort((a, b) => a.daysUntil - b.daysUntil));
    
    // Show toast for critical items only once on mount
    const critical = upcoming.filter(item => item.daysUntil <= 30);
    if (critical.length > 0) {
      toast.warning(`${critical.length} inspection(s) due within 30 days!`, {
        id: 'critical-inspections-alert',
        action: () => setShowUpcomingOnly(true),
        actionLabel: 'View All',
        category: 'inspection',
        persist: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Filter facilities
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'all' || facility.type.toLowerCase() === filter.toLowerCase();
    
    if (showUpcomingOnly) {
      const hasUpcoming = Object.entries(facility.inspections).some(([_, inspection]) => {
        if (!inspection.date) return false;
        const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
        return days <= 90;
      });
      return matchesSearch && matchesType && hasUpcoming;
    }
    
    return matchesSearch && matchesType;
  });

  // Export to Excel
  const handleExport = () => {
    toast.loading('Generating export...', { id: 'export' });
    setTimeout(() => {
      toast.remove('export');
      toast.success('Facilities overview exported successfully!', {
        action: () => console.log('Download'),
        actionLabel: 'Download'
      });
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Quick look at all BP facilities and inspection schedules
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => toast.info('Refreshing data...')}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Refresh data"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Banner */}
          {notifications.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">
                {notifications.length} Upcoming Inspections
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                {notifications.slice(0, 3).map(n => 
                  `${n.facility}: ${n.type} (${n.daysUntil} days)`
                ).join(' • ')}
                {notifications.length > 3 && ` • +${notifications.length - 3} more`}
              </p>
            </div>
            <button
              onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showUpcomingOnly ? 'Show All' : 'View Upcoming'}
            </button>
          </div>
        </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All Facilities</option>
          <option value="fixed">Fixed Assets</option>
          <option value="vessel">Vessels</option>
        </select>
          </div>

          {/* Summary Cards */}
          <SummaryCards facilities={facilities} />

          {/* Facilities Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Facility
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Helideck<br/>Inspection
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Fuel<br/>Inspection
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Friction<br/>Test
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Barrier<br/>Health
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  ERP<br/>Review
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  PHI<br/>Helideck
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  BRS<br/>Helideck
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFacilities.map((facility) => (
                <FacilityRow
                  key={facility.id}
                  facility={facility}
                  calculateDaysUntilDue={calculateDaysUntilDue}
                  getStatusColor={getStatusColor}
                  statusConfig={statusConfig}
                  onView={() => setSelectedFacility(facility)}
                />
              ))}
            </tbody>
          </table>
        </div>
          </div>

          {/* Facility Details Modal */}
          {selectedFacility && (
            <FacilityDetailsModal
              facility={selectedFacility}
              onClose={() => setSelectedFacility(null)}
              calculateDaysUntilDue={calculateDaysUntilDue}
              getStatusColor={getStatusColor}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Sidebar Component - consistent with Dashboard
const Sidebar = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('facilities');
  
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
    if (itemId === 'dashboard') {
      navigate('/');
    } else if (itemId === 'notams') {
      navigate('/notams');
    } else if (itemId === 'helicards') {
      navigate('/helicards');
    } else if (itemId !== 'facilities') {
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

const UserProfile = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
  return (
    <div className="p-6 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role || 'User'}</p>
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

// Header Component - consistent with Dashboard
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Facilities Overview</h1>
        <div className="flex items-center gap-4">
          <NotificationBellButton />
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Summary Cards Component
const SummaryCards = ({ facilities }) => {
  // Define calculateDaysUntilDue first
  const calculateDaysUntilDue = (lastDate, frequency) => {
    if (!lastDate) return -999;
    
    const last = new Date(lastDate);
    const now = new Date();
    let nextDue = new Date(last);
    
    switch (frequency) {
      case 'Annual':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      case '2-year':
        nextDue.setFullYear(nextDue.getFullYear() + 2);
        break;
      case 'Quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      default:
        return 999;
    }
    
    const diffTime = nextDue - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateStats = () => {
    let overdue = 0;
    let dueSoon = 0;
    let upcoming = 0;
    let current = 0;

    facilities.forEach(facility => {
      Object.entries(facility.inspections).forEach(([_, inspection]) => {
        if (inspection.date && inspection.frequency !== 'N/A') {
          const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
          if (days < 0) overdue++;
          else if (days <= 30) dueSoon++;
          else if (days <= 90) upcoming++;
          else current++;
        }
      });
    });

    return { overdue, dueSoon, upcoming, current };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Current</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.current}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
            🟢
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Due in 90 Days</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
            🔵
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Due in 30 Days</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.dueSoon}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">
            🟠
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Overdue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overdue}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
            🔴
          </div>
        </div>
      </div>
    </div>
  );
};

// Facility Row Component
const FacilityRow = ({ facility, calculateDaysUntilDue, getStatusColor, statusConfig, onView }) => {
  const toast = useToast();
  
  const handleScheduleInspection = (facilityName, inspectionType) => {
    toast.success(`Scheduling ${inspectionType} for ${facilityName}`, {
      action: () => console.log('Open calendar'),
      actionLabel: 'View Calendar'
    });
  };

  const InspectionCell = ({ inspection, type }) => {
    if (!inspection.date) {
      return (
        <td className="px-4 py-4 text-center">
          <span className="text-gray-400 text-sm">N/A</span>
        </td>
      );
    }

    const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
    const status = getStatusColor(days);
    const config = statusConfig[status];
    
    return (
      <td className="px-4 py-4 text-center">
        <div 
          className={`inline-flex flex-col items-center px-3 py-2 rounded-lg border ${config.bg} ${config.border} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => {
            if (days < 30) {
              handleScheduleInspection(facility.name, type);
            }
          }}
        >
          <span className={`text-sm font-medium ${config.text}`}>
            {new Date(inspection.date).toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric',
              year: '2-digit'
            })}
          </span>
          <span className={`text-xs ${config.text} mt-1`}>
            {days < 0 ? `${Math.abs(days)}d overdue` : 
             days === 0 ? 'Due today' :
             `${days}d`}
          </span>
        </div>
      </td>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-gray-900">{facility.name}</p>
          <p className="text-sm text-gray-500">{facility.type}</p>
        </div>
      </td>
      <InspectionCell inspection={facility.inspections.helideckInspection} type="Helideck Inspection" />
      <InspectionCell inspection={facility.inspections.fuelInspection} type="Fuel Inspection" />
      <InspectionCell inspection={facility.inspections.frictionTest} type="Friction Test" />
      <InspectionCell inspection={facility.inspections.barrierHealth} type="Barrier Health Review" />
      <InspectionCell inspection={facility.inspections.erpReview} type="ERP Review" />
      <InspectionCell inspection={facility.inspections.phiHelideckPlate} type="PHI Helideck Plate" />
      <InspectionCell inspection={facility.inspections.brsHelideckPlate} type="BRS Helideck Plate" />
      <td className="px-4 py-4 text-center">
        <button
          onClick={onView}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          View
        </button>
      </td>
    </tr>
  );
};

// Facility Details Modal
const FacilityDetailsModal = ({ facility, onClose, calculateDaysUntilDue, getStatusColor }) => {
  const toast = useToast();
  
  const handleUpdateInspection = (type) => {
    toast.info(`Opening update form for ${type}...`);
  };

  const inspectionTypes = [
    { key: 'helideckInspection', label: 'Helideck Inspection', icon: '🚁' },
    { key: 'fuelInspection', label: 'Fuel Inspection', icon: '⛽' },
    { key: 'frictionTest', label: 'Friction Test', icon: '🔧' },
    { key: 'barrierHealth', label: 'Barrier Health Review', icon: '🛡️' },
    { key: 'erpReview', label: 'ERP Review', icon: '📋' },
    { key: 'phiHelideckPlate', label: 'PHI Helideck Plate', icon: '📄' },
    { key: 'brsHelideckPlate', label: 'BRS Helideck Plate', icon: '📄' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{facility.name}</h2>
              <p className="mt-1 opacity-90">{facility.type} Asset</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Notes */}
          {facility.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-1">Notes</h3>
              <p className="text-amber-800">{facility.notes}</p>
            </div>
          )}

          {/* Inspection Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Schedule</h3>
            <div className="space-y-3">
              {inspectionTypes.map(({ key, label, icon }) => {
                const inspection = facility.inspections[key];
                if (!inspection || inspection.frequency === 'N/A') return null;

                const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
                const status = getStatusColor(days);
                
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">
                            Last: {new Date(inspection.date).toLocaleDateString()} • 
                            Provider: {inspection.provider} • 
                            Frequency: {inspection.frequency}
                          </p>
                          {key === 'frictionTest' && inspection.lastValue && (
                            <p className="text-sm text-gray-600 mt-1">
                              Last Value: {inspection.lastValue}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          status === 'overdue' ? 'bg-red-100 text-red-700' :
                          status === 'due-soon' ? 'bg-orange-100 text-orange-700' :
                          status === 'warning' ? 'bg-amber-100 text-amber-700' :
                          status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {days < 0 ? `${Math.abs(days)} days overdue` :
                           days === 0 ? 'Due today' :
                           `Due in ${days} days`}
                        </div>
                        <button
                          onClick={() => handleUpdateInspection(label)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline View */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Timeline</h3>
            <TimelineView facility={facility} calculateDaysUntilDue={calculateDaysUntilDue} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                toast.info('Opening inspection history...');
              }}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              View History
            </button>
            <button
              onClick={() => {
                toast.success('Report generated for ' + facility.name);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Timeline View Component
const TimelineView = ({ facility, calculateDaysUntilDue }) => {
  const upcomingInspections = [];
  
  Object.entries(facility.inspections).forEach(([type, inspection]) => {
    if (inspection.date && inspection.frequency !== 'N/A') {
      const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
      if (days >= -30 && days <= 365) {
        const nextDate = new Date(inspection.date);
        switch (inspection.frequency) {
          case 'Annual':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          case '2-year':
            nextDate.setFullYear(nextDate.getFullYear() + 2);
            break;
          case 'Quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          default:
            // For any other frequency, default to annual
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
        
        upcomingInspections.push({
          type: type.replace(/([A-Z])/g, ' $1').trim(),
          date: nextDate,
          days: days,
          provider: inspection.provider
        });
      }
    }
  });
  
  upcomingInspections.sort((a, b) => a.days - b.days);
  
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
      {upcomingInspections.map((item, index) => (
        <div key={index} className="relative flex items-center mb-4">
          <div className={`absolute left-2 w-4 h-4 rounded-full ${
            item.days < 0 ? 'bg-red-500' :
            item.days <= 30 ? 'bg-orange-500' :
            item.days <= 60 ? 'bg-amber-500' :
            item.days <= 90 ? 'bg-blue-500' :
            'bg-green-500'
          }`}></div>
          <div className="ml-10">
            <p className="font-medium text-gray-900">{item.type}</p>
            <p className="text-sm text-gray-600">
              {item.date.toLocaleDateString()} • {item.provider}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilitiesOverview;