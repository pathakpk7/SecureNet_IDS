import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const RealtimeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts"
        },
        (payload) => {
          console.log("REALTIME ALERT:", payload);

          setAlerts(prev => {
            const newAlert = payload.new;
            const existingAlerts = prev.filter(alert => alert.id !== newAlert.id);
            return [...existingAlerts, newAlert];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (alertId) => {
    try {
      await supabase
        .from("alerts")
        .update({ read: true })
        .eq("id", alertId);

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (err) {
      console.error("Mark alert as read failed:", err);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await supabase
        .from("alerts")
        .delete()
        .eq("id", alertId);

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error("Delete alert failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="alerts-loading">
        <div className="spinner"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>Security Alerts</h2>
        <div className="alert-stats">
          <span className="total-alerts">{alerts.length}</span>
          <span className="unread-count">
            {alerts.filter(alert => !alert.read).length} unread
          </span>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`alert-item ${alert.read ? 'read' : 'unread'}`}
            onClick={() => handleMarkAsRead(alert.id)}
          >
            <div className="alert-header">
              <span className="alert-severity">{alert.severity}</span>
              <span className="alert-time">
                {new Date(alert.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="alert-content">
              <h4>{alert.title}</h4>
              <p>{alert.description}</p>
              {alert.ip_address && (
                <p className="alert-ip">Source IP: {alert.ip_address}</p>
              )}
            </div>
            <div className="alert-actions">
              <button 
                className="mark-read-btn"
                onClick={() => handleMarkAsRead(alert.id)}
                disabled={alert.read}
              >
                {alert.read ? '✓ Read' : 'Mark as Read'}
              </button>
              <button 
                className="delete-alert-btn"
                onClick={() => handleDeleteAlert(alert.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealtimeAlerts;
