import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, Send, CheckCircle2, Clock, AlertTriangle, 
  MessageSquare, User, Shield, ChevronRight, X, Sparkles, RefreshCw, Key,
  ShieldCheck, HandHeart, Check, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { guidanceService, organizationService } from '../../api/supabase';
import toast from 'react-hot-toast';

const UserGuidanceWidget = ({ compact = false, relatedAlert = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: relatedAlert ? `Help with Alert: ${relatedAlert.attack_type || 'Threat'} (${relatedAlert.source_ip || ''})` : '',
    category: 'threat_analysis',
    priority: 'medium',
    description: '',
    adminId: ''
  });

  const orgId = user?.org_id || user?.organization?.id || 'demo-org-id';
  const orgName = user?.organization?.name || user?.name ? `${user.name}'s Org` : 'SecureNet SOC Enterprise';
  const joinKey = user?.organization?.join_key || localStorage.getItem('securenet_org_key') || 'SEC789';

  const fetchRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // For admins: fetch all tickets across the organization
      // For standard users: fetch their own tickets
      const filterParams = { orgId };
      if (!isAdmin) {
        filterParams.userId = user.id;
      }
      
      const data = await guidanceService.getRequests(filterParams);
      setRequests(data || []);
    } catch (err) {
      console.warn("Could not fetch guidance requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (orgId) {
      organizationService.getOrgAdmins(orgId).then(admins => {
        setOrgAdmins(admins || []);
      });
    }
  }, [user, orgId, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      setSubmitting(true);
      const selectedAdmin = orgAdmins.find(a => a.id === formData.adminId);
      
      const newReq = await guidanceService.createRequest({
        org_id: orgId,
        user_id: user.id,
        user_name: user.name || user.email?.split('@')[0] || 'SOC Analyst',
        user_email: user.email,
        admin_id: formData.adminId || null,
        admin_name: selectedAdmin ? (selectedAdmin.name || selectedAdmin.email) : null,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        related_alert_id: relatedAlert?.id || null
      });

      // Log user activity to Supabase and backend
      await guidanceService.logUserActivity({
        org_id: orgId,
        user_id: user.id,
        email: user.email,
        action: 'guidance_requested',
        resource_type: 'guidance_request',
        resource_id: newReq.id,
        details: { title: formData.title, category: formData.category, priority: formData.priority }
      });

      toast.success('Guidance ticket submitted and saved to Supabase!');
      setFormData({
        title: '',
        category: 'threat_analysis',
        priority: 'medium',
        description: '',
        adminId: ''
      });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      toast.error('Error submitting guidance request');
      console.error("Error submitting guidance request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Volunteer to guide a user request (for admins)
  const handleVolunteer = async (requestId, e) => {
    e.stopPropagation();
    try {
      const adminName = user?.name || user?.email?.split('@')[0] || 'Security Administrator';
      await guidanceService.volunteerForRequest(requestId, user.id, adminName);
      
      await guidanceService.logUserActivity({
        org_id: orgId,
        user_id: user.id,
        email: user.email,
        action: 'admin_volunteered_guidance',
        resource_type: 'guidance_ticket',
        resource_id: requestId,
        details: { admin: adminName }
      });

      toast.success('Volunteered as mentor for this ticket!');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to volunteer for ticket');
    }
  };

  // Submit Admin Guidance Response
  const handleAdminResponseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !adminResponseText.trim()) return;

    try {
      setResponding(true);
      await guidanceService.respondToRequest(selectedRequest.id, adminResponseText, 'resolved');
      
      await guidanceService.logUserActivity({
        org_id: orgId,
        user_id: user.id,
        email: user.email,
        action: 'guidance_ticket_resolved',
        resource_type: 'guidance_ticket',
        resource_id: selectedRequest.id,
        details: { target_user: selectedRequest.user_name || selectedRequest.user_email }
      });

      toast.success('Guidance response sent & saved to Supabase!');
      setSelectedRequest(null);
      setAdminResponseText('');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to submit guidance response');
    } finally {
      setResponding(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
            <CheckCircle2 size={12} /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
            <Clock size={12} /> In Progress
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
            <AlertTriangle size={12} /> Open
          </span>
        );
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 30, 0.8) 100%)',
      border: '1px solid rgba(0, 245, 255, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: isAdmin ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0, 245, 255, 0.1)',
            padding: '10px',
            borderRadius: '10px',
            color: isAdmin ? '#a855f7' : '#00f5ff'
          }}>
            {isAdmin ? <ShieldCheck size={22} /> : <HelpCircle size={22} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdmin ? 'Admin Mentorship & User Guidance Hub' : 'SOC Guidance & Admin Help Hub'}
              {isAdmin && (
                <span style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  Admin View
                </span>
              )}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              {orgName} • Key: <strong style={{ color: '#00f5ff', letterSpacing: '1px' }}>{joinKey}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={fetchRequests}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh Tickets"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>

          {isAdmin ? (
            <button
              onClick={() => navigate('/admin-panel')}
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Guidance Center</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#00f5ff',
                color: '#030712',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(0, 245, 255, 0.4)'
              }}
            >
              <MessageSquare size={14} />
              <span>Ask for Guidance</span>
            </button>
          )}

          {/* Test Guidance button for admin to easily verify persistence */}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'rgba(0, 245, 255, 0.1)',
                color: '#00f5ff',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Submit test guidance request"
            >
              <MessageSquare size={14} />
              <span>+ New Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* AVAILABLE ADMINS ROSTER STRIP */}
      {orgAdmins.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
            <Shield size={14} color="#00f5ff" />
            <span><strong>Available Admins & Mentors:</strong> {orgAdmins.map(a => `${a.name || a.email.split('@')[0]} (${a.specialty_role || 'Admin'})`).join(' • ')}</span>
          </div>
        </div>
      )}

      {/* REQUESTS LIST */}
      {loading && requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
          Loading guidance tickets from Supabase...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Sparkles size={24} color="#00f5ff" style={{ margin: '0 auto 8px', opacity: 0.7 }} />
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>
            {isAdmin ? 'No Open Help Requests in Organization' : 'No Open Help Requests'}
          </p>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {isAdmin 
              ? 'All user questions and threat escalations have been attended to, or no user has submitted one yet. You can click "+ New Ticket" to create a sample request.' 
              : 'Have a question on an alert or need mentorship? Click "Ask for Guidance" to request assistance from your organization admins.'}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {requests.slice(0, compact ? 3 : 10).map(req => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
                gap: '12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#f8fafc' }}>
                    {req.title}
                  </span>
                  {getStatusBadge(req.status)}
                  <span style={{
                    fontSize: '10px',
                    color: req.priority === 'urgent' ? '#ef4444' : req.priority === 'high' ? '#f59e0b' : '#38bdf8',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}>
                    [{req.priority || 'medium'}]
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>User: <strong style={{ color: '#cbd5e1' }}>{req.user_name || req.user_email}</strong></span>
                  <span>Category: <strong>{req.category?.replace('_', ' ')}</strong></span>
                  {req.admin_name && (
                    <span style={{ color: '#00f5ff' }}>Guided by: <strong>{req.admin_name}</strong></span>
                  )}
                  <span>{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAdmin && req.status === 'open' && (
                  <button
                    onClick={(e) => handleVolunteer(req.id, e)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <HandHeart size={12} /> Volunteer
                  </button>
                )}
                <ChevronRight size={16} color="#64748b" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: SUBMIT NEW GUIDANCE REQUEST */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 30, 0.98))',
            border: '1px solid rgba(0, 245, 255, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#00f5ff" />
                Request Admin Guidance & Help
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Request Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Suspicious outbound connections on port 4444"
                  required
                  style={{
                    width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px'
                    }}
                  >
                    <option value="threat_analysis">Threat Analysis</option>
                    <option value="alert_triage">Alert Triage</option>
                    <option value="rule_configuration">Rule Configuration</option>
                    <option value="general_guidance">General Guidance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {orgAdmins.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Assign to Specific Admin (Optional)</label>
                  <select
                    value={formData.adminId}
                    onChange={(e) => setFormData(p => ({ ...p, adminId: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px'
                    }}
                  >
                    <option value="">Any Available Admin</option>
                    {orgAdmins.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name || a.email} ({a.specialty_role || 'Admin'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Description & Questions</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what you observed, what rules you tried to configure, or where you need guidance..."
                  required
                  style={{
                    width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#94a3b8', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#00f5ff', color: '#030712', border: 'none',
                    padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Send size={14} />
                  {submitting ? 'Submitting to Supabase...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW TICKET DETAILS & ADMIN RESPONSE */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(10, 15, 30, 0.98))',
            border: '1px solid rgba(0, 245, 255, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>
                  {selectedRequest.title}
                </h3>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ color: '#94a3b8', marginBottom: '8px', lineHeight: '1.5' }}>
                {selectedRequest.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <span>From: <b>{selectedRequest.user_name || selectedRequest.user_email}</b></span>
                <span>Category: <b>{selectedRequest.category?.replace('_', ' ')}</b></span>
              </div>
            </div>

            {/* If Admin Guidance Provided */}
            {selectedRequest.guidance_notes ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ color: '#10b981', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <ShieldCheck size={16} /> Admin Guidance & Remediation:
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}>
                  {selectedRequest.guidance_notes}
                </div>
              </div>
            ) : isAdmin ? (
              <form onSubmit={handleAdminResponseSubmit} style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Provide Mentorship Guidance & Resolve Ticket:
                </label>
                <textarea
                  rows={3}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Type guidance recommendations, firewall rules, or troubleshooting steps..."
                  required
                  style={{
                    width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(0,245,255,0.3)', borderRadius: '6px', color: '#fff', fontSize: '13px', resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={responding}
                    style={{
                      background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px',
                      borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Check size={14} />
                    {responding ? 'Saving to Supabase...' : 'Save & Resolve Ticket'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px', color: '#f59e0b', fontSize: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '6px' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Awaiting response from an assigned admin mentor.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#94a3b8', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserGuidanceWidget;
