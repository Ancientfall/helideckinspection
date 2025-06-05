// Global notification manager to coordinate between toast and notification center
class NotificationManager {
  constructor() {
    this.toastCallbacks = [];
    this.notificationCallbacks = [];
  }

  // Register callbacks for toast system
  onToast(callback) {
    this.toastCallbacks.push(callback);
    return () => {
      this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register callbacks for notification center
  onNotification(callback) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  // Send a notification to both systems
  notify(message, type = 'info', options = {}) {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      ...options
    };

    // Send to toast system
    this.toastCallbacks.forEach(callback => {
      callback(notification);
    });

    // Send to notification center if it should persist
    if (type === 'error' || type === 'warning' || options.persist) {
      this.notificationCallbacks.forEach(callback => {
        callback(notification);
      });
    }

    return notification.id;
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Convenience methods
export const notify = {
  success: (message, options) => notificationManager.notify(message, 'success', options),
  error: (message, options) => notificationManager.notify(message, 'error', options),
  warning: (message, options) => notificationManager.notify(message, 'warning', options),
  info: (message, options) => notificationManager.notify(message, 'info', options),
  loading: (message, options) => notificationManager.notify(message, 'loading', { ...options, duration: 0 })
};