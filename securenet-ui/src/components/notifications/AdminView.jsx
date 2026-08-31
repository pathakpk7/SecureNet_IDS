import React, { useState } from 'react';
import Card from "../ui/Card";
import "../../styles/pages/notifications.css";

const AdminNotifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'Critical Security Alert',
      message: 'SQL injection attempt detected on login endpoint from IP 203.0.113.45',
      time: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      priority: 'high',
      source: 'system',
      affectedUsers: 156
    },
    {
      id: 2,
      type: 'system',
      title: 'System Update Completed',
      message: 'Security definitions updated successfully across all nodes',
      time: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'medium',
      source: 'system',
      affectedUsers: 0
    },
    {
      id: 3,
      type: 'alert',
      title: 'Brute Force Attack Detected',
      message: 'Multiple failed login attempts from IP 192.168.1.100 - 50+ attempts',
      time: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'high',
      source: 'system',
      affectedUsers: 12
    },
    {
      id: 4,
      type: 'info',
      title: 'Weekly Security Report Generated',
      message: 'Comprehensive security report is ready for admin review',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      source: 'system',
      affectedUsers: 0
    },
    {
      id: 5,
      type: 'alert',
      title: 'Network Anomaly Detected',
      message: 'Unusual traffic pattern detected in subnet 192.168.1.0/24',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
      priority: 'medium',
      source: 'network',
      affectedUsers: 45
    },
    {
      id: 6,
      type: 'system',
      title: 'Backup System Status',
      message: 'Daily system backup completed successfully - 2.3GB backed up',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      source: 'system',
      affectedUsers: 0
    },
    {
      id: 7,
      type: 'alert',
      title: 'Malware Quarantine Alert',
      message: 'Suspicious file quarantined from user upload - hash: 7f8a9b2c',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true,
      priority: 'high',
      source: 'endpoint',
      affectedUsers: 1
    },
    {
      id: 8,
      type: 'info',
      title: 'New User Registration',
      message: 'New admin user registered: alice.wilson@example.com',
      time: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      source: 'auth',
      affectedUsers: 0
    },
    {
      id: 9,
      type: 'alert',
      title: 'Database Performance Warning',
      message: 'Database response time exceeded threshold - 3.2s average',
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      priority: 'medium',
      source: 'database',
      affectedUsers: 234
    },
    {
      id: 10,
      type: 'system',
      title: 'API Rate Limit Triggered',
      message: 'API rate limit exceeded for user john.doe@example.com',
      time: new Date(Date.now() - 10 * 60 * 60 * 1000),
      read: true,
      priority: 'medium',
      source: 'api',
      affectedUsers: 1
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
  const alertCount = notifications.filter(n => n.type === 'alert').length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
    }
  };

  const markPriority = (id, priority) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, priority } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'alert': return 'warning';
      case 'system': return 'settings';
      case 'info': return 'info';
      default: return 'notifications';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'alert': return '#ff3366';
      case 'system': return '#00f5ff';
      case 'info': return '#666';
      default: return '#666';
    }
  };

  return (
    <div className="admin-notifications-page fade-in">
      <div className="page-header">
        <h1 className="page-title">System Notifications</h1>
        <p className="page-subtitle">Monitor all system alerts and notifications</p>
      </div>

      <div className="notifications-stats admin-stats">
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{highPriorityCount}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{alertCount}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </Card>
      </div>

      <div className="notifications-controls admin-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Notifications
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'alert' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('alert')}
          >
            Alerts
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'system' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('system')}
          >
            System
          </button>
          <button 
            className={`filter-tab ${selectedFilter === 'info' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('info')}
          >
            Info
          </button>
        </div>
        <div className="control-actions admin-actions">
          <button className="btn btn-primary" onClick={markAllAsRead}>
            Mark All as Read
          </button>
          <button className="btn btn-danger" onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      <div className="notifications-list admin-list">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`notification-item admin-notification ${!notification.read ? 'unread' : ''}`}
          >
            <div className="notification-content">
              <div className="notification-header">
                <div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-info">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-meta-info">
                    <span className="notification-source">Source: {notification.source}</span>
                    {notification.affectedUsers > 0 && (
                      <span className="affected-users">
                        Affects: {notification.affectedUsers} users
                      </span>
                    )}
                  </div>
                </div>
                <div className="notification-meta">
                  <div className="priority-controls">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    >
                      {notification.priority.toUpperCase()}
                    </span>
                    <select 
                      className="priority-select"
                      value={notification.priority}
                      onChange={(e) => markPriority(notification.id, e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <span className="notification-time">{formatTime(notification.time)}</span>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button className="btn btn-sm btn-outline">View Details</button>
                <button className="btn btn-sm btn-outline">Investigate</button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteNotification(notification.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card className="empty-state admin-empty">
          <div className="empty-content">
            <span className="empty-icon">notifications_none</span>
            <h3>No system notifications</h3>
            <p>No notifications match the current filter criteria.</p>
          </div>
        </Card>
      )}

      <Card className="notification-settings admin-settings">
        <h3>System Notification Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Critical Alert SMS</span>
              <span className="setting-description">Send SMS for critical security alerts</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">System Health Monitoring</span>
              <span className="setting-description">Monitor system performance and health</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Automated Response</span>
              <span className="setting-description">Auto-respond to common threats</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Audit Trail</span>
              <span className="setting-description">Log all notification actions</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminNotifications;
