import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Settings, Info, Bell, Check, Trash2, Eye } from 'lucide-react';
import Card from "../ui/Card";
import { supabase } from "../../api/supabase";
import { getDeviceId, fetchRemoteNotificationState, pushRemoteNotificationState } from "../../api/notificationSync";
import toast from "react-hot-toast";
import InvestigationModal from "./InvestigationModal";
import "../../styles/pages/notifications.css";
import { WS_URL } from '@/config/api';

const ADMIN_NOTIF_KEY = 'securenet_admin_notifications_v3';
const READ_NOTIF_KEY = 'securenet_read_notifications_ids';
const DELETED_NOTIF_KEY = 'securenet_deleted_notifications_ids';
const SYNC_KEY = 'admin_notifications_sync';

const BASELINE_ADMIN_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Critical Security Alert',
    message: 'SQL injection attempt detected on login endpoint from IP 203.0.113.45. Multiple UNION SELECT queries evaluated against database engine.',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    source: 'ids_engine',
    affectedUsers: 156
  },
  {
    id: 'notif-2',
    type: 'system',
    title: 'System Update Completed',
    message: 'Security definitions updated successfully across all cluster nodes. Baseline anomaly detection models re-calibrated.',
    time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    priority: 'medium',
    source: 'system',
    affectedUsers: 0
  },
  {
    id: 'notif-3',
    type: 'alert',
    title: 'Brute Force Attack Detected',
    message: 'Multiple failed login attempts from IP 192.168.1.100 - 50+ attempts within 60 seconds window.',
    time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'high',
    source: 'firewall',
    affectedUsers: 12
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'Weekly Security Report',
    message: 'Comprehensive security report generated and ready for executive admin review and export.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
    source: 'reports',
    affectedUsers: 0
  },
  {
    id: 'notif-5',
    type: 'alert',
    title: 'Network Anomaly Detected',
    message: 'Unusual traffic spike detected in subnet 192.168.1.0/24 exceeding 1.2Gbps throughput.',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium',
    source: 'traffic_monitor',
    affectedUsers: 45
  },
  {
    id: 'notif-6',
    type: 'system',
    title: 'Backup System Status',
    message: 'Daily system database snapshot completed successfully - 2.3GB backed up to secure vault.',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
    source: 'vault',
    affectedUsers: 0
  },
  {
    id: 'notif-7',
    type: 'alert',
    title: 'Malware Quarantine Alert',
    message: 'Suspicious payload file quarantined from user upload endpoint - hash: 7f8a9b2c3d4e5f.',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'high',
    source: 'endpoint_agent',
    affectedUsers: 1
  },
  {
    id: 'notif-8',
    type: 'info',
    title: 'New Admin Registered',
    message: 'New administrative access granted for user: alice.wilson@securenet.io',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
    source: 'auth_service',
    affectedUsers: 0
  },
  {
    id: 'notif-9',
    type: 'alert',
    title: 'Database Response Latency',
    message: 'Database response time spiked over configured threshold - 3.2s average query latency.',
    time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium',
    source: 'database',
    affectedUsers: 234
  }
];

