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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', color: '#10b981' }}>
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
        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', color: '#10b981' }}>
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

  const sections = [
    { id: 'personal', label: 'General Preferences', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'dashboard', label: 'Dashboard View', icon: LayoutDashboard },
    { id: 'privacy', label: 'Privacy & Status', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ];

  return (
    <div className="user-settings-page fade-in" style={{ padding: '24px 0', display: 'flex', gap: '32px' }}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ marginBottom: '16px', color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={22} color="#10b981" /> My Settings
        </div>
        
        {sections.map(sec => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: 'none',
                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: isActive ? '#10b981' : '#94a3b8',
                fontWeight: isActive ? '600' : '400',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent'
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
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {React.createElement(sections.find(s => s.id === activeSection)?.icon, { size: 24, color: '#10b981' })}
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>PERSONAL</span>
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
        <Card style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            Need advanced system settings? Contact your Administrator.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleReset}
              style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={handleSave}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}
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
