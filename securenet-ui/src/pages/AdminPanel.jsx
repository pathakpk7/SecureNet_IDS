import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { authService, organizationService, guidanceService } from '../api/supabase';
import { 
  Users, UserPlus, Shield, UserX, AlertTriangle, 
  ShieldCheck, Mail, Lock, X, FileText, Download, 
  CheckCircle2, Search, Activity, Trash2, Power, Settings,
  Key, Copy, Check, RefreshCw, MessageSquare, HandHeart,
  Clock, Award, HelpCircle, ChevronRight, Send, AlertCircle,
  Briefcase, Eye, ShieldAlert, Zap, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
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
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'guidance' | 'activity' | 'settings'

  // Users & Org Data
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [orgDetails, setOrgDetails] = useState({
    id: user?.org_id || user?.organization?.id || 'demo-org-id',
    name: user?.organization?.name || 'SecureNet SOC Enterprise',
    join_key: user?.organization?.join_key || 'SEC789'
  });
  const [copiedKey, setCopiedKey] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);

  // Guidance Requests Data
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [guidanceFilter, setGuidanceFilter] = useState('all'); // 'all' | 'open' | 'claimed' | 'resolved'
  const [selectedGuidanceTicket, setSelectedGuidanceTicket] = useState(null);
  const [guidanceResponseText, setGuidanceResponseText] = useState('');
  const [guidanceStatusSelect, setGuidanceStatusSelect] = useState('resolved');
  const [respondingToGuidance, setRespondingToGuidance] = useState(false);

  // Activity Stream Data
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  // Modals & Selections
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetAdminToAssign, setTargetAdminToAssign] = useState('');
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: 'user', 
    specialty_role: 'Security Analyst',
    permissions: ['read'] 
  });
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // System Settings
  const [sysSettings, setSysSettings] = useState({
    userRegistration: true,
    emailNotifications: true,
    twoFactorAuth: false,
    autoAssignAdmins: true,
    telemetryLogging: true
  });

  // Fetch Users and Org Admins
  const fetchUsersAndOrg = async () => {
    try {
      setLoadingUsers(true);
      const orgId = user?.org_id || user?.organization?.id || 'demo-org-id';

      // 1. Fetch profiles
      let supabaseUsers = [];
      try {
        const profiles = await organizationService.getAllProfiles();
        if (profiles && profiles.length > 0) {
          supabaseUsers = profiles.map((u, i) => ({
            id: u.id || `sup-${i}`,
            name: u.name || u.email?.split('@')[0] || 'User',
            email: u.email || '',
            role: u.role || 'user',
            specialty_role: u.specialty_role || (u.role === 'admin' ? 'Security Architect' : 'SOC Analyst'),
            assigned_admin_id: u.assigned_admin_id || null,
            status: u.is_active !== false ? 'active' : 'inactive',
            banned: false,
            lastLogin: u.created_at || 'Recently',
            loginCount: 1,
            permissions: u.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read'],
            activity: []
          }));
        }
      } catch (e) {
        console.debug("Falling back to local users:", e.message);
      }

      const localUsers = authService._getLocalUsers() || [];
      const formattedLocalUsers = localUsers.map((u, i) => ({
        id: u.id || `loc-${i}`,
        name: u.name || u.email?.split('@')[0] || 'User',
        email: u.email || '',
        role: u.role || 'user',
        specialty_role: u.specialty_role || (u.role === 'admin' ? 'General Admin' : 'SOC Analyst'),
        assigned_admin_id: u.assigned_admin_id || null,
        status: 'active',
        banned: false,
        lastLogin: u.created_at || 'Recently',
        loginCount: 1,
        permissions: u.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read'],
        activity: []
      }));

      const merged = [...supabaseUsers];
      formattedLocalUsers.forEach(lu => {
        if (!merged.find(mu => mu.email === lu.email)) {
          merged.push(lu);
        }
      });

      // Default demo accounts if empty
      if (merged.length === 0) {
        merged.push(
          {
            id: 'admin-1',
            name: 'Lead Admin',
            email: 'admin@securenet.com',
            role: 'admin',
            specialty_role: 'Threat Hunting & Response',
            status: 'active',
            banned: false,
            lastLogin: 'Active now',
            loginCount: 42,
            permissions: ['read', 'write', 'delete', 'admin'],
            activity: []
          },
          {
            id: 'user-1',
            name: 'SOC Analyst Demo',
            email: 'user@securenet.com',
            role: 'user',
            specialty_role: 'Level 1 Triage',
            assigned_admin_id: 'admin-1',
            status: 'active',
            banned: false,
            lastLogin: '10m ago',
            loginCount: 12,
            permissions: ['read'],
            activity: []
          }
        );
      }

      setUsers(merged);

      // 2. Fetch Org Admins
      try {
        const admins = await organizationService.getOrgAdmins(orgId);
        if (admins && admins.length > 0) {
          setOrgAdmins(admins);
        } else {
          setOrgAdmins(merged.filter(u => u.role === 'admin'));
        }
      } catch {
        setOrgAdmins(merged.filter(u => u.role === 'admin'));
      }

      // 3. Fetch Org Join Key
      const key = user?.organization?.join_key || localStorage.getItem('securenet_org_key') || 'SEC789';
      setOrgDetails(prev => ({ ...prev, join_key: key }));

    } catch (err) {
      console.error('Could not fetch users and org details:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Guidance Requests
  const fetchGuidanceRequests = async () => {
    try {
      setLoadingGuidance(true);
      const orgId = user?.org_id || user?.organization?.id || 'demo-org-id';
      const requests = await guidanceService.getRequests({ orgId });
      setGuidanceRequests(requests || []);
    } catch (err) {
      console.warn("Could not load guidance requests:", err);
    } finally {
      setLoadingGuidance(false);
    }
  };

  // Fetch Activity Stream
  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const orgId = user?.org_id || user?.organization?.id || 'demo-org-id';
      const acts = await guidanceService.getUserActivities({ orgId, limit: 50 });
      setActivities(acts || []);
    } catch (err) {
      console.warn("Could not load activity logs:", err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchUsersAndOrg();
    fetchGuidanceRequests();
    fetchActivities();
  }, [user]);

  // Copy Key Handler
  const handleCopyKey = () => {
    navigator.clipboard.writeText(orgDetails.join_key);
    setCopiedKey(true);
    toast.success('6-letter Join Key copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Regenerate Key Handler
  const handleRegenerateKey = async () => {
    if (!window.confirm("Are you sure you want to regenerate this organization's 6-letter join key? Existing keys will no longer work for new signups.")) {
      return;
    }
    try {
      setRegeneratingKey(true);
      const orgId = user?.org_id || user?.organization?.id || 'demo-org-id';
      const newKey = await organizationService.regenerateJoinKey(orgId);
      setOrgDetails(prev => ({ ...prev, join_key: newKey }));
      localStorage.setItem('securenet_org_key', newKey);
      toast.success(`New 6-letter Key Generated: ${newKey}`);
    } catch (err) {
      toast.error('Failed to regenerate key');
    } finally {
      setRegeneratingKey(false);
    }
  };

  // Volunteer to Guide a user ticket
  const handleVolunteerForRequest = async (requestId) => {
    try {
      const adminName = user?.name || user?.email?.split('@')[0] || 'Admin Mentor';
      const updated = await guidanceService.volunteerForRequest(requestId, user.id, adminName);
      
      // Log activity
      await guidanceService.logUserActivity({
        org_id: orgDetails.id,
        user_id: user.id,
        email: user.email,
        action: 'admin_volunteered_guidance',
        resource_type: 'guidance_ticket',
        resource_id: requestId,
        details: { admin: adminName }
      });

      toast.success('You have volunteered to mentor and guide this user!');
      fetchGuidanceRequests();
      fetchActivities();
    } catch (err) {
      toast.error('Error volunteering for guidance request');
    }
  };

  // Submit Admin Guidance Response
  const handleSubmitGuidanceResponse = async (e) => {
    e.preventDefault();
    if (!selectedGuidanceTicket || !guidanceResponseText.trim()) {
      toast.error('Please enter guidance feedback or instructions');
      return;
    }

    try {
      setRespondingToGuidance(true);
      await guidanceService.respondToRequest(selectedGuidanceTicket.id, {
        admin_response: guidanceResponseText,
        status: guidanceStatusSelect,
        admin_id: user.id
      });

      // Log activity
      await guidanceService.logUserActivity({
        org_id: orgDetails.id,
        user_id: user.id,
        email: user.email,
        action: 'guidance_ticket_resolved',
        resource_type: 'guidance_ticket',
        resource_id: selectedGuidanceTicket.id,
        details: { status: guidanceStatusSelect, target_user: selectedGuidanceTicket.user_name }
      });

      toast.success(`Guidance response sent & ticket marked ${guidanceStatusSelect.toUpperCase()}`);
      setSelectedGuidanceTicket(null);
      setGuidanceResponseText('');
      fetchGuidanceRequests();
      fetchActivities();
    } catch (err) {
      toast.error('Failed to submit guidance response');
    } finally {
      setRespondingToGuidance(false);
    }
  };

  // Assign Admin to User
  const handleAssignAdminSubmit = async () => {
    if (!selectedUser || !targetAdminToAssign) return;
    try {
      await organizationService.assignUserAdmin(selectedUser.id, targetAdminToAssign);
      
      const adminObj = orgAdmins.find(a => a.id === targetAdminToAssign);
      const adminLabel = adminObj ? (adminObj.name || adminObj.email) : targetAdminToAssign;

      // Update local state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, assigned_admin_id: targetAdminToAssign } : u));
      
      await guidanceService.logUserActivity({
        org_id: orgDetails.id,
        user_id: user.id,
        email: user.email,
        action: 'admin_assigned_to_user',
        resource_type: 'user',
        resource_id: selectedUser.id,
        details: { user_email: selectedUser.email, assigned_admin: adminLabel }
      });

      toast.success(`Assigned ${adminLabel} as mentor for ${selectedUser.name}`);
      setShowAssignAdminModal(false);
      setSelectedUser(null);
      fetchActivities();
    } catch (err) {
      toast.error('Failed to assign admin mentor');
    }
  };

  const systemStats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active' && !u.banned).length,
    adminUsers: users.filter(u => u.role === 'admin' && !u.banned).length,
    openGuidanceTickets: guidanceRequests.filter(r => r.status === 'open').length,
    totalGuidanceTickets: guidanceRequests.length,
    totalActivities: activities.length
  }), [users, guidanceRequests, activities]);

  // Export CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['Name', 'Email', 'Role', 'Specialty', 'Status', 'Last Login'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        `"${u.name}"`, 
        `"${u.email}"`, 
        `"${u.role}"`, 
        `"${u.specialty_role || 'N/A'}"`, 
        `"${u.status}"`, 
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

  // Add User
  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const u = {
        id: `local-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        password: 'securenet123',
        role: newUser.role,
        specialty_role: newUser.specialty_role,
        status: 'active',
        banned: false,
        lastLogin: 'Never',
        loginCount: 0,
        activity: [{ action: 'Account Created by Admin', timestamp: new Date().toISOString(), ip: 'System' }]
      };
      
      authService._saveLocalUser(u);
      setUsers([u, ...users]);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'user', specialty_role: 'Security Analyst', permissions: ['read'] });
      toast.success(`User ${u.name} registered successfully`);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Delete this user? Action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User removed');
    }
  };

  const handleBanUser = (userId) => {
    setUsers(users.map(user => user.id === userId ? { ...user, banned: !user.banned, status: !user.banned ? 'inactive' : 'active' } : user));
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => user.id === userId ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user));
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? { bg: 'rgba(56, 189, 248, 0.1)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' } 
      : { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.specialty_role?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const filteredGuidance = useMemo(() => {
    if (guidanceFilter === 'open') return guidanceRequests.filter(r => r.status === 'open');
    if (guidanceFilter === 'claimed') return guidanceRequests.filter(r => r.status === 'in_progress');
    if (guidanceFilter === 'resolved') return guidanceRequests.filter(r => r.status === 'resolved');
    return guidanceRequests;
  }, [guidanceRequests, guidanceFilter]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchSearch = !activitySearch || 
        act.user_email?.toLowerCase().includes(activitySearch.toLowerCase()) ||
        act.action?.toLowerCase().includes(activitySearch.toLowerCase());
      
      if (activityFilter === 'all') return matchSearch;
      if (activityFilter === 'guidance') return matchSearch && act.action?.includes('guidance');
      if (activityFilter === 'auth') return matchSearch && (act.action?.includes('login') || act.action?.includes('signup'));
      if (activityFilter === 'security') return matchSearch && (act.action?.includes('alert') || act.action?.includes('threat') || act.action?.includes('rule'));
      return matchSearch;
    });
  }, [activities, activitySearch, activityFilter]);

  return (
    <div className="admin-panel fade-in" style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER WITH TITLE & ROLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={28} color="#00f5ff" /> Admin Control & Guidance Center
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '0.95rem' }}>
            Multi-admin collaboration, organization key management, user mentoring, and telemetry monitoring
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ 
            background: 'rgba(0, 245, 255, 0.1)', 
            color: '#00f5ff', 
            border: '1px solid rgba(0, 245, 255, 0.3)',
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={14} /> Org ID: {orgDetails.id.substring(0, 8)}...
          </span>
        </div>
      </div>

      {/* 6-LETTER JOIN KEY & MULTI-ADMIN HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 60, 0.9) 100%)',
        border: '1px solid rgba(0, 245, 255, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 245, 255, 0.05)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        alignItems: 'center'
      }}>
        
        {/* Left: Organization 6-Letter Key */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Key size={18} color="#00f5ff" />
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Organization 6-Letter Join Key
            </span>
          </div>
          
          <h3 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '20px', fontWeight: '700' }}>
            {orgDetails.name}
          </h3>

          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Share this 6-letter security key with analysts, responders, and secondary admins to onboard them directly into your organization SOC workspace.
          </p>

          {/* Join Key Code Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px dashed rgba(0, 245, 255, 0.6)',
              borderRadius: '12px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '28px',
                fontWeight: '900',
                letterSpacing: '6px',
                color: '#00f5ff',
                textShadow: '0 0 12px rgba(0, 245, 255, 0.5)'
              }}>
                {orgDetails.join_key}
              </span>

              <button
                onClick={handleCopyKey}
                style={{
                  background: copiedKey ? '#10b981' : 'rgba(0, 245, 255, 0.15)',
                  color: copiedKey ? '#fff' : '#00f5ff',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                title="Copy Join Key"
              >
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={handleRegenerateKey}
              disabled={regeneratingKey}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Regenerate Key"
            >
              <RefreshCw size={14} className={regeneratingKey ? 'spin' : ''} />
              {regeneratingKey ? 'Updating...' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Right: Multi-Admin Roster & Roles */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#38bdf8" />
              <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: '600' }}>
                Multi-Admin Council ({orgAdmins.length})
              </span>
            </div>
            <span style={{ color: '#10b981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Active Mentors
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
            {orgAdmins.map((adm, idx) => (
              <div 
                key={adm.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {(adm.name || adm.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#f8fafc', fontSize: '12px', fontWeight: '600' }}>
                      {adm.name || adm.email?.split('@')[0]} {adm.email === user?.email && <span style={{ color: '#00f5ff', fontSize: '10px' }}>(You)</span>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                      {adm.email}
                    </div>
                  </div>
                </div>

                <span style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  {adm.specialty_role || 'Security Admin'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* METRIC STRIP */}
      <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.8)', overflow: 'hidden' }}>
        <div className="admin-stats-bar">
          
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Users size={16} color="#38bdf8" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Total Users: <b style={{ color: '#f8fafc', fontSize: '14px', marginLeft: '6px' }}>{systemStats.totalUsers}</b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <ShieldCheck size={16} color="#a855f7" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Admins: <b style={{ color: '#a855f7', fontSize: '14px', marginLeft: '6px' }}>{systemStats.adminUsers}</b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <HandHeart size={16} color="#f59e0b" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Open Tickets: <b style={{ color: systemStats.openGuidanceTickets > 0 ? '#f59e0b' : '#10b981', fontSize: '14px', marginLeft: '6px' }}>
                {systemStats.openGuidanceTickets}
              </b>
            </div>
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <Activity size={16} color="#10b981" />
            <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Telemetry Events: <b style={{ color: '#10b981', fontSize: '14px', marginLeft: '6px' }}>{systemStats.totalActivities}</b>
            </div>
          </div>

        </div>
      </Card>

      {/* TAB NAVIGATION BAR */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: activeTab === 'users' ? 'rgba(0, 245, 255, 0.15)' : 'transparent',
            color: activeTab === 'users' ? '#00f5ff' : '#94a3b8',
            border: activeTab === 'users' ? '1px solid rgba(0, 245, 255, 0.4)' : '1px solid transparent',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Users size={16} /> User Directory & Mentorship ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('guidance')}
          style={{
            background: activeTab === 'guidance' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'guidance' ? '#fbbf24' : '#94a3b8',
            border: activeTab === 'guidance' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <HandHeart size={16} /> Volunteer & Guidance Center
          {systemStats.openGuidanceTickets > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#fff',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '10px'
            }}>
              {systemStats.openGuidanceTickets}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          style={{
            background: activeTab === 'activity' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'activity' ? '#10b981' : '#94a3b8',
            border: activeTab === 'activity' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Activity size={16} /> User Activity Stream
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            background: activeTab === 'settings' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            color: activeTab === 'settings' ? '#c084fc' : '#94a3b8',
            border: activeTab === 'settings' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Settings size={16} /> System & Policy Settings
        </button>
      </div>

      {/* TAB 1: USERS & ACCESS CONTROL */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* USER MANAGEMENT ACTION ROW */}
          <Card className="admin-actions-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '13px', fontWeight: '600' }}>
              <Users size={16} color="#38bdf8" /> User & Role Management
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowAddUserModal(true)}
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={14} /> Add User / Admin
              </button>
              <button onClick={handleExportCSV} style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid rgba(145, 165, 233, 0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} /> Export CSV
              </button>
            </div>
          </Card>

          {/* USER TABLE */}
          <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#00f5ff" /> Organization Members Directory
              </h3>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search user, specialty, role..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 12px 6px 30px', borderRadius: '20px', fontSize: '12px', width: '220px', outline: 'none' }} 
                />
              </div>
            </div>
            
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {loadingUsers ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading organization members...</div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No users match the search criteria.</div>
              ) : (
                <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '10px 20px', fontWeight: '600' }}>User</th>
                      <th style={{ padding: '10px 20px', fontWeight: '600' }}>Role</th>
                      <th style={{ padding: '10px 20px', fontWeight: '600' }}>Specialty / Domain</th>
                      <th style={{ padding: '10px 20px', fontWeight: '600' }}>Assigned Mentor</th>
                      <th style={{ padding: '10px 20px', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '10px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const rColor = getRoleColor(u.role);
                      const mentor = orgAdmins.find(a => a.id === u.assigned_admin_id);
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '12px 20px' }}>
                            <div style={{ color: '#f8fafc', fontWeight: '500' }}>{u.name}</div>
                            <div style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{ background: rColor.bg, color: rColor.text, border: `1px solid ${rColor.border}`, padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#cbd5e1' }}>
                            {u.specialty_role || (u.role === 'admin' ? 'Security Architect' : 'SOC Analyst')}
                          </td>
                          <td style={{ padding: '12px 20px' }}>
                            {u.role === 'admin' ? (
                              <span style={{ color: '#64748b', fontSize: '11px' }}>— Mentor —</span>
                            ) : mentor ? (
                              <span style={{ color: '#38bdf8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={12} /> {mentor.name || mentor.email}
                              </span>
                            ) : (
                              <button
                                onClick={() => { setSelectedUser(u); setShowAssignAdminModal(true); }}
                                style={{
                                  background: 'rgba(56, 189, 248, 0.1)',
                                  color: '#38bdf8',
                                  border: '1px solid rgba(56, 189, 248, 0.3)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                + Assign Mentor
                              </button>
                            )}
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
                          <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {u.role !== 'admin' && (
                                <button 
                                  onClick={() => { setSelectedUser(u); setShowAssignAdminModal(true); }} 
                                  style={{ background: 'transparent', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} 
                                  title="Assign/Change Mentor"
                                >
                                  <Shield size={14}/>
                                </button>
                              )}
                              <button onClick={() => { setSelectedUser(u); setShowUserActivityModal(true); }} style={{ background: 'transparent', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} title="Activity"><Activity size={14}/></button>
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
        </div>
      )}

      {/* TAB 2: VOLUNTEER & GUIDANCE CENTER */}
      {activeTab === 'guidance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Action and Filter Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HandHeart size={18} color="#f59e0b" /> User Guidance & Mentorship Tickets
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>
                Review user questions, threat escalations, volunteer to guide, and provide actionable security resolutions
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Filter:</span>
              <button
                onClick={() => setGuidanceFilter('all')}
                style={{
                  background: guidanceFilter === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: guidanceFilter === 'all' ? '#fff' : '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                All ({guidanceRequests.length})
              </button>
              <button
                onClick={() => setGuidanceFilter('open')}
                style={{
                  background: guidanceFilter === 'open' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: guidanceFilter === 'open' ? '#ef4444' : '#94a3b8',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Open ({guidanceRequests.filter(r => r.status === 'open').length})
              </button>
              <button
                onClick={() => setGuidanceFilter('claimed')}
                style={{
                  background: guidanceFilter === 'claimed' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: guidanceFilter === 'claimed' ? '#f59e0b' : '#94a3b8',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                In Progress ({guidanceRequests.filter(r => r.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setGuidanceFilter('resolved')}
                style={{
                  background: guidanceFilter === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: guidanceFilter === 'resolved' ? '#10b981' : '#94a3b8',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Resolved ({guidanceRequests.filter(r => r.status === 'resolved').length})
              </button>
              <button
                onClick={fetchGuidanceRequests}
                style={{
                  background: 'transparent',
                  color: '#00f5ff',
                  border: '1px solid rgba(0, 245, 255, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} className={loadingGuidance ? 'spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Ticket Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {loadingGuidance ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>
                Loading guidance tickets...
              </div>
            ) : filteredGuidance.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#94a3b8',
                gridColumn: '1 / -1',
                background: 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>No pending guidance tickets</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>All user requests in this view have been attended to or none have been submitted yet.</p>
              </div>
            ) : (
              filteredGuidance.map(ticket => {
                const isClaimedByMe = ticket.admin_id === user.id;
                const isOpen = ticket.status === 'open';
                const isResolved = ticket.status === 'resolved';

                return (
                  <Card 
                    key={ticket.id}
                    style={{
                      background: isResolved ? 'rgba(15, 23, 42, 0.5)' : isOpen ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                      border: `1px solid ${isResolved ? 'rgba(16, 185, 129, 0.2)' : isOpen ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <span style={{
                          background: ticket.priority === 'urgent' ? 'rgba(239, 68, 68, 0.2)' : ticket.priority === 'high' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                          color: ticket.priority === 'urgent' ? '#ef4444' : ticket.priority === 'high' ? '#f59e0b' : '#38bdf8',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {ticket.priority} Priority
                        </span>
                        <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '8px' }}>
                          {ticket.category.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <span style={{
                        color: isResolved ? '#10b981' : isOpen ? '#ef4444' : '#f59e0b',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isResolved ? <CheckCircle2 size={12} /> : isOpen ? <AlertCircle size={12} /> : <Clock size={12} />}
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', color: '#f8fafc', fontSize: '14px', fontWeight: '600' }}>
                        {ticket.title}
                      </h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                        {ticket.description}
                      </p>
                    </div>

                    {/* User info */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#cbd5e1',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>User: <b>{ticket.user_name || ticket.user_email}</b></span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Mentor Tag if claimed */}
                    {ticket.admin_name && (
                      <div style={{ fontSize: '11px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} /> Guided by: <b>{ticket.admin_name}</b> {isClaimedByMe && '(You)'}
                      </div>
                    )}

                    {/* Admin Response if provided */}
                    {ticket.admin_response && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#a7f3d0'
                      }}>
                        <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Admin Guidance Provided:
                        </div>
                        {ticket.admin_response}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {isOpen && (
                        <button
                          onClick={() => handleVolunteerForRequest(ticket.id)}
                          style={{
                            flex: 1,
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            padding: '8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <HandHeart size={14} /> Volunteer to Guide
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedGuidanceTicket(ticket);
                          setGuidanceResponseText(ticket.admin_response || '');
                          setGuidanceStatusSelect(ticket.status === 'resolved' ? 'resolved' : 'resolved');
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(0, 245, 255, 0.1)',
                          color: '#00f5ff',
                          border: '1px solid rgba(0, 245, 255, 0.3)',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <MessageSquare size={14} /> {ticket.admin_response ? 'Update Guidance' : 'Provide Guidance'}
                      </button>
                    </div>

                  </Card>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 3: USER ACTIVITY & TELEMETRY STREAM */}
      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Stream Header & Filters */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#10b981" /> Live Organization Telemetry & Activity Stream
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>
                Track real-time actions, login events, alert triage, rule deployments, and guidance interaction across all users
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Filter by user or action..." 
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 12px 6px 30px', borderRadius: '20px', fontSize: '12px', width: '200px', outline: 'none' }} 
                />
              </div>

              <select 
                value={activityFilter} 
                onChange={(e) => setActivityFilter(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8fafc',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="all">All Events</option>
                <option value="guidance">Guidance & Mentoring</option>
                <option value="auth">Auth & Logins</option>
                <option value="security">Security Actions</option>
              </select>

              <button
                onClick={fetchActivities}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} className={loadingActivities ? 'spin' : ''} /> Reload Log
              </button>
            </div>
          </div>

          {/* Activity Log List */}
          <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' }}>
            <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
              {loadingActivities ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading telemetry stream...</div>
              ) : filteredActivities.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No activity records found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {filteredActivities.map((act, index) => {
                    const isGuidance = act.action?.includes('guidance');
                    const isAlert = act.action?.includes('alert') || act.action?.includes('threat');
                    const isAuth = act.action?.includes('login') || act.action?.includes('signup');

                    return (
                      <div 
                        key={act.id || index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 20px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                          background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isGuidance ? 'rgba(245, 158, 11, 0.1)' : isAlert ? 'rgba(239, 68, 68, 0.1)' : isAuth ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isGuidance ? '#f59e0b' : isAlert ? '#ef4444' : isAuth ? '#38bdf8' : '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isGuidance ? <HandHeart size={16} /> : isAlert ? <AlertTriangle size={16} /> : isAuth ? <Lock size={16} /> : <Activity size={16} />}
                          </div>

                          <div>
                            <div style={{ color: '#f8fafc', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{act.action?.replace(/_/g, ' ').toUpperCase()}</span>
                              {act.resource_type && (
                                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'normal' }}>
                                  [{act.resource_type}]
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                              Triggered by: <span style={{ color: '#38bdf8' }}>{act.user_email || 'System'}</span>
                              {act.details && typeof act.details === 'object' && (
                                <span style={{ marginLeft: '8px', color: '#cbd5e1' }}>
                                  ({JSON.stringify(act.details)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {new Date(act.timestamp).toLocaleTimeString()} · {new Date(act.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

        </div>
      )}

      {/* TAB 4: SYSTEM & SECURITY SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          
          <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.6)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={16} color="#a855f7" /> Core System Options
              </h3>
            </div>
            <div style={{ padding: '0 20px' }}>
              <ToggleItem 
                icon={UserPlus} label="User Registration" description="Allow open new user signups via Join Key" 
                checked={sysSettings.userRegistration} 
                onChange={() => setSysSettings(p => ({...p, userRegistration: !p.userRegistration}))} 
              />
              <ToggleItem 
                icon={Mail} label="Email Notifications" description="Send system alerts and mentorship tickets via email" 
                checked={sysSettings.emailNotifications} 
                onChange={() => setSysSettings(p => ({...p, emailNotifications: !p.emailNotifications}))} 
              />
              <ToggleItem 
                icon={Lock} label="Two-Factor Auth" description="Enforce 2FA for all administrator accounts" 
                checked={sysSettings.twoFactorAuth} 
                onChange={() => setSysSettings(p => ({...p, twoFactorAuth: !p.twoFactorAuth}))} 
              />
              <ToggleItem 
                icon={ShieldCheck} label="Auto-Assign Mentors" description="Automatically assign new analysts to primary admins" 
                checked={sysSettings.autoAssignAdmins} 
                onChange={() => setSysSettings(p => ({...p, autoAssignAdmins: !p.autoAssignAdmins}))} 
              />
            </div>
          </Card>

          <Card style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} color="#00f5ff" /> Organization Access Policy
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              Your organization utilizes standard 6-letter join keys. When a user or analyst signs up with <b>{orgDetails.join_key}</b>, they are automatically granted role-based access to the organization's network telemetry, IDS alerts, and mentorship tickets.
            </p>
            <div style={{
              background: 'rgba(0, 245, 255, 0.05)',
              border: '1px solid rgba(0, 245, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#cbd5e1'
            }}>
              <b>Active Policy:</b> Dual Multi-Admin Triage & Zero Trust Activity Logging.
            </div>
          </Card>

        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '440px', padding: '24px', background: '#0f172a', border: '1px solid rgba(0,245,255,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Add Organization Member</h3>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Full Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} placeholder="John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Work Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} placeholder="john@securenet.com" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Role Type</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                  <option value="user">SOC Analyst / User</option>
                  <option value="admin">Administrator / Mentor</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Specialty / Domain</label>
                <input type="text" value={newUser.specialty_role} onChange={e => setNewUser({...newUser, specialty_role: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} placeholder="e.g., Threat Hunter, Firewall Lead, Incident Response" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleAddUser} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Create Member</button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: ASSIGN MENTOR ADMIN */}
      {showAssignAdminModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '440px', padding: '24px', background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>Assign Admin Mentor</h3>
              <button onClick={() => setShowAssignAdminModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' }}>
              Select an administrator from the council to act as the primary mentor for <b>{selectedUser.name}</b> ({selectedUser.email}).
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Available Admins</label>
              <select 
                value={targetAdminToAssign} 
                onChange={(e) => setTargetAdminToAssign(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="">-- Choose Admin Mentor --</option>
                {orgAdmins.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name || a.email} ({a.specialty_role || 'Admin'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAssignAdminModal(false)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleAssignAdminSubmit} disabled={!targetAdminToAssign} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Save Mentor Assignment</button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: PROVIDE GUIDANCE & RESOLVE TICKET */}
      {selectedGuidanceTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '540px', padding: '24px', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HandHeart size={18} color="#f59e0b" /> Provide User Mentorship & Guidance
              </h3>
              <button onClick={() => setSelectedGuidanceTicket(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            {/* Ticket Info Card */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ color: '#00f5ff', fontWeight: '600', marginBottom: '4px' }}>
                {selectedGuidanceTicket.title}
              </div>
              <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                {selectedGuidanceTicket.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <span>From: {selectedGuidanceTicket.user_name || selectedGuidanceTicket.user_email}</span>
                <span>Priority: {selectedGuidanceTicket.priority?.toUpperCase()}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitGuidanceResponse}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Admin Guidance & Remediation Steps
                </label>
                <textarea 
                  rows={4}
                  value={guidanceResponseText}
                  onChange={(e) => setGuidanceResponseText(e.target.value)}
                  placeholder="Provide detailed guidance, mitigation advice, or alert context to the user..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Ticket Resolution Status
                </label>
                <select 
                  value={guidanceStatusSelect}
                  onChange={(e) => setGuidanceStatusSelect(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="resolved">Mark as Resolved (Recommended)</option>
                  <option value="in_progress">Keep In Progress (Follow-up needed)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedGuidanceTicket(null)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" disabled={respondingToGuidance} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={14} /> {respondingToGuidance ? 'Sending...' : 'Send Guidance & Update'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: USER ACTIVITY DRILL DOWN */}
      {showUserActivityModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ width: '100%', maxWidth: '520px', padding: '24px', background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px' }}>User Details & Activity - {selectedUser.name}</h3>
              <button onClick={() => setShowUserActivityModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div><span style={{ color: '#64748b' }}>Email:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.email}</span></div>
              <div><span style={{ color: '#64748b' }}>Role:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.role.toUpperCase()}</span></div>
              <div><span style={{ color: '#64748b' }}>Specialty:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.specialty_role || 'N/A'}</span></div>
              <div><span style={{ color: '#64748b' }}>Status:</span> <span style={{ color: '#cbd5e1' }}>{selectedUser.status.toUpperCase()}</span></div>
            </div>

            <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '13px' }}>Recent Audit Logs</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activities.filter(a => a.user_id === selectedUser.id || a.user_email === selectedUser.email).length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '20px' }}>No activity logs recorded for this user yet.</div>
              ) : (
                activities.filter(a => a.user_id === selectedUser.id || a.user_email === selectedUser.email).map((act, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ color: '#f8fafc', fontWeight: '500', marginBottom: '2px' }}>{act.action}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px' }}>
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
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
