// components/ToastSystem.jsx - Toast notification system
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { notificationManager } from '../utils/notificationManager';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Listen to notification manager
  useEffect(() => {
    const unsubscribe = notificationManager.onToast((notification) => {
      const duration = notification.duration ?? (notification.type === 'loading' ? 0 : 5000);
      const newToast = { ...notification, duration };
      setToasts(prev => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== notification.id));
        }, duration);
      }
    });

    return unsubscribe;
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000, options = {}) => {
    const id = notificationManager.notify(message, type, { ...options, duration });
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options) => addToast(message, 'success', 5000, options),
    error: (message, options) => addToast(message, 'error', 7000, options),
    warning: (message, options) => addToast(message, 'warning', 6000, options),
    info: (message, options) => addToast(message, 'info', 5000, options),
    loading: (message, options) => addToast(message, 'loading', 0, options),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose, action, actionLabel }) => {
  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    loading: {
      icon: <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent" />,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600'
    }
  };

  const currentConfig = config[type] || config.info;

  return (
    <div className={`relative min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border ${currentConfig.bgColor} ${currentConfig.borderColor} ${currentConfig.textColor}`}>
      <div className="flex items-start gap-3">
        <div className={currentConfig.iconColor}>{currentConfig.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {action && actionLabel && (
            <button onClick={action} className="mt-2 text-sm font-medium underline hover:no-underline">
              {actionLabel}
            </button>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }} 
          className="p-1 rounded hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};