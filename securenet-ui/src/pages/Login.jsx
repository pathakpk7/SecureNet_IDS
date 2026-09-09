import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, History, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';
import '../styles/pages/login.css';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loginAsDemo, resetPassword, resendEmailConfirmation } = useAuth();
  const navigate = useNavigate();

  // Demo accounts for reference
  const demoAccounts = {
    admin: {
      email: 'admin@securenet.com',
      password: 'admin123',
      label: 'Security Administrator',
      desc: 'Full administrative control, IP firewall management & user settings'
    },
    user: {
      email: 'user@securenet.com',
      password: 'user123',
      label: 'SOC Analyst / Operator',
      desc: 'Threat monitoring, packet telemetry inspection & security analytics'
    }
  };

  // Fetch older saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const accounts = [];

      // 1. Check for Remembered credentials
      const remembered = localStorage.getItem('saved_login_credentials');
      if (remembered) {
        try {
          const parsed = JSON.parse(remembered);
          if (parsed?.email) {
            accounts.push({
              email: parsed.email,
              password: parsed.password || '',
              role: parsed.role || 'user',
              label: 'Remembered Account'
            });
            // Pre-fill form by default with remembered
            setFormData(prev => ({
              ...prev,
              email: parsed.email,
              password: parsed.password || '',
              rememberMe: true
            }));
            if (parsed.role) setSelectedRole(parsed.role);
          }
        } catch (e) {}
      }

      // 2. Check for registered users in local DB
      const regUsersStr = localStorage.getItem('registeredUsers');
      if (regUsersStr) {
        try {
          const regUsers = JSON.parse(regUsersStr);
          if (Array.isArray(regUsers)) {
            regUsers.forEach(u => {
              if (u.email && !accounts.some(a => a.email.toLowerCase() === u.email.toLowerCase())) {
                accounts.push({
                  email: u.email,
                  password: u.password || '',
                  role: u.role || 'user',
                  label: u.role === 'admin' ? 'Admin Account' : 'Registered User'
                });
              }
            });
          }
        } catch (e) {}
      }

      // 3. Add built-in demo presets
      accounts.push({
        email: demoAccounts.admin.email,
        password: demoAccounts.admin.password,
        role: 'admin',
        label: 'Default Admin Demo'
      });
      accounts.push({
        email: demoAccounts.user.email,
        password: demoAccounts.user.password,
        role: 'user',
        label: 'Default Analyst Demo'
      });

      setSavedAccounts(accounts);
    } catch (err) {
      console.warn("Could not retrieve saved credentials:", err);
    }
  }, []);

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setError('');
    setSuccess('');
  };

  const handleApplySavedCredential = (account) => {
    setSelectedRole(account.role || 'user');
    setFormData({
      email: account.email,
      password: account.password || '',
      rememberMe: true
    });
    setShowSavedList(false);
    setError('');
    setSuccess(`Loaded credentials for ${account.email}`);
  };

  const handleQuickFillDemo = () => {
    const creds = demoAccounts[selectedRole];
    setFormData(prev => ({
      ...prev,
      email: creds.email,
      password: creds.password
    }));
    setError('');
    setSuccess(`Filled ${selectedRole.toUpperCase()} demo credentials`);
  };

  const handleInstantDemoLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (loginAsDemo) {
        loginAsDemo(selectedRole);
      } else {
        await login(demoAccounts[selectedRole].email, demoAccounts[selectedRole].password, selectedRole);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const email = (formData.email || '').trim();
      const password = (formData.password || '').trim();

      if (!email || !password) {
        setError('Please fill in both email and password');
        setLoading(false);
        return;
      }

      // Save for "Remember Me"
      if (formData.rememberMe) {
        localStorage.setItem('saved_login_credentials', JSON.stringify({
          email,
          password,
          role: selectedRole
        }));
      } else {
        localStorage.removeItem('saved_login_credentials');
      }

      // Authenticate via AuthContext
      const result = await login(email, password, selectedRole);
      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login attempt error:", err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid')) {
        setError("Invalid email or password. Check your details or use 1-Click Demo Login above.");
      } else {
        setError(msg || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address in the field above');
      return;
    }
    try {
      await resetPassword(formData.email.trim());
      setSuccess('Password reset instructions sent! Please check your inbox.');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email');
      setSuccess('');
    }
  };

  const handleResendConfirmation = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address in the field above');
      return;
    }
    try {
      await resendEmailConfirmation(formData.email.trim());
      setSuccess('Confirmation email resent! Please check your inbox.');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email');
      setSuccess('');
    }
  };

  const isCurrentAdmin = selectedRole === 'admin';

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="grid-lines"></div>
        <div className="particles"></div>
      </div>

      <div className={`auth-card unified-card ${isCurrentAdmin ? 'role-admin' : 'role-user'}`}>
        
        {/* Top Header */}
        <div className="auth-header">
          <Link to="/" className="brand-logo-link" title="Return to Home">
            <img src="/logo.jpg" alt="SecureNet IDS Logo" className="login-logo-img" />
          </Link>
          <h2>SecureNet <span className="text-cyan">IDS</span></h2>
          <p>Enterprise Intrusion Detection & Threat Telemetry</p>
        </div>

        {/* Interactive Role Switcher */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn user-tab ${!isCurrentAdmin ? 'active' : ''}`}
            onClick={() => handleRoleChange('user')}
          >
            <User size={15} /> Analyst / Operator
          </button>
          <button
            type="button"
            className={`role-tab-btn admin-tab ${isCurrentAdmin ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <Shield size={15} /> Security Admin
          </button>
        </div>

        {/* Role Summary & 1-Click Demo Quick Bar */}
        <div className={`demo-quick-banner ${isCurrentAdmin ? 'admin-banner' : 'user-banner'}`}>
          <div className="demo-badge-info">
            <div className="demo-role-title">
              {isCurrentAdmin ? <Shield size={14} color="#ef4444" /> : <User size={14} color="#00f5ff" />}
              <span>{demoAccounts[selectedRole].label}</span>
            </div>
            <div className="demo-sub-text">{demoAccounts[selectedRole].desc}</div>
          </div>
          
          <div className="demo-action-buttons">
            <button
              type="button"
              className="btn-demo-fill"
              onClick={handleQuickFillDemo}
              title={`Autofill ${demoAccounts[selectedRole].email}`}
            >
              Fill Credentials
            </button>
            <button
              type="button"
              className="btn-demo-instant"
              onClick={handleInstantDemoLogin}
              disabled={loading}
              title={`Instant access as ${selectedRole}`}
            >
              <Zap size={13} /> 1-Click Access
            </button>
          </div>
        </div>

        {/* Saved Accounts Drawer Toggle */}
        {savedAccounts.length > 0 && (
          <div className="saved-accounts-accordion">
            <button
              type="button"
              className="btn-toggle-saved"
              onClick={() => setShowSavedList(!showSavedList)}
            >
              <History size={13} />
              <span>Saved & Demo Accounts ({savedAccounts.length})</span>
              <span className="accordion-chevron">{showSavedList ? '▲' : '▼'}</span>
            </button>

            {showSavedList && (
              <div className="saved-accounts-dropdown">
                {savedAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    className="saved-account-row"
                    onClick={() => handleApplySavedCredential(acc)}
                  >
                    <div className="saved-row-info">
                      <span className="saved-row-email">{acc.email}</span>
                      <span className={`saved-row-tag ${acc.role}`}>{acc.label}</span>
                    </div>
                    <span className="saved-row-action">Use →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Sign In Form */}
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isCurrentAdmin ? "admin@securenet.com" : "user@securenet.com"}
              className="auth-input"
              autoComplete="username email"
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter account password"
                className="auth-input password-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="form-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="auth-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" onClick={handlePasswordReset} className="forgot-password-link">
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="error-message fade-in">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message fade-in">
              <CheckCircle2 size={14} /> {success}
            </div>
          )}

          <button 
            type="submit" 
            className={`btn-auth-submit ${isCurrentAdmin ? 'admin-submit' : 'user-submit'}`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In as ${isCurrentAdmin ? 'Administrator' : 'Analyst'} →`}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an organization account?{' '}
            <Link to="/signup" className="auth-link">
              Register Organization
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
