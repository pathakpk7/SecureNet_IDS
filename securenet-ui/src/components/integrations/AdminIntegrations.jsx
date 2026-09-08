import React, { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import { Layers, CheckCircle2, XCircle, AlertTriangle, MessageSquare, Shield, Mail, Database, Cloud, Settings, RotateCw, Wrench, Power, PowerOff } from 'lucide-react';
import '../../styles/pages/integrations.css';

const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Slack Notifications',
      status: 'active',
      type: 'communication',
      lastSync: 'Just now',
      description: 'Send security alerts to Slack channels'
    },
    {
      id: 2,
      name: 'SIEM System',
      status: 'active',
      type: 'security',
      lastSync: '5 minutes ago',
      description: 'Export logs to external SIEM system'
    },
    {
      id: 3,
      name: 'Active Directory',
      status: 'inactive',
      type: 'authentication',
      lastSync: '1 hour ago',
      description: 'Sync user accounts with AD'
    },
    {
      id: 4,
      name: 'Threat Intelligence API',
      status: 'active',
      type: 'security',
      lastSync: '1 minute ago',
      description: 'Import threat intelligence feeds'
    },
    {
      id: 5,
      name: 'Email Gateway',
      status: 'active',
      type: 'communication',
      lastSync: '3 minutes ago',
      description: 'Integrate with email security gateway'
    },
    {
      id: 6,
      name: 'Cloud Provider',
      status: 'error',
      type: 'cloud',
      lastSync: 'Failed',
      description: 'Connect to AWS/Azure security services'
    }
  ]);

  const stats = useMemo(() => ({
    total: integrations.length,
    active: integrations.filter(i => i.status === 'active').length,
    inactive: integrations.filter(i => i.status === 'inactive').length,
    error: integrations.filter(i => i.status === 'error').length
  }), [integrations]);

  // Simulate real-time sync status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        lastSync: integration.status === 'active' 
          ? Math.random() > 0.7 ? 'Just now' : integration.lastSync
          : integration.lastSync
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleIntegration = (id) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === 'active' ? 'inactive' : 'active';
        return { ...integration, status: newStatus };
      }
      return integration;
    }));
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'communication': return <MessageSquare size={20} />;
      case 'security': return <Shield size={20} />;
      case 'authentication': return <Database size={20} />;
      case 'cloud': return <Cloud size={20} />;
      default: return <Layers size={20} />;
    }
  };

  return (
    <div className="admin-integrations-page fade-in" style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={32} color="#00f5ff" />
            System Integrations
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '1rem' }}>Manage third-party service connections and data flows dynamically</p>
        </div>
      </div>

      {/* COMPACT DYNAMIC KPIs IN ONE BOX */}
      <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.8)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center' }}>
          
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Layers size={20} color="#38bdf8" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Total Integrations: <b style={{ color: '#f8fafc', fontSize: '16px', marginLeft: '6px' }}>{stats.total}</b>
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Active: <b style={{ color: '#10b981', fontSize: '16px', marginLeft: '6px' }}>{stats.active}</b>
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <XCircle size={20} color="#f59e0b" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Inactive: <b style={{ color: '#f59e0b', fontSize: '16px', marginLeft: '6px' }}>{stats.inactive}</b>
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Errors: <b style={{ color: '#ef4444', fontSize: '16px', marginLeft: '6px' }}>{stats.error}</b>
            </div>
          </div>

        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* ACTIVE INTEGRATIONS */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Active Integrations</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {integrations.filter(i => i.status === 'active').map(integration => (
              <div key={integration.id} style={{
                background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderLeft: '4px solid #10b981', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                      {getIconForType(integration.type)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>{integration.name}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>{integration.description}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b' }}>
                    <RotateCw size={12} color="#10b981" /> Last sync: <span style={{ color: '#cbd5e1' }}>{integration.lastSync}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleToggleIntegration(integration.id)} style={{
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <PowerOff size={14} /> Disable
                    </button>
                    <button style={{
                      background: 'transparent', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Settings size={14} /> Configure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* INACTIVE INTEGRATIONS */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <XCircle size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Inactive Integrations</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {integrations.filter(i => i.status === 'inactive').map(integration => (
              <div key={integration.id} style={{
                background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderLeft: '4px solid #f59e0b', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8 }}>
                    <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#f59e0b' }}>
                      {getIconForType(integration.type)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>{integration.name}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>{integration.description}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b' }}>
                    <RotateCw size={12} color="#f59e0b" /> Last sync: <span style={{ color: '#cbd5e1' }}>{integration.lastSync}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleToggleIntegration(integration.id)} style={{
                      background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Power size={14} /> Enable
                    </button>
                    <button style={{
                      background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Settings size={14} /> Configure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* INTEGRATION ERRORS */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc' }}>Integration Errors</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {integrations.filter(i => i.status === 'error').map(integration => (
              <div key={integration.id} style={{
                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}>
                      {getIconForType(integration.type)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>{integration.name}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>{integration.description}</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', color: '#fca5a5', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                   <AlertTriangle size={14} /> Connection timeout. Please check credentials.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <RotateCw size={14} /> Retry
                    </button>
                    <button style={{
                      background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Wrench size={14} /> Troubleshoot
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {integrations.filter(i => i.status === 'error').length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 12px' }} />
                <div>No integration errors. All connections healthy!</div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AdminIntegrations;
