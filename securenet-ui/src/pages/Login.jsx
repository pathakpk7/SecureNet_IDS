import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Eye, EyeOff, Zap, CheckCircle2, ArrowRight, ShieldCheck, RotateCw } from 'lucide-react';
import '../styles/pages/login.css';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Security CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const captchaCanvasRef = useRef(null);
  
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

  // Generate a random alphanumeric CAPTCHA
  const generateCaptchaCode = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Draw cyber-styled distorted CAPTCHA onto canvas
  const renderCaptchaCanvas = (code) => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Security interference lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = selectedRole === 'admin' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 245, 255, 0.35)';
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Distorted security characters
    const charSpacing = width / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = (i + 1) * charSpacing;
      const y = height / 2 + 3 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 24 - 12) * Math.PI / 180;
      
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = selectedRole === 'admin' ? '#f87171' : '#00f5ff';
      ctx.shadowColor = selectedRole === 'admin' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 245, 255, 0.8)';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setCaptchaInput('');
    renderCaptchaCanvas(newCode);
  };

  // Initial load: Fetch older saved credentials from localStorage & generate CAPTCHA
  useEffect(() => {
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setTimeout(() => renderCaptchaCanvas(newCode), 50);

    try {
      const accounts = [];

      // 1. Check permanent saved accounts list
      const savedListRaw = localStorage.getItem('saved_accounts_list');
      if (savedListRaw) {
        try {
          const parsedList = JSON.parse(savedListRaw);
          if (Array.isArray(parsedList)) {
            parsedList.forEach(item => {
              if (item.email && !accounts.some(a => a.email.toLowerCase() === item.email.toLowerCase())) {
                accounts.push({
                  email: item.email,
                  password: item.password || '',
                  role: item.role || 'user',
                  label: `Saved: ${item.email}`
                });
              }
            });
          }
        } catch (e) {}
      }

      // 2. Check latest remembered credentials
      const remembered = localStorage.getItem('saved_login_credentials');
      if (remembered) {
        try {
          const parsed = JSON.parse(remembered);
          if (parsed?.email) {
            if (!accounts.some(a => a.email.toLowerCase() === parsed.email.toLowerCase())) {
              accounts.unshift({
                email: parsed.email,
                password: parsed.password || '',
                role: parsed.role || 'user',
                label: `Recent: ${parsed.email}`
              });
            }
            // Auto-prefill form with last used account
            setFormData({
              email: parsed.email,
              password: parsed.password || '',
              rememberMe: true
            });
            if (parsed.role) setSelectedRole(parsed.role);
          }
        } catch (e) {}
      }

      // 3. Add default presets for easy 1-click test
      accounts.push({
        email: demoAccounts.user.email,
        password: demoAccounts.user.password,
        role: 'user',
        label: 'Analyst Demo (user@securenet.com)'
      });
      accounts.push({
        email: demoAccounts.admin.email,
        password: demoAccounts.admin.password,
        role: 'admin',
        label: 'Admin Demo (admin@securenet.com)'
      });

      setSavedAccounts(accounts);
    } catch (err) {
      console.warn("Could not retrieve saved credentials:", err);
    }
  }, []);

  // Re-render canvas if role or captcha changes
  useEffect(() => {
    if (captchaCode) {
      renderCaptchaCanvas(captchaCode);
    }
  }, [selectedRole, captchaCode]);

  // Persist credentials in localStorage for automatic future 1-click logins
  const persistUserCredentials = (email, password, role) => {
    try {
      const cleanEmail = email.trim();
      const cleanPass = password.trim();

      // 1. Save as latest login
      localStorage.setItem('saved_login_credentials', JSON.stringify({
        email: cleanEmail,
        password: cleanPass,
        role
      }));

      // 2. Add to permanent list
      let list = [];
      try {
        const raw = localStorage.getItem('saved_accounts_list');
        if (raw) list = JSON.parse(raw);
      } catch {}
      if (!Array.isArray(list)) list = [];

      const existingIndex = list.findIndex(a => a.email.toLowerCase() === cleanEmail.toLowerCase());
      const accountItem = {
        email: cleanEmail,
        password: cleanPass,
        role,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        list[existingIndex] = accountItem;
      } else {
        list.unshift(accountItem);
      }
      localStorage.setItem('saved_accounts_list', JSON.stringify(list));
    } catch (e) {
      console.warn("Could not persist credentials to storage:", e);
    }
  };

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setError('');
    setSuccess('');
    refreshCaptcha();
  };

  const handleQuickAutofill = (role) => {
    const creds = demoAccounts[role];
    setSelectedRole(role);
    setFormData({
      email: creds.email,
      password: creds.password,
      rememberMe: true
    });
    setError('');
    setSuccess(`Loaded credentials for ${creds.label}`);
    refreshCaptcha();
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
      setSuccess(`Loaded saved account for ${account.email}`);
      refreshCaptcha();
    }
  };

  const handleInstantDemoLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      persistUserCredentials(demoAccounts[selectedRole].email, demoAccounts[selectedRole].password, selectedRole);
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

      // Security CAPTCHA Backend Validation
      if (!captchaInput.trim()) {
        setError('Security Verification Required: Please enter the CAPTCHA code.');
        setLoading(false);
        return;
      }

      if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
        setError('Security verification failed: Incorrect CAPTCHA code. A new code has been generated.');
        refreshCaptcha();
        setLoading(false);
        return;
      }

      // Store credentials permanently for easy future login
      persistUserCredentials(email, password, selectedRole);

      // Authenticate via Supabase / AuthContext
      const userResult = await login(email, password, selectedRole);
      if (userResult) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login attempt error:", err);
      const msg = err.message || '';
      refreshCaptcha();
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError("Your email address has not been confirmed yet in Supabase. Please verify via your inbox link.");
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setError("Incorrect password for this account. Please verify your credentials or use 'Forgot password?'.");
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

        {/* Saved Accounts Dropdown (auto-stores every signed in user) */}
        {savedAccounts.length > 0 && (
          <div className="auth-saved-select-box">
            <select
              className="auth-saved-select"
              onChange={handleSavedSelect}
              value={formData.email || ""}
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

          {/* Security CAPTCHA Verification Box */}
          <div className="auth-captcha-box">
            <div className="auth-captcha-header">
              <span className="auth-captcha-title">
                <ShieldCheck size={14} color={isCurrentAdmin ? '#ef4444' : '#00f5ff'} />
                Security Verification
              </span>
              <button
                type="button"
                className="auth-captcha-refresh-btn"
                onClick={refreshCaptcha}
                title="Generate new CAPTCHA"
              >
                <RotateCw size={13} />
              </button>
            </div>

            <div className="auth-captcha-row">
              <div className="auth-captcha-canvas-wrap">
                <canvas
                  ref={captchaCanvasRef}
                  width={110}
                  height={38}
                  style={{ display: 'block', borderRadius: '4px' }}
                />
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter CAPTCHA"
                className="auth-captcha-input"
                maxLength={6}
                required
                autoComplete="off"
              />
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
            {loading ? 'Verifying & Authenticating...' : (
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
