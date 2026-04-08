import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Shield, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X,
  Filter,
  Trash2,
  Settings,
  Clock
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Critical Security Alert',
      message: 'Multiple DDoS attacks detected from suspicious IP ranges',
      timestamp: '2024-01-15 14:35:22',
      read: false,
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'warning',
      title: 'Unusual Login Activity',
      message: 'Multiple failed login attempts detected for admin account',
      timestamp: '2024-01-15 14:32:08',
      read: false,
      icon: Shield
    },
    {
      id: 3,
      type: 'success',
      title: 'System Update Complete',
      message: 'Security patches have been successfully applied',
      timestamp: '2024-01-15 14:30:45',
      read: true,
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight at 2:00 AM',
      timestamp: '2024-01-15 14:28:15',
      read: true,
      icon: Info
    },
    {
      id: 5,
      type: 'warning',
      title: 'High CPU Usage',
      message: 'Detection system CPU usage exceeding 85% threshold',
      timestamp: '2024-01-15 14:25:30',
      read: false,
      icon: AlertTriangle
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">Security alerts and system updates</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {unreadCount} unread
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 glass-card rounded-lg hover:bg-white/20 transition-colors"
            >
              <Settings className="w-5 h-5 text-blue-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <div className="flex gap-2">
            {['all', 'unread', 'critical', 'warning', 'success', 'info'].map((filterType) => (
              <motion.button
                key={filterType}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {filterType}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-gray-400">
              {filter === 'unread' ? 'All notifications have been read' : 'No notifications match the current filter'}
            </p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`glass-card p-6 border-l-4 ${
                  notification.read ? 'opacity-75' : ''
                } ${getTypeColor(notification.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getIconColor(notification.type)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-gray-300 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {notification.timestamp}
                        </div>
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
