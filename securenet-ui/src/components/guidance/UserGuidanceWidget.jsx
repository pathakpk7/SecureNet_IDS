import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Send, CheckCircle2, Clock, AlertTriangle, 
  MessageSquare, User, Shield, ChevronRight, X, Sparkles, RefreshCw, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { guidanceService, organizationService } from '../../api/supabase';

const UserGuidanceWidget = ({ compact = false, relatedAlert = null }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [formData, setFormData] = useState({
    title: relatedAlert ? `Help with Alert: ${relatedAlert.attack_type || 'Threat'} (${relatedAlert.source_ip || ''})` : '',
    category: 'threat_analysis',
    priority: 'medium',
    description: '',
    adminId: ''
  });

  const orgId = user?.org_id || user?.organization?.id || 'demo-org-id';
  const orgName = user?.organization?.name || 'SecureNet SOC Enterprise';
  const joinKey = user?.organization?.join_key || 'SEC789';

  const fetchRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await guidanceService.getRequests({
        orgId: orgId,
        userId: user.id
      });
      setRequests(data || []);
    } catch (err) {
      console.warn("Could not fetch user guidance requests:", err);
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
  }, [user, orgId]);

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

      // Log user activity
      await guidanceService.logUserActivity({
        org_id: orgId,
        user_id: user.id,
        email: user.email,
        action: 'guidance_requested',
        resource_type: 'guidance_request',
        resource_id: newReq.id,
        details: { title: formData.title, category: formData.category, priority: formData.priority }
      });

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
      console.error("Error submitting guidance request:", err);
    } finally {
      setSubmitting(false);
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
            <Clock size={12} /> Guided in Progress
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
            <AlertTriangle size={12} /> Open Request
          </span>
        );
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      border: '1px solid rgba(0, 245, 255, 0.2)',
      borderRadius: '12px',
      padding: compact ? '14px' : '20px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(0, 245, 255, 0.12)', border: '1px solid rgba(0, 245, 255, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f5ff'
          }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '600' }}>
              SOC Guidance & Admin Help Hub
            </h4>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {orgName} • Key: <strong style={{ color: '#00f5ff' }}>{joinKey}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchRequests}
            title="Refresh Requests"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 8px',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #00f5ff, #0ea5e9)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              color: '#030712',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={14} />
            <span>Ask for Guidance</span>
          </button>
        </div>
      </div>

      {/* AVAILABLE ADMINS BANNER */}
      {orgAdmins.length > 0 && (
        <div style={{
          background: 'rgba(0, 245, 255, 0.04)',
          border: '1px solid rgba(0, 245, 255, 0.15)',
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
            <span><strong>Available Admins:</strong> {orgAdmins.map(a => `${a.name || a.email.split('@')[0]} (${a.specialty_role || 'Admin'})`).join(' • ')}</span>
          </div>
        </div>
      )}

      {/* REQUESTS LIST */}
      {loading && requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
          Loading guidance tickets...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Sparkles size={24} color="#00f5ff" style={{ margin: '0 auto 8px', opacity: 0.7 }} />
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>No Open Help Requests</p>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Have a question on an alert or need mentorship? Click "Ask for Guidance" to request assistance from your organization admins.
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
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#f8fafc' }}>
                    {req.title}
                  </span>
                  {getStatusBadge(req.status)}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '12px' }}>
                  <span>Category: <strong>{req.category?.replace('_', ' ')}</strong></span>
                  {req.admin_name && (
                    <span style={{ color: '#00f5ff' }}>Admin Guide: <strong>{req.admin_name}</strong></span>
                  )}
                  <span>{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight size={16} color="#64748b" />
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
                  <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Direct to Specific Admin (Optional)</label>
                  <select
                    value={formData.adminId}
                    onChange={(e) => setFormData(p => ({ ...p, adminId: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px'
                    }}
                  >
                    <option value="">Any Available Admin (Broadcast to SOC Leads)</option>
                    {orgAdmins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name || admin.email} - {admin.specialty_role || 'Admin'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Detailed Question / Incident Summary</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what you observed, suspect IPs, or the security guidance you need..."
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
                    padding: '8px 16px', background: 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 20px', background: 'linear-gradient(135deg, #00f5ff, #0ea5e9)',
                    border: 'none', borderRadius: '6px', color: '#030712', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting...' : 'Send Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: VIEW TICKET & ADMIN RESPONSE */}
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
            color: '#fff',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>{selectedRequest.title}</h3>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#cbd5e1' }}>
              <strong style={{ color: '#00f5ff', display: 'block', marginBottom: '4px' }}>Your Inquiry:</strong>
              {selectedRequest.description}
            </div>

            {selectedRequest.guidance_notes ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                  <CheckCircle2 size={16} />
                  <span>Admin Guidance from {selectedRequest.admin_name || 'SOC Lead'}:</span>
                </div>
                <div style={{ fontSize: '13px', color: '#f1f5f9', whiteSpace: 'pre-line' }}>
                  {selectedRequest.guidance_notes}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#eab308',
                marginBottom: '16px'
              }}>
                An admin is reviewing your request and will provide guidance shortly.
              </div>
            )}

            <button
              onClick={() => setSelectedRequest(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '600' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserGuidanceWidget;
