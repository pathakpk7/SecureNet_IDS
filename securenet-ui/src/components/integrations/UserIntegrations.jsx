import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Smartphone, Key, Shield, Plus, RefreshCw, Settings, HelpCircle, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import '../../styles/pages/integrations.css';

const UserIntegrations = () => {
  const [userIntegrations, setUserIntegrations] = useState([
    {
      id: 1,
      name: 'Personal Email Alerts',
      status: 'active',
      type: 'Communication',
      lastSync: '5 minutes ago',
      description: 'Receive real-time security alerts via email digest'
    },
    {
      id: 2,
      name: 'Mobile Push App',
      status: 'active',
      type: 'Mobile',
      lastSync: '1 minute ago',
      description: 'Instant mobile push notifications for critical threats'
    },
    {
      id: 3,
      name: 'Password Manager Sync',
      status: 'inactive',
      type: 'Security',
      lastSync: '2 days ago',
      description: 'Sync credentials with external password vault'
    },
    {
      id: 4,
      name: 'Secure VPN Monitor',
      status: 'active',
      type: 'Network',
      lastSync: '10 minutes ago',
      description: 'Continuous monitoring of encrypted VPN tunnels'
    }
  ]);

  const [activeModal, setActiveModal] = useState(null); // null | 'addIntegration' | 'settings' | 'help'
  const [newIntegrationForm, setNewIntegrationForm] = useState({ name: '', type: 'Communication', description: '' });

  const activeCount = userIntegrations.filter(i => i.status === 'active').length;
  const inactiveCount = userIntegrations.filter(i => i.status === 'inactive').length;

  const handleToggleIntegration = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUserIntegrations(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus, lastSync: 'Just now' } : item));
    toast.success(`${name} is now ${nextStatus.toUpperCase()}`);
  };

  const handleSyncAll = () => {
    toast.loading('Syncing all connected integration services...', { id: 'sync-all' });
    setTimeout(() => {
      setUserIntegrations(prev => prev.map(item => item.status === 'active' ? { ...item, lastSync: 'Just now' } : item));
      toast.success('All active integrations synced successfully!', { id: 'sync-all' });
    }, 1500);
  };

  const handleAddIntegrationSubmit = (e) => {
    e.preventDefault();
    if (!newIntegrationForm.name || !newIntegrationForm.description) {
      toast.error('Please complete all integration details');
      return;
    }
    const created = {
      id: Date.now(),
      name: newIntegrationForm.name,
      status: 'active',
      type: newIntegrationForm.type,
      lastSync: 'Just now',
      description: newIntegrationForm.description
    };
    setUserIntegrations(prev => [created, ...prev]);
    setNewIntegrationForm({ name: '', type: 'Communication', description: '' });
    setActiveModal(null);
    toast.success(`Connected new service: ${created.name}`);
  };

  return (
    <div className="user-integrations-page fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Personal Integrations</h1>
        <p className="page-subtitle">Manage your connected services, automated notifications, and integration settings</p>
      </div>

      {/* ROW 1: 4 Total Integrations, 3 Active, 1 Inactive in ONE ROW */}
      <div className="integrations-stats-row">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value" style={{ color: '#00f5ff' }}>{userIntegrations.length}</div>
            <div className="stat-label">Total Integrations</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value" style={{ color: '#10b981' }}>{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value" style={{ color: '#fbbf24' }}>{inactiveCount}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </Card>
      </div>

      {/* ROW 2: Your Connected Services, Integration Benefits, Quick Actions in ONE ROW */}
      <div className="integrations-main-row">
        {/* Card 1: Your Connected Services (Proportionally larger on left) */}
        <Card className="integrations-card connected-services-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Your Connected Services</h3>
            <span className="user-role-badge">LIVE CONNECTORS</span>
          </div>

          <div className="integrations-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userIntegrations.map(integration => (
              <div 
                key={integration.id} 
                className="integration-item-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px'
                }}
              >
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#fff' }}>{integration.name}</h4>
                    <span 
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        background: integration.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: integration.status === 'active' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                        color: integration.status === 'active' ? '#10b981' : '#fbbf24'
                      }}
                    >
                      {integration.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>{integration.description}</p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                    <span style={{ color: '#00f5ff', fontWeight: '700' }}>{integration.type}</span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span style={{ color: '#cbd5e1' }}>Last sync: {integration.lastSync}</span>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleToggleIntegration(integration.id, integration.name, integration.status)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: integration.status === 'active' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      border: integration.status === 'active' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                      color: integration.status === 'active' ? '#ef4444' : '#10b981',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {integration.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="integrations-card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Integration Benefits</h3>
          <div className="benefits-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="benefit-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="#00f5ff" /> Instant Email Alerts</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Receive security incident digests directly to your inbox</p>
            </div>
            <div className="benefit-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={14} color="#00f5ff" /> Mobile Push Sync</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Real-time alerts delivered straight to your smartphone</p>
            </div>
            <div className="benefit-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Key size={14} color="#00f5ff" /> Vault Password Sync</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Seamless credential validation with password managers</p>
            </div>
            <div className="benefit-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} color="#00f5ff" /> VPN Tunnel Protection</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Continuous telemetry monitoring across active VPNs</p>
            </div>
          </div>
        </Card>

        {/* Card 3: Quick Actions */}
        <Card className="integrations-card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
          <div className="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setActiveModal('addIntegration')} className="action-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Plus size={16} />
              Add New Integration
            </button>
            <button onClick={handleSyncAll} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <RefreshCw size={16} />
              Sync All Services
            </button>
            <button onClick={() => setActiveModal('settings')} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Settings size={16} />
              Integration Settings
            </button>
            <button onClick={() => setActiveModal('help')} className="action-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <HelpCircle size={16} />
              Help & Support
            </button>
          </div>
        </Card>
      </div>

      {/* MODAL 1: Add New Integration */}
      {activeModal === 'addIntegration' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Connect New Integration</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddIntegrationSubmit} className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Integration Service Name</label>
                <input
                  type="text"
                  value={newIntegrationForm.name}
                  onChange={(e) => setNewIntegrationForm({ ...newIntegrationForm, name: e.target.value })}
                  placeholder="e.g., Telegram Security Bot"
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Integration Category</label>
                <select
                  value={newIntegrationForm.type}
                  onChange={(e) => setNewIntegrationForm({ ...newIntegrationForm, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value="Communication">Communication</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Security">Security</option>
                  <option value="Network">Network</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Service Description</label>
                <textarea
                  rows={3}
                  value={newIntegrationForm.description}
                  onChange={(e) => setNewIntegrationForm({ ...newIntegrationForm, description: e.target.value })}
                  placeholder="Briefly describe what this service does..."
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#00f5ff', color: '#000', fontWeight: '700' }}>Connect Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Integration Settings */}
      {activeModal === 'settings' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Integration Global Settings</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#fff' }}>Auto Sync Interval</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>Frequency of background telemetry polling</p>
                </div>
                <select style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#00f5ff', borderRadius: '4px', fontSize: '12px' }}>
                  <option>Every 5 Minutes</option>
                  <option>Every 15 Minutes</option>
                  <option>Hourly</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#fff' }}>Encrypt Saved Tokens</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>AES-256 vault token encryption</p>
                </div>
                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '12px' }}>ENABLED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Help & Support */}
      {activeModal === 'help' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Integration Help & Knowledge Base</h3>
              <button onClick={() => setActiveModal(null)} className="close-btn" style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Need assistance linking your email or mobile device?</p>
              <div style={{ padding: '10px 12px', background: 'rgba(0,245,255,0.05)', borderRadius: '6px', border: '1px solid rgba(0,245,255,0.2)', fontSize: '12px', color: '#fff' }}>
                <strong>Troubleshooting Sync Issues:</strong> Toggle the service Off and On again, or click 'Sync All Services'.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserIntegrations;

