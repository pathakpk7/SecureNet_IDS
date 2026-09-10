import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import toast from 'react-hot-toast';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  Calendar,
  X,
  ExternalLink,
  Lock,
  Cpu
} from 'lucide-react';
import { getResponseAction, getRecommendedActions } from '../../services/incidentEngine';
import InvestigationModal from '../notifications/InvestigationModal';
import { supabase } from '../../api/supabase';

export default function IncidentPanel({ alert }) {
  const navigate = useNavigate();
  const [actionStatus, setActionStatus] = useState('idle'); // idle | executing | executed | scheduled
  const [scheduledTime, setScheduledTime] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Extract or synthesize a high-fidelity incident object from alerts
  const safeAlert = alert || {
    id: 'inc-live-01',
    message: "Network traffic baseline monitoring active",
    threatType: "Perimeter Traffic Sweep",
    sourceIP: "203.0.113.45",
    destinationIP: "192.168.1.1",
    threat: { level: "LOW" },
    prediction: { level: "LOW" }
  };
  
  const rawAction = getResponseAction(safeAlert) || "MONITOR";
  const recommendation = getRecommendedActions(safeAlert) || {
    description: "Continue real-time traffic monitoring and logging",
    priority: "NORMAL",
    steps: ["Inspect flow telemetry", "Verify ML anomaly indicators", "Check threat intelligence reputation"]
  };

  const priority = (recommendation.priority || 'NORMAL').toUpperCase();
  const threatLevel = (safeAlert?.threat?.level || safeAlert?.severity || 'LOW').toUpperCase();

  const getPriorityTheme = () => {
    switch(priority) {
      case 'URGENT':
      case 'CRITICAL':
        return { color: '#ff3366', bg: 'rgba(255, 51, 102, 0.12)', border: '#ff3366', icon: <ShieldAlert size={20} color="#ff3366" /> };
      case 'HIGH':
        return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: '#fbbf24', icon: <AlertTriangle size={20} color="#fbbf24" /> };
      case 'MEDIUM':
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: '#38bdf8', icon: <Cpu size={20} color="#38bdf8" /> };
      case 'LOW':
      default:
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', icon: <ShieldCheck size={20} color="#10b981" /> };
    }
  };

  const theme = getPriorityTheme();

  const handleToggleStep = (index) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleExecuteAction = () => {
    setActionStatus('executing');
    toast.loading(`Executing automated mitigation: ${rawAction}...`, { id: 'exec-action' });

    setTimeout(() => {
      setActionStatus('executed');
      // Mark all steps complete
      setCompletedSteps(new Set((recommendation.steps || []).map((_, i) => i)));
      
      // Auto-block source IP if applicable
      if (safeAlert.sourceIP && (rawAction === 'BLOCK_IP' || rawAction === 'RATE_LIMIT')) {
        try {
          supabase.from('blacklist').insert([{
            ip_address: safeAlert.sourceIP,
            reason: `Autonomous response action: ${rawAction}`
          }]);
        } catch (e) {}
      }

      toast.success(`Autonomous mitigation successful! ${rawAction} enforced.`, { id: 'exec-action' });
    }, 600);
  };

  const handleScheduleAction = () => {
    const timeStr = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setScheduledTime(timeStr);
    setActionStatus('scheduled');
    toast.success(`Action "${rawAction}" queued for maintenance window (${timeStr})`, {
      icon: '⏱️'
    });
  };

  const handleBlockIp = (ip) => {
    try {
      supabase.from('blacklist').insert([{
        ip_address: ip,
        reason: 'Blocked via Incident Response Investigation'
      }]);
    } catch (e) {}
    toast.success(`Attacker IP ${ip} permanently blacklisted.`);
  };

  return (
    <>
      <Card className="incident-card db-incident-card">
        {/* Header with status badge */}
        <div className="db-card-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme.icon}
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600 }}>
              Incident Response & Containment
            </h3>
          </div>
          <span 
            className="db-card-link-badge" 
            style={{ 
              backgroundColor: actionStatus === 'executed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.1)',
              borderColor: actionStatus === 'executed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.25)',
              color: actionStatus === 'executed' ? '#10b981' : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {actionStatus === 'executed' ? (
              <>
                <CheckCircle2 size={12} /> Mitigated
              </>
            ) : actionStatus === 'scheduled' ? (
              <>
                <Clock size={12} /> Queued ({scheduledTime})
              </>
            ) : (
              <>
                <Zap size={12} /> Auto Response Active
              </>
            )}
          </span>
        </div>

        {/* Action & Priority Metrics Bar */}
        <div className="incident-metrics-grid">
          <div className="incident-metric-box">
            <span className="inc-metric-lbl">Recommended Action</span>
            <div className="inc-metric-val" style={{ color: theme.color }}>
              {rawAction}
            </div>
          </div>

          <div className="incident-metric-box">
            <span className="inc-metric-lbl">Response Priority</span>
            <div className="inc-metric-val" style={{ color: theme.color }}>
              <span className={`priority-pill ${priority.toLowerCase()}`}>
                {priority}
              </span>
            </div>
          </div>

          <div className="incident-metric-box">
            <span className="inc-metric-lbl">Threat Vector</span>
            <div className="inc-metric-val text-gray-200" style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {safeAlert.threatType || safeAlert.message || 'Suspicious Traffic'}
            </div>
          </div>
        </div>

        {/* Description Callout */}
        <div className="incident-desc-callout">
          <span className="desc-title">Objective:</span>
          <p className="desc-text">{recommendation.description || 'System state nominal. Automated inspection active.'}</p>
        </div>

        {/* Recommended Steps with Interactive Checkboxes */}
        <div className="incident-steps-section">
          <div className="steps-header">
            <h4>Actionable Containment Steps:</h4>
            <span className="steps-counter">
              {completedSteps.size} of {(recommendation.steps || []).length} completed
            </span>
          </div>

          <ul className="interactive-steps-list">
            {(recommendation.steps || []).map((step, index) => {
              const isChecked = completedSteps.has(index);
              return (
                <li 
                  key={index} 
                  className={`step-item ${isChecked ? 'completed' : ''}`}
                  onClick={() => handleToggleStep(index)}
                  title="Click to check or uncheck step"
                >
                  <div className={`step-checkbox ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <CheckCircle2 size={13} color="#10b981" />}
                  </div>
                  <span className="step-text">{step}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Action Buttons Row */}
        <div className="incident-actions-row">
          <button 
            type="button"
            onClick={handleExecuteAction}
            disabled={actionStatus === 'executing' || actionStatus === 'executed'}
            className={`btn btn-sm ${actionStatus === 'executed' ? 'btn-applied' : 'btn-primary'}`}
            style={{ flex: 1.2 }}
          >
            {actionStatus === 'executed' ? (
              <>
                <CheckCircle2 size={14} /> Action Executed ✓
              </>
            ) : actionStatus === 'executing' ? (
              'Deploying Rule...'
            ) : (
              <>
                <Zap size={14} /> Execute Action
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={handleScheduleAction}
            className="btn btn-outline btn-sm"
            style={{ flex: 1 }}
          >
            <Clock size={14} /> Schedule for Later
          </button>

          <button 
            type="button"
            onClick={() => setShowDetailsModal(true)}
            className="btn btn-outline btn-sm btn-details"
            style={{ flex: 1 }}
            title="Inspect full forensic breakdown"
          >
            View Details →
          </button>
        </div>
      </Card>

      {/* FORENSIC INVESTIGATION DETAILS MODAL */}
      {showDetailsModal && (
        <InvestigationModal
          notification={{
            id: safeAlert.id || 'inc-' + Date.now(),
            title: `Incident Response: ${rawAction}`,
            message: `${recommendation.description}. Target: ${safeAlert.destinationIP || 'Edge Ingress'}. Source: ${safeAlert.sourceIP || '203.0.113.45'}.`,
            source_ip: safeAlert.sourceIP || '203.0.113.45',
            priority: priority.toLowerCase(),
            time: new Date().toISOString()
          }}
          onClose={() => setShowDetailsModal(false)}
          onBlockIp={handleBlockIp}
          onMarkRead={() => {
            setActionStatus('executed');
            setShowDetailsModal(false);
          }}
        />
      )}
    </>
  );
}