const AdminNotifications = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [investigatingNotification, setInvestigatingNotification] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const formatTime = (timestamp) => {
    try {
      const time = new Date(timestamp);
      if (isNaN(time.getTime())) return 'Recently';
      return time.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch(e) {
      return 'Recently';
    }
  };

  // 1. Initial State loaded from localStorage with persisted read/deleted IDs
  const [notifications, setNotifications] = useState(() => {
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
      const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));
      const stored = localStorage.getItem(ADMIN_NOTIF_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter(n => !deletedIds.has(String(n.id)))
            .map(n => ({
              ...n,
              read: readIds.has(String(n.id)) ? true : Boolean(n.read)
            }));
        }
      }

      return BASELINE_ADMIN_NOTIFICATIONS
        .filter(n => !deletedIds.has(String(n.id)))
        .map(n => ({
          ...n,
          read: readIds.has(String(n.id)) ? true : Boolean(n.read)
        }));
    } catch (e) {
      return BASELINE_ADMIN_NOTIFICATIONS;
    }
  });

  const myDeviceId = useMemo(() => getDeviceId(), []);
  const syncChannelRef = useRef(null);

  // Save helper to persist state changes
  const saveNotifications = (newList) => {
    setNotifications(newList);
    try {
      localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  };

  // 2. Ingest real-time alerts & synchronize cross-device state via Supabase
  useEffect(() => {
    let isMounted = true;

    // Fetch remote sync state from Supabase
    const syncWithRemoteState = async () => {
      try {
        const remote = await fetchRemoteNotificationState(SYNC_KEY);
        if (!isMounted) return;

        let changed = false;
        const localRead = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
        const localDeleted = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));

        remote.readIds.forEach(id => {
          if (!localRead.has(id)) {
            localRead.add(id);
            changed = true;
          }
        });

        remote.deletedIds.forEach(id => {
          if (!localDeleted.has(id)) {
            localDeleted.add(id);
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem(READ_NOTIF_KEY, JSON.stringify(Array.from(localRead)));
          localStorage.setItem(DELETED_NOTIF_KEY, JSON.stringify(Array.from(localDeleted)));
          setNotifications(prev => {
            const updated = prev
              .filter(n => !localDeleted.has(String(n.id)))
              .map(n => ({
                ...n,
                read: localRead.has(String(n.id)) ? true : Boolean(n.read)
              }));
            try {
              localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      } catch (err) {}
    };

    syncWithRemoteState();

    const fetchLiveAlerts = async () => {
      try {
        const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
        const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));

        const { data: dbAlerts, error } = await supabase
          .from('alerts')
          .select('*')
          .order('detected_at', { ascending: false })
          .limit(50);

        if (!error && dbAlerts && dbAlerts.length > 0 && isMounted) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => String(n.id)));
            const newNotifs = dbAlerts
              .filter(a => !deletedIds.has(String(`alert-${a.id}`)) && !existingIds.has(String(`alert-${a.id}`)))
              .map(a => ({
                id: `alert-${a.id}`,
                type: 'alert',
                title: `${a.attack_type || 'Threat Alert'} Detected`,
                message: a.description || `Inbound ${a.attack_type || 'attack'} detected from IP ${a.source_ip || 'External'}. Risk level: ${a.risk_level || 'HIGH'}.`,
                time: a.detected_at || a.created_at || new Date().toISOString(),
                read: readIds.has(String(`alert-${a.id}`)),
                priority: String(a.risk_level || '').toLowerCase() === 'critical' ? 'high' : 'medium',
                source: 'ids_engine',
                affectedUsers: 1
              }));

            if (newNotifs.length > 0) {
              const merged = [...newNotifs, ...prev];
              try {
                localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            }
            return prev;
          });
        }
      } catch (err) {}
    };

    fetchLiveAlerts();

    // WebSocket live stream ingestion for instant notifications
    let ws = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'packet_update' && msg.data && msg.data.prediction && isMounted) {
            const pkt = msg.data;
            const newNotif = {
              id: `ws-alert-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              type: 'alert',
              title: `Live ${pkt.prediction || 'Threat'} Detected`,
              message: `Telemetry detected ${pkt.prediction} vector from IP ${pkt.src_ip || '192.168.1.105'}:${pkt.src_port || '80'} targeting port ${pkt.dst_port || '80'}.`,
              time: new Date().toISOString(),
              read: false,
              priority: 'high',
              source: 'ids_realtime',
              affectedUsers: 1
            };
            setNotifications(prev => {
              const updated = [newNotif, ...prev];
              try {
                localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }
        } catch (e) {}
      };
    } catch (e) {}

    // Supabase alert table changes
    let alertChannel = null;
    try {
      alertChannel = supabase
        .channel('public:alerts:admin-notifs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
          if (payload?.new && isMounted) {
            const a = payload.new;
            const newNotif = {
              id: `alert-${a.id || Date.now()}`,
              type: 'alert',
              title: `${a.attack_type || 'Security Threat'} Detected`,
              message: a.description || `Inbound ${a.attack_type || 'attack'} detected from IP ${a.source_ip || 'External'}.`,
              time: a.detected_at || a.created_at || new Date().toISOString(),
              read: false,
              priority: String(a.risk_level || '').toLowerCase() === 'critical' ? 'high' : 'medium',
              source: 'ids_engine',
              affectedUsers: 1
            };
            setNotifications(prev => {
              const updated = [newNotif, ...prev];
              try {
                localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            toast.error(`New Threat Notification: ${a.attack_type || 'Attack detected'}`);
          }
        })
        .subscribe();
    } catch (e) {}

    // Supabase Real-time Cross-Device Broadcast Channel
    let syncChannel = null;
    try {
      syncChannel = supabase.channel('securenet-notifications-sync-channel', {
        config: { broadcast: { self: false } }
      });

      syncChannel.on('broadcast', { event: 'NOTIF_ACTION' }, ({ payload }) => {
        if (!payload || payload.deviceId === myDeviceId || payload.targetRole !== 'admin' || !isMounted) return;

        if (payload.action === 'MARK_READ') {
          const targetId = String(payload.id);
          try {
            const currentRead = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
            currentRead.add(targetId);
            localStorage.setItem(READ_NOTIF_KEY, JSON.stringify(Array.from(currentRead)));
          } catch (e) {}

          setNotifications(prev => {
            const updated = prev.map(n => String(n.id) === targetId ? { ...n, read: true } : n);
            try {
              localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        } else if (payload.action === 'MARK_ALL_READ') {
          try {
            const currentRead = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
            (payload.allIds || []).forEach(id => currentRead.add(String(id)));
            localStorage.setItem(READ_NOTIF_KEY, JSON.stringify(Array.from(currentRead)));
          } catch (e) {}

          setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            try {
              localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        } else if (payload.action === 'DELETE') {
          const targetId = String(payload.id);
          try {
            const currentDel = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));
            currentDel.add(targetId);
            localStorage.setItem(DELETED_NOTIF_KEY, JSON.stringify(Array.from(currentDel)));
          } catch (e) {}

          setNotifications(prev => {
            const updated = prev.filter(n => String(n.id) !== targetId);
            try {
              localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        } else if (payload.action === 'CLEAR_ALL') {
          try {
            const currentDel = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));
            (payload.allIds || []).forEach(id => currentDel.add(String(id)));
            localStorage.setItem(DELETED_NOTIF_KEY, JSON.stringify(Array.from(currentDel)));
            localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify([]));
          } catch (e) {}

          setNotifications([]);
        }
      });

      syncChannel.subscribe();
      syncChannelRef.current = syncChannel;
    } catch (e) {}

    return () => {
      isMounted = false;
      if (alertChannel) supabase.removeChannel(alertChannel);
      if (syncChannel) supabase.removeChannel(syncChannel);
    };
  }, [myDeviceId]);

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

  // Persist "Mark As Read" & Sync Across Devices
  const markAsRead = (id, e) => {
    if (e) e.stopPropagation();
    const targetId = String(id);
    let updatedReadIds = [];
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
      readIds.add(targetId);
      updatedReadIds = Array.from(readIds);
      localStorage.setItem(READ_NOTIF_KEY, JSON.stringify(updatedReadIds));
    } catch (err) {}

    const updated = notifications.map(n => 
      String(n.id) === targetId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
    toast.success('Marked as read');

    // Broadcast in real-time to other open devices (e.g. laptop or mobile)
    if (syncChannelRef.current) {
      syncChannelRef.current.send({
        type: 'broadcast',
        event: 'NOTIF_ACTION',
        payload: {
          action: 'MARK_READ',
          id: targetId,
          targetRole: 'admin',
          deviceId: myDeviceId
        }
      });
    }

    // Persist to Supabase backend
    try {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]');
      pushRemoteNotificationState(SYNC_KEY, updatedReadIds, deletedIds);
    } catch (err) {}
  };

  // Persist "Mark All As Read" & Sync Across Devices
  const markAllAsRead = () => {
    const allIds = notifications.map(n => String(n.id));
    let updatedReadIds = [];
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]'));
      allIds.forEach(id => readIds.add(id));
      updatedReadIds = Array.from(readIds);
      localStorage.setItem(READ_NOTIF_KEY, JSON.stringify(updatedReadIds));
    } catch (err) {}

    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success('All notifications marked as read');

    if (syncChannelRef.current) {
      syncChannelRef.current.send({
        type: 'broadcast',
        event: 'NOTIF_ACTION',
        payload: {
          action: 'MARK_ALL_READ',
          allIds,
          targetRole: 'admin',
          deviceId: myDeviceId
        }
      });
    }

    try {
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]');
      pushRemoteNotificationState(SYNC_KEY, updatedReadIds, deletedIds);
    } catch (err) {}
  };

  // Persist "Clear All" & Sync Across Devices
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      const allIds = notifications.map(n => String(n.id));
      let updatedDeletedIds = [];
      try {
        const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));
        allIds.forEach(id => deletedIds.add(id));
        updatedDeletedIds = Array.from(deletedIds);
        localStorage.setItem(DELETED_NOTIF_KEY, JSON.stringify(updatedDeletedIds));
      } catch (err) {}

      saveNotifications([]);
      toast.success('All notifications cleared');

      if (syncChannelRef.current) {
        syncChannelRef.current.send({
          type: 'broadcast',
          event: 'NOTIF_ACTION',
          payload: {
            action: 'CLEAR_ALL',
            allIds,
            targetRole: 'admin',
            deviceId: myDeviceId
          }
        });
      }

      try {
        const readIds = JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]');
        pushRemoteNotificationState(SYNC_KEY, readIds, updatedDeletedIds);
      } catch (err) {}
    }
  };

  // Persist Priority Change
  const markPriority = (id, priority, e) => {
    if (e) e.stopPropagation();
    const updated = notifications.map(n => 
      String(n.id) === String(id) ? { ...n, priority } : n
    );
    saveNotifications(updated);
    toast.success(`Priority set to ${priority}`);
  };

  // Persist "Delete" & Sync Across Devices
  const deleteNotification = (id, e) => {
    if (e) e.stopPropagation();
    const targetId = String(id);
    let updatedDeletedIds = [];
    try {
      const deletedIds = new Set(JSON.parse(localStorage.getItem(DELETED_NOTIF_KEY) || '[]'));
      deletedIds.add(targetId);
      updatedDeletedIds = Array.from(deletedIds);
      localStorage.setItem(DELETED_NOTIF_KEY, JSON.stringify(updatedDeletedIds));
    } catch (err) {}

    const updated = notifications.filter(n => String(n.id) !== targetId);
    saveNotifications(updated);
    toast.success('Notification removed');

    if (syncChannelRef.current) {
      syncChannelRef.current.send({
        type: 'broadcast',
        event: 'NOTIF_ACTION',
        payload: {
          action: 'DELETE',
          id: targetId,
          targetRole: 'admin',
          deviceId: myDeviceId
        }
      });
    }

    try {
      const readIds = JSON.parse(localStorage.getItem(READ_NOTIF_KEY) || '[]');
      pushRemoteNotificationState(SYNC_KEY, readIds, updatedDeletedIds);
    } catch (err) {}
  };

  const getPriorityColor = (priority) => {
    switch(String(priority).toLowerCase()) {
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
        {(showAll ? filteredNotifications : filteredNotifications.slice(0, 9)).map((notification) => {
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
                      <button 
                        className="btn btn-sm btn-outline btn-investigate"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInvestigatingNotification(notification);
                        }}
                      >
                        Investigate
                      </button>
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

      {filteredNotifications.length > 9 && (
        <div className="show-more-container" style={{ textAlign: 'center', margin: '24px 0 10px 0' }}>
          <button 
            className="btn btn-outline show-more-toggle-btn"
            onClick={() => setShowAll(prev => !prev)}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {showAll ? (
              <>Showing All {filteredNotifications.length} Notifications • Show Less ▲</>
            ) : (
              <>Show All Notifications ({filteredNotifications.length} Total) ▼</>
            )}
          </button>
        </div>
      )}

      {filteredNotifications.length === 0 && (
        <Card className="empty-state admin-empty">
          <div className="empty-content">
            <span className="empty-icon"><Bell size={32} color="#94a3b8" /></span>
            <h3>No system notifications</h3>
            <p>No notifications match the current filter criteria.</p>
          </div>
        </Card>
      )}

      {/* SOC FORENSIC INVESTIGATION MODAL */}
      {investigatingNotification && (
        <InvestigationModal
          notification={investigatingNotification}
          onClose={() => setInvestigatingNotification(null)}
          onBlockIp={(ip) => {
            try {
              supabase.from('blacklist').insert([{ 
                ip_address: ip, 
                reason: `Blocked during investigation of alert: ${investigatingNotification.title}` 
              }]);
            } catch (e) {}
          }}
          onMarkRead={(id) => markAsRead(id)}
        />
      )}
    </div>
  );
};

export default AdminNotifications;
