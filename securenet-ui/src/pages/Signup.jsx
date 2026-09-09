import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, CheckCircle2, Lock, User, Mail, Building, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
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
  const [organizations, setOrganizations] = useState([
    { id: 'demo-org-id', name: 'Test Organization' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  
  const { adminSignup, userSignup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const { data, error: orgErr } = await supabase.from('organizations').select('id, name');
        const defaultList = [
          { id: 'demo-org-id', name: 'Test Organization' }
        ];
        if (data && data.length > 0) {
          const combined = [...defaultList];
          data.forEach(dbOrg => {
            if (!combined.some(o => o.id === dbOrg.id || o.name === dbOrg.name)) {
              combined.push(dbOrg);
            }
          });
          setOrganizations(combined);
        }
      } catch (err) {
        console.warn('Could not fetch organizations from Supabase:', err);
      }
    };
    fetchOrgs();
  }, []);

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

      if (formData.role === 'user' && !formData.orgId) {
        setError('Please select an organization to join');
        setLoading(false);
        return;
      }

      if (formData.role === 'admin') {
        await adminSignup(formData.email, formData.password, formData.orgName, formData.orgDescription);
        setSuccess('Admin account created successfully! Organization created. Redirecting to login...');
      } else {
        await userSignup(formData.email, formData.password, formData.orgId);
        setSuccess('User account created successfully! Redirecting to login...');
      }

      // Persist credentials for easy instant login
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
        <div className="auth-card landscape-card glass neon-border fade-in">
          
          {/* LEFT HERO PANEL (LANDSCAPE BRANDING) */}
          <div className="signup-hero-panel">
            <div className="hero-brand">
              <img src="/logo.jpg" alt="SecureNet IDS Logo" className="signup-hero-logo-img" />
              <h2>SecureNet IDS</h2>
              <span className="hero-badge">ENTERPRISE EDITION</span>
            </div>
            <p className="hero-desc">
              Join our advanced intrusion detection platform to protect your infrastructure with real-time threat intelligence.
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>AI Neural Threat Detection</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>Zero-Trust Security Policies</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="#00f5ff" />
                <span>Instant Incident Telemetry</span>
              </div>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="signup-form-panel">
            <div className="auth-header">
              <h2>Account Registration</h2>
              <p>Join our advanced intrusion detection system</p>
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
                      placeholder="Enter your full name"
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
                      placeholder="Enter your email"
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
                      <option value="user">User (Standard Access)</option>
                      <option value="admin">Admin (Organization Owner)</option>
                    </select>
                  </div>
                </div>

                {/* USER ORG SELECT */}
                {formData.role === 'user' && (
                  <div className="form-group span-2">
                    <label htmlFor="orgId">Organization</label>
                    <div className="input-icon-wrapper">
                      <Building size={16} className="input-field-icon" />
                      <select
                        id="orgId"
                        name="orgId"
                        value={formData.orgId}
                        onChange={handleChange}
                        className="auth-input auth-select with-icon"
                        required
                      >
                        <option value="">Select an organization to join</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <small className="form-help-text">
                      For testing: Ask your admin for the organization ID
                    </small>
                  </div>
                )}

                {/* ADMIN ORG NAME */}
                {formData.role === 'admin' && (
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
                        placeholder="Enter your organization name"
                        className="auth-input with-icon"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* ADMIN ORG DESC */}
                {formData.role === 'admin' && (
                  <div className="form-group span-2">
                    <label htmlFor="orgDescription">Organization Description</label>
                    <textarea
                      id="orgDescription"
                      name="orgDescription"
                      value={formData.orgDescription}
                      onChange={handleChange}
                      placeholder="Describe your organization (optional)"
                      className="auth-input auth-textarea"
                      rows="2"
                    />
                  </div>
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
                    {loading ? 'Creating Account...' : 'SIGN UP'}
                  </button>
                </div>

              </div>
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
    </div>
  );
};

export default Signup;
