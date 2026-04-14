import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/login.css';

const Login = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error on input change
    setSuccess(''); // Clear success message on input change
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCardSelect = (role) => {
    setSelectedRole(role);
    setShowLoginForm(true);
    // Pre-fill with demo account data
    setFormData({
      email: demoAccounts[role].email,
      password: demoAccounts[role].password,
      rememberMe: false
    });
  };

  const handleBackToCards = () => {
    setShowLoginForm(false);
    setSelectedRole('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email');
        setLoading(false);
        return;
      }

      // Clear any existing messages
      setError('');
      setSuccess('');
      
      // Attempt login with new auth service
      const user = await login(formData.email, formData.password, formData.rememberMe);
      
      if (user) {
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
            <h1>SecureNet IDS</h1>
            <p>Choose your login type to access the platform</p>
          </div>
          
          <div className="login-cards">
            <div className="login-card admin-card" onClick={() => handleCardSelect('admin')}>
              <div className="card-icon">{'\ud83d\udc51'}</div>
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
                <button className="btn btn-primary">Login as Admin</button>
              </div>
            </div>

            <div className="login-card user-card" onClick={() => handleCardSelect('user')}>
              <div className="card-icon">{'\ud83d\udc64'}</div>
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
                <button className="btn btn-primary">Login as User</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-card glass neon-border fade-in">
          <div className="auth-header">
            <button onClick={handleBackToCards} className="back-btn">{'\u2190'} Back</button>
            <h2>Login as {selectedRole.toUpperCase()}</h2>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="auth-input"
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
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '??' : '???'}
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
                Remember Me
              </label>
            </div>

            {error && (
              <div className="error-message">
                {error}
                {error.includes('email has not been confirmed') && (
                  <div style={{marginTop: '8px'}}>
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
              {loading ? 'Logging in...' : 'Login'}
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
              <a href="/signup" className="auth-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
