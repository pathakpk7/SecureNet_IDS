import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Settings, Info, Bell, Check, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import { supabase } from '../../api/supabase';
import toast from 'react-hot-toast';
import '../../styles/pages/notifications.css';

const USER_NOTIF_KEY = 'securenet_user_notifications_v3';
const READ_NOTIF_KEY = 'securenet_read_notifications_ids';
const DELETED_NOTIF_KEY = 'securenet_deleted_notifications_ids';

const BASELINE_USER_NOTIFICATIONS = [
  {
    id: 'user-notif-1',
    type: 'alert',
    title: 'Login Alert',
    message: 'New login detected from Chrome browser on Windows 11 system in New Delhi region.',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    priority: 'medium'
  },
  {
    id: 'user-notif-2',
    type: 'info',
    title: 'Report Available',
    message: 'Your personal monthly security audit report is ready for download.',
    time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    priority: 'low'
  },
  {
    id: 'user-notif-3',
    type: 'alert',
    title: 'Password Changed',
    message: 'Your account password was successfully updated from your account settings.',
    time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'high'
  },
  {
    id: 'user-notif-4',
    type: 'info',
    title: 'Profile Updated',
    message: 'Your personal contact email and recovery options have been modified.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low'
  },
  {
    id: 'user-notif-5',
    type: 'alert',
    title: 'Session Timeout Warning',
    message: 'Your session will expire in 5 minutes due to account inactivity.',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium'
  },
  {
    id: 'user-notif-6',
    type: 'info',
    title: 'Welcome to SecureNet',
    message: 'Welcome to SecureNet IDS! Check your security dashboard telemetry.',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low'
  }
];

const UserNotifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const formatTime = (timestamp) => {
    try {
      const time = new Date(timestamp);
      return isNaN(time.getTime()) ? 'Just now' : time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Just now';
    }
  };

  // 1. Initialize persistent state from localStorage
  const [notifications, setNotifications] = useState(() => {
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
      const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));
      const cached = localStorage.getItem(USER_NOTIF_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter(n => !deletedIds.has(String(n.id)))
            .map(n => ({
              ...n,
              read: readIds.has(String(n.id)) ? true : Boolean(n.read)
            }));
        }
      }

      return BASELINE_USER_NOTIFICATIONS
        .filter(n => !deletedIds.has(String(n.id)))
        .map(n => ({
          ...n,
          read: readIds.has(String(n.id)) ? true : Boolean(n.read)
        }));
    } catch (e) {
      return BASELINE_USER_NOTIFICATIONS;
    }
  });

  // Save helper to persist state changes
  const saveNotifications = (newList) => {
    setNotifications(newList);
    try {
      localStorage.setItem(USER_NOTIF_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save user notifications', e);
    }
  };

  // 2. Ingest alerts from Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchLiveAlerts = async () => {
      try {
        const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
        const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));

        const { data: dbAlerts, error } = await supabase
          .from('alerts')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(6);

        if (!error && dbAlerts && dbAlerts.length > 0 && isMounted) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => String(n.id)));
            const newNotifs = dbAlerts
              .filter(a => !deletedIds.has(String(`user-alert-${a.id}`)) && !existingIds.has(String(`user-alert-${a.id}`)))
              .map(a => ({
                id: `user-alert-${a.id}`,
                type: 'alert',
                title: `${a.attack_type || 'Security Alert'} Notice`,
                message: a.description || `Activity detected from ${a.source_ip || 'network'}. Risk level: ${a.risk_level || 'ELEVATED'}.`,
                time: a.detected_at || a.created_at || new Date().toISOString(),
                read: readIds.has(String(`user-alert-${a.id}`)),
                priority: String(a.risk_level || '').toLowerCase() === 'critical' ? 'high' : 'medium'
              }));

            if (newNotifs.length > 0) {
              const merged = [...newNotifs, ...prev];
              try {
                localStorage.setItem(USER_NOTIF_KEY, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            }
            return prev;
          });
        }
      } catch (err) {}
    };

    fetchLiveAlerts();

    let channel = null;
    try {
      channel = supabase
        .channel('public:alerts:user-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
          if (payload?.new && isMounted) {
            const a = payload.new;
            const newNotif = {
              id: `user-alert-${a.id || Date.now()}`,
              type: 'alert',
              title: `${a.attack_type || 'Security Notice'} Detected`,
              message: a.description || `Inbound traffic alert detected from ${a.source_ip || 'network'}.`,
              time: a.detected_at || a.created_at || new Date().toISOString(),
              read: false,
              priority: String(a.risk_level || '').toLowerCase() === 'critical' ? 'high' : 'medium'
            };
            setNotifications(prev => {
              const updated = [newNotif, ...prev];
              try {
                localStorage.setItem(USER_NOTIF_KEY, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            toast.error(`Security Alert: ${a.attack_type || 'Threat detected'}`);
          }
        })
        .subscribe();
    } catch (e) {}

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unread') return !notification.read;
      return notification.type === selectedFilter;
    });
  }, [notifications, selectedFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const highPriorityCount = useMemo(() => {
    return notifications.filter(n => n.priority === 'high').length;
  }, [notifications]);

  const alertCount = useMemo(() => {
    return notifications.filter(n => n.type === 'alert').length;
  }, [notifications]);


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
          <button className="btn btn-danger" onClick={clearAll}>
            Clear All
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
                    <div className="meta-badge-row">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority.toUpperCase()}
                      </span>
                      {!notification.read ? (
                        <button
                          className="quick-read-btn"
                          title="Mark as read"
                          onClick={(e) => markAsRead(notification.id, e)}
                        >
                          <Check size={12} /> Read
                        </button>
                      ) : (
                        <span className="read-status-badge">
                          <Check size={12} /> Read
                        </span>
                      )}
                    </div>
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
