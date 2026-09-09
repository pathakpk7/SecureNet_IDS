import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, User, Shield, Check, History, ArrowRight } from 'lucide-react';
import '../styles/pages/login.css';

const Login = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
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
  
  const { login, resetPassword, resendEmailConfirmation } = useAuth();
  const navigate = useNavigate();

  // Sample data for demo accounts
  const demoAccounts = {
    admin: {
      email: 'admin@securenet.com',
      password: 'admin123',
      name: 'Admin User',
      features: [
        'Complete system control',
        'Advanced security tools',
        'User management',
        'Full reporting access'
      ]
    },
    user: {
      email: 'user@securenet.com',
      password: 'user123',
      name: 'Regular User',
      features: [
        'Security monitoring',
        'Alert management',
        'Basic reporting',
        'Personal settings'
      ]
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
            // Pre-fill form by default if remembered
            setFormData(prev => ({
              ...prev,
              email: parsed.email,
              password: parsed.password || '',
              rememberMe: true
            }));
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

      // 3. Add demo accounts for convenience
      accounts.push({
        email: demoAccounts.admin.email,
        password: demoAccounts.admin.password,
        role: 'admin',
        label: 'Demo Administrator'
      });
      accounts.push({
        email: demoAccounts.user.email,
        password: demoAccounts.user.password,
        role: 'user',
        label: 'Demo Operator'
      });

      setSavedAccounts(accounts);
    } catch (err) {
      console.warn("Could not retrieve saved credentials:", err);
    }
  }, []);

  const handleApplySavedCredential = (account) => {
    setSelectedRole(account.role || 'user');
    setFormData({
      email: account.email,
      password: account.password || '',
      rememberMe: true
    });
    setShowLoginForm(true);
    setShowSavedList(false);
    setError('');
    setSuccess(`Loaded credentials for ${account.email}`);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCardSelect = (role) => {
    setSelectedRole(role);
    setShowLoginForm(true);
    setFormData({
      email: demoAccounts[role].email,
      password: demoAccounts[role].password,
      rememberMe: false
    });
  };

  const handleDirectLoginClick = () => {
    setShowLoginForm(true);
    setError('');
    setSuccess('');
  };

  const handleBackToCards = () => {
    setShowLoginForm(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email');
        setLoading(false);
        return;
      }

      // Save credentials for "Remember Me" or older credential fetching
      if (formData.rememberMe) {
        localStorage.setItem('saved_login_credentials', JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: selectedRole
        }));
      }

      // Check if demo account
      const isAdminDemo = formData.email === demoAccounts.admin.email && formData.password === demoAccounts.admin.password;
      const isUserDemo = formData.email === demoAccounts.user.email && formData.password === demoAccounts.user.password;
      
      if (isAdminDemo || isUserDemo) {
        const mockUser = {
          id: isAdminDemo ? 'demo-admin-id' : 'demo-user-id',
          email: formData.email,
          role: isAdminDemo ? 'admin' : 'user',
          org_id: 'demo-org-id',
          organization: { id: 'demo-org-id', name: "Demo Organization" },
          permissions: {
            canManageUsers: isAdminDemo,
            canManageOrgSettings: isAdminDemo,
            canInviteUsers: isAdminDemo,
            canViewLogs: true,
            canBlockIP: isAdminDemo,
            canRunSimulation: isAdminDemo,
            canViewAnalytics: true,
            canGenerateReports: true,
            canExportData: true,
            canViewUsers: true,
            canResetPasswords: true,
            canDeactivateUsers: true
          }
        };
        
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        navigate('/dashboard');
        return;
      }
      
      // Attempt login
      const result = await login(formData.email, formData.password, formData.rememberMe);
      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Fallback check
      const isAdminDemo = formData.email === demoAccounts.admin.email && formData.password === demoAccounts.admin.password;
      const isUserDemo = formData.email === demoAccounts.user.email && formData.password === demoAccounts.user.password;
      
      if (isAdminDemo || isUserDemo) {
        const mockUser = {
          id: isAdminDemo ? 'demo-admin-id' : 'demo-user-id',
          email: formData.email,
          role: isAdminDemo ? 'admin' : 'user',
          org_id: 'demo-org-id',
          organization: { id: 'demo-org-id', name: "Demo Organization" }
        };
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        navigate('/dashboard');
        return;
      }
      
      if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
        setError("Invalid email or password. If you haven't created an account yet, please click 'Create one' below.");
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }
    try {
      await resetPassword(formData.email);
      setSuccess('Password reset email sent! Check your inbox.');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email');
      setSuccess('');
    }
  };

  const handleResendConfirmation = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }
    try {
      await resendEmailConfirmation(formData.email);
      setSuccess('Confirmation email resent! Please check your inbox.');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email');
      setSuccess('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="grid-lines"></div>
        <div className="particles"></div>
      </div>
      
      {!showLoginForm ? (
        <div className="login-selection-container">
          <div className="selection-header">
            <Link to="/" style={{ display: 'inline-block' }}>
              <img src="/logo.jpg" alt="SecureNet IDS Logo" className="login-logo-img" />
            </Link>
            <h1>SecureNet IDS</h1>
            <p>Select an account type or access with saved credentials</p>
          </div>

          {/* FETCH SAVED CREDENTIALS BANNER */}
          {savedAccounts.length > 0 && (
            <div className="saved-credentials-banner">
              <div className="saved-banner-header" onClick={() => setShowSavedList(!showSavedList)}>
                <div className="saved-banner-title">
                  <History size={16} className="text-cyan" />
                  <span>Older Saved Credentials Available ({savedAccounts.length})</span>
                </div>
                <button type="button" className="btn-fetch-saved">
                  {showSavedList ? 'Hide Saved Accounts ▲' : 'Fetch Saved Accounts ▼'}
                </button>
              </div>

              {showSavedList && (
                <div className="saved-accounts-list">
                  {savedAccounts.map((account, idx) => (
                    <div 
                      key={idx} 
                      className="saved-account-item"
                      onClick={() => handleApplySavedCredential(account)}
                    >
                      <div className="saved-account-details">
                        <span className="saved-email">{account.email}</span>
                        <span className="saved-tag">{account.label}</span>
                      </div>
                      <button type="button" className="btn-use-cred">
                        Autofill & Login →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="login-cards">
            <div className="login-card admin-card" onClick={() => handleCardSelect('admin')}>
              <div className="card-icon"><Shield size={28} color="#ef4444" /></div>
              <h2>Login as ADMIN</h2>
              <div className="demo-info">
                <p><strong>Demo Account:</strong></p>
                <p>Email: {demoAccounts.admin.email}</p>
                <p>Password: {demoAccounts.admin.password}</p>
              </div>
              <div className="features-list">
                <h3>Admin Features:</h3>
                <ul>
                  {demoAccounts.admin.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="card-action">
                <button className="btn btn-primary" type="button">Access Admin Terminal</button>
              </div>
            </div>

            <div className="login-card user-card" onClick={() => handleCardSelect('user')}>
              <div className="card-icon"><User size={28} color="#00f5ff" /></div>
              <h2>Login as USER</h2>
              <div className="demo-info">
                <p><strong>Demo Account:</strong></p>
                <p>Email: {demoAccounts.user.email}</p>
                <p>Password: {demoAccounts.user.password}</p>
              </div>
              <div className="features-list">
                <h3>User Features:</h3>
                <ul>
                  {demoAccounts.user.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="card-action">
                <button className="btn btn-primary" type="button">Access SOC Workspace</button>
              </div>
            </div>
          </div>

          <div className="direct-login-option" style={{ marginTop: '24px' }}>
            <button 
              type="button" 
              onClick={handleDirectLoginClick}
              className="btn-direct-login"
            >
              Sign In with Custom Email & Password →
            </button>
          </div>

          <div className="selection-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">Create one</Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="auth-card glass neon-border fade-in">
          <div className="auth-header">
            <button onClick={handleBackToCards} className="back-btn" type="button">← Back</button>
            <h2>Secure Sign In</h2>
            <p>Enter your credentials to access the SOC workspace</p>
          </div>

          {/* Quick-fill button if saved accounts exist */}
          {savedAccounts.length > 0 && (
            <div className="form-saved-quickfill">
              <span className="quickfill-label"><History size={13} /> Saved accounts:</span>
              <div className="quickfill-chips">
                {savedAccounts.slice(0, 3).map((acc, i) => (
                  <button 
                    key={i} 
                    type="button" 
                    className="quickfill-chip"
                    onClick={() => handleApplySavedCredential(acc)}
                    title={`Autofill ${acc.email}`}
                  >
                    {acc.email}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="on">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="auth-input"
                autoComplete="username email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="auth-input password-input"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="auth-checkbox"
                />
                Remember Me (Save Credentials for Quick Access)
              </label>
            </div>

            {error && (
              <div className="error-message">
                {error}
                {error.includes('email has not been confirmed') && (
                  <div style={{ marginTop: '8px' }}>
                    <button 
                      type="button"
                      onClick={handleResendConfirmation}
                      style={{
                        background: 'none',
                        border: '1px solid #ff3366',
                        color: '#ff3366',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Resend Confirmation Email
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary auth-button"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <a href="#" onClick={handlePasswordReset} className="auth-link">
                Forgot Password?
              </a>
            </p>
            <p>
              <a href="#" onClick={handleResendConfirmation} className="auth-link">
                Resend Confirmation Email
              </a>
            </p>
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create one
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
