import React, { useState, useEffect } from 'react';
import './AlertSystem.css';

const AlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [flashActive, setFlashActive] = useState(false);

  const playAlertSound = () => {
    // Create audio context for beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Alert frequency
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const triggerAlert = (type, message) => {
    const newAlert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setAlerts(prev => [...prev, newAlert]);
    playAlertSound();
    setFlashActive(true);
    
    // Remove flash effect after 500ms
    setTimeout(() => setFlashActive(false), 500);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
    }, 5000);
  };

  useEffect(() => {
    // Simulate random alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const alertTypes = ['warning', 'error', 'info', 'success'];
        const messages = [
          'Suspicious activity detected',
          'Security scan completed',
          'Threat neutralized',
          'System update available'
        ];
        
        const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        triggerAlert(randomType, randomMessage);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={`alert-flash ${flashActive ? 'active' : ''}`} />
      <div className="alert-container">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${alert.type}`}>
            <div className="alert-icon">
              {alert.type === 'warning' && 'warning'}
              {alert.type === 'error' && 'error'}
              {alert.type === 'info' && 'info'}
              {alert.type === 'success' && 'check_circle'}
            </div>
            <div className="alert-content">
              <div className="alert-message">{alert.message}</div>
              <div className="alert-time">{alert.timestamp}</div>
            </div>
            <button 
              className="alert-close"
              onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            >
              close
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default AlertSystem;
