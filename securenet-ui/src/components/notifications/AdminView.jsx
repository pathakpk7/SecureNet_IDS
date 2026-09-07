import React, { useState } from 'react';
import { AlertTriangle, Settings, Info, Bell } from 'lucide-react';
import Card from "../ui/Card";
import "../../styles/pages/notifications.css";

const AdminNotifications = () => {
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
      title: 'Critical Security Alert',
      message: 'SQL injection attempt detected on login endpoint from IP 203.0.113.45. Multiple UNION SELECT queries evaluated against database engine.',
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
      message: 'Security definitions updated successfully across all cluster nodes. Baseline anomaly detection models re-calibrated.',
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
      message: 'Multiple failed login attempts from IP 192.168.1.100 - 50+ attempts within 60 seconds window.',
      time: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'high',
      source: 'system',
      affectedUsers: 12
    },
    {
      id: 4,
      type: 'info',
      title: 'Weekly Security Report',
      message: 'Comprehensive security report generated and ready for executive admin review and export.',
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
      message: 'Unusual traffic spike detected in subnet 192.168.1.0/24 exceeding 1.2Gbps throughput.',
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
      message: 'Daily system database snapshot completed successfully - 2.3GB backed up to secure vault.',
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
      message: 'Suspicious payload file quarantined from user upload endpoint - hash: 7f8a9b2c3d4e5f.',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true,
      priority: 'high',
      source: 'endpoint',
      affectedUsers: 1
    },
    {
      id: 8,
      type: 'info',
      title: 'New Admin Registered',
      message: 'New administrative access granted for user: alice.wilson@securenet.io',
      time: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      source: 'auth',
      affectedUsers: 0
    },
    {
      id: 9,
      type: 'alert',
      title: 'Database Response Latency',
      message: 'Database response time spiked over configured threshold - 3.2s average query latency.',
      time: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      priority: 'medium',
      source: 'database',
      affectedUsers: 234
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

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const markPriority = (id, priority, e) => {
    if (e) e.stopPropagation();
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, priority } : n
    ));
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
    <div className="admin-notifications-page fade-in">
      <div className="page-header">
        <h1 className="page-title">System Notifications</h1>
        <p className="page-subtitle">3-Column Grid • Click any card to expand full details</p>
      </div>

      <div className="notifications-stats admin-stats">
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total Notifications</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value text-cyan">{unreadCount}</span>
            <span className="stat-label">Unread Alerts</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value text-red">{highPriorityCount}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value text-yellow">{alertCount}</span>
            <span className="stat-label">Threat Alerts</span>
          </div>
        </Card>
      </div>

      <div className="notifications-controls admin-controls">
        <div className="filter-tabs">
          {['all', 'unread', 'alert', 'system', 'info'].map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter === 'all' ? 'All' : filter === 'unread' ? `Unread (${unreadCount})` : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="control-actions admin-actions">
          <button className="btn btn-primary" onClick={markAllAsRead}>
            Mark All Read
          </button>
          <button className="btn btn-danger" onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* 3 NOTIFICATIONS IN ONE ROW GRID */}
      <div className="notifications-list admin-list">
        {filteredNotifications.map((notification) => {
          const isExpanded = expandedId === notification.id;

          return (
            <Card 
              key={notification.id} 
              className={`notification-item admin-notification ${!notification.read ? 'unread' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}
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
                    <div className="notification-meta-info">
                      <span className="notification-source">Subsystem Source: {notification.source}</span>
                      {notification.affectedUsers > 0 && (
                        <span className="affected-users">
                          Affects: {notification.affectedUsers} active users
                        </span>
                      )}
                    </div>

                    <div className="priority-controls">
                      <label style={{ fontSize: '11px', color: '#94a3b8', marginRight: '6px' }}>Set Priority:</label>
                      <select 
                        className="priority-select"
                        value={notification.priority}
                        onChange={(e) => markPriority(notification.id, e.target.value, e)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={(e) => markAsRead(notification.id, e)}
                        >
                          Mark Read
                        </button>
                      )}
                      <button className="btn btn-sm btn-outline">Investigate</button>
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
        <Card className="empty-state admin-empty">
          <div className="empty-content">
            <span className="empty-icon"><Bell size={32} color="#94a3b8" /></span>
            <h3>No system notifications</h3>
            <p>No notifications match the current filter criteria.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminNotifications;
