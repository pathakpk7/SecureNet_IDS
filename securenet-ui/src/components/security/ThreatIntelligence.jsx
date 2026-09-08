import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity, ArrowRight, BrainCircuit } from 'lucide-react';

export default function ThreatIntelligence({ alerts = [] }) {
  const navigate = useNavigate();
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  
  const hasThreats = safeAlerts.length > 0;
  
  const topThreat = safeAlerts[0] || {
    message: 'Active network traffic within normal thresholds',
    threat: { level: 'LOW' },
    prediction: { message: 'Normal operational baseline' }
  };

  const level = (topThreat?.threat?.level || topThreat?.severity || 'LOW').toUpperCase();
  const isSafe = !hasThreats && level === 'LOW';

  const getRiskColors = () => {
    switch(level) {
      case 'CRITICAL': return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444', icon: <ShieldAlert size={22} color="#ef4444" /> };
      case 'HIGH': return { bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', text: '#f97316', icon: <AlertTriangle size={22} color="#f97316" /> };
      case 'MEDIUM': return { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', text: '#eab308', icon: <AlertTriangle size={22} color="#eab308" /> };
      case 'LOW': 
      default: return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981', icon: <ShieldCheck size={22} color="#10b981" /> };
    }
  };

  const colors = getRiskColors();
  const titleText = topThreat?.threatType || topThreat?.attack_type || topThreat?.message || 'Network Secure';
  const predictionText = topThreat?.prediction?.message || topThreat?.description || 'No anomalies detected in the current traffic window.';
  
  const getInsight = () => {
    if (level === 'CRITICAL') return 'Immediate threat detected - automatic mitigation engaged.';
    if (level === 'HIGH') return 'High confidence attack signature identified.';
    if (level === 'MEDIUM') return 'Anomalous flow telemetry detected. Monitoring closely.';
    return 'Baseline traffic verified by CICIDS2017 AI model. No malicious signatures present.';
  };

  return (
    <Card 
      className="intel-card db-card-clickable" 
      onClick={() => navigate('/attack-analysis')}
      title="Click to open Attack Analysis"
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        borderLeft: `4px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        cursor: 'pointer'
      }}
    >
      {/* Background glow effect based on risk */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: '180px', height: '180px',
        background: `radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`,
        opacity: 0.6,
        pointerEvents: 'none',
        transform: 'translate(30%, -30%)'
      }}></div>

      <div className="db-card-header" style={{ marginBottom: '20px', zIndex: 1 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
          {colors.icon}
          Threat Intelligence
        </h3>
        <span className="db-card-link-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8', transition: 'color 0.2s ease' }}>
          Analysis <ArrowRight size={14} />
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1, flex: 1 }}>
        
        {/* Main Threat Status */}
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>
            Current Top Threat
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: isSafe ? '#10b981' : '#f8fafc', lineHeight: 1.3 }}>
            {titleText}
          </div>
        </div>

        {/* Risk Level Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Risk Assessment:</div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '6px',
            background: colors.bg,
            color: colors.text,
            fontSize: '12px',
            fontWeight: '700',
            border: `1px solid ${colors.border}40`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {level}
          </div>
        </div>

        {/* Prediction Data */}
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', padding: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38bdf8', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            <Activity size={14} color="#38bdf8" /> 
            Live Prediction
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
            {predictionText}
          </div>
        </div>

      </div>

      {/* AI Insight Footer */}
      <div style={{ 
        marginTop: '20px', 
        paddingTop: '16px', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        zIndex: 1
      }}>
        <BrainCircuit size={18} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#d8b4fe', lineHeight: 1.5, opacity: 0.9 }}>
          <b style={{ color: '#c084fc', fontWeight: '600' }}>AI Insight:</b> {getInsight()}
        </div>
      </div>
    </Card>
  );
}
