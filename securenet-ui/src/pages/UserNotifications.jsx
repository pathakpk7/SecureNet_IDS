import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/notifications.css';

const UserNotifications = () => {
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
      title: 'Login Alert',
      message: 'New login detected from Chrome browser on Windows',
      time: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      priority: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Report Available',
      message: 'Your personal security report is ready for download',
      time: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'low'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Password Changed',
      message: 'Your password was successfully changed',
      time: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'high'
    },
    {
      id: 4,
      type: 'info',
      title: 'Profile Updated',
      message: 'Your profile information has been updated',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Session Timeout Warning',
      message: 'Your session will expire in 5 minutes due to inactivity',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'info',
      title: 'Welcome Message',
      message: 'Welcome to SecureNet IDS! Here are some getting started tips.',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
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
    <div className="user-notifications-page fade-in">
      <div className="page-header">
        <h1 className="page-title">My Notifications</h1>
        <p className="page-subtitle">Your personal alerts and notifications</p>
      </div>

      <div className="notifications-stats user-stats">
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{highPriorityCount}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{alertCount}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </Card>
      </div>

      <div className="notifications-controls user-controls">
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
            className={`filter-tab ${selectedFilter === 'info' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('info')}
          >
            Info
          </button>
        </div>
        <div className="control-actions user-actions">
          <button className="btn btn-primary" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="notifications-list user-list">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`notification-item user-notification ${!notification.read ? 'unread' : ''}`}
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
        <Card className="empty-state user-empty">
          <div className="empty-content">
            <span className="empty-icon">notifications_none</span>
            <h3>No notifications</h3>
            <p>You have no notifications matching the current filter.</p>
          </div>
        </Card>
      )}

      <Card className="notification-settings user-settings">
        <h3>Notification Preferences</h3>
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

      <Card className="help-card">
        <h3>Notification Help</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>Understanding Priority Levels</h4>
            <p>High priority notifications require immediate attention, while low priority are informational.</p>
          </div>
          <div className="help-item">
            <h4>Managing Notifications</h4>
            <p>You can mark notifications as read, delete them, or filter by type to find what you need.</p>
          </div>
          <div className="help-item">
            <h4>Need Help?</h4>
            <p>Contact your system administrator if you have questions about notifications.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserNotifications;
