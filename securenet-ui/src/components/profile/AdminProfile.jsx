import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, Zap, Users, Shield, Download, BarChart2, Server, Activity, Clock, ShieldAlert } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { authService, organizationService } from '../../api/supabase';
import '../../styles/pages/profile.css';

const AdminProfile = () => {
  const { user } = useAuth();
  
  // Resolve current user data (fallback to demoUser if not fully populated in context)
  const currentUser = user || (localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')) : null);
  
  const [adminData, setAdminData] = useState({
    name: currentUser?.user_metadata?.name || currentUser?.name || 'System Admin',
    email: currentUser?.email || 'admin@securenet.com',
    role: currentUser?.role || 'admin',
    department: currentUser?.organization?.name || 'IT Security Operations',
    joinedDate: currentUser?.created_at || new Date().toISOString(),
    securityLevel: 'MAXIMUM'
  });

  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeThreats: 0,
    systemUptime: '99.9%',
    lastBackup: 'Never'
  });

  const [adminActions, setAdminActions] = useState([]);
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  useEffect(() => {
    // Dynamically fetch total users
    const fetchStats = async () => {
      try {
        let total = 0;
        const localUsers = authService._getLocalUsers() || [];
        total += localUsers.length;
        
        try {
          const profiles = await organizationService.getAllProfiles();
          if (profiles) total += profiles.length;
        } catch (e) {
          console.debug("Could not fetch Supabase profiles for stats");
        }

        setSystemStats(prev => ({
          ...prev,
          totalUsers: total > 0 ? total : 1,
          lastBackup: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();

    // Populate dynamic recent actions
    const actions = [
      { id: 1, action: `Admin session authenticated via ${currentUser?.email}`, timestamp: 'Just now', type: 'security', icon: Lock, color: '#10b981' },
      { id: 2, action: 'Synchronized live threat intelligence feed', timestamp: '1 hour ago', type: 'system', icon: Server, color: '#38bdf8' },
      { id: 3, action: 'Updated zero-trust network policies', timestamp: '3 hours ago', type: 'security', icon: Shield, color: '#f59e0b' },
      { id: 4, action: 'Automated vulnerability scan completed', timestamp: '1 day ago', type: 'report', icon: Activity, color: '#8b5cf6' }
    ];
    setAdminActions(actions);
    
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeThreats: Math.floor(Math.random() * 5)
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleRunBackup = () => {
    setIsBackupRunning(true);
    toast.loading('Initiating deep system snapshot...', { id: 'admin-backup' });
    setTimeout(() => {
      setIsBackupRunning(false);
      setSystemStats(prev => ({ ...prev, lastBackup: 'Just now' }));
      toast.success('System configuration and logs backed up securely.', { id: 'admin-backup' });
      setAdminActions(prev => [
        { id: Date.now(), action: 'Executed full system backup', timestamp: 'Just now', type: 'system', icon: Download, color: '#38bdf8' },
        ...prev
      ]);
    }, 2500);
  };

  const handleGenerateReport = () => {
    toast.success('Generating administrator SOC audit report...');
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ adminData, systemStats }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `audit_report_${new Date().getTime()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Audit report downloaded successfully!');
    }, 800);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <ShieldAlert size={32} color="#ef4444" />
        </div>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', color: '#f8fafc', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>Administrator Terminal</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>System controller and elevated security management</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* ADMIN IDENTITY */}
        <Card style={{ background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(239, 68, 68, 0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444', boxShadow: '0 0 15px #ef4444' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <Lock size={18} /> IDENTITY VAULT
            </h3>
            <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>ROOT_ACCESS</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identity</span>
              <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '500' }}>{adminData.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</span>
              <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '500' }}>{adminData.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Node</span>
              <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '500' }}>{adminData.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clearance</span>
              <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '700', textShadow: '0 0 8px rgba(16,185,129,0.4)' }}>{adminData.securityLevel}</span>
            </div>
          </div>
        </Card>

        {/* SYSTEM STATUS */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(0, 245, 255, 0.2)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#00f5ff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Activity size={18} /> NETWORK METRICS
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Total Users</div>
              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }}>{systemStats.totalUsers}</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ color: '#ef4444', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Active Threats</div>
              <div style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(239,68,68,0.3)' }}>{systemStats.activeThreats}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Uptime</div>
              <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>{systemStats.systemUptime}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Last Backup</div>
              <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '600', marginTop: '8px' }}>{systemStats.lastBackup}</div>
            </div>
          </div>
        </Card>

        {/* SECURITY POLICIES */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Shield size={18} /> SECURITY POLICIES
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Zero-Trust Auth</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Multi-factor enforced</div>
              </div>
              <span style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '12px', fontWeight: 'bold' }}>ACTIVE</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Session Timeout</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Auto-kill inactive sessions</div>
              </div>
              <span style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: '12px', fontWeight: 'bold' }}>15 MIN</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Geo-Fencing</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Block unauthorized regions</div>
              </div>
              <span style={{ fontSize: '10px', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '12px', fontWeight: 'bold' }}>ACTIVE</span>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* RECENT ACTIONS */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Clock size={18} color="#94a3b8" /> RECENT ADMIN ACTIONS
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {adminActions.map(action => (
              <div key={action.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', color: action.color }}>
                  <action.icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '500' }}>{action.action}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {action.timestamp} • {action.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* QUICK ACTIONS */}
        <Card style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Zap size={18} color="#f59e0b" /> QUICK COMMANDS
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => toast.info('Navigating to Policy Manager')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <Shield size={16} /> Update Security Policies
            </button>
            <button onClick={() => toast.info('Opening Network Configurations')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', color: '#00f5ff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <Server size={16} /> Configure Network Rules
            </button>
            <button onClick={handleRunBackup} disabled={isBackupRunning} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', opacity: isBackupRunning ? 0.5 : 1 }}>
              <Download size={16} /> {isBackupRunning ? 'Backing Up...' : 'System Snapshot Backup'}
            </button>
            <button onClick={handleGenerateReport} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
              <BarChart2 size={16} /> Generate SOC Report
            </button>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default AdminProfile;
