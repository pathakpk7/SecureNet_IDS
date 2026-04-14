import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/integrations.css';

const UserIntegrations = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Splunk',
      icon: 'analytics',
      category: 'SIEM',
      description: 'Centralized logging and SIEM solution',
      status: 'connected',
      version: '8.2.0',
      lastSync: '2024-01-15 14:32:45',
      endpoints: ['https://splunk.company.com:8089'],
      credentials: 'API Key',
      dataFlow: 'bidirectional',
      health: 'healthy',
      userAccess: 'read-only'
    },
    {
      id: 2,
      name: 'ServiceNow',
      icon: 'settings',
      category: 'ITSM',
      description: 'IT Service Management and workflow automation',
      status: 'connected',
      version: 'Quebec',
      lastSync: '2024-01-15 14:30:12',
      endpoints: ['https://company.service-now.com/api'],
      credentials: 'OAuth2',
      dataFlow: 'outbound',
      health: 'healthy',
      userAccess: 'read-only'
    },
    {
      id: 3,
      name: 'Palo Alto Networks',
      icon: 'security',
      category: 'Firewall',
      description: 'Next-generation firewall and security platform',
      status: 'connected',
      version: '10.2.3',
      lastSync: '2024-01-15 14:28:33',
      endpoints: ['https://firewall.company.com/api'],
      credentials: 'API Key',
      dataFlow: 'inbound',
      health: 'healthy',
      userAccess: 'read-only'
    },
    {
      id: 4,
      name: 'Okta',
      icon: 'person',
      category: 'IAM',
      description: 'Identity and access management (IAM)',
      status: 'connected',
      version: '2023.10',
      lastSync: '2024-01-15 14:35:11',
      endpoints: ['https://company.okta.com/oauth2'],
      credentials: 'OAuth2',
      dataFlow: 'outbound',
      health: 'healthy',
      userAccess: 'read-only'
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(integration => {
        if (integration.status === 'connected' && Math.random() > 0.9) {
          return { ...integration, lastSync: new Date().toISOString().replace('T', ' ').slice(0, 19) };
        }
        return integration;
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected': return '#00ff00';
      case 'disconnected': return '#ff3366';
      case 'pending': return '#ffaa00';
      case 'error': return '#ff0000';
      default: return '#666';
    }
  };

  const getHealthColor = (health) => {
    switch(health) {
      case 'healthy': return '#00ff00';
      case 'warning': return '#ffaa00';
      case 'unhealthy': return '#ff3366';
      case 'unknown': return '#666';
      default: return '#666';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'SIEM': return '#00f5ff';
      case 'ITSM': return '#00f5ff';
      case 'Firewall': return '#00f5ff';
      case 'EDR': return '#00f5ff';
      case 'IAM': return '#00f5ff';
      case 'Cloud Security': return '#00f5ff';
      default: return '#00f5ff';
    }
  };

  const handleViewDetails = (integration) => {
    setSelectedIntegration(integration);
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const healthyCount = integrations.filter(i => i.health === 'healthy').length;
  const totalDataFlow = integrations.filter(i => i.dataFlow === 'bidirectional' || i.dataFlow === 'inbound').length;

  return (
    <div className="user-integrations-page fade-in">
      <div className="page-header">
        <h1 className="page-title">System Integrations</h1>
        <p className="page-subtitle">View available system integrations and their status</p>
      </div>

      {/* Integration Statistics */}
      <div className="integration-stats user-stats">
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{integrations.length}</span>
            <span className="stat-label">Available Integrations</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{connectedCount}</span>
            <span className="stat-label">Connected</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{healthyCount}</span>
            <span className="stat-label">Healthy</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{totalDataFlow}</span>
            <span className="stat-label">Data Sources</span>
          </div>
        </Card>
      </div>

      {/* Access Notice */}
      <Card className="access-notice-card user-notice">
        <div className="notice-content">
          <span className="notice-icon">info</span>
          <div className="notice-info">
            <h4>View-Only Access</h4>
            <p>You have view-only access to system integrations. For configuration changes, please contact your system administrator.</p>
          </div>
        </div>
      </Card>

      {/* Available Integrations */}
      <div className="available-integrations-section">
        <div className="integrations-header">
          <h3>Available Integrations</h3>
          <span className="user-indicator">USER VIEW</span>
        </div>
        <div className="integrations-grid">
          {integrations.map((integration) => (
            <Card key={integration.id} className="integration-card user-integration-card">
              <div className="integration-header">
                <div className="integration-info">
                  <div className="integration-title">
                    <span className="integration-icon">{integration.icon}</span>
                    <div>
                      <h4 className="integration-name">{integration.name}</h4>
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(integration.category) }}
                      >
                        {integration.category}
                      </span>
                    </div>
                  </div>
                  <div className="integration-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(integration.status) }}
                    >
                      {integration.status.toUpperCase()}
                    </span>
                    <span 
                      className="health-badge"
                      style={{ backgroundColor: getHealthColor(integration.health) }}
                    >
                      {integration.health.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="integration-details">
                <div className="detail-item">
                  <span className="detail-label">Version:</span>
                  <span className="detail-value">{integration.version}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Sync:</span>
                  <span className="detail-value">{integration.lastSync}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Data Flow:</span>
                  <span className="detail-value">{integration.dataFlow}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Access Level:</span>
                  <span className="detail-value">{integration.userAccess}</span>
                </div>
              </div>
              <div className="integration-description">
                <p>{integration.description}</p>
              </div>
              <div className="integration-actions">
                <button 
                  className="btn btn-primary user-btn"
                  onClick={() => handleViewDetails(integration)}
                >
                  View Details
                </button>
                <button className="btn btn-outline user-btn-outline disabled" disabled>
                  Configure (Admin Only)
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Details Modal */}
      {selectedIntegration && (
        <div className="modal-overlay">
          <Card className="modal-card user-modal">
            <div className="modal-header">
              <h3>{selectedIntegration.name} Details</h3>
              <button className="modal-close" onClick={() => setSelectedIntegration(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="integration-overview">
                <div className="overview-header">
                  <span className="integration-icon large">{selectedIntegration.icon}</span>
                  <div className="overview-info">
                    <h4>{selectedIntegration.name}</h4>
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(selectedIntegration.category) }}
                    >
                      {selectedIntegration.category}
                    </span>
                  </div>
                </div>
                <p className="overview-description">{selectedIntegration.description}</p>
              </div>
              
              <div className="integration-metrics">
                <h5>Status Information</h5>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-label">Connection Status:</span>
                    <span 
                      className="metric-value"
                      style={{ color: getStatusColor(selectedIntegration.status) }}
                    >
                      {selectedIntegration.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Health Status:</span>
                    <span 
                      className="metric-value"
                      style={{ color: getHealthColor(selectedIntegration.health) }}
                    >
                      {selectedIntegration.health.toUpperCase()}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Version:</span>
                    <span className="metric-value">{selectedIntegration.version}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Last Sync:</span>
                    <span className="metric-value">{selectedIntegration.lastSync}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Data Flow:</span>
                    <span className="metric-value">{selectedIntegration.dataFlow}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Access Level:</span>
                    <span className="metric-value">{selectedIntegration.userAccess}</span>
                  </div>
                </div>
              </div>

              <div className="integration-endpoints">
                <h5>Endpoints</h5>
                <div className="endpoints-list">
                  {selectedIntegration.endpoints.map((endpoint, index) => (
                    <div key={index} className="endpoint-item">
                      <span className="endpoint-url">{endpoint}</span>
                      <span className="endpoint-status">Connected</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="access-restriction">
                <div className="restriction-info">
                  <span className="restriction-icon">lock</span>
                  <div>
                    <h5>Configuration Access Restricted</h5>
                    <p>Only administrators can modify integration configurations. Contact your system administrator for any changes needed.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setSelectedIntegration(null)}>
                Close
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Help Section */}
      <Card className="help-card user-help">
        <h3>Understanding Integrations</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>What are Integrations?</h4>
            <p>Integrations connect SecureNet IDS with external systems and services to enhance security monitoring and response capabilities.</p>
          </div>
          <div className="help-item">
            <h4>Available Integrations</h4>
            <p>System administrators configure various integrations including SIEM systems, firewalls, identity providers, and cloud security platforms.</p>
          </div>
          <div className="help-item">
            <h4>Your Access Level</h4>
            <p>As a user, you can view integration status and details but cannot modify configurations. This ensures system security and stability.</p>
          </div>
          <div className="help-item">
            <h4>Need Changes?</h4>
            <p>Contact your system administrator to request integration modifications or additions based on your security requirements.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserIntegrations;
