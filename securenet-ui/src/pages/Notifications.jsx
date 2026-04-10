import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/notifications.css';

const Notifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'High Severity Alert',
      message: 'SQL injection attempt detected on login endpoint',
      time: '2 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'system',
      title: 'System Update',
      message: 'Security definitions updated successfully',
      time: '15 minutes ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Suspicious Activity',
      message: 'Multiple failed login attempts from IP 203.0.113.45',
      time: '1 hour ago',
      read: true,
      priority: 'high'
    },
    {
      id: 4,
      type: 'info',
      title: 'Report Generated',
      message: 'Weekly security report is ready for download',
      time: '2 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Network Anomaly',
      message: 'Unusual traffic pattern detected in subnet 192.168.1.0/24',
      time: '3 hours ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'system',
      title: 'Backup Completed',
      message: 'Daily system backup completed successfully',
      time: '4 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: 7,
      type: 'alert',
      title: 'Malware Detected',
      message: 'Suspicious file quarantined from user upload',
      time: '5 hours ago',
      read: true,
      priority: 'high'
    },
    {
      id: 8,
      type: 'info',
      title: 'User Activity',
      message: 'New user registration: alice.wilson@example.com',
      time: '6 hours ago',
      read: true,
      priority: 'low'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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
    <div className="notifications-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Real-time alerts and system notifications</p>
      </div>

      <div className="notifications-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{notifications.filter(n => n.priority === 'high').length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{notifications.filter(n => n.type === 'alert').length}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </Card>
      </div>

      <div className="notifications-controls">
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
        <div className="control-actions">
          <button className="btn btn-outline" onClick={markAllAsRead}>
            Mark All as Read
          </button>
          <button className="btn btn-outline">Clear All</button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`notification-item ${!notification.read ? 'unread' : ''}`}
          >
            <div className="notification-content">
              <div className="notification-header">
                <div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-info">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                </div>
                <div className="notification-meta">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority.toUpperCase()}
                  </span>
                  <span className="notification-time">{notification.time}</span>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
                <button className="btn btn-sm btn-outline">View Details</button>
                <button 
                  className="btn btn-sm btn-outline"
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
        <Card className="empty-state">
          <div className="empty-content">
            <span className="empty-icon">notifications_none</span>
            <h3>No notifications</h3>
            <p>No notifications match the current filter criteria.</p>
          </div>
        </Card>
      )}

      <Card className="notification-settings">
        <h3>Notification Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Email Notifications</span>
              <span className="setting-description">Receive notifications via email</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Push Notifications</span>
              <span className="setting-description">Receive push notifications in browser</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">High Priority Only</span>
              <span className="setting-description">Only show high priority notifications</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Sound Alerts</span>
              <span className="setting-description">Play sound for new notifications</span>
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

export default Notifications;
