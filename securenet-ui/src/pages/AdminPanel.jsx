import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { authService, organizationService } from '../api/supabase';
import { 
  Users, UserPlus, Shield, UserX, AlertTriangle, 
  ShieldCheck, Mail, Lock, X, FileText, Download, 
  CheckCircle2, Search, Activity, Trash2, Power, Settings 
} from 'lucide-react';
import '../styles/pages/admin.css';

const ToggleItem = ({ icon: Icon, label, description, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <div style={{ padding: '8px', background: 'rgba(0, 245, 255, 0.05)', borderRadius: '6px', color: '#0ea5e9' }}>
        <Icon size={16} />
      </div>
      <div>
        <div style={{ color: '#f8fafc', fontWeight: '500', fontSize: '13px' }}>{label}</div>
        <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{description}</div>
      </div>
    </div>
    <div 
      onClick={onChange}
      style={{
        width: '36px', height: '20px', background: checked ? '#10b981' : 'rgba(255,255,255,0.1)',
        borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0
      }}
    >
      <div style={{
        width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
        transform: checked ? 'translateX(16px)' : 'translateX(0)', transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  </div>
);

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let supabaseUsers = [];
        try {
          const profiles = await organizationService.getAllProfiles();
          if (profiles && profiles.length > 0) {
            supabaseUsers = profiles.map((u, i) => ({
              id: u.id || `sup-${i}`,
              name: u.name || u.email?.split('@')[0] || 'User',
              email: u.email || '',
              role: u.role || 'user',
              status: u.is_active !== false ? 'active' : 'inactive',
              banned: false,
              lastLogin: u.created_at || 'Unknown',
              loginCount: 0,
              permissions: u.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read'],
              activity: []
            }));
          }
        } catch (e) {
          console.debug("Could not fetch from Supabase, falling back to local users:", e.message);
        }

        const localUsers = authService._getLocalUsers() || [];
        const formattedLocalUsers = localUsers.map((u, i) => ({
          id: u.id || `loc-${i}`,
          name: u.name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          role: u.role || 'user',
          status: 'active',
          banned: false,
          lastLogin: u.created_at || 'Unknown',
          loginCount: 0,
          permissions: u.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read'],
          activity: []
        }));

        const merged = [...supabaseUsers];
        formattedLocalUsers.forEach(lu => {
          if (!merged.find(mu => mu.email === lu.email)) {
            merged.push(lu);
          }
        });

        setUsers(merged);
      } catch (err) {
        console.error('Could not fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user', permissions: ['read'] });
  
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [sysSettings, setSysSettings] = useState({
    userRegistration: true,
    emailNotifications: true,
    twoFactorAuth: false
  });

  const systemStats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active' && !u.banned).length,
    adminUsers: users.filter(u => u.role === 'admin' && !u.banned).length,
    inactiveUsers: users.filter(u => u.status === 'inactive' && !u.banned).length,
    bannedUsers: users.filter(u => u.banned === true).length
  }), [users]);

  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['Name', 'Email', 'Role', 'Status', 'Banned', 'Last Login'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        `"${u.name}"`, 
        `"${u.email}"`, 
        `"${u.role}"`, 
        `"${u.status}"`, 
        u.banned, 
        `"${u.lastLogin}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `users_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAction = (actionType) => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    
    setUsers(prev => prev.map(user => {
      if (!selectedUsers.includes(user.id)) return user;
      if (actionType === 'ban') return { ...user, banned: true, status: 'inactive' };
      if (actionType === 'unban') return { ...user, banned: false, status: 'active' };
      if (actionType === 'activate') return { ...user, status: 'active' };
      if (actionType === 'deactivate') return { ...user, status: 'inactive' };
      return user;
    }));

    if (actionType === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      }
    }
    
    setSelectedUsers([]);
    setShowBulkModal(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedUsers(users.map(u => u.id));
    else setSelectedUsers([]);
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const u = {
        id: `local-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        password: 'securenet123', // Default password for manually added users
        role: newUser.role,
        status: 'active',
        banned: false,
        lastLogin: 'Never',
        loginCount: 0,
        activity: [{ action: 'Account Created by Admin', timestamp: new Date().toISOString(), ip: 'System' }]
      };
      
      // Persist to local registry so it survives page reload
      authService._saveLocalUser(u);

      setUsers([u, ...users]);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'user', permissions: ['read'] });
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Delete this user? Action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleBanUser = (userId) => {
    setUsers(users.map(user => user.id === userId ? { ...user, banned: !user.banned, status: !user.banned ? 'inactive' : 'active' } : user));
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user));
  };

  const handleViewUserActivity = (u) => {
    setSelectedUser(u);
    setShowUserActivityModal(true);
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? { bg: 'rgba(56, 189, 248, 0.1)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' } : { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
  };

  return (
    <div className="admin-panel fade-in" style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} color="#00f5ff" /> Admin Control Panel
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '0.95rem' }}>Manage users, roles, and core platform settings</p>
        </div>
      </div>

      {/* SINGLE ROW COMPACT STATS */}
      <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.8)', overflow: 'hidden' }}>
        <div className="admin-stats-bar">
          
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Users size={16} color="#38bdf8" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Total Users: <b style={{ color: '#f8fafc', fontSize: '14px', marginLeft: '6px' }}>{systemStats.totalUsers}</b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Active Users: <b style={{ color: '#10b981', fontSize: '14px', marginLeft: '6px' }}>{systemStats.activeUsers}</b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <ShieldCheck size={16} color="#a855f7" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Admin Users: <b style={{ color: '#a855f7', fontSize: '14px', marginLeft: '6px' }}>{systemStats.adminUsers}</b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <UserX size={16} color="#f59e0b" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Inactive Users: <b style={{ color: '#f59e0b', fontSize: '14px', marginLeft: '6px' }}>{systemStats.inactiveUsers}</b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <AlertTriangle size={16} color="#ef4444" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Banned Users: <b style={{ color: '#ef4444', fontSize: '14px', marginLeft: '6px' }}>{systemStats.bannedUsers}</b>
            </div>
          </div>

        </div>
      </Card>

      {/* USER MANAGEMENT ACTION ROW */}
      <Card className="admin-actions-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '13px', fontWeight: '600' }}>
          <Settings size={16} color="#38bdf8" /> User Management
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowAddUserModal(true)}
            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={14} /> Add User
          </button>
          <button onClick={handleExportCSV} style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid rgba(145, 165, 233, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} /> Export CSV
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowBulkModal(!showBulkModal)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Bulk Actions
              {selectedUsers.length > 0 && (
                <span style={{ background: '#38bdf8', color: '#0f172a', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>
                  {selectedUsers.length}
                </span>
              )}
            </button>
            
            {showBulkModal && (
              <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', width: '160px', background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '6px', padding: '8px', zIndex: 10 }}>
                <button onClick={() => handleBulkAction('activate')} style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '12px', borderRadius: '4px' }}>Activate Selected</button>
                <button onClick={() => handleBulkAction('deactivate')} style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '12px', borderRadius: '4px' }}>Deactivate Selected</button>
                <button onClick={() => handleBulkAction('ban')} style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '12px', borderRadius: '4px' }}>Ban Selected</button>
                <button onClick={() => handleBulkAction('delete')} style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', borderRadius: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>Delete Selected</button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* TWO COLUMN GRID: USER LIST | SYSTEM SETTINGS */}
      <div className="admin-main-split">
        
        {/* COMPACT USER LIST */}
        <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} color="#00f5ff" /> User Directory</h3>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search..." style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '4px 12px 4px 30px', borderRadius: '20px', fontSize: '12px', width: '160px', outline: 'none' }} />
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {loadingUsers ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading users...</div>
            ) : (
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '10px 20px', width: '40px' }}>
                      <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ padding: '10px 20px', fontWeight: '600' }}>User</th>
                    <th style={{ padding: '10px 20px', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '10px 20px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '10px 20px', fontWeight: '600' }}>Last Login</th>
                    <th style={{ padding: '10px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const rColor = getRoleColor(u.role);
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', background: selectedUsers.includes(u.id) ? 'rgba(56, 189, 248, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => handleSelectUser(u.id)} style={{ cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ color: '#f8fafc', fontWeight: '500' }}>{u.name}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ background: rColor.bg, color: rColor.text, border: `1px solid ${rColor.border}`, padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          {u.banned ? (
                            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Banned</span>
                          ) : u.status === 'active' ? (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Active</span>
                          ) : (
                            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}><Power size={12} /> Inactive</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 20px', color: '#94a3b8' }}>{u.lastLogin}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleViewUserActivity(u)} style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} title="Activity"><Activity size={14}/></button>
                            <button onClick={() => handleToggleUserStatus(u.id)} disabled={u.banned} style={{ background: 'transparent', color: u.status === 'active' ? '#f59e0b' : '#10b981', border: `1px solid ${u.status === 'active' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, padding: '4px 8px', borderRadius: '4px', cursor: u.banned ? 'not-allowed' : 'pointer', fontSize: '11px', opacity: u.banned ? 0.5 : 1 }} title={u.status === 'active' ? 'Disable' : 'Enable'}><Power size={14}/></button>
                            <button onClick={() => handleBanUser(u.id)} style={{ background: u.banned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: u.banned ? '#10b981' : '#ef4444', border: `1px solid ${u.banned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} title={u.banned ? 'Unban' : 'Ban'}><AlertTriangle size={14}/></button>
                            <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} title="Delete"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* SYSTEM SETTINGS CARD */}
        <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={16} color="#a855f7" /> Core System Options</h3>
          </div>
          <div style={{ padding: '0 20px' }}>
            <ToggleItem 
              icon={UserPlus} label="User Registration" description="Allow open new user signups" 
              checked={sysSettings.userRegistration} 
              onChange={() => setSysSettings(p => ({...p, userRegistration: !p.userRegistration}))} 
            />
            <ToggleItem 
              icon={Mail} label="Email Notifications" description="Send system alerts via email" 
              checked={sysSettings.emailNotifications} 
              onChange={() => setSysSettings(p => ({...p, emailNotifications: !p.emailNotifications}))} 
            />
            <ToggleItem 
              icon={Lock} label="Two-Factor Auth" description="Enforce 2FA for all accounts" 
              checked={sysSettings.twoFactorAuth} 
              onChange={() => setSysSettings(p => ({...p, twoFactorAuth: !p.twoFactorAuth}))} 
            />
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
             <button style={{ width: '100%', background: 'transparent', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
               Advanced Configurations
             </button>
          </div>
        </Card>

      </div>

      {/* MODALS */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '420px', padding: '24px', background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Add New User</h3>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} placeholder="John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} placeholder="john@example.com" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleAddUser} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Create User</button>
            </div>
          </Card>
        </div>
      )}

      {showUserActivityModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '520px', padding: '24px', background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Activity - {selectedUser.name}</h3>
              <button onClick={() => setShowUserActivityModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div><span style={{ color: '#64748b' }}>Email:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.email}</span></div>
              <div><span style={{ color: '#64748b' }}>Role:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.role.toUpperCase()}</span></div>
              <div><span style={{ color: '#64748b' }}>Status:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.status.toUpperCase()}</span></div>
              <div><span style={{ color: '#64748b' }}>Logins:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.loginCount}</span></div>
            </div>

            <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '13px' }}>Recent Activity</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedUser.activity.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '20px' }}>No activity logs found.</div>
              ) : (
                selectedUser.activity.map((act, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ color: '#f8fafc', fontWeight: '500', marginBottom: '4px' }}>{act.action}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                      <span>IP: {act.ip}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
