import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    orgId: '', // For user signup
    orgName: '', // For admin signup
    orgDescription: '' // For admin signup
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { adminSignup, userSignup, debugGetAllOrganizations } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log("Starting signup process for role:", formData.role);

      // Validation
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Name validation
      if (formData.name.length < 2) {
        setError('Name must be at least 2 characters long');
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

      // Password validation
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Organization validation for user signup
      if (formData.role === 'user' && !formData.orgId) {
        setError('Please select an organization to join');
        setLoading(false);
        return;
      }

      let result;

      if (formData.role === 'admin') {
        // ADMIN SIGNUP FLOW
        console.log("ADMIN SIGNUP FLOW STARTED");
        result = await adminSignup(formData.email, formData.password, formData.orgName, formData.orgDescription);
        console.log("ADMIN SIGNUP COMPLETED:", result);
        setSuccess('Admin account created successfully! Organization created. You can now login.');
      } else {
        // USER SIGNUP FLOW
        console.log("USER SIGNUP FLOW STARTED");
        result = await userSignup(formData.email, formData.password, formData.orgId);
        console.log("USER SIGNUP COMPLETED:", result);
        setSuccess('User account created successfully! You can now login.');
      }

      // DEBUG LOGS
      console.log("SIGNUP RESULT:", result);
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="grid-lines"></div>
        <div className="particles"></div>
      </div>
      
      <div className="auth-content-wrapper">
        <div className="auth-card glass neon-border fade-in">
          <div className="auth-header">
            <h2>Create SecureNet Account</h2>
            <p>Join our advanced intrusion detection system</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="auth-input"
              required
            />
          </div>

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
                placeholder="Create a password (min 6 characters)"
                className="auth-input password-input"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="auth-input auth-select"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="orgName">Organization Name</label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="Enter your organization name"
                className="auth-input"
                required
              />
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="form-group">
              <label htmlFor="orgDescription">Organization Description</label>
              <textarea
                id="orgDescription"
                name="orgDescription"
                value={formData.orgDescription}
                onChange={handleChange}
                placeholder="Describe your organization (optional)"
                className="auth-input auth-textarea"
                rows="3"
              />
            </div>
          )}

          {formData.role === 'user' && (
            <div className="form-group">
              <label htmlFor="orgId">Organization</label>
              <select
                id="orgId"
                name="orgId"
                value={formData.orgId}
                onChange={handleChange}
                className="auth-input auth-select"
                required
              >
                <option value="">Select an organization to join</option>
                {/* For now, hardcoded admin org ID - in production, fetch from API */}
                <option value="PASTE_ADMIN_ORG_ID_HERE">Test Organization</option>
              </select>
              <small className="form-help-text">
                For testing: Ask your admin for the organization ID
              </small>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="auth-link">
              Login
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Signup;
