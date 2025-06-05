import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Download, Search, RefreshCw, TrendingUp, Bell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastSystem';
import { useNotifications } from './NotificationCenter';
import { useAuth } from '../contexts/AuthContext';
import { facilitiesAPI } from '../services/api';
import FacilityForm from './FacilityForm';
import { PERMISSIONS } from '../constants/roles';

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
  const { hasPermission } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  
  // Fetch facilities from backend API
  const fetchFacilities = async () => {
    setIsLoading(true);
    try {
      const data = await facilitiesAPI.getAll();
      console.log('Fetched facilities:', data);
      setFacilities(data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

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
      if (facility.inspections) {
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
      }
    });
    
    setNotifications(upcoming.sort((a, b) => a.daysUntil - b.daysUntil));
  }, [facilities]);

  // Filter facilities
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'all' || (facility.type && facility.type.toLowerCase() === filter.toLowerCase());
    
    if (showUpcomingOnly && facility.inspections) {
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

  const handleAddFacility = () => {
    setEditingFacility(null);
    setShowFacilityForm(true);
  };

  const handleEditFacility = (facility) => {
    setEditingFacility(facility);
    setShowFacilityForm(true);
  };

  const handleDeleteFacility = async (facilityId) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) {
      return;
    }

    try {
      await facilitiesAPI.delete(facilityId);
      toast.success('Facility deleted successfully');
      fetchFacilities();
    } catch (error) {
      console.error('Error deleting facility:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete facility';
      toast.error(errorMessage);
    }
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
                  onClick={fetchFacilities}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Refresh data"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
                {hasPermission(PERMISSIONS.MANAGE_FACILITIES) && (
                  <button
                    onClick={handleAddFacility}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Facility
                  </button>
                )}
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
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading facilities...
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm || filter !== 'all' ? 'No facilities match your search criteria' : 'No facilities found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Facility
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Location
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Operator
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Status
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
                        onView={() => setSelectedFacility(facility)}
                        onEdit={() => handleEditFacility(facility)}
                        onDelete={() => handleDeleteFacility(facility.id)}
                        hasManagePermission={hasPermission(PERMISSIONS.MANAGE_FACILITIES)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Facility Form Modal */}
          {showFacilityForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="max-w-lg w-full mx-4">
                <FacilityForm
                  facility={editingFacility}
                  onClose={() => {
                    setShowFacilityForm(false);
                    setEditingFacility(null);
                  }}
                  onSuccess={() => {
                    setShowFacilityForm(false);
                    setEditingFacility(null);
                    fetchFacilities();
                  }}
                />
              </div>
            </div>
          )}

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
        { id: 'notams', label: 'NOTAMs', icon: '⚠️' },
        { id: 'helicards', label: 'Helideck Plates', icon: '📄', badge: null }
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
      navigate('/helideck-plates');
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
      if (facility.inspections) {
        Object.entries(facility.inspections).forEach(([_, inspection]) => {
          if (inspection.date && inspection.frequency !== 'N/A') {
            const days = calculateDaysUntilDue(inspection.date, inspection.frequency);
            if (days < 0) overdue++;
            else if (days <= 30) dueSoon++;
            else if (days <= 90) upcoming++;
            else current++;
          }
        });
      }
    });

    return { overdue, dueSoon, upcoming, current };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Facilities</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{facilities.length}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
            🏭
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
const FacilityRow = ({ facility, onView, onEdit, onDelete, hasManagePermission }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-gray-900">{facility.name}</p>
        </div>
      </td>
      <td className="px-4 py-4 text-center text-sm text-gray-600">
        {facility.location}
      </td>
      <td className="px-4 py-4 text-center text-sm text-gray-600">
        {facility.operator}
      </td>
      <td className="px-4 py-4 text-center">
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
          {facility.type || 'Fixed'}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className={`px-2 py-1 text-xs rounded-full ${
          facility.status === 'Active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {facility.status || 'Active'}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onView}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View
          </button>
          {hasManagePermission && (
            <>
              <span className="text-gray-300">|</span>
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Edit
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// Facility Details Modal
const FacilityDetailsModal = ({ facility, onClose, calculateDaysUntilDue, getStatusColor }) => {
  const toast = useToast();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{facility.name}</h2>
              <p className="mt-1 opacity-90">{facility.type || 'Fixed'} Asset</p>
              <p className="text-sm opacity-80">{facility.location} • {facility.operator}</p>
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
          {/* Facility Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{facility.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Operator</p>
                <p className="font-medium">{facility.operator}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{facility.type || 'Fixed'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{facility.status || 'Active'}</p>
              </div>
            </div>
          </div>

          {/* Inspection Details */}
          {facility.inspections && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Schedule</h3>
              <p className="text-sm text-gray-500 mb-4">
                No inspection data available for this facility yet.
              </p>
            </div>
          )}

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

export default FacilitiesOverview;