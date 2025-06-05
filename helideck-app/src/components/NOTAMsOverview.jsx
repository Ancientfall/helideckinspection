import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Clock, Filter, Search, MapPin, Wind, Cloud, ChevronDown, ChevronUp, Download, RefreshCw, Bell } from 'lucide-react';
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

// NOTAMs Overview Component
const NOTAMsOverview = () => {
  const toast = useToast();
  const [notams, setNotams] = useState([]);
  const [isLoadingNotams, setIsLoadingNotams] = useState(true);
  
  // TODO: Fetch NOTAMs from backend API
  useEffect(() => {
    // Placeholder for API call
    // fetch('/api/notams')
    //   .then(res => res.json())
    //   .then(data => {
    //     setNotams(data);
    //     setIsLoadingNotams(false);
    //   });
    setIsLoadingNotams(false);
  }, []);

  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNotam, setExpandedNotam] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Calculate time until effective
  const getTimeUntilEffective = (effectiveFrom) => {
    const now = new Date();
    const effective = new Date(effectiveFrom);
    const diff = effective - now;
    
    if (diff < 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };


  // Filter NOTAMs
  const filteredNotams = notams.filter(notam => {
    const matchesSearch = 
      notam.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notam.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notam.type === typeFilter;
    const matchesStatus = !showActiveOnly || notam.status === 'ACTIVE';
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group NOTAMs by status
  const groupedNotams = {
    ACTIVE: filteredNotams.filter(n => n.status === 'ACTIVE'),
    UPCOMING: filteredNotams.filter(n => n.status === 'UPCOMING'),
    EXPIRED: filteredNotams.filter(n => n.status === 'EXPIRED')
  };

  const typeConfig = {
    CRITICAL: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: '🔴' },
    WARNING: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', icon: '⚠️' },
    INFO: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'ℹ️' }
  };

  // Check for critical NOTAMs on mount
  useEffect(() => {
    const criticalActive = notams.filter(n => n.type === 'CRITICAL' && n.status === 'ACTIVE');
    if (criticalActive.length > 0) {
      // Use a unique ID to prevent duplicates
      const notificationId = 'critical-notams-alert';
      toast.error(`${criticalActive.length} critical NOTAM(s) active!`, {
        id: notificationId,
        action: () => setTypeFilter('CRITICAL'),
        actionLabel: 'View Critical',
        category: 'notams',
        persist: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleRefresh = () => {
    toast.loading('Refreshing NOTAMs...', { id: 'refresh' });
    setTimeout(() => {
      toast.remove('refresh');
      toast.success('NOTAMs updated successfully');
    }, 1500);
  };

  const handleExport = () => {
    toast.loading('Generating NOTAM report...', { id: 'export' });
    setTimeout(() => {
      toast.remove('export');
      toast.success('NOTAM report exported', {
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
                Real-time notices affecting helideck operations across all facilities
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Refresh NOTAMs"
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active NOTAMs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {notams.filter(n => n.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Critical</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {notams.filter(n => n.type === 'CRITICAL' && n.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
                  🔴
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Weather Related</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {notams.filter(n => n.weatherImpact && n.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Upcoming (24h)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {notams.filter(n => n.status === 'UPCOMING').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search NOTAMs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showActiveOnly 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Active Only
            </button>
          </div>

          {/* NOTAMs List */}
          <div className="space-y-6">
            {Object.entries(groupedNotams).map(([status, notamsList]) => {
              if (notamsList.length === 0) return null;
              
              return (
                <div key={status}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    {status === 'ACTIVE' && <span className="text-green-600">● Active NOTAMs</span>}
                    {status === 'UPCOMING' && <span className="text-amber-600">● Upcoming NOTAMs</span>}
                    {status === 'EXPIRED' && <span className="text-gray-400">● Expired NOTAMs</span>}
                    <span className="text-sm font-normal text-gray-500">({notamsList.length})</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {notamsList.map((notam) => (
                      <NOTAMCard
                        key={notam.id}
                        notam={notam}
                        expanded={expandedNotam === notam.id}
                        onToggle={() => setExpandedNotam(expandedNotam === notam.id ? null : notam.id)}
                        typeConfig={typeConfig}
                        getTimeUntilEffective={getTimeUntilEffective}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

// NOTAM Card Component
const NOTAMCard = ({ notam, expanded, onToggle, typeConfig, getTimeUntilEffective }) => {
  const config = typeConfig[notam.type];
  const timeUntil = getTimeUntilEffective(notam.effectiveFrom);
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${config.border} overflow-hidden transition-all`}>
      <div 
        className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors`}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {notam.type}
              </span>
              <span className="text-sm text-gray-500">ID: {notam.id}</span>
              {notam.weatherImpact && (
                <span className="flex items-center gap-1 text-sm text-blue-600">
                  <Cloud className="w-4 h-4" />
                  Weather Impact
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{notam.title}</h3>
            <p className="text-gray-600 mb-3">{notam.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                {notam.facility}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(notam.effectiveFrom).toLocaleDateString()}
              </span>
              {timeUntil && notam.status === 'UPCOMING' && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Clock className="w-4 h-4" />
                  Effective in {timeUntil}
                </span>
              )}
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Category</p>
              <p className="font-medium">{notam.category}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Effective Period</p>
              <p className="font-medium">
                {new Date(notam.effectiveFrom).toLocaleString()} - 
                {notam.effectiveTo ? new Date(notam.effectiveTo).toLocaleString() : 'Until further notice'}
              </p>
            </div>
            
            {notam.restrictions && (
              <div>
                <p className="text-gray-500 mb-1">Restrictions</p>
                <p className="font-medium">{notam.restrictions}</p>
              </div>
            )}
            
            {notam.alternateArrangements && (
              <div>
                <p className="text-gray-500 mb-1">Alternate Arrangements</p>
                <p className="font-medium">{notam.alternateArrangements}</p>
              </div>
            )}
            
            {notam.windSpeed && (
              <div>
                <p className="text-gray-500 mb-1">Wind Conditions</p>
                <p className="font-medium flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  {notam.windSpeed} from {notam.windDirection}
                </p>
              </div>
            )}
            
            {notam.frictionValue && (
              <div>
                <p className="text-gray-500 mb-1">Friction Value</p>
                <p className="font-medium">{notam.frictionValue}</p>
              </div>
            )}
            
            {notam.contactInfo && (
              <div>
                <p className="text-gray-500 mb-1">Contact</p>
                <p className="font-medium">{notam.contactInfo}</p>
              </div>
            )}
            
            {notam.recommendedAction && (
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Recommended Action</p>
                <p className="font-medium">{notam.recommendedAction}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(notam.lastUpdated).toLocaleString()}
            </p>
            <button className="text-green-600 hover:text-green-700 font-medium text-sm">
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sidebar Component - consistent with other views
const Sidebar = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('notams');
  
  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', badge: null },
        { id: 'facilities', label: 'Facilities & Inspections', icon: '🚁', badge: null },
        { id: 'notams', label: 'NOTAMs', icon: '⚠️' },
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
    } else if (itemId === 'facilities') {
      navigate('/facilities-overview');
    } else if (itemId === 'notams') {
      // Already on NOTAMs page
    } else if (itemId === 'helicards') {
      navigate('/helicards');
    } else if (itemId !== 'notams') {
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

// Header Component
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
        <h1 className="text-2xl font-semibold text-gray-900">NOTAMs Overview</h1>
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

export default NOTAMsOverview;