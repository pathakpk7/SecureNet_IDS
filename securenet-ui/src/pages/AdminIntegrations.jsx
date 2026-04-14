import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/integrations.css';

const AdminIntegrations = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
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
      config: {
        logLevel: 'info',
        batchSize: 1000,
        retryAttempts: 3,
        timeout: 30
      }
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
      config: {
        instance: 'company',
        priority: 'high',
        escalation: true,
        autoAssign: false
      }
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
      config: {
        deviceId: 'PA-220',
        rulebase: 'default',
        logLevel: 'warning',
        blockThreshold: 5
      }
    },
    {
      id: 4,
      name: 'CrowdStrike',
      icon: 'shield',
      category: 'EDR',
      description: 'Endpoint detection and response (EDR)',
      status: 'disconnected',
      version: '6.44.0',
      lastSync: '2024-01-15 12:15:22',
      endpoints: ['https://api.crowdstrike.com'],
      credentials: 'OAuth2',
      dataFlow: 'bidirectional',
      health: 'unhealthy',
      config: {
        customerId: 'COMP123',
        sensorVersion: '6.44.0',
        preventionPolicy: 'default',
        detectionPolicy: 'strict'
      }
    },
    {
      id: 5,
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
      config: {
        domain: 'company.okta.com',
        mfaRequired: true,
        sessionTimeout: 30,
        passwordPolicy: 'strong'
      }
    },
    {
      id: 6,
      name: 'AWS Security Hub',
      icon: 'cloud',
      category: 'Cloud Security',
      description: 'Unified security posture management',
      status: 'connected',
      version: '2.0.0',
      lastSync: '2024-01-15 14:33:45',
      endpoints: ['https://securityhub.us-east-1.amazonaws.com'],
      credentials: 'IAM Role',
      dataFlow: 'inbound',
      health: 'healthy',
      config: {
        region: 'us-east-1',
        accountId: '123456789012',
        enableFindings: true,
        aggregationPeriod: 60
      }
    }
  ]);

  const [availableAPIs] = useState([
    {
      id: 'slack',
      name: 'Slack',
      icon: 'chat',
      category: 'Communication',
      description: 'Team communication and notifications',
      requiredFields: ['webhook_url', 'channel'],
      optionalFields: ['username', 'icon_emoji']
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: 'assignment',
      category: 'Project Management',
      description: 'Issue tracking and project management',
      requiredFields: ['url', 'username', 'api_token'],
      optionalFields: ['project_key', 'issue_type']
    },
    {
      id: 'microsoft_teams',
      name: 'Microsoft Teams',
      icon: 'groups',
      category: 'Communication',
      description: 'Team collaboration and meetings',
      requiredFields: ['webhook_url', 'team_id'],
      optionalFields: ['channel', 'activity_type']
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'code',
      category: 'Development',
      description: 'Code repository and version control',
      requiredFields: ['api_url', 'access_token'],
      optionalFields: ['organization', 'repo_filter']
    },
    {
      id: 'elastic',
      name: 'Elasticsearch',
      icon: 'search',
      category: 'Database',
      description: 'Search and analytics engine',
      requiredFields: ['url', 'username', 'password'],
      optionalFields: ['index_prefix', 'timeout']
    },
    {
      id: 'datadog',
      name: 'Datadog',
      icon: 'trending_up',
      category: 'Monitoring',
      description: 'Infrastructure monitoring and APM',
      requiredFields: ['api_key', 'app_key'],
      optionalFields: ['site', 'metric_prefix']
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(integration => {
        if (integration.status === 'connected' && Math.random() > 0.9) {
          return { ...integration, lastSync: new Date().toISOString().replace('T', ' ').slice(0, 19) };
        }
        return integration;
      }));
    }, 10000);

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
      case 'SIEM': return '#ff3366';
      case 'ITSM': return '#00f5ff';
      case 'Firewall': return '#ffaa00';
      case 'EDR': return '#00ff00';
      case 'IAM': return '#666';
      case 'Cloud Security': return '#ff1493';
      default: return '#666';
    }
  };

  const handleAddIntegration = (apiTemplate) => {
    const newId = Date.now();
    const integration = {
      id: newId,
      name: apiTemplate.name,
      icon: apiTemplate.icon,
      category: apiTemplate.category,
      description: apiTemplate.description,
      status: 'pending',
      version: '1.0.0',
      lastSync: new Date().toISOString().replace('T', ' ').slice(0, 19),
      endpoints: ['https://api.example.com'],
      credentials: 'API Key',
      dataFlow: 'outbound',
      health: 'unknown',
      config: {}
    };
    
    setIntegrations(prev => [integration, ...prev]);
    setShowAddModal(false);
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const handleRemoveIntegration = (id) => {
    if (window.confirm('Are you sure you want to remove this integration? This action cannot be undone.')) {
      setIntegrations(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleConfigureIntegration = (integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const handleSaveConfig = () => {
    if (selectedIntegration) {
      setIntegrations(prev => prev.map(i => 
        i.id === selectedIntegration.id ? { ...selectedIntegration, status: 'connected', health: 'healthy' } : i
      ));
      setShowConfigModal(false);
      setSelectedIntegration(null);
    }
  };

  const handleToggleStatus = (id) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected',
            health: integration.status === 'connected' ? 'unhealthy' : 'healthy'
          } 
        : integration
    ));
  };

  const handleTestConnection = (id) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, health: 'testing' } 
        : integration
    ));

    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, health: Math.random() > 0.2 ? 'healthy' : 'unhealthy' } 
          : integration
      ));
    }, 2000);
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const healthyCount = integrations.filter(i => i.health === 'healthy').length;
  const totalDataFlow = integrations.filter(i => i.dataFlow === 'bidirectional' || i.dataFlow === 'inbound').length;

  return (
    <div className="admin-integrations-page fade-in">
      <div className="page-header">
        <h1 className="page-title">API Integrations Management</h1>
        <p className="page-subtitle">Configure and manage system integrations and APIs</p>
      </div>

      {/* Integration Statistics */}
      <div className="integration-stats admin-stats">
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{integrations.length}</span>
            <span className="stat-label">Total Integrations</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{connectedCount}</span>
            <span className="stat-label">Connected</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{healthyCount}</span>
            <span className="stat-label">Healthy</span>
          </div>
        </Card>
        <Card className="stat-card admin-stat">
          <div className="stat-content">
            <span className="stat-value">{totalDataFlow}</span>
            <span className="stat-label">Data Inbound</span>
          </div>
        </Card>
      </div>

      {/* Add Integration Section */}
      <div className="add-integration-section">
        <Card className="add-integration-card">
          <div className="add-header">
            <h3>Add New Integration</h3>
            <button className="btn btn-primary admin-btn" onClick={() => setShowAddModal(true)}>
              Add Integration
            </button>
          </div>
          <div className="available-apis-grid">
            {availableAPIs.map((api) => (
              <div key={api.id} className="api-template-card">
                <div className="api-header">
                  <span className="api-icon">{api.icon}</span>
                  <div className="api-info">
                    <h4 className="api-name">{api.name}</h4>
                    <span 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(api.category) }}
                    >
                      {api.category}
                    </span>
                  </div>
                </div>
                <p className="api-description">{api.description}</p>
                <div className="api-fields">
                  <span className="fields-info">Required: {api.requiredFields.length} fields</span>
                  <span className="fields-info">Optional: {api.optionalFields.length} fields</span>
                </div>
                <button 
                  className="btn btn-outline admin-btn-outline"
                  onClick={() => handleAddIntegration(api)}
                >
                  Add Integration
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Current Integrations */}
      <div className="current-integrations-section">
        <div className="integrations-header">
          <h3>Current Integrations</h3>
          <div className="integrations-actions">
            <button className="btn btn-outline admin-btn-outline">
              Export Configuration
            </button>
            <button className="btn btn-outline admin-btn-outline">
              Test All Connections
            </button>
          </div>
        </div>
        <div className="integrations-grid">
          {integrations.map((integration) => (
            <Card key={integration.id} className="integration-card admin-integration-card">
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
                  <span className="detail-label">Credentials:</span>
                  <span className="detail-value">{integration.credentials}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Data Flow:</span>
                  <span className="detail-value">{integration.dataFlow}</span>
                </div>
              </div>
              <div className="integration-endpoints">
                <h5>Endpoints</h5>
                <div className="endpoints-list">
                  {integration.endpoints.map((endpoint, index) => (
                    <span key={index} className="endpoint">{endpoint}</span>
                  ))}
                </div>
              </div>
              <div className="integration-actions">
                <button 
                  className="btn btn-primary admin-btn"
                  onClick={() => handleConfigureIntegration(integration)}
                >
                  Configure
                </button>
                <button 
                  className="btn btn-outline admin-btn-outline"
                  onClick={() => handleTestConnection(integration.id)}
                  disabled={integration.status === 'disconnected'}
                >
                  Test Connection
                </button>
                <button 
                  className="btn btn-outline admin-btn-outline"
                  onClick={() => handleToggleStatus(integration.id)}
                >
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
                <button 
                  className="btn btn-outline danger admin-btn-danger"
                  onClick={() => handleRemoveIntegration(integration.id)}
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <Card className="modal-card admin-modal">
            <div className="modal-header">
              <h3>Add New Integration</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="api-selection">
                {availableAPIs.map((api) => (
                  <div key={api.id} className="api-option" onClick={() => handleAddIntegration(api)}>
                    <div className="api-option-header">
                      <span className="api-icon">{api.icon}</span>
                      <div className="api-option-info">
                        <h4>{api.name}</h4>
                        <span className="api-category">{api.category}</span>
                      </div>
                    </div>
                    <p>{api.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="modal-overlay">
          <Card className="modal-card admin-modal">
            <div className="modal-header">
              <h3>Configure {selectedIntegration.name}</h3>
              <button className="modal-close" onClick={() => setShowConfigModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="config-form">
                <div className="form-group">
                  <label>Integration Name</label>
                  <input 
                    type="text" 
                    value={selectedIntegration.name}
                    onChange={(e) => setSelectedIntegration({...selectedIntegration, name: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Endpoints</label>
                  {selectedIntegration.endpoints.map((endpoint, index) => (
                    <input 
                      key={index}
                      type="text" 
                      value={endpoint}
                      onChange={(e) => {
                        const newEndpoints = [...selectedIntegration.endpoints];
                        newEndpoints[index] = e.target.value;
                        setSelectedIntegration({...selectedIntegration, endpoints: newEndpoints});
                      }}
                      className="form-input"
                    />
                  ))}
                </div>
                <div className="form-group">
                  <label>Credentials Type</label>
                  <select 
                    value={selectedIntegration.credentials}
                    onChange={(e) => setSelectedIntegration({...selectedIntegration, credentials: e.target.value})}
                    className="form-select"
                  >
                    <option value="API Key">API Key</option>
                    <option value="OAuth2">OAuth2</option>
                    <option value="Basic Auth">Basic Auth</option>
                    <option value="IAM Role">IAM Role</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data Flow</label>
                  <select 
                    value={selectedIntegration.dataFlow}
                    onChange={(e) => setSelectedIntegration({...selectedIntegration, dataFlow: e.target.value})}
                    className="form-select"
                  >
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                    <option value="bidirectional">Bidirectional</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowConfigModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary admin-btn" onClick={handleSaveConfig}>
                Save Configuration
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminIntegrations;
