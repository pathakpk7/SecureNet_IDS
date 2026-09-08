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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ padding: '10px', background: 'rgba(0, 245, 255, 0.05)', borderRadius: '8px', color: '#0ea5e9' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: '500', fontSize: '15px' }}>{label}</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>{description}</div>
        </div>
      </div>
      <div 
        onClick={onChange}
        style={{
          width: '44px', height: '24px', background: checked ? '#10b981' : 'rgba(255,255,255,0.1)',
          borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0
        }}
      >
        <div style={{
          width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
          transform: checked ? 'translateX(20px)' : 'translateX(0)', transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  );

  const SelectItem = ({ icon: Icon, label, description, value, options, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ padding: '10px', background: 'rgba(0, 245, 255, 0.05)', borderRadius: '8px', color: '#0ea5e9' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: '500', fontSize: '15px' }}>{label}</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>{description}</div>
        </div>
      </div>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'rgba(15, 23, 42, 0.8)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 12px', borderRadius: '6px', outline: 'none', cursor: 'pointer', fontSize: '13px', minWidth: '120px'
        }}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  const InputItem = ({ icon: Icon, label, description, type="number", value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ padding: '10px', background: 'rgba(0, 245, 255, 0.05)', borderRadius: '8px', color: '#0ea5e9' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ color: '#f8fafc', fontWeight: '500', fontSize: '15px' }}>{label}</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>{description}</div>
        </div>
      </div>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'rgba(15, 23, 42, 0.8)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 12px', borderRadius: '6px', outline: 'none', fontSize: '13px', width: '80px', textAlign: 'center'
        }}
      />
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
    <div className="admin-settings-page fade-in" style={{ padding: '24px 0', display: 'flex', gap: '32px' }}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ marginBottom: '16px', color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={22} color="#00f5ff" /> Configuration
        </div>
        
        {sections.map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none',
                background: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                color: isActive ? '#0ea5e9' : '#94a3b8',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                borderLeft: isActive ? '3px solid #0ea5e9' : '3px solid transparent'
              }}
              onMouseOver={e => { if(!isActive) e.currentTarget.style.color = '#cbd5e1' }}
              onMouseOut={e => { if(!isActive) e.currentTarget.style.color = '#94a3b8' }}
            >
              <sec.icon size={18} />
              {sec.label}
            </button>
          )
        })}

        <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
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
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {React.createElement(sections.find(s => s.id === activeSection)?.icon, { size: 24, color: '#00f5ff' })}
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>ADMIN ONLY</span>
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
        <Card style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            Unsaved changes will be lost if you navigate away.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleReset}
              style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={handleExport}
              style={{ background: 'transparent', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Download size={14} /> Export Settings
            </button>
            <button 
              onClick={handleSave}
              style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}
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
