import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

/**
 * Enterprise Reports Page
 * High-performance security report generation and compliance data exports.
 */
const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('executive_summary');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [reportHistory, setReportHistory] = useState([
    {
      id: 'rep-01',
      title: 'Executive Security Threat Briefing',
      report_type: 'executive_summary',
      format: 'pdf',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      size: '6.8 KB'
    },
    {
      id: 'rep-02',
      title: 'Monthly Incident Audit Log Export',
      report_type: 'incident_summary',
      format: 'csv',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      size: '24.5 KB'
    }
  ]);

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

  return (
    <div className="reports-page p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Security Reports & Compliance</h1>
        <p className="text-gray-400">Generate executive summaries, export raw telemetry, and manage audit records</p>
      </div>

      {/* Report Generation Section */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📊</span> Generate Custom Security Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Template
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="executive_summary">Executive Summary (High-Level Overview)</option>
              <option value="threat_analysis">Threat Intelligence & Attack Analysis</option>
              <option value="network_performance">Network Throughput & Performance</option>
              <option value="compliance_audit">Security Compliance & Audit Trail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="pdf">PDF Document (Formatted with Charts & Stats)</option>
              <option value="csv">CSV (Raw Structured Data)</option>
              <option value="json">JSON (API & SIEM Integration)</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Generate & Download Report</span>
            </>
          )}
        </button>
      </Card>

      {/* Raw Data Exports */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>💾</span> Direct Telemetry & Audit Exports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportAlerts}
            className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all group text-left"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Export All Alerts (CSV)</div>
              <div className="text-xs text-gray-400 mt-1">Download complete attack history with risk levels and payload metadata</div>
            </div>
            <span className="text-cyan-400 text-xl group-hover:translate-x-1 transition-transform">⬇</span>
          </button>

          <button
            onClick={exportAuditLogs}
            className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all group text-left"
          >
            <div>
              <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Export Audit Logs (CSV)</div>
              <div className="text-xs text-gray-400 mt-1">Export admin and user operational actions for compliance audits</div>
            </div>
            <span className="text-cyan-400 text-xl group-hover:translate-x-1 transition-transform">⬇</span>
          </button>
        </div>
      </Card>

      {/* Report History */}
      <Card className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🕒</span> Generated Reports History
        </h2>
        
        {reportHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports generated yet</p>
        ) : (
          <div className="space-y-3">
            {reportHistory.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800/80 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{report.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Type: <strong className="text-cyan-400">{report.report_type}</strong> • Format: <strong className="text-yellow-400">{report.format.toUpperCase()}</strong> • Size: {report.size} • Created: {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={generateReport}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors border border-slate-700"
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
