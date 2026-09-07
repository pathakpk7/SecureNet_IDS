import React, { useState } from 'react';
import { AlertTriangle, Settings, Info, Bell } from 'lucide-react';
import Card from '../ui/Card';
import '../../styles/pages/notifications.css';

const UserNotifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const formatTime = (timestamp) => {
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
      message: 'New login detected from Chrome browser on Windows 11 system in New Delhi region.',
      time: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      priority: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Report Available',
      message: 'Your personal monthly security audit report is ready for download.',
      time: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'low'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Password Changed',
      message: 'Your account password was successfully updated from your account settings.',
      time: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'high'
    },
    {
      id: 4,
      type: 'info',
      title: 'Profile Updated',
      message: 'Your personal contact email and recovery options have been modified.',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Session Timeout Warning',
      message: 'Your session will expire in 5 minutes due to account inactivity.',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'info',
      title: 'Welcome to SecureNet',
      message: 'Welcome to SecureNet IDS! Check your security dashboard telemetry.',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      priority: 'low'
    }
  ]);

  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.read;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
  const alertCount = notifications.filter(n => n.type === 'alert').length;

  const markAsRead = (id, e) => {
    if (e) e.stopPropagation();
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id, e) => {
    if (e) e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff3366';
      case 'medium': return '#fbbf24';
      case 'low': return '#00f5ff';
      default: return '#94a3b8';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle size={16} color="#ff3366" />;
      case 'system': return <Settings size={16} color="#fbbf24" />;
      case 'info': return <Info size={16} color="#00f5ff" />;
      default: return <Bell size={16} color="#94a3b8" />;
    }
  };

  return (
    <div className="user-notifications-page fade-in">
      <div className="page-header">
        <h1 className="page-title">My Notifications</h1>
        <p className="page-subtitle">3-Column Grid • Click any card to expand full details</p>
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
            <span className="stat-value text-cyan">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value text-red">{highPriorityCount}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value text-yellow">{alertCount}</span>
            <span className="stat-label">Alerts</span>
          </div>
        </Card>
      </div>

      <div className="notifications-controls user-controls">
        <div className="filter-tabs">
          {['all', 'unread', 'alert', 'info'].map((filter) => (
            <button 
              key={filter}
              className={`filter-tab ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter === 'all' ? 'All' : filter === 'unread' ? `Unread (${unreadCount})` : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="control-actions user-actions">
          <button className="btn btn-primary" onClick={markAllAsRead}>
            Mark All Read
          </button>
        </div>
      </div>

      {/* 3 NOTIFICATIONS IN ONE ROW GRID */}
      <div className="notifications-list user-list">
        {filteredNotifications.map((notification) => {
          const isExpanded = expandedId === notification.id;

          return (
            <Card 
              key={notification.id} 
              className={`notification-item user-notification ${!notification.read ? 'unread' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}
              onClick={() => handleToggleExpand(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-icon">{getTypeIcon(notification.type)}</span>
                  <div className="notification-info">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className={`notification-message ${!isExpanded ? 'truncated' : ''}`}>
                      {notification.message}
                    </p>
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

                <button className="expand-toggle-btn" onClick={(e) => { e.stopPropagation(); handleToggleExpand(notification.id); }}>
                  {isExpanded ? 'Collapse Details ▲' : 'Expand Details ▼'}
                </button>

                {/* EXPANDED DETAILS PANEL */}
                {isExpanded && (
                  <div className="notification-details-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={(e) => markAsRead(notification.id, e)}
                        >
                          Mark Read
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={(e) => deleteNotification(notification.id, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <Card className="empty-state user-empty">
          <div className="empty-content">
            <span className="empty-icon"><Bell size={32} color="#94a3b8" /></span>
            <h3>No notifications</h3>
            <p>You have no notifications matching the current filter.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserNotifications;
