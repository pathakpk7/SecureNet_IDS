import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Eye, EyeOff, CheckCircle2, Lock, User, Mail, 
  Building, UserCheck, Key, Copy, Check, Users, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, organizationService, generateJoinKey } from '../api/supabase';
import '../styles/pages/signup.css';

const ADMIN_SPECIALTIES = [
  'Network & Threat Defense Lead',
  'Incident Response Commander',
  'SOC Mentorship & Guidance Lead',
  'Cloud Infrastructure Security',
  'Compliance & Audit Officer',
  'Malware Analysis & Forensics'
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    adminMode: 'create_org', // 'create_org' | 'join_org'
    orgName: '',
    orgDescription: '',
    specialtyRole: 'Network & Threat Defense Lead',
    joinKey: '',
    assignedAdminId: ''
  });

  const [verifiedOrg, setVerifiedOrg] = useState(null);
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  
  const [createdKeyModal, setCreatedKeyModal] = useState(null); // { orgName, joinKey, role }
  const [copiedKey, setCopiedKey] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { adminSignup, userSignup } = useAuth();
  const navigate = useNavigate();

  // Instant verification when 6-character joinKey is typed
  useEffect(() => {
    const key = (formData.joinKey || '').trim().toUpperCase();
    if (key.length === 6 || key === 'DEMO-ORG-ID') {
      let isMounted = true;
      setVerifyingKey(true);
      setKeyError('');
      
      organizationService.getOrgByJoinKey(key).then(org => {
        if (!isMounted) return;
        setVerifyingKey(false);
        if (org) {
          setVerifiedOrg(org);
          setKeyError('');
        } else {
          setVerifiedOrg(null);
          setKeyError('Invalid 6-letter Organization Key');
        }
      }).catch(err => {
        if (!isMounted) return;
        setVerifyingKey(false);
        setVerifiedOrg(null);
        setKeyError('Could not verify key. Please check again.');
      });

      return () => { isMounted = false; };
    } else {
      setVerifiedOrg(null);
      setKeyError('');
      setVerifyingKey(false);
    }
  }, [formData.joinKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCopyKey = () => {
    if (createdKeyModal?.joinKey) {
      navigator.clipboard.writeText(createdKeyModal.joinKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.name.length < 2) {
        setError('Name must be at least 2 characters long');
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // USER SIGNUP VALIDATION
      if (formData.role === 'user') {
        const cleanKey = (formData.joinKey || '').trim().toUpperCase();
        if (!cleanKey) {
          setError('Please enter your 6-letter Organization Key (e.g. SEC789)');
          setLoading(false);
          return;
        }

        const res = await userSignup(
          formData.email, 
          formData.password, 
          cleanKey, 
          formData.assignedAdminId || null, 
          formData.name
        );

        setSuccess(`Joined ${verifiedOrg?.name || 'Organization'} successfully! Redirecting to login...`);
      } 
      // ADMIN SIGNUP
      else if (formData.role === 'admin') {
        if (formData.adminMode === 'create_org') {
          if (!formData.orgName) {
            setError('Please enter your Organization Name');
            setLoading(false);
            return;
          }

          const res = await adminSignup(
            formData.email,
            formData.password,
            formData.orgName,
            formData.orgDescription,
            formData.specialtyRole,
            '',
            null,
            formData.name
          );

          const generatedKey = res.organization?.join_key || 'SEC789';
          setCreatedKeyModal({
            orgName: formData.orgName,
            joinKey: generatedKey,
            email: formData.email,
            role: 'admin'
          });
          setLoading(false);
          return; // Wait for user to review modal
        } else {
          // Join existing org as co-admin
          const cleanKey = (formData.joinKey || '').trim().toUpperCase();
          if (!cleanKey) {
            setError('Please enter the 6-letter Organization Key of the organization you want to join as Admin');
            setLoading(false);
            return;
          }

          await adminSignup(
            formData.email,
            formData.password,
            verifiedOrg?.name || '',
            '',
            formData.specialtyRole,
            cleanKey,
            verifiedOrg?.id || null,
            formData.name
          );

          setSuccess(`Co-Admin account created for ${verifiedOrg?.name || 'Organization'}! Redirecting to login...`);
        }
      }

      // Persist credentials for instant login
      try {
        const cleanEmail = formData.email.trim();
        const cleanPass = formData.password.trim();
        localStorage.setItem('saved_login_credentials', JSON.stringify({
          email: cleanEmail,
          password: cleanPass,
          role: formData.role
        }));
        let list = [];
        try { list = JSON.parse(localStorage.getItem('saved_accounts_list') || '[]'); } catch {}
        if (!Array.isArray(list)) list = [];
        const existingIdx = list.findIndex(a => a.email.toLowerCase() === cleanEmail.toLowerCase());
        const item = { email: cleanEmail, password: cleanPass, role: formData.role, updatedAt: new Date().toISOString() };
        if (existingIdx >= 0) {
          list[existingIdx] = item;
        } else {
          list.unshift(item);
        }
        localStorage.setItem('saved_accounts_list', JSON.stringify(list));
      } catch (e) {
        console.warn("Storage error saving signup credentials:", e);
      }

      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      if (!createdKeyModal) setLoading(false);
    }
  };

  const handleProceedFromModal = () => {
    try {
      const cleanEmail = formData.email.trim();
      const cleanPass = formData.password.trim();
      localStorage.setItem('saved_login_credentials', JSON.stringify({
        email: cleanEmail,
        password: cleanPass,
        role: 'admin'
      }));
    } catch (e) {}
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="grid-lines"></div>
        <div className="particles"></div>
      </div>
      
      <div className="auth-content-wrapper">
        <div className="auth-card landscape-card glass neon-border fade-in">
          
          {/* LEFT HERO PANEL (LANDSCAPE BRANDING) */}
          <div className="signup-hero-panel">
            <div className="hero-brand">
              <img src="/logo.jpg" alt="SecureNet IDS Logo" className="signup-hero-logo-img" />
              <h2>SecureNet IDS</h2>
              <span className="hero-badge">ENTERPRISE EDITION</span>
            </div>
            <p className="hero-desc">
              Join our advanced multi-tenant intrusion detection system. Organizations feature unique 6-letter join keys, multi-admin management, and real-time guidance.
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>6-Letter Unique Org Join Key</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>Multi-Admin Task Specialization</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>Live User Activity & Guidance Hub</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>AI Neural Threat Classification</span>
              </div>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="signup-form-panel">
            <div className="auth-header">
              <h2>Account Registration</h2>
              <p>Create your enterprise profile and join your security team</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form-landscape">
              <div className="signup-grid-landscape">
                
                {/* NAME */}
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-icon-wrapper">
                    <User size={16} className="input-field-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sarah Connor"
                      className="auth-input with-icon"
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} className="input-field-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      className="auth-input with-icon"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <Lock size={16} className="input-field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="auth-input password-input with-icon"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="password-toggle-btn"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* ROLE */}
                <div className="form-group">
                  <label htmlFor="role">Account Role</label>
                  <div className="input-icon-wrapper">
                    <UserCheck size={16} className="input-field-icon" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="auth-input auth-select with-icon"
                    >
                      <option value="user">User / SOC Analyst (Join with 6-Letter Key)</option>
                      <option value="admin">Admin / Security Lead (Manage Org & Guidance)</option>
                    </select>
                  </div>
                </div>

                {/* USER FLOW: 6-LETTER KEY & VERIFICATION */}
                {formData.role === 'user' && (
                  <div className="form-group span-2">
                    <label htmlFor="joinKey" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Organization 6-Letter Join Key</span>
                      <span style={{ fontSize: '11px', color: '#00f5ff' }}>Demo Key: <strong>SEC789</strong></span>
                    </label>
                    <div className="input-icon-wrapper">
                      <Key size={16} className="input-field-icon" />
                      <input
                        type="text"
                        id="joinKey"
                        name="joinKey"
                        maxLength={6}
                        value={formData.joinKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, joinKey: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SEC789"
                        style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                        className="auth-input with-icon"
                        required
                      />
                    </div>

                    {verifyingKey && (
                      <small style={{ color: '#00f5ff', marginTop: '4px', display: 'block' }}>
                        Verifying organization key...
                      </small>
                    )}

                    {keyError && (
                      <small style={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
                        {keyError}
                      </small>
                    )}

                    {verifiedOrg && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        background: 'rgba(0, 245, 255, 0.08)',
                        border: '1px solid rgba(0, 245, 255, 0.3)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                          <CheckCircle2 size={16} />
                          <span>Verified: {verifiedOrg.name}</span>
                        </div>
                        {verifiedOrg.admins && verifiedOrg.admins.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Organization Admins: {verifiedOrg.admins.map(a => `${a.name || a.email} (${a.specialty_role || 'Admin'})`).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* USER FLOW: ASSIGNED ADMIN MENTOR OPTION */}
                {formData.role === 'user' && verifiedOrg?.admins && verifiedOrg.admins.length > 0 && (
                  <div className="form-group span-2">
                    <label htmlFor="assignedAdminId">Select Primary Admin Mentor (Optional)</label>
                    <div className="input-icon-wrapper">
                      <Users size={16} className="input-field-icon" />
                      <select
                        id="assignedAdminId"
                        name="assignedAdminId"
                        value={formData.assignedAdminId}
                        onChange={handleChange}
                        className="auth-input auth-select with-icon"
                      >
                        <option value="">Auto-assign / Shared Admin Pool</option>
                        {verifiedOrg.admins.map(admin => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name || admin.email} - {admin.specialty_role || 'General Security'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ADMIN FLOW: CREATE NEW OR JOIN EXISTING ORG */}
                {formData.role === 'admin' && (
                  <div className="form-group span-2" style={{ display: 'flex', gap: '16px', margin: '4px 0 10px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#e2e8f0', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="adminMode"
                        value="create_org"
                        checked={formData.adminMode === 'create_org'}
                        onChange={handleChange}
                      />
                      <span>Create New Organization</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#e2e8f0', fontSize: '13px' }}>
                      <input
                        type="radio"
                        name="adminMode"
                        value="join_org"
                        checked={formData.adminMode === 'join_org'}
                        onChange={handleChange}
                      />
                      <span>Join as Secondary Admin (with 6-Letter Key)</span>
                    </label>
                  </div>
                )}

                {/* ADMIN CREATE ORG: NAME & DESC */}
                {formData.role === 'admin' && formData.adminMode === 'create_org' && (
                  <>
                    <div className="form-group span-2">
                      <label htmlFor="orgName">Organization Name</label>
                      <div className="input-icon-wrapper">
                        <Building size={16} className="input-field-icon" />
                        <input
                          type="text"
                          id="orgName"
                          name="orgName"
                          value={formData.orgName}
                          onChange={handleChange}
                          placeholder="e.g. Apex Cyber Defense Corp"
                          className="auth-input with-icon"
                          required
                        />
                      </div>
                      <small style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                        A unique 6-letter organization key will be generated for your team upon creation.
                      </small>
                    </div>

                    <div className="form-group span-2">
                      <label htmlFor="specialtyRole">Admin Task / Specialty</label>
                      <div className="input-icon-wrapper">
                        <ShieldCheck size={16} className="input-field-icon" />
                        <select
                          id="specialtyRole"
                          name="specialtyRole"
                          value={formData.specialtyRole}
                          onChange={handleChange}
                          className="auth-input auth-select with-icon"
                        >
                          {ADMIN_SPECIALTIES.map(sp => (
                            <option key={sp} value={sp}>{sp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* ADMIN JOIN ORG: 6-LETTER KEY */}
                {formData.role === 'admin' && formData.adminMode === 'join_org' && (
                  <>
                    <div className="form-group span-2">
                      <label htmlFor="joinKey">Existing Organization 6-Letter Key</label>
                      <div className="input-icon-wrapper">
                        <Key size={16} className="input-field-icon" />
                        <input
                          type="text"
                          id="joinKey"
                          name="joinKey"
                          maxLength={6}
                          value={formData.joinKey}
                          onChange={(e) => setFormData(prev => ({ ...prev, joinKey: e.target.value.toUpperCase() }))}
                          placeholder="e.g. SEC789"
                          style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                          className="auth-input with-icon"
                          required
                        />
                      </div>

                      {verifiedOrg && (
                        <div style={{
                          marginTop: '6px',
                          padding: '8px 10px',
                          background: 'rgba(0, 245, 255, 0.08)',
                          border: '1px solid rgba(0, 245, 255, 0.3)',
                          borderRadius: '6px',
                          color: '#10b981',
                          fontSize: '12px'
                        }}>
                          Verified Organization: <strong>{verifiedOrg.name}</strong>
                        </div>
                      )}
                    </div>

                    <div className="form-group span-2">
                      <label htmlFor="specialtyRole">Your Admin Specialty / Role</label>
                      <div className="input-icon-wrapper">
                        <ShieldCheck size={16} className="input-field-icon" />
                        <select
                          id="specialtyRole"
                          name="specialtyRole"
                          value={formData.specialtyRole}
                          onChange={handleChange}
                          className="auth-input auth-select with-icon"
                        >
                          {ADMIN_SPECIALTIES.map(sp => (
                            <option key={sp} value={sp}>{sp}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* ERROR & SUCCESS MESSAGES */}
                {error && (
                  <div className="error-message span-2">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="success-message span-2">
                    {success}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="form-group span-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary auth-button"
                    disabled={loading}
                  >
                    {loading ? 'Processing Registration...' : 'CREATE ACCOUNT'}
                  </button>
                </div>

              </div>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* KEY REVEAL / CELEBRATION MODAL FOR NEW ORG ADMINS */}
      {createdKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(10, 15, 30, 0.95))',
            border: '1px solid rgba(0, 245, 255, 0.5)',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            color: '#fff'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 255, 0.1)',
              border: '2px solid #00f5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#00f5ff'
            }}>
              <Sparkles size={28} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#f8fafc' }}>
              Organization Created Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              Your organization <strong style={{ color: '#00f5ff' }}>{createdKeyModal.orgName}</strong> is registered. Share this unique 6-letter join key with your team members and co-admins:
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px dashed #00f5ff',
              borderRadius: '12px',
              padding: '16px',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>
                  Organization Join Key
                </span>
                <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '6px', color: '#00f5ff', fontFamily: 'monospace' }}>
                  {createdKeyModal.joinKey}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                style={{
                  background: copiedKey ? '#10b981' : 'rgba(0, 245, 255, 0.2)',
                  border: '1px solid rgba(0, 245, 255, 0.4)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                {copiedKey ? <Check size={16} /> : <Copy size={16} />}
                {copiedKey ? 'COPIED!' : 'COPY'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>
              You can also copy or manage this key anytime inside your Admin Panel.
            </p>

            <button
              type="button"
              onClick={handleProceedFromModal}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>PROCEED TO LOGIN</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Signup;

