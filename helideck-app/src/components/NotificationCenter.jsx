import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Bell, X, CheckCircle, XCircle, AlertTriangle, Info, Archive, Clock } from 'lucide-react';
import { notificationManager } from '../utils/notificationManager';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('helideckNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('helideckNotifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Listen to notification manager
  useEffect(() => {
    const unsubscribe = notificationManager.onNotification((notification) => {
      const newNotification = {
        ...notification,
        read: false,
        archived: false,
        category: notification.category || 'general'
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 100));
    });

    return unsubscribe;
  }, []);

  const addNotification = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now();
    const newNotification = {
      id,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      archived: false,
      category: options.category || 'general',
      ...options
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep last 100
    
    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const archiveNotification = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, archived: true, read: true } : n)
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleCenter = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const value = {
    notifications,
    unreadCount,
    isOpen,
    filter,
    setFilter,
    addNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    toggleCenter
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationBell />
      <NotificationPanel />
    </NotificationContext.Provider>
  );
};

const NotificationBell = () => {
  const { unreadCount, toggleCenter } = useNotifications();

  return (
    <button
      onClick={toggleCenter}
      className="fixed top-4 right-20 z-[90] p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Notifications"
    >
      <Bell className="w-6 h-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

const NotificationPanel = () => {
  const {
    notifications,
    isOpen,
    filter,
    setFilter,
    toggleCenter,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll
  } = useNotifications();

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'archived') return n.archived;
    if (filter === 'all') return !n.archived;
    return n.category === filter;
  });

  const categories = ['all', 'unread', 'inspection', 'helicard', 'compliance', 'system', 'archived'];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={toggleCenter} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-hidden flex flex-col z-[101]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <button
              onClick={toggleCenter}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
          <button
            onClick={markAllAsRead}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear all
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications to display</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onArchive={() => archiveNotification(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onRead, onArchive, onDelete }) => {
  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }
  };

  const currentConfig = config[notification.type] || config.info;
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
      onClick={onRead}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${currentConfig.bgColor} ${currentConfig.iconColor}`}>
          {currentConfig.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? 'font-medium' : ''} text-gray-900`}>
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{timeAgo}</span>
            {notification.category && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-500 capitalize">{notification.category}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!notification.archived && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchive(); }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Archive"
            >
              <Archive className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Delete"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return past.toLocaleDateString();
}

export default NotificationProvider;