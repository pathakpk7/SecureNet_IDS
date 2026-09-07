import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, Zap, Users, Shield, Download, BarChart2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import '../../styles/pages/profile.css';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState({
    name: 'System Administrator',
    email: 'admin@securenet.com',
    role: 'admin',
    department: 'IT Security',
    joinedDate: '2023-01-15',
    lastLogin: '2024-04-18T09:30:00Z',
    permissions: ['ALL'],
    activeSessions: 3,
    securityLevel: 'MAXIMUM'
  });

  const [systemStats, setSystemStats] = useState({
    totalUsers: 127,
    activeThreats: 8,
    systemUptime: '99.7%',
    lastBackup: '2 hours ago'
  });

  const [adminActions, setAdminActions] = useState([
    { id: 1, action: 'Modified firewall rules', timestamp: '2 hours ago', type: 'security' },
    { id: 2, action: 'Created new user account', timestamp: '5 hours ago', type: 'user-management' },
    { id: 3, action: 'Updated system configuration', timestamp: '1 day ago', type: 'system' },
    { id: 4, action: 'Generated security report', timestamp: '2 days ago', type: 'report' }
  ]);

  const [isBackupRunning, setIsBackupRunning] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeThreats: Math.max(0, prev.activeThreats + Math.floor(Math.random() * 3) - 1)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRunBackup = () => {
    setIsBackupRunning(true);
    toast.loading('Initiating system snapshot backup...', { id: 'admin-backup' });
    setTimeout(() => {
      setIsBackupRunning(false);
      setSystemStats(prev => ({ ...prev, lastBackup: 'Just now' }));
      toast.success('Full system backup completed successfully!', { id: 'admin-backup' });
      setAdminActions(prev => [
        { id: Date.now(), action: 'Executed full system backup', timestamp: 'Just now', type: 'system' },
        ...prev
      ]);
    }, 2000);
  };

  const handleGenerateReport = () => {
    toast.success('Generating administrator SOC audit report...');
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemStats, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "admin_audit_report.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Audit report downloaded successfully!');
    }, 500);
  };

  return (
    <div className="admin-profile-page fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Administrator Profile</h1>
        <p className="page-subtitle">System administrator account and security settings</p>
      </div>

      {/* ROW 1: Admin Information (Compact single-row card) */}
      <div className="profile-row-top">
        <Card className="profile-card compact-personal-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="compact-personal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 className="card-title" style={{ margin: 0, color: '#ef4444' }}>Admin Information</h3>
              <span className="user-role-badge" style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>{adminData.role.toUpperCase()}</span>
            </div>
            <button
              onClick={() => toast.info('Admin credentials are managed via Vault SSO.')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '4px 12px', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Lock size={12} /> SSO Vault
            </button>
          </div>
          <div className="compact-personal-grid">
            <div className="compact-info-item">
              <span className="compact-info-label">Name</span>
              <span className="compact-info-value">{adminData.name}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Email</span>
              <span className="compact-info-value">{adminData.email}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Department</span>
              <span className="compact-info-value">{adminData.department}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Joined</span>
              <span className="compact-info-value">{new Date(adminData.joinedDate).toLocaleDateString()}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Security Level</span>
              <span className="compact-info-value" style={{ color: '#ef4444', fontWeight: '700' }}>{adminData.securityLevel}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 2: System Overview, Security Settings, Admin Privileges (3 Cards in 1 Row) */}
      <div className="profile-row-middle" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Card className="profile-card">
          <h3 className="card-title">System Overview</h3>
          <div className="system-overview">
            <div className="overview-item" onClick={() => toast.info(`Total Active Users: ${systemStats.totalUsers}`)} style={{ cursor: 'pointer' }}>
              <span className="overview-label">Total Users:</span>
              <span className="overview-value">{systemStats.totalUsers}</span>
            </div>
            <div className="overview-item" onClick={() => toast.warning(`Active Threats Detected: ${systemStats.activeThreats}`)} style={{ cursor: 'pointer' }}>
              <span className="overview-label">Active Threats:</span>
              <span className="overview-value threats">{systemStats.activeThreats}</span>
            </div>
            <div className="overview-item" onClick={() => toast.success(`System Uptime: ${systemStats.systemUptime}`)} style={{ cursor: 'pointer' }}>
              <span className="overview-label">System Uptime:</span>
              <span className="overview-value">{systemStats.systemUptime}</span>
            </div>
            <div className="overview-item" onClick={() => toast.info(`Last Backup: ${systemStats.lastBackup}`)} style={{ cursor: 'pointer' }}>
              <span className="overview-label">Last Backup:</span>
              <span className="overview-value">{systemStats.lastBackup}</span>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Security Settings</h3>
          <div className="security-settings">
            <div className="setting-item" onClick={() => toast.success('2FA enforced for all Admin Accounts')} style={{ cursor: 'pointer' }}>
              <div className="setting-info">
                <h4>Two-Factor Auth</h4>
                <p>Enhanced admin security</p>
              </div>
              <div className="setting-status enabled">ENABLED</div>
            </div>
            <div className="setting-item" onClick={() => toast.info('Admin Inactivity Timeout: 15 Minutes')} style={{ cursor: 'pointer' }}>
              <div className="setting-info">
                <h4>Session Timeout</h4>
                <p>Auto-logout inactive</p>
              </div>
              <div className="setting-status">15 min</div>
            </div>
            <div className="setting-item" onClick={() => toast.success('IP Whitelisting Active for Subnet')} style={{ cursor: 'pointer' }}>
              <div className="setting-info">
                <h4>IP Whitelist</h4>
                <p>Restrict by IP</p>
              </div>
              <div className="setting-status enabled">ENABLED</div>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Admin Privileges</h3>
          <div className="privileges-list">
            <div className="privilege-item full-access" onClick={() => toast.info('Access Level: ROOT / ALL PERMISSIONS')} style={{ cursor: 'pointer' }}>
              <span className="privilege-icon"><Zap size={18} color="#00f5ff" /></span>
              <div className="privilege-info">
                <h4>Full System Access</h4>
                <p>Complete control over system</p>
              </div>
            </div>
            <div className="privilege-item" onClick={() => toast.info('User Management Privilege Active')} style={{ cursor: 'pointer' }}>
              <span className="privilege-icon"><Users size={18} color="#00f5ff" /></span>
              <div className="privilege-info">
                <h4>User Management</h4>
                <p>Create/modify user accounts</p>
              </div>
            </div>
            <div className="privilege-item" onClick={() => toast.info('Security Policy Engine Active')} style={{ cursor: 'pointer' }}>
              <span className="privilege-icon"><Shield size={18} color="#00f5ff" /></span>
              <div className="privilege-info">
                <h4>Security Configuration</h4>
                <p>Modify security policies</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 3: Recent Admin Actions & Quick Admin Actions (2 Cards in 1 Row) */}
      <div className="profile-row-bottom">
        <Card className="profile-card">
          <h3 className="card-title">Recent Admin Actions</h3>
          <div className="actions-timeline">
            {adminActions.map(action => (
              <div key={action.id} className="action-item">
                <div className="action-time">{action.timestamp}</div>
                <div className="action-content">
                  <span className={`action-type ${action.type}`}>{action.type}</span>
                  <span className="action-text">{action.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Quick Admin Actions</h3>
          <div className="quick-actions">
            <button onClick={() => toast.info('User Management Panel opened.')} className="action-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Users size={16} />
              Manage Users
            </button>
            <button onClick={() => toast.info('Navigating to Security Policy Config...')} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Shield size={16} />
              Security Settings
            </button>
            <button onClick={handleRunBackup} disabled={isBackupRunning} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Download size={16} />
              {isBackupRunning ? 'Backing Up...' : 'System Backup'}
            </button>
            <button onClick={handleGenerateReport} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <BarChart2 size={16} />
              Generate Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;

