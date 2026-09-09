import React, { useState } from 'react';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { 
  Settings, User, Bell, LayoutDashboard, Eye, Accessibility,
  Save, RotateCcw, Moon, RotateCw, Volume2, Mail, Smartphone,
  Globe, Clock, Maximize, Lock, Activity, EyeOff, Type, Contrast, Hand
} from "lucide-react";
import '../../styles/pages/settings.css';

const UserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: false,
    autoRefresh: true,
    soundAlerts: false,
    emailAlerts: true,
    pushNotifications: true,
    alertThreshold: 'medium',
    notificationFrequency: 'immediate',
    language: 'english',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    defaultDashboard: 'overview',
    widgetsEnabled: true,
    animationEffects: true,
    compactView: false,
    profileVisibility: 'team',
    activityStatus: true,
    lastSeenVisibility: true,
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReader: false
  });

  const [activeSection, setActiveSection] = useState('personal');

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    alert('Personal settings saved successfully!');
  };

  const handleReset = () => {
    if(window.confirm('Are you sure you want to reset your personal settings to defaults?')) {
      alert('Settings reset.');
    }
  };

  // Reusable UI Components
  const ToggleItem = ({ icon: Icon, label, description, checked, onChange }) => (
    <div className="settings-control-row">
      <div className="settings-control-info">
        <div className="settings-control-icon user-icon">
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
        <div className="settings-control-icon user-icon">
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

  const sections = [
    { id: 'personal', label: 'General Preferences', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'dashboard', label: 'Dashboard View', icon: LayoutDashboard },
    { id: 'privacy', label: 'Privacy & Status', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ];

  return (
    <div className="user-settings-page settings-view-layout fade-in">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="settings-nav-sidebar">
        <div className="settings-sidebar-title">
          <Settings size={20} color="#10b981" /> My Settings
        </div>
        
        <div className="settings-nav-items-scroll">
          {sections.map(sec => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`settings-nav-btn user-nav ${isActive ? 'active' : ''}`}
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
              <User size={14} /> Profile Status
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
              {user?.username || 'User'}<br/>
              Role: {user?.role || 'Analyst'}<br/>
              Standard Security Profile
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="settings-main-panel">
        
        <Card className="settings-panel-card">
          <div className="settings-panel-header">
            <h2 className="settings-panel-title">
              {React.createElement(sections.find(s => s.id === activeSection)?.icon, { size: 22, color: '#10b981' })}
              <span>{sections.find(s => s.id === activeSection)?.label}</span>
            </h2>
            <div>
              <span className="settings-badge-user">PERSONAL</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {activeSection === 'personal' && (
              <>
                <ToggleItem icon={Moon} label="Dark Mode Interface" description="Toggle dark mode theme" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                <SelectItem icon={Globe} label="Language" description="Interface language" value={settings.language} onChange={(v) => handleChange('language', v)} options={[{value: 'english', label: 'English'}, {value: 'spanish', label: 'Spanish'}, {value: 'french', label: 'French'}]} />
                <SelectItem icon={Globe} label="Timezone" description="Your local timezone" value={settings.timezone} onChange={(v) => handleChange('timezone', v)} options={[{value: 'UTC', label: 'UTC'}, {value: 'EST', label: 'EST'}, {value: 'PST', label: 'PST'}]} />
                <SelectItem icon={Clock} label="Time Format" description="12-hour or 24-hour clock" value={settings.timeFormat} onChange={(v) => handleChange('timeFormat', v)} options={[{value: '12-hour', label: '12-hour AM/PM'}, {value: '24-hour', label: '24-hour'}]} />
              </>
            )}

            {activeSection === 'notifications' && (
              <>
                <ToggleItem icon={Volume2} label="Sound Alerts" description="Play sound for critical alerts" checked={settings.soundAlerts} onChange={() => handleToggle('soundAlerts')} />
                <ToggleItem icon={Mail} label="Email Alerts" description="Receive digest emails" checked={settings.emailAlerts} onChange={() => handleToggle('emailAlerts')} />
                <ToggleItem icon={Smartphone} label="Push Notifications" description="Receive browser push notifications" checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
                <SelectItem icon={Bell} label="Alert Threshold" description="Minimum severity to notify you" value={settings.alertThreshold} onChange={(v) => handleChange('alertThreshold', v)} options={[{value: 'low', label: 'Low & Above'}, {value: 'medium', label: 'Medium & Above'}, {value: 'high', label: 'High & Critical'}]} />
              </>
            )}

            {activeSection === 'dashboard' && (
              <>
                <ToggleItem icon={RotateCw} label="Auto Refresh" description="Keep dashboard data live" checked={settings.autoRefresh} onChange={() => handleToggle('autoRefresh')} />
                <ToggleItem icon={LayoutDashboard} label="Dashboard Widgets" description="Show overview widgets on home screen" checked={settings.widgetsEnabled} onChange={() => handleToggle('widgetsEnabled')} />
                <ToggleItem icon={Maximize} label="Compact View" description="Reduce padding to fit more data" checked={settings.compactView} onChange={() => handleToggle('compactView')} />
                <SelectItem icon={LayoutDashboard} label="Default Dashboard" description="Screen to show on login" value={settings.defaultDashboard} onChange={(v) => handleChange('defaultDashboard', v)} options={[{value: 'overview', label: 'System Overview'}, {value: 'network', label: 'Network Traffic'}, {value: 'logs', label: 'Security Logs'}]} />
              </>
            )}

            {activeSection === 'privacy' && (
              <>
                <ToggleItem icon={Activity} label="Activity Status" description="Show when you are online" checked={settings.activityStatus} onChange={() => handleToggle('activityStatus')} />
                <ToggleItem icon={Clock} label="Last Seen Visibility" description="Show your last login time" checked={settings.lastSeenVisibility} onChange={() => handleToggle('lastSeenVisibility')} />
                <SelectItem icon={Lock} label="Profile Visibility" description="Who can see your profile" value={settings.profileVisibility} onChange={(v) => handleChange('profileVisibility', v)} options={[{value: 'private', label: 'Private'}, {value: 'team', label: 'Team Only'}, {value: 'public', label: 'Public'}]} />
              </>
            )}

            {activeSection === 'accessibility' && (
              <>
                <ToggleItem icon={Contrast} label="High Contrast" description="Increase contrast for better visibility" checked={settings.highContrast} onChange={() => handleToggle('highContrast')} />
                <ToggleItem icon={EyeOff} label="Reduced Motion" description="Minimize animations and transitions" checked={settings.reducedMotion} onChange={() => handleToggle('reducedMotion')} />
                <ToggleItem icon={Hand} label="Screen Reader Support" description="Optimize for screen readers" checked={settings.screenReader} onChange={() => handleToggle('screenReader')} />
                <SelectItem icon={Type} label="Font Size" description="Global text scaling" value={settings.fontSize} onChange={(v) => handleChange('fontSize', v)} options={[{value: 'small', label: 'Small'}, {value: 'medium', label: 'Medium'}, {value: 'large', label: 'Large'}]} />
              </>
            )}

          </div>
        </Card>

        {/* ACTIONS BAR */}
        <Card className="settings-bottom-actions-card">
          <div className="settings-bottom-note">
            Need advanced system settings? Contact your Administrator.
          </div>
          <div className="settings-bottom-btns">
            <button 
              onClick={handleReset}
              className="settings-btn-reset"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={handleSave}
              className="settings-btn-save user-save"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default UserSettings;
