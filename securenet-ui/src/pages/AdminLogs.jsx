import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/logs.css';

const AdminLogs = () => {
  const [selectedLogLevel, setSelectedLogLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [systemLogs, setSystemLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:32:45',
      event: 'SQL Injection Attempt Blocked',
      status: 'success',
      source: 'WAF',
      details: 'Malicious SQL query detected and blocked from IP 192.168.1.105',
      userId: null,
      system: true
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:12',
      event: 'User Login Failed',
      status: 'warning',
      source: 'Auth',
      details: 'Failed login attempt for user admin from IP 203.0.113.45',
      userId: 'admin',
      system: true
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:33',
      event: 'Firewall Rule Updated',
      status: 'info',
      source: 'Firewall',
      details: 'Added new rule to block IP range 10.0.0.0/16',
      userId: null,
      system: true
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:22:18',
      event: 'Malware Detected',
      status: 'error',
      source: 'AV',
      details: 'Trojan horse detected in file upload from user john.doe',
      userId: 'john.doe',
      system: true
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:18:45',
      event: 'System Backup Completed',
      status: 'success',
      source: 'Backup',
      details: 'Daily backup completed successfully. 2.4GB backed up.',
      userId: null,
      system: true
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:15:22',
      event: 'Port Scan Detected',
      status: 'warning',
      source: 'IDS',
      details: 'Port scan detected from IP 172.16.0.22 targeting ports 80, 443, 22',
      userId: null,
      system: true
    },
    {
      id: 7,
      timestamp: '2024-01-15 14:12:08',
      event: 'Certificate Renewed',
      status: 'info',
      source: 'SSL',
      details: 'SSL certificate renewed for securenet.example.com',
      userId: null,
      system: true
    },
    {
      id: 8,
      timestamp: '2024-01-15 14:08:55',
      event: 'Database Connection Failed',
      status: 'error',
      source: 'DB',
      details: 'Unable to connect to primary database server',
      userId: null,
      system: true
    },
    {
      id: 9,
      timestamp: '2024-01-15 14:05:12',
      event: 'User Session Started',
      status: 'info',
      source: 'Auth',
      details: 'User jane.smith started new session from 192.168.1.100',
      userId: 'jane.smith',
      system: true
    },
    {
      id: 10,
      timestamp: '2024-01-15 14:02:33',
      event: 'System Update Available',
      status: 'info',
      source: 'System',
      details: 'Security updates available for kernel and packages',
      userId: null,
      system: true
    }
  ]);

  // Simulate real-time log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        event: ['System Check', 'User Activity', 'Security Scan', 'Network Monitor'][Math.floor(Math.random() * 4)],
        status: ['success', 'warning', 'error', 'info'][Math.floor(Math.random() * 4)],
        source: ['System', 'Auth', 'IDS', 'Network'][Math.floor(Math.random() * 4)],
        details: 'Automated system check completed successfully',
        userId: Math.random() > 0.7 ? ['admin', 'john.doe', 'jane.smith'][Math.floor(Math.random() * 3)] : null,
        system: true
      };
      
      setSystemLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate cursor blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorPosition(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = systemLogs.filter(log => {
    const matchesLevel = selectedLogLevel === 'all' || log.status === selectedLogLevel;
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return '#00ff00';
      case 'warning': return '#ffaa00';
      case 'error': return '#ff0000';
      case 'info': return '#00f5ff';
      default: return '#666';
    }
  };

  const handleClearLogs = () => {
    setSystemLogs([]);
    console.log('System logs cleared');
  };

  const handleExportLogs = () => {
    const logData = systemLogs.map(log => 
      `${log.timestamp} [${log.status.toUpperCase()}] [${log.source}] ${log.event}: ${log.details}`
    ).join('\n');
    
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Logs exported');
  };

  return (
    <div className="terminal-logs-page admin-logs fade-in">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-prompt">root@securenet:~$</span>
          <span className="terminal-command">cat /var/log/system.log | tail -f</span>
        </div>
      </div>

      <div className="page-header">
        <h1 className="page-title">System Logs</h1>
        <p className="page-subtitle">Full system event monitoring and audit trails</p>
      </div>

      <div className="terminal-controls">
        <div className="control-left">
          <div className="terminal-input">
            <span className="terminal-prompt">$</span>
            <input
              type="text"
              placeholder="grep -i 'search term' /var/log/system.log"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="terminal-input"
            />
            <span className={`terminal-cursor ${cursorPosition ? 'visible' : 'hidden'}`}>_</span>
          </div>
          <div className="filter-buttons">
            <button 
              className={`terminal-btn ${selectedLogLevel === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('all')}
            >
              [ALL]
            </button>
            <button 
              className={`terminal-btn ${selectedLogLevel === 'success' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('success')}
            >
              [SUCCESS]
            </button>
            <button 
              className={`terminal-btn ${selectedLogLevel === 'warning' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('warning')}
            >
              [WARNING]
            </button>
            <button 
              className={`terminal-btn ${selectedLogLevel === 'error' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('error')}
            >
              [ERROR]
            </button>
            <button 
              className={`terminal-btn ${selectedLogLevel === 'info' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('info')}
            >
              [INFO]
            </button>
          </div>
        </div>
        <div className="control-right">
          <button className="terminal-btn export" onClick={handleExportLogs}>[EXPORT]</button>
          <button className="terminal-btn clear" onClick={handleClearLogs}>[CLEAR]</button>
        </div>
      </div>

      <div className="logs-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemLogs.length}</span>
            <span className="stat-label">Total Logs</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemLogs.filter(l => l.status === 'error').length}</span>
            <span className="stat-label">Errors</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemLogs.filter(l => l.status === 'warning').length}</span>
            <span className="stat-label">Warnings</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{systemLogs.filter(l => l.status === 'success').length}</span>
            <span className="stat-label">Success</span>
          </div>
        </Card>
      </div>

      <Card className="terminal-stats-card">
        <div className="terminal-header">
          <h3>System Statistics</h3>
          <div className="terminal-actions">
            <button className="terminal-btn" onClick={handleExportLogs}>[EXPORT]</button>
            <button className="terminal-btn" onClick={handleClearLogs}>[CLEAR]</button>
            <button className="terminal-btn">[REFRESH]</button>
          </div>
        </div>
        <div className="terminal-stats">
          <div className="stat-item">
            <span className="stat-label">Total Logs:</span>
            <span className="stat-value">{systemLogs.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Filtered:</span>
            <span className="stat-value">{filteredLogs.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">System Events:</span>
            <span className="stat-value">{systemLogs.filter(l => l.system).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">User Events:</span>
            <span className="stat-value">{systemLogs.filter(l => l.userId).length}</span>
          </div>
        </div>
      </Card>

      <Card className="terminal-stats-card">
        <div className="terminal-header">
          <h3>System Logs</h3>
          <div className="terminal-actions">
            <button className="terminal-btn" onClick={handleExportLogs}>[EXPORT]</button>
            <button className="terminal-btn" onClick={handleClearLogs}>[CLEAR]</button>
            <button className="terminal-btn">[TAIL]</button>
          </div>
        </div>
        <div className="terminal-output">
          {filteredLogs.map((log, index) => (
            <div key={log.id} className="terminal-line">
              <span className="terminal-timestamp">
                [{log.timestamp}]
              </span>
              <span className={`terminal-status ${log.status}`} style={{ color: getStatusColor(log.status) }}>
                {log.status.toUpperCase()}
              </span>
              <span className="terminal-source">
                [{log.source}]
              </span>
              <span className="terminal-event">
                {log.event}
              </span>
              <span className="terminal-details">
                {log.details}
              </span>
              {log.userId && (
                <span className="terminal-user">
                  [user: {log.userId}]
                </span>
              )}
              <span className="terminal-cursor-line">_</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="logs-pagination">
        <div className="pagination-info">
          Showing {filteredLogs.length} of {systemLogs.length} logs
        </div>
        <div className="pagination-controls">
          <button className="btn btn-outline">Previous</button>
          <span className="page-info">Page 1 of 1</span>
          <button className="btn btn-outline">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
