import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Key, Download, HelpCircle, X, Lock, Shield, Activity, Clock, Zap, Server } from 'lucide-react';
import Card from '../../components/ui/Card';
import '../../styles/pages/profile.css';
import { API_BASE, API_V1, WS_URL } from '@/config/api';

const UserOnlyProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    joinedDate: '',
    lastLogin: '',
    securityScore: 0,
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    department: ''
  });

  const [userStats, setUserStats] = useState({
    alertsReceived: 12,
    threatsBlocked: 4,
    loginAttempts: 45,
    securityEvents: 2
  });

  const [devices, setDevices] = useState([]);

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

  const [recentActivity, setRecentActivity] = useState([]);

  // Modal State: null | 'editProfile' | 'manageDevices' | 'changePassword' | 'sessions' | 'getHelp'
  const [activeModal, setActiveModal] = useState(null);

  // Form states for modals
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [supportForm, setSupportForm] = useState({ subject: '', priority: 'Medium', message: '' });

  // Fetch user profile from auth context / backend
  useEffect(() => {
    // Load user data from localStorage (set during login)
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const profile = {
          name: parsed.user_metadata?.name || parsed.name || parsed.email?.split('@')[0] || 'System User',
          email: parsed.email || 'user@securenet.com',
          role: parsed.role || 'user',
          department: parsed.organization?.name || parsed.department || 'General Network',
          joinedDate: parsed.created_at || parsed.joinedDate || new Date().toISOString(),
          lastLogin: parsed.last_login || new Date().toISOString(),
          securityScore: parsed.securityScore || 100,
        };
        setUserData(profile);
        setEditFormData({ name: profile.name, email: profile.email, department: profile.department });
      } catch (e) {
        console.error("Error parsing demoUser:", e);
      }
    }

    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/stats`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setUserStats({
            alertsReceived: data.alerts_generated || 0,
            threatsBlocked: data.threat_intel_checks || 0,
            loginAttempts: data.packets_processed || 0,
            securityEvents: data.attacks_detected || 0
          });
        }
      } catch (e) {}
    };

    // Fetch recent activity from logs
    const fetchActivity = async () => {
      try {
        const res = await fetch(`${API_BASE}/logs?limit=4`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || []);
          if (list.length > 0) {
            setRecentActivity(list.map((log, i) => ({
              id: log.id || i,
              action: log.message || 'Activity logged',
              timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent',
              location: log.source || 'System'
            })));
          }
        }
      } catch (e) {}
    };

    fetchStats();
    fetchActivity();
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'rgba(0, 245, 255, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 245, 255, 0.3)' }}>
          <Shield size={32} color="#00f5ff" />
        </div>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', color: '#f8fafc', fontWeight: 'bold', textShadow: '0 0 10px rgba(0, 245, 255, 0.2)' }}>Operator Profile</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Personal account settings and security telemetry</p>
        </div>
      </div>

      <div className="profile-cards-grid">
        {/* PERSONAL INFO */}
        <Card style={{ background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(0, 245, 255, 0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#00f5ff', boxShadow: '0 0 15px #00f5ff' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#00f5ff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <Lock size={18} /> IDENTITY VAULT
            </h3>
            <span style={{ padding: '4px 10px', background: 'rgba(0, 245, 255, 0.15)', color: '#00f5ff', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>{userData.role.toUpperCase()}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identity</span>
              <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '500' }}>{userData.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</span>
              <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '500' }}>{userData.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Node</span>
              <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '500' }}>{userData.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Join Date</span>
              <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>{new Date(userData.joinedDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <button onClick={() => { setEditFormData({ name: userData.name, email: userData.email, department: userData.department }); setActiveModal('editProfile'); }} className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Edit3 size={14} /> Edit Identity
          </button>
        </Card>

        {/* SECURITY STATS */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Activity size={18} /> SECURITY METRICS
          </h3>
          <div className="profile-metrics-grid">
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Alerts Rx</div>
              <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>{userStats.alertsReceived}</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ color: '#10b981', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Threats Blk</div>
              <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(16,185,129,0.3)' }}>{userStats.threatsBlocked}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Logins</div>
              <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: 'bold' }}>{userStats.loginAttempts}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Trust Score</div>
              <div style={{ color: userData.securityScore >= 80 ? '#10b981' : '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>{userData.securityScore}%</div>
            </div>
          </div>
        </Card>

        {/* SECURITY SETTINGS */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Shield size={18} /> ACCOUNT SECURITY
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${securitySettings.is2FAEnabled ? '#10b981' : '#94a3b8'}` }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Two-Factor Auth</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Extra security layer</div>
              </div>
              <button onClick={toggle2FA} style={{ fontSize: '10px', padding: '4px 10px', background: securitySettings.is2FAEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: securitySettings.is2FAEnabled ? '#10b981' : '#f8fafc', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                {securitySettings.is2FAEnabled ? 'ENABLED' : 'ENABLE'}
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `3px solid ${securitySettings.isLoginAlertsEnabled ? '#10b981' : '#94a3b8'}` }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Login Alerts</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Alerts for new sign-ins</div>
              </div>
              <button onClick={toggleLoginAlerts} style={{ fontSize: '10px', padding: '4px 10px', background: securitySettings.isLoginAlertsEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: securitySettings.isLoginAlertsEnabled ? '#10b981' : '#f8fafc', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                {securitySettings.isLoginAlertsEnabled ? 'ENABLED' : 'ENABLE'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Active Sessions</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Control active sign-ins</div>
              </div>
              <button onClick={() => setActiveModal('sessions')} style={{ fontSize: '10px', padding: '4px 10px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                MANAGE
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="profile-row-bottom">
        {/* RECENT ACTIVITY */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Clock size={18} color="#94a3b8" /> ACTIVITY LOG
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivity.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                No recent activity logs found.
              </div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', color: '#38bdf8' }}>
                    <Activity size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '500' }}>{activity.action}</div>
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {activity.timestamp} • {activity.location}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Zap size={18} color="#f59e0b" /> QUICK COMMANDS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => setActiveModal('changePassword')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <Key size={16} /> Change Password
            </button>
            <button onClick={() => setActiveModal('manageDevices')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', color: '#00f5ff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <Server size={16} /> Manage Devices ({devices.length})
            </button>
            <button onClick={handleDownloadData} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <Download size={16} /> Download Telemetry Data
            </button>
            <button onClick={() => setActiveModal('getHelp')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <HelpCircle size={16} /> Support & SOC Ticket
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

