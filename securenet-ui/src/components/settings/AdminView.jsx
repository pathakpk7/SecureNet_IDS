import React, { useState, useEffect } from 'react';
import Card from "../../components/ui/Card";
import "../../styles/pages/settings.css";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // System Settings
    darkMode: false,
    autoRefresh: true,
    soundAlerts: false,
    logLevel: 'info',
    dataRetention: 90,
    apiRateLimit: 1000,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false,
    
    // Security Configs
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    encryptionEnabled: true,
    sslProtocol: 'TLSv1.3',
    
    // Advanced System Configs
    systemPerformance: 'high',
    cacheSize: 1024,
    maxConnections: 1000,
    timeoutThreshold: 30,
    logRotation: 'weekly',
    auditEnabled: true,
    
    // Network Security
    firewallEnabled: true,
    intrusionDetection: true,
    portScanningProtection: true,
    ddosProtection: true,
    ipWhitelist: [],
    ipBlacklist: [],
    
    // Monitoring & Alerts
    systemAlerts: true,
    emailAlerts: true,
    smsAlerts: false,
    alertThreshold: 'medium',
    notificationFrequency: 'immediate',
    
    // User Management
    userRegistration: 'admin_only',
    defaultUserRole: 'user',
    passwordComplexity: 'strong',
    sessionManagement: true,
    
    // Compliance & Audit
    gdprCompliance: true,
    auditRetention: 2555, // 7 years
    dataEncryption: 'AES-256',
    accessLogging: true,
    complianceReports: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving admin settings:', settings);
    // In a real app, this would save to backend
    alert('Admin settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      setSettings({
        darkMode: false,
        autoRefresh: true,
        soundAlerts: false,
        logLevel: 'info',
        dataRetention: 90,
        apiRateLimit: 1000,
        backupFrequency: 'daily',
        maintenanceMode: false,
        debugMode: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        encryptionEnabled: true,
        sslProtocol: 'TLSv1.3',
        systemPerformance: 'high',
        cacheSize: 1024,
        maxConnections: 1000,
        timeoutThreshold: 30,
        logRotation: 'weekly',
        auditEnabled: true,
        firewallEnabled: true,
        intrusionDetection: true,
        portScanningProtection: true,
        ddosProtection: true,
        ipWhitelist: [],
        ipBlacklist: [],
        systemAlerts: true,
        emailAlerts: true,
        smsAlerts: false,
        alertThreshold: 'medium',
        notificationFrequency: 'immediate',
        userRegistration: 'admin_only',
        defaultUserRole: 'user',
        passwordComplexity: 'strong',
        sessionManagement: true,
        gdprCompliance: true,
        auditRetention: 2555,
        dataEncryption: 'AES-256',
        accessLogging: true,
        complianceReports: true
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `admin_settings_${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="admin-settings-page fade-in">
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure system-wide settings and security configurations</p>
      </div>

      <div className="settings-grid">
        {/* System Configuration */}
        <Card className="settings-section admin-section">
          <div className="section-header">
            <h3>System Configuration</h3>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Maintenance Mode</span>
                <span className="setting-description">Temporarily disable user access for maintenance</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Debug Mode</span>
                <span className="setting-description">Enable detailed logging and debugging information</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.debugMode}
                  onChange={() => handleToggle('debugMode')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Log Level</span>
                <span className="setting-description">Minimum severity level for system logs</span>
              </div>
              <select 
                className="form-select"
                value={settings.logLevel}
                onChange={(e) => handleChange('logLevel', e.target.value)}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Data Retention</span>
                <span className="setting-description">Keep logs and data for (days)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                min="7"
                max="3650"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">API Rate Limit</span>
                <span className="setting-description">Requests per minute per user</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.apiRateLimit}
                onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
                min="100"
                max="10000"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Backup Frequency</span>
                <span className="setting-description">How often to backup system data</span>
              </div>
              <select 
                className="form-select"
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Security Configuration */}
        <Card className="settings-section admin-section">
          <div className="section-header">
            <h3>Security Configuration</h3>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Two-Factor Authentication</span>
                <span className="setting-description">Require 2FA for all users</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Session Timeout</span>
                <span className="setting-description">Auto-logout after inactivity (minutes)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Password Expiry</span>
                <span className="setting-description">Force password change after (days)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.passwordExpiry}
                onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                min="30"
                max="365"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Max Login Attempts</span>
                <span className="setting-description">Maximum failed login attempts before lockout</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Lockout Duration</span>
                <span className="setting-description">Account lockout duration (minutes)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.lockoutDuration}
                onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
                min="5"
                max="1440"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Encryption Enabled</span>
                <span className="setting-description">Enable end-to-end encryption for data</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.encryptionEnabled}
                  onChange={() => handleToggle('encryptionEnabled')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">SSL Protocol</span>
                <span className="setting-description">SSL/TLS protocol version</span>
              </div>
              <select 
                className="form-select"
                value={settings.sslProtocol}
                onChange={(e) => handleChange('sslProtocol', e.target.value)}
              >
                <option value="TLSv1.2">TLS 1.2</option>
                <option value="TLSv1.3">TLS 1.3</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Network Security */}
        <Card className="settings-section admin-section">
          <div className="section-header">
            <h3>Network Security</h3>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Firewall Enabled</span>
                <span className="setting-description">Enable system firewall protection</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.firewallEnabled}
                  onChange={() => handleToggle('firewallEnabled')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Intrusion Detection</span>
                <span className="setting-description">Enable IDS/IPS monitoring</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.intrusionDetection}
                  onChange={() => handleToggle('intrusionDetection')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Port Scanning Protection</span>
                <span className="setting-description">Block port scanning attempts</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.portScanningProtection}
                  onChange={() => handleToggle('portScanningProtection')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">DDoS Protection</span>
                <span className="setting-description">Enable DDoS attack mitigation</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.ddosProtection}
                  onChange={() => handleToggle('ddosProtection')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>

        {/* User Management */}
        <Card className="settings-section admin-section">
          <div className="section-header">
            <h3>User Management</h3>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">User Registration</span>
                <span className="setting-description">Who can register new accounts</span>
              </div>
              <select 
                className="form-select"
                value={settings.userRegistration}
                onChange={(e) => handleChange('userRegistration', e.target.value)}
              >
                <option value="admin_only">Admin Only</option>
                <option value="invite_only">Invite Only</option>
                <option value="public">Public Registration</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Default User Role</span>
                <span className="setting-description">Default role for new users</span>
              </div>
              <select 
                className="form-select"
                value={settings.defaultUserRole}
                onChange={(e) => handleChange('defaultUserRole', e.target.value)}
              >
                <option value="user">User</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Password Complexity</span>
                <span className="setting-description">Required password strength</span>
              </div>
              <select 
                className="form-select"
                value={settings.passwordComplexity}
                onChange={(e) => handleChange('passwordComplexity', e.target.value)}
              >
                <option value="weak">Weak</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
                <option value="very_strong">Very Strong</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Session Management</span>
                <span className="setting-description">Enable advanced session management</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.sessionManagement}
                  onChange={() => handleToggle('sessionManagement')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>

        {/* Compliance & Audit */}
        <Card className="settings-section admin-section">
          <div className="section-header">
            <h3>Compliance & Audit</h3>
            <span className="admin-badge">ADMIN</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">GDPR Compliance</span>
                <span className="setting-description">Enable GDPR compliance features</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.gdprCompliance}
                  onChange={() => handleToggle('gdprCompliance')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Audit Retention</span>
                <span className="setting-description">Keep audit logs for (days)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.auditRetention}
                onChange={(e) => handleChange('auditRetention', parseInt(e.target.value))}
                min="365"
                max="3650"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Data Encryption</span>
                <span className="setting-description">Encryption algorithm for data at rest</span>
              </div>
              <select 
                className="form-select"
                value={settings.dataEncryption}
                onChange={(e) => handleChange('dataEncryption', e.target.value)}
              >
                <option value="AES-128">AES-128</option>
                <option value="AES-256">AES-256</option>
                <option value="RSA-2048">RSA-2048</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Access Logging</span>
                <span className="setting-description">Log all access attempts and changes</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.accessLogging}
                  onChange={() => handleToggle('accessLogging')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Compliance Reports</span>
                <span className="setting-description">Generate automated compliance reports</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.complianceReports}
                  onChange={() => handleToggle('complianceReports')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card className="settings-actions admin-actions">
        <div className="actions-content">
          <div className="actions-info">
            <h3>System Administration</h3>
            <p>Manage system-wide settings and security configurations</p>
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary admin-btn" onClick={handleSave}>
              Save System Settings
            </button>
            <button className="btn btn-outline admin-btn-outline" onClick={handleReset}>
              Reset to Default
            </button>
            <button className="btn btn-outline admin-btn-outline" onClick={handleExport}>
              Export Settings
            </button>
            <button className="btn btn-outline admin-btn-outline">Import Settings</button>
            <button className="btn btn-outline admin-btn-outline">System Backup</button>
            <button className="btn btn-outline admin-btn-outline">Security Audit</button>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card className="settings-info admin-info">
        <h3>System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">SecureNet IDS v3.2.1 Enterprise</span>
          </div>
          <div className="info-item">
            <span className="info-label">License:</span>
            <span className="info-value">Enterprise Edition (Unlimited Users)</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">January 15, 2024</span>
          </div>
          <div className="info-item">
            <span className="info-label">Support:</span>
            <span className="info-value">enterprise@securenet.com</span>
          </div>
          <div className="info-item">
            <span className="info-label">System Status:</span>
            <span className="info-value status-healthy">Operational</span>
          </div>
          <div className="info-item">
            <span className="info-label">Security Level:</span>
            <span className="info-value status-secure">High</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
