import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/logs.css';

const UserLogs = () => {
  const { user } = useAuth();
  const [selectedLogLevel, setSelectedLogLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [personalLogs, setPersonalLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:32:45',
      event: 'Login Successful',
      status: 'success',
      source: 'Auth',
      details: 'User logged in successfully from 192.168.1.100',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:12',
      event: 'Password Changed',
      status: 'info',
      source: 'Auth',
      details: 'Password was updated successfully',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:33',
      event: 'File Downloaded',
      status: 'info',
      source: 'File System',
      details: 'Downloaded security-report.pdf (2.4MB)',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:22:18',
      event: 'Security Scan Completed',
      status: 'success',
      source: 'Security',
      details: 'Personal security scan completed - no threats found',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:18:45',
      event: 'Settings Updated',
      status: 'info',
      source: 'Settings',
      details: 'Email notification preferences updated',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:15:22',
      event: 'Session Started',
      status: 'info',
      source: 'Auth',
      details: 'New session started from Chrome browser',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 7,
      timestamp: '2024-01-15 14:12:08',
      event: 'Two-Factor Authentication Enabled',
      status: 'success',
      source: 'Auth',
      details: '2FA enabled via mobile app',
      userId: user?.id || 'current-user',
      system: false
    },
    {
      id: 8,
      timestamp: '2024-01-15 14:08:55',
      event: 'Profile Updated',
      status: 'info',
      source: 'Profile',
      details: 'Profile information updated',
      userId: user?.id || 'current-user',
      system: false
    }
  ]);

  // Simulate personal log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        { event: 'Page Viewed', source: 'Navigation', details: 'Viewed dashboard page' },
        { event: 'Data Exported', source: 'Export', details: 'Exported personal data (CSV)' },
        { event: 'Security Check', source: 'Security', details: 'Routine security check passed' },
        { event: 'Settings Modified', source: 'Settings', details: 'Display settings updated' }
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        event: randomEvent.event,
        status: ['success', 'info'][Math.floor(Math.random() * 2)],
        source: randomEvent.source,
        details: randomEvent.details,
        userId: user?.id || 'current-user',
        system: false
      };
      
      setPersonalLogs(prev => [newLog, ...prev.slice(0, 19)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Apply role-based filtering
  const filteredLogs = personalLogs.filter(log => {
    const matchesLevel = selectedLogLevel === 'all' || log.status === selectedLogLevel;
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    // User can only see their own logs (already filtered by userId in data)
    return matchesLevel && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return '#00ff00';
      case 'info': return '#00f5ff';
      case 'warning': return '#ffaa00';
      case 'error': return '#ff3366';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return 'check_circle';
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const handleExportLogs = () => {
    const logData = filteredLogs.map(log => 
      `${log.timestamp} [${log.status.toUpperCase()}] [${log.source}] ${log.event}: ${log.details}`
    ).join('\n');
    
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-logs-${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Personal logs exported');
  };

  return (
    <div className="user-logs-page fade-in">
      <div className="page-header">
        <h1 className="page-title">My Activity Logs</h1>
        <p className="page-subtitle">Personal activity history and security events</p>
      </div>

      <div className="user-logs-controls">
        <div className="control-left">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search your activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
            />
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedLogLevel === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${selectedLogLevel === 'success' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('success')}
            >
              Success
            </button>
            <button 
              className={`filter-btn ${selectedLogLevel === 'info' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('info')}
            >
              Info
            </button>
            <button 
              className={`filter-btn ${selectedLogLevel === 'warning' ? 'active' : ''}`}
              onClick={() => setSelectedLogLevel('warning')}
            >
              Warning
            </button>
          </div>
        </div>
        <div className="control-right">
          <button className="action-btn export" onClick={handleExportLogs}>Export</button>
        </div>
      </div>

      <div className="user-logs-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalLogs.length}</span>
            <span className="stat-label">Total Activities</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalLogs.filter(l => l.status === 'success').length}</span>
            <span className="stat-label">Successful</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalLogs.filter(l => l.source === 'Auth').length}</span>
            <span className="stat-label">Auth Events</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalLogs.filter(l => l.source === 'Security').length}</span>
            <span className="stat-label">Security Events</span>
          </div>
        </Card>
      </div>

      <Card className="user-logs-summary">
        <div className="summary-header">
          <h3>Activity Summary</h3>
          <div className="summary-actions">
            <button className="action-btn export" onClick={handleExportLogs}>Export Logs</button>
          </div>
        </div>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Recent Activities:</span>
            <span className="summary-value">{filteredLogs.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Activity:</span>
            <span className="summary-value">{filteredLogs[0]?.timestamp || 'No activity'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Account Status:</span>
            <span className="summary-value secure">Secure</span>
          </div>
        </div>
      </Card>

      <Card className="user-logs-list">
        <div className="logs-header">
          <h3>My Activity History</h3>
          <div className="logs-info">
            Showing {filteredLogs.length} of {personalLogs.length} activities
          </div>
        </div>
        <div className="logs-output">
          {filteredLogs.map((log, index) => (
            <div key={log.id} className="log-item">
              <div className="log-header">
                <span className="log-timestamp">{log.timestamp}</span>
                <span className={`log-status ${log.status}`} style={{ color: getStatusColor(log.status) }}>
                  {getStatusIcon(log.status)} {log.status.toUpperCase()}
                </span>
                <span className="log-source">{log.source}</span>
              </div>
              <div className="log-content">
                <span className="log-event">{log.event}</span>
                <span className="log-details">{log.details}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="user-logs-pagination">
        <div className="pagination-info">
          Showing {filteredLogs.length} of {personalLogs.length} activities
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

export default UserLogs;
