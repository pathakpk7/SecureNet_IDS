import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Key, Download, HelpCircle, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import '../../styles/pages/profile.css';

const UserOnlyProfile = () => {
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'user',
    department: 'Engineering',
    joinedDate: '2023-06-20',
    lastLogin: '2024-04-18T08:45:00Z',
    securityScore: 85,
  });

  const [editFormData, setEditFormData] = useState({
    name: userData.name,
    email: userData.email,
    department: userData.department
  });

  const [userStats, setUserStats] = useState({
    alertsReceived: 12,
    threatsBlocked: 8,
    loginAttempts: 156,
    securityEvents: 3
  });

  const [devices, setDevices] = useState([
    { id: 'dev-1', name: 'Windows Laptop', info: 'Current device - Last active: Now', status: 'online', current: true },
    { id: 'dev-2', name: 'iPhone 13 Pro', info: 'Last active: 2 hours ago', status: 'offline', current: false },
    { id: 'dev-3', name: 'MacBook Workstation', info: 'Last active: 1 day ago', status: 'offline', current: false }
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    is2FAEnabled: false,
    isLoginAlertsEnabled: true,
    sessionTimeout: '15 mins'
  });

  const [privacy, setPrivacy] = useState({
    shareInsights: true,
    receiveRecs: true,
    anonymousStats: false
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Login successful', timestamp: '2 hours ago', location: '192.168.1.100' },
    { id: 2, action: 'Password updated', timestamp: '1 day ago', location: 'Company Office' },
    { id: 3, action: 'New device connected', timestamp: '3 days ago', location: 'Mobile Phone' },
    { id: 4, action: 'Security settings changed', timestamp: '1 week ago', location: 'Web Portal' }
  ]);

  // Modal State: null | 'editProfile' | 'manageDevices' | 'changePassword' | 'sessions' | 'getHelp'
  const [activeModal, setActiveModal] = useState(null);

  // Form states for modals
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [supportForm, setSupportForm] = useState({ subject: '', priority: 'Medium', message: '' });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserStats(prev => ({
        ...prev,
        loginAttempts: prev.loginAttempts + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserData(prev => ({
      ...prev,
      name: editFormData.name,
      email: editFormData.email,
      department: editFormData.department
    }));
    setActiveModal(null);
    toast.success('Personal Information updated successfully!');
  };

  const toggle2FA = () => {
    setSecuritySettings(prev => {
      const nextState = !prev.is2FAEnabled;
      toast.success(nextState ? 'Two-Factor Authentication Enabled!' : 'Two-Factor Authentication Disabled');
      return { ...prev, is2FAEnabled: nextState };
    });
  };

  const toggleLoginAlerts = () => {
    setSecuritySettings(prev => {
      const nextState = !prev.isLoginAlertsEnabled;
      toast.success(nextState ? 'Login notifications enabled' : 'Login notifications disabled');
      return { ...prev, isLoginAlertsEnabled: nextState };
    });
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success('Privacy preference updated');
      return updated;
    });
  };

  const handleRevokeDevice = (deviceId, deviceName) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    toast.success(`Revoked access for ${deviceName}`);
  };

  const handleAddDeviceSim = () => {
    const newDev = {
      id: `dev-${Date.now()}`,
      name: 'iPad Air 5',
      info: 'Last active: Just now',
      status: 'online',
      current: false
    };
    setDevices(prev => [...prev, newDev]);
    toast.success('New device registered successfully');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.newPass) {
      toast.error('Please complete all required password fields');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      toast.error('New passwords do not match!');
      return;
    }
    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
    setActiveModal(null);
    toast.success('Password changed successfully!');
    setRecentActivity(prev => [
      { id: Date.now(), action: 'Password updated', timestamp: 'Just now', location: 'Web Portal' },
      ...prev
    ]);
  };

  const handleDownloadData = () => {
    const exportData = {
      user: userData,
      stats: userStats,
      security: securitySettings,
      privacy: privacy,
      activity: recentActivity,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securenet_user_profile_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Account security data downloaded successfully!');
  };

  const handleSubmitSupport = (e) => {
    e.preventDefault();
    if (!supportForm.subject || !supportForm.message) {
      toast.error('Please fill out the ticket subject and description');
      return;
    }
    setSupportForm({ subject: '', priority: 'Medium', message: '' });
    setActiveModal(null);
    toast.success('Support ticket submitted! SOC team will respond shortly.');
  };

  const handleTerminateSessions = () => {
    toast.success('All other active sessions have been terminated.');
    setActiveModal(null);
  };

  return (
    <div className="user-profile-page fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Personal account settings and security information</p>
      </div>

      {/* ROW 1: Personal Information (Much smaller card in ONE ROW) */}
      <div className="profile-row-top">
        <Card className="profile-card compact-personal-card">
          <div className="compact-personal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Personal Information</h3>
              <span className="user-role-badge">{userData.role.toUpperCase()}</span>
            </div>
            <button
              onClick={() => {
                setEditFormData({ name: userData.name, email: userData.email, department: userData.department });
                setActiveModal('editProfile');
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Edit3 size={12} /> Edit Profile
            </button>
          </div>
          <div className="compact-personal-grid">
            <div className="compact-info-item">
              <span className="compact-info-label">Name</span>
              <span className="compact-info-value">{userData.name}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Email</span>
              <span className="compact-info-value">{userData.email}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Department</span>
              <span className="compact-info-value">{userData.department}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Member Since</span>
              <span className="compact-info-value">{new Date(userData.joinedDate).toLocaleDateString()}</span>
            </div>
            <div className="compact-info-item">
              <span className="compact-info-label">Security Score</span>
              <span className={`compact-info-value security-score ${userData.securityScore >= 80 ? 'high' : userData.securityScore >= 60 ? 'medium' : 'low'}`}>
                {userData.securityScore}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 2: Security Statistics, Connected Devices, Security Settings, Privacy Preferences (4 CARDS IN ONE ROW) */}
      <div className="profile-row-middle">
        <Card className="profile-card">
          <h3 className="card-title">Security Statistics</h3>
          <div className="security-stats">
            <div className="stat-item" onClick={() => toast.info(`Alerts Received: ${userStats.alertsReceived}`)} style={{ cursor: 'pointer' }}>
              <div className="stat-value">{userStats.alertsReceived}</div>
              <div className="stat-label">Alerts Received</div>
            </div>
            <div className="stat-item" onClick={() => toast.info(`Threats Blocked: ${userStats.threatsBlocked}`)} style={{ cursor: 'pointer' }}>
              <div className="stat-value">{userStats.threatsBlocked}</div>
              <div className="stat-label">Threats Blocked</div>
            </div>
            <div className="stat-item" onClick={() => toast.info(`Login Attempts: ${userStats.loginAttempts}`)} style={{ cursor: 'pointer' }}>
              <div className="stat-value">{userStats.loginAttempts}</div>
              <div className="stat-label">Login Attempts</div>
            </div>
            <div className="stat-item" onClick={() => toast.info(`Security Events: ${userStats.securityEvents}`)} style={{ cursor: 'pointer' }}>
              <div className="stat-value">{userStats.securityEvents}</div>
              <div className="stat-label">Security Events</div>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Connected Devices</h3>
          <div className="devices-list">
            {devices.slice(0, 2).map((dev) => (
              <div key={dev.id} className={`device-item ${dev.current ? 'current' : ''}`}>
                <div className="device-info">
                  <h4>{dev.name}</h4>
                  <p>{dev.info}</p>
                </div>
                <div className={`device-status ${dev.status}`}>{dev.status.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveModal('manageDevices')}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', marginTop: '12px' }}
          >
            Manage Devices ({devices.length})
          </button>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Security Settings</h3>
          <div className="security-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Two-Factor Auth</h4>
                <p>{securitySettings.is2FAEnabled ? 'Protected with 2FA' : 'Extra security layer'}</p>
              </div>
              <button
                onClick={toggle2FA}
                className={`btn btn-sm ${securitySettings.is2FAEnabled ? 'btn-danger' : 'btn-outline'}`}
                style={{
                  background: securitySettings.is2FAEnabled ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  borderColor: securitySettings.is2FAEnabled ? '#ef4444' : 'rgba(0, 245, 255, 0.4)',
                  color: securitySettings.is2FAEnabled ? '#ef4444' : '#00f5ff'
                }}
              >
                {securitySettings.is2FAEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Login Alerts</h4>
                <p>Alerts for new sign-ins</p>
              </div>
              <button
                onClick={toggleLoginAlerts}
                className="setting-status enabled"
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: securitySettings.isLoginAlertsEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                  color: securitySettings.isLoginAlertsEnabled ? '#10b981' : '#94a3b8'
                }}
              >
                {securitySettings.isLoginAlertsEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Sessions</h4>
                <p>Control active sessions</p>
              </div>
              <button
                onClick={() => setActiveModal('sessions')}
                className="btn btn-sm btn-outline"
              >
                Manage
              </button>
            </div>
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Privacy Preferences</h3>
          <div className="privacy-settings">
            <div className="privacy-item">
              <label className="privacy-label">
                <input
                  type="checkbox"
                  checked={privacy.shareInsights}
                  onChange={() => handlePrivacyChange('shareInsights')}
                  style={{ width: '16px', height: '16px', accentColor: '#00f5ff' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>Share security insights</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Share threat findings with SOC team</div>
                </div>
              </label>
            </div>
            <div className="privacy-item">
              <label className="privacy-label">
                <input
                  type="checkbox"
                  checked={privacy.receiveRecs}
                  onChange={() => handlePrivacyChange('receiveRecs')}
                  style={{ width: '16px', height: '16px', accentColor: '#00f5ff' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>Receive recommendations</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Get automated AI defense tips</div>
                </div>
              </label>
            </div>
            <div className="privacy-item">
              <label className="privacy-label">
                <input
                  type="checkbox"
                  checked={privacy.anonymousStats}
                  onChange={() => handlePrivacyChange('anonymousStats')}
                  style={{ width: '16px', height: '16px', accentColor: '#00f5ff' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '13px' }}>Anonymous usage telemetry</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Help improve global detection engine</div>
                </div>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 3: Recent Activity & Quick Actions (2 CARDS IN ONE ROW) */}
      <div className="profile-row-bottom">
        <Card className="profile-card">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-timeline">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-time">{activity.timestamp}</div>
                <div className="activity-content">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-location">from {activity.location}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="profile-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions">
            <button onClick={() => setActiveModal('changePassword')} className="action-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Key size={16} />
              Change Password
            </button>
            <button onClick={handleDownloadData} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Download size={16} />
              Download Data
            </button>
            <button onClick={() => setActiveModal('getHelp')} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <HelpCircle size={16} />
              Get Help & Support
            </button>
          </div>
        </Card>
      </div>

      {/* MODAL 1: Edit Profile */}
      {activeModal === 'editProfile' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Personal Information</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#00f5ff', color: '#000', fontWeight: '700' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Devices */}
      {activeModal === 'manageDevices' && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>Registered Devices ({devices.length})</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {devices.map((dev) => (
                <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{dev.name} {dev.current && <span style={{ fontSize: '10px', background: 'rgba(0,245,255,0.2)', color: '#00f5ff', padding: '2px 6px', borderRadius: '4px' }}>Current</span>}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>{dev.info}</p>
                  </div>
                  {!dev.current && (
                    <button
                      onClick={() => handleRevokeDevice(dev.id, dev.name)}
                      className="btn btn-sm"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', fontSize: '11px' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              <button onClick={handleAddDeviceSim} className="btn btn-outline btn-sm" style={{ marginTop: '8px' }}>
                + Add / Pair New Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Change Password */}
      {activeModal === 'changePassword' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleChangePassword} className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPass}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#00f5ff', color: '#000', fontWeight: '700' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Active Sessions */}
      {activeModal === 'sessions' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Active User Sessions</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(0,245,255,0.05)', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.2)' }}>
                <div style={{ fontWeight: '700', color: '#00f5ff', fontSize: '13px' }}>Chrome on Windows 11 (This Device)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>IP: 192.168.1.100 • Location: Local Subnet • Active Now</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>Mobile Safari on iOS</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>IP: 10.0.4.12 • Location: Cellular Network • 2 hours ago</div>
              </div>
              <button onClick={handleTerminateSessions} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', marginTop: '8px' }}>
                Terminate All Other Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Get Help & Support */}
      {activeModal === 'getHelp' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Submit Support & Security Ticket</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitSupport} className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Issue Subject</label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  placeholder="e.g., Cannot access WAF log exports"
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Priority Level</label>
                <select
                  value={supportForm.priority}
                  onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value="Low">Low - General Inquiry</option>
                  <option value="Medium">Medium - System Preference Issue</option>
                  <option value="High">High - Security Alert Discrepancy</option>
                  <option value="Critical">Critical - Urgent Account Access</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Detailed Description</label>
                <textarea
                  rows={3}
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  placeholder="Describe your issue or security question..."
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#00f5ff', color: '#000', fontWeight: '700' }}>Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOnlyProfile;

