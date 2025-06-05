import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastSystem';
import { useNotifications } from './NotificationCenter';
import { useAuth } from '../contexts/AuthContext';
import { Bell } from 'lucide-react';
import HelicardManagement from './HelicardManagement';

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

const HelicardManagementView = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <HelicardManagement />
        </main>
      </div>
    </div>
  );
};

// Sidebar Component - consistent with other views
const Sidebar = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('helicards');
  
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
    } else if (itemId === 'facilities') {
      navigate('/facilities-overview');
    } else if (itemId === 'notams') {
      navigate('/notams');
    } else if (itemId === 'helicards') {
      // Already on Helicards page
    } else {
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
        <h1 className="text-2xl font-semibold text-gray-900">Helicard Management</h1>
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

export default HelicardManagementView;