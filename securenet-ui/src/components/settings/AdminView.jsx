import React, { useState } from 'react';
import Card from "../../components/ui/Card";
import { 
  Settings, Shield, Network, Bell, Users, FileCheck, 
  Save, RotateCcw, Download, Server, Key, Lock,
  Globe, AlertTriangle, Monitor, Sliders, Moon, Volume2, Database, UploadCloud,
  ChevronDown, Cpu, Clock
} from "lucide-react";
import "../../styles/pages/settings.css";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
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

  const [activeSection, setActiveSection] = useState('system');

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert('Admin settings saved successfully!');
  };

  const handleReset = () => {
    if(window.confirm('Are you sure you want to reset all settings to defaults?')) {
      alert('Settings reset.');
    }
  };

  const handleExport = () => {
    alert('Exporting settings to JSON...');
  };

  // Reusable UI Components
  const ToggleItem = ({ icon: Icon, label, description, checked, onChange }) => (
    <div className="settings-control-row">
      <div className="settings-control-info">
        <div className="settings-control-icon admin-icon">
          <Icon size={20} />
        </div>
        <div className="settings-control-text">
          <div className="settings-control-label">{label}</div>
          <div className="settings-control-desc">{description}</div>
        </div>
      </div>
      <div className="settings-control-action">
        <div 
          onClick={onChange}
          className={`settings-toggle-switch ${checked ? 'checked' : ''}`}
        >
          <div className="settings-toggle-thumb" />
        </div>
      </div>
    </div>
  );

  const SelectItem = ({ icon: Icon, label, description, value, options, onChange }) => (
    <div className="settings-control-row">
      <div className="settings-control-info">
        <div className="settings-control-icon admin-icon">
          <Icon size={20} />
        </div>
        <div className="settings-control-text">
          <div className="settings-control-label">{label}</div>
          <div className="settings-control-desc">{description}</div>
        </div>
      </div>
      <div className="settings-control-action">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="settings-select-input"
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    </div>
  );

  const InputItem = ({ icon: Icon, label, description, type="number", value, onChange }) => (
    <div className="settings-control-row">
      <div className="settings-control-info">
        <div className="settings-control-icon admin-icon">
          <Icon size={20} />
        </div>
        <div className="settings-control-text">
          <div className="settings-control-label">{label}</div>
          <div className="settings-control-desc">{description}</div>
        </div>
      </div>
      <div className="settings-control-action">
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="settings-number-input"
        />
      </div>
    </div>
  );

  const sections = [
    { id: 'system', label: 'General System', icon: Settings },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'network', label: 'Network Config', icon: Network },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'alerts', label: 'Alerts & Logs', icon: Bell },
    { id: 'compliance', label: 'Compliance & Audit', icon: FileCheck },
  ];

  return (
    <div className="admin-settings-page settings-view-layout fade-in">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="settings-nav-sidebar">
        <div className="settings-sidebar-title">
          <Sliders size={20} color="#00f5ff" /> Configuration
        </div>
        
        <div className="settings-nav-items-scroll">
          {sections.map(sec => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`settings-nav-btn admin-nav ${isActive ? 'active' : ''}`}
              >
                <sec.icon size={18} />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        <div className="settings-sidebar-status">
          <Card style={{ padding: '16px', background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(0,0,0,0.4))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Server size={14} /> System Status
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
              SecureNet IDS v1.4.3<br/>
              Enterprise License<br/>
              Last update: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="settings-main-panel">
        
        <Card className="settings-panel-card">
          <div className="settings-panel-header">
            <h2 className="settings-panel-title">
              {React.createElement(sections.find(s => s.id === activeSection)?.icon, { size: 22, color: '#00f5ff' })}
              <span>{sections.find(s => s.id === activeSection)?.label}</span>
            </h2>
            <div>
              <span className="settings-badge-admin">ADMIN ONLY</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {activeSection === 'system' && (
              <>
                <ToggleItem icon={Moon} label="Dark Mode Interface" description="Force dark mode across all user sessions" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                <ToggleItem icon={RotateCcw} label="Auto Refresh Dashboard" description="Real-time data fetching every 5 seconds" checked={settings.autoRefresh} onChange={() => handleToggle('autoRefresh')} />
                <ToggleItem icon={AlertTriangle} label="Maintenance Mode" description="Disable non-admin logins and pause ML inference" checked={settings.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} />
                <SelectItem icon={Cpu} label="System Performance" description="CPU/Memory allocation for ML workers" value={settings.systemPerformance} onChange={(v) => handleChange('systemPerformance', v)} options={[{value: 'low', label: 'Efficiency'}, {value: 'medium', label: 'Balanced'}, {value: 'high', label: 'Maximum Performance'}]} />
                <InputItem icon={Database} label="Data Retention (Days)" description="Time to keep raw packet logs before purging" value={settings.dataRetention} onChange={(v) => handleChange('dataRetention', parseInt(v))} />
              </>
            )}

            {activeSection === 'security' && (
              <>
                <ToggleItem icon={Lock} label="Enforce 2FA" description="Require Two-Factor Auth for all administrative roles" checked={settings.twoFactorAuth} onChange={() => handleToggle('twoFactorAuth')} />
                <ToggleItem icon={Key} label="Data Encryption" description="Encrypt database volumes at rest" checked={settings.encryptionEnabled} onChange={() => handleToggle('encryptionEnabled')} />
                <SelectItem icon={Shield} label="SSL/TLS Protocol" description="Minimum required TLS version for API" value={settings.sslProtocol} onChange={(v) => handleChange('sslProtocol', v)} options={[{value: 'TLSv1.2', label: 'TLS 1.2'}, {value: 'TLSv1.3', label: 'TLS 1.3 (Recommended)'}]} />
                <InputItem icon={Clock} label="Session Timeout" description="Auto-logout idle sessions (minutes)" value={settings.sessionTimeout} onChange={(v) => handleChange('sessionTimeout', parseInt(v))} />
                <InputItem icon={AlertTriangle} label="Max Login Attempts" description="Lock account after N failed attempts" value={settings.maxLoginAttempts} onChange={(v) => handleChange('maxLoginAttempts', parseInt(v))} />
              </>
            )}

            {activeSection === 'network' && (
              <>
                <ToggleItem icon={Network} label="Intrusion Detection (IDS)" description="Enable core traffic analysis and ML classification" checked={settings.intrusionDetection} onChange={() => handleToggle('intrusionDetection')} />
                <ToggleItem icon={Shield} label="Firewall Rules Enforcement" description="Automatically block critical threats" checked={settings.firewallEnabled} onChange={() => handleToggle('firewallEnabled')} />
                <ToggleItem icon={Globe} label="DDoS Protection" description="Enable volumetric traffic filtering" checked={settings.ddosProtection} onChange={() => handleToggle('ddosProtection')} />
                <ToggleItem icon={Monitor} label="Port Scanning Protection" description="Block aggressive port mappers automatically" checked={settings.portScanningProtection} onChange={() => handleToggle('portScanningProtection')} />
              </>
            )}

            {activeSection === 'users' && (
              <>
                <SelectItem icon={Users} label="User Registration" description="Who can create new accounts" value={settings.userRegistration} onChange={(v) => handleChange('userRegistration', v)} options={[{value: 'admin_only', label: 'Admin Only'}, {value: 'invite', label: 'Invite Only'}, {value: 'open', label: 'Open Registration'}]} />
                <SelectItem icon={Key} label="Password Complexity" description="Required password strength" value={settings.passwordComplexity} onChange={(v) => handleChange('passwordComplexity', v)} options={[{value: 'medium', label: 'Medium'}, {value: 'strong', label: 'Strong'}, {value: 'very_strong', label: 'Very Strong'}]} />
                <ToggleItem icon={Monitor} label="Session Management" description="Allow users to view and revoke active sessions" checked={settings.sessionManagement} onChange={() => handleToggle('sessionManagement')} />
              </>
            )}

            {activeSection === 'alerts' && (
              <>
                <ToggleItem icon={Bell} label="System Alerts" description="Enable in-app toast notifications" checked={settings.systemAlerts} onChange={() => handleToggle('systemAlerts')} />
                <ToggleItem icon={Volume2} label="Sound Alerts" description="Play audio for critical threat detections" checked={settings.soundAlerts} onChange={() => handleToggle('soundAlerts')} />
                <SelectItem icon={AlertTriangle} label="Alert Threshold" description="Minimum severity to trigger alerts" value={settings.alertThreshold} onChange={(v) => handleChange('alertThreshold', v)} options={[{value: 'low', label: 'Low & Above'}, {value: 'medium', label: 'Medium & Above'}, {value: 'high', label: 'High & Critical Only'}]} />
                <SelectItem icon={Clock} label="Notification Frequency" description="How often to dispatch batched emails" value={settings.notificationFrequency} onChange={(v) => handleChange('notificationFrequency', v)} options={[{value: 'immediate', label: 'Immediate'}, {value: 'hourly', label: 'Hourly Digest'}, {value: 'daily', label: 'Daily Digest'}]} />
              </>
            )}

            {activeSection === 'compliance' && (
              <>
                <ToggleItem icon={FileCheck} label="GDPR Compliance Mode" description="Enable strict PII masking in packet logs" checked={settings.gdprCompliance} onChange={() => handleToggle('gdprCompliance')} />
                <ToggleItem icon={Database} label="Access Logging" description="Log all dashboard access attempts and configuration changes" checked={settings.accessLogging} onChange={() => handleToggle('accessLogging')} />
                <ToggleItem icon={UploadCloud} label="Compliance Reports" description="Generate automated monthly compliance reports" checked={settings.complianceReports} onChange={() => handleToggle('complianceReports')} />
                <InputItem icon={Clock} label="Audit Retention" description="Keep audit logs for (days)" value={settings.auditRetention} onChange={(v) => handleChange('auditRetention', parseInt(v))} />
              </>
            )}

          </div>
        </Card>

        {/* ADMIN ACTIONS BAR */}
        <Card className="settings-bottom-actions-card">
          <div className="settings-bottom-note">
            Unsaved changes will be lost if you navigate away.
          </div>
          <div className="settings-bottom-btns">
            <button 
              onClick={handleReset}
              className="settings-btn-reset"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={handleExport}
              className="settings-btn-export"
            >
              <Download size={14} /> Export Settings
            </button>
            <button 
              onClick={handleSave}
              className="settings-btn-save admin-save"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AdminSettings;
