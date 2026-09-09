import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Eye, EyeOff, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import '../styles/pages/login.css';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loginAsDemo, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Standard demo credentials
  const demoAccounts = {
    admin: {
      email: 'admin@securenet.com',
      password: 'admin123',
      label: 'Security Administrator',
      role: 'admin'
    },
    user: {
      email: 'user@securenet.com',
      password: 'user123',
      label: 'SOC Analyst / Operator',
      role: 'user'
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
              label: `Saved: ${parsed.email}`
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
                  label: `${u.role === 'admin' ? 'Admin' : 'User'}: ${u.email}`
                });
              }
            });
          }
        } catch (e) {}
      }

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

  const handleQuickAutofill = (role) => {
    const creds = demoAccounts[role];
    setSelectedRole(role);
    setFormData(prev => ({
      ...prev,
      email: creds.email,
      password: creds.password,
      rememberMe: true
    }));
    setError('');
    setSuccess(`Loaded demo credentials for ${creds.label}`);
  };

  const handleSavedSelect = (e) => {
    const selectedEmail = e.target.value;
    if (!selectedEmail) return;
    const account = savedAccounts.find(a => a.email === selectedEmail);
    if (account) {
      setSelectedRole(account.role || 'user');
      setFormData({
        email: account.email,
        password: account.password || '',
        rememberMe: true
      });
      setError('');
      setSuccess(`Loaded saved account: ${account.email}`);
    }
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
      setError(err.message || 'Demo access failed');
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
        setError('Please enter both your email address and password');
        setLoading(false);
        return;
      }

      // Save or remove Remember Me credentials
      if (formData.rememberMe) {
        localStorage.setItem('saved_login_credentials', JSON.stringify({
          email,
          password,
          role: selectedRole
        }));
      } else {
        localStorage.removeItem('saved_login_credentials');
      }

      // Authenticate
      const userResult = await login(email, password, selectedRole);
      if (userResult) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login attempt error:", err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid')) {
        setError("Invalid credentials. Try using 'Quick Demo Autofill' below or reset your password.");
      } else {
        setError(msg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address in the field above to reset password');
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

  const isCurrentAdmin = selectedRole === 'admin';

  return (
    <div className="auth-login-page">
      <div className="auth-background">
        <div className="grid-lines"></div>
        <div className="particles"></div>
      </div>

      <div className={`auth-login-card ${isCurrentAdmin ? 'role-admin' : 'role-user'}`}>
        
        {/* Brand Header */}
        <div className="auth-login-header">
          <Link to="/" className="brand-logo-link" title="Return to Home">
            <img src="/logo.jpg" alt="SecureNet IDS Logo" className="auth-login-logo" />
          </Link>
          <h2>SecureNet <span className="text-cyan">IDS</span></h2>
          <p>Enterprise Intrusion Detection & Threat Telemetry</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="auth-login-tabs">
          <button
            type="button"
            className={`auth-login-tab-btn user-tab ${!isCurrentAdmin ? 'active' : ''}`}
            onClick={() => handleRoleChange('user')}
          >
            <User size={15} /> Analyst / Operator
          </button>
          <button
            type="button"
            className={`auth-login-tab-btn admin-tab ${isCurrentAdmin ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <Shield size={15} /> Security Admin
          </button>
        </div>

        {/* Quick Demo Autofill Toolbar */}
        <div className="auth-login-quickstrip">
          <span className="auth-login-quickstrip-label">
            <Zap size={13} /> Quick Demo:
          </span>
          <div className="auth-login-quickstrip-chips">
            <button
              type="button"
              className="auth-quick-chip chip-cyan"
              onClick={() => handleQuickAutofill('user')}
              title="Autofill user@securenet.com"
            >
              Analyst
            </button>
            <button
              type="button"
              className="auth-quick-chip chip-red"
              onClick={() => handleQuickAutofill('admin')}
              title="Autofill admin@securenet.com"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Older Saved Accounts Dropdown (if any exist) */}
        {savedAccounts.length > 0 && (
          <div className="auth-saved-select-box">
            <select
              className="auth-saved-select"
              onChange={handleSavedSelect}
              defaultValue=""
            >
              <option value="" disabled>Saved Accounts ({savedAccounts.length})</option>
              {savedAccounts.map((acc, idx) => (
                <option key={idx} value={acc.email}>
                  {acc.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="auth-login-form" autoComplete="on">
          <div className="auth-login-field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isCurrentAdmin ? "admin@securenet.com" : "user@securenet.com"}
              className="auth-login-input"
              autoComplete="username email"
              required
            />
          </div>

          <div className="auth-login-field">
            <label htmlFor="password">Password</label>
            <div className="auth-login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="auth-login-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-login-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="auth-login-options">
            <label className="auth-login-checkbox-label">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="auth-login-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" onClick={handlePasswordReset} className="auth-login-forgot-link">
              Forgot password?
            </a>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="auth-login-error">
              {error}
            </div>
          )}
          
          {success && (
            <div className="auth-login-success">
              <CheckCircle2 size={15} /> {success}
            </div>
          )}

          {/* Primary Submit Button */}
          <button 
            type="submit" 
            className={`auth-login-submit-btn ${isCurrentAdmin ? 'admin-btn' : 'user-btn'}`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In as {isCurrentAdmin ? 'Security Admin' : 'SOC Analyst'} <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Secondary 1-Click Instant Demo Button */}
          <button
            type="button"
            className="auth-login-instant-btn"
            onClick={handleInstantDemoLogin}
            disabled={loading}
          >
            <Zap size={14} /> Instant Demo Access (1-Click)
          </button>
        </form>

        {/* Footer */}
        <div className="auth-login-footer">
          <p>
            Don't have an organization account?{' '}
            <Link to="/signup" className="auth-link">
              Register Organization
            </Link>
          </p>
          <Link to="/" className="auth-login-back-home">
            ← Return to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
