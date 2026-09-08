import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/reports.css';

/**
 * Enterprise Reports Page
 * High-performance security report generation and compliance data exports.
 */
const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('executive_summary');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [reportHistory, setReportHistory] = useState([]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/reports/generate?report_type=${reportType}&format=${format}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Report generated and downloaded successfully!');
        setReportHistory(prev => [
          {
            id: `rep-${Date.now()}`,
            title: `${reportType.replace(/_/g, ' ').toUpperCase()} Report`,
            report_type: reportType,
            format: format,
            created_at: new Date().toISOString(),
            size: `${(blob.size / 1024).toFixed(1)} KB`
          },
          ...prev
        ]);
      } else {
        toast.error('Failed to generate report from backend service');
      }
    } catch (error) {
      toast.error('Error connecting to report service');
    } finally {
      setLoading(false);
    }
  };

  const exportAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/reports/alerts/export?format=csv');

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securenet_alerts_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Alerts exported to CSV successfully!');
      } else {
        toast.error('Failed to export alerts');
      }
    } catch (error) {
      toast.error('Error connecting to alerts export endpoint');
    }
  };

  const exportAuditLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/reports/audit-logs/export?format=csv');

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securenet_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Audit logs exported to CSV successfully!');
      } else {
        toast.error('Failed to export audit logs');
      }
    } catch (error) {
      toast.error('Error connecting to audit logs endpoint');
    }
  };

  const handleArchiveData = async () => {
    if (!window.confirm("Are you sure you want to archive all current data and reset the dashboard? A summary will be kept in audit logs.")) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/archive', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || 'Weekly data archived successfully!');
        setReportHistory(prev => [
          {
            id: `arch-${Date.now()}`,
            title: 'Weekly System Archive & Reset',
            report_type: 'weekly_archive',
            format: 'system',
            created_at: new Date().toISOString(),
            size: 'System Reset'
          },
          ...prev
        ]);
        // Also force a reload to clear all active context if they visit the dashboard
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error(data.error || 'Failed to archive data');
      }
    } catch (error) {
      toast.error('Error connecting to archive service');
    } finally {
      setLoading(false);
    }
  };

  const displayedReports = isExpanded ? reportHistory : reportHistory.slice(0, 3);

  return (
    <div className="reports-page-container fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Security Reports & Compliance</h1>
        <p className="page-subtitle">Generate executive summaries, export raw telemetry, and manage audit records</p>
      </div>

      {/* ROW 1: Side-by-Side (Generate Custom Security Report + Direct Telemetry & Audit Exports) */}
      <div className="reports-top-row">
        {/* Card 1: Custom Report Generator */}
        <Card className="reports-card">
          <div className="reports-card-header">
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>Generate Custom Security Report</h3>
            <span className="aa-badge">REPORT GENERATOR</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                Report Template
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="executive_summary">Executive Summary (High-Level Overview)</option>
                <option value="threat_analysis">Threat Intelligence & Attack Analysis</option>
                <option value="network_performance">Network Throughput & Performance</option>
                <option value="compliance_audit">Security Compliance & Audit Trail</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                Export Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="pdf">PDF Document (Formatted with Charts & Stats)</option>
                <option value="csv">CSV (Raw Structured Data)</option>
                <option value="json">JSON (API & SIEM Integration)</option>
              </select>
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="aa-playbook-btn btn-waf"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Generating Report...' : 'Generate & Download Report'}
            </button>
          </div>
        </Card>

        {/* Card 2: Direct Telemetry & Audit Exports */}
        <Card className="reports-card">
          <div className="reports-card-header">
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>Direct Telemetry & Audit Exports</h3>
            <span className="aa-badge">RAW EXPORTS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={exportAlerts}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#00f5ff' }}>Export All Alerts (CSV)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Download complete attack history with risk levels and payload metadata</div>
              </div>
              <span className="aa-badge">CSV DUMP</span>
            </button>

            <button
              onClick={exportAuditLogs}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#10b981' }}>Export Audit Logs (CSV)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Export admin and user operational actions for compliance audits</div>
              </div>
              <span className="aa-badge" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>AUDIT TRAIL</span>
            </button>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#fff' }}>Weekly Data Maintenance</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8' }}>
              Archive the previous session's data (alerts, logs, stats) and log it for compliance. This will completely clear the active dashboard for a fresh start.
            </p>
            <button
              onClick={handleArchiveData}
              disabled={loading}
              className="aa-playbook-btn"
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
              }}
            >
              {loading ? 'Archiving...' : 'Archive Weekly Data & Refresh Dashboard'}
            </button>
          </div>
        </Card>
      </div>

      {/* ROW 2: SEPARATE ROW - Generated Reports History (With Expand/Collapse) */}
      <Card className="reports-history-card">
        <div className="reports-card-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>Generated Reports History</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Showing {displayedReports.length} of {reportHistory.length} reports</span>
          </div>

          {reportHistory.length > 3 && (
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              className="reports-toggle-btn"
            >
              {isExpanded ? 'Collapse History ▲' : `Expand to View All (${reportHistory.length}) ▼`}
            </button>
          )}
        </div>

        {reportHistory.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 0' }}>No reports generated yet</p>
        ) : (
          <div className="reports-list">
            {displayedReports.map((report) => (
              <div key={report.id} className="report-item-card">
                <div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '14px' }}>{report.title}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Type: <strong style={{ color: '#00f5ff' }}>{report.report_type}</strong> • Format: <strong style={{ color: '#fbbf24' }}>{report.format.toUpperCase()}</strong> • Size: {report.size} • Created: {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={generateReport}
                  className="range-btn"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  Download Again
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
