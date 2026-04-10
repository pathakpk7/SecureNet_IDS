import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/reports.css';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const availableReports = [
    {
      id: 1,
      name: 'Security Assessment Report',
      description: 'Comprehensive security assessment with vulnerability analysis',
      type: 'security',
      size: '2.4MB',
      generated: '2024-01-15 14:30:00',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Threat Intelligence Report',
      description: 'Latest threat intelligence and attack patterns analysis',
      type: 'threat',
      size: '1.8MB',
      generated: '2024-01-15 12:15:00',
      format: 'PDF'
    },
    {
      id: 3,
      name: 'Network Traffic Analysis',
      description: 'Detailed network traffic patterns and anomalies',
      type: 'network',
      size: '3.2MB',
      generated: '2024-01-15 10:45:00',
      format: 'CSV'
    },
    {
      id: 4,
      name: 'Incident Response Report',
      description: 'Summary of security incidents and response actions',
      type: 'incident',
      size: '1.5MB',
      generated: '2024-01-15 09:20:00',
      format: 'PDF'
    },
    {
      id: 5,
      name: 'Compliance Audit Report',
      description: 'Regulatory compliance and audit findings',
      type: 'compliance',
      size: '2.1MB',
      generated: '2024-01-14 16:30:00',
      format: 'PDF'
    },
    {
      id: 6,
      name: 'System Performance Report',
      description: 'IDS system performance and resource utilization',
      type: 'performance',
      size: '890KB',
      generated: '2024-01-14 14:00:00',
      format: 'XLSX'
    }
  ];

  const summaryStats = {
    totalReports: availableReports.length,
    thisWeek: 4,
    lastGenerated: '2 hours ago',
    totalSize: '11.9MB'
  };

  const getReportIcon = (type) => {
    switch(type) {
      case 'security': return 'security';
      case 'threat': return 'warning';
      case 'network': return 'network';
      case 'incident': return 'error';
      case 'compliance': return 'assessment';
      case 'performance': return 'speed';
      default: return 'description';
    }
  };

  const getReportColor = (type) => {
    switch(type) {
      case 'security': return '#ff3366';
      case 'threat': return '#ffaa00';
      case 'network': return '#00f5ff';
      case 'incident': return '#ff3366';
      case 'compliance': return '#00f5ff';
      case 'performance': return '#00f5ff';
      default: return '#666';
    }
  };

  const handleDownload = (reportId) => {
    console.log(`Downloading report ${reportId}`);
    // In a real app, this would trigger a download
  };

  const handleGenerateReport = (type) => {
    console.log(`Generating ${type} report`);
    // In a real app, this would trigger report generation
  };

  return (
    <div className="reports-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Security reports and analytics dashboard</p>
      </div>

      <div className="reports-summary">
        <Card className="summary-card">
          <div className="summary-content">
            <span className="summary-value">{summaryStats.totalReports}</span>
            <span className="summary-label">Total Reports</span>
          </div>
        </Card>
        <Card className="summary-card">
          <div className="summary-content">
            <span className="summary-value">{summaryStats.thisWeek}</span>
            <span className="summary-label">This Week</span>
          </div>
        </Card>
        <Card className="summary-card">
          <div className="summary-content">
            <span className="summary-value">{summaryStats.lastGenerated}</span>
            <span className="summary-label">Last Generated</span>
          </div>
        </Card>
        <Card className="summary-card">
          <div className="summary-content">
            <span className="summary-value">{summaryStats.totalSize}</span>
            <span className="summary-label">Total Size</span>
          </div>
        </Card>
      </div>

      <div className="reports-actions">
        <Card className="actions-card">
          <h3>Generate New Report</h3>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => handleGenerateReport('security')}
            >
              Security Assessment
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleGenerateReport('threat')}
            >
              Threat Intelligence
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleGenerateReport('network')}
            >
              Network Analysis
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleGenerateReport('incident')}
            >
              Incident Report
            </button>
          </div>
        </Card>
      </div>

      <Card className="reports-table-card">
        <div className="table-header">
          <h3>Available Reports</h3>
          <div className="table-actions">
            <button className="btn btn-outline">Refresh</button>
            <button className="btn btn-outline">Archive</button>
          </div>
        </div>
        <div className="reports-list">
          {availableReports.map((report) => (
            <div key={report.id} className="report-item">
              <div className="report-info">
                <div className="report-header">
                  <span 
                    className="report-icon"
                    style={{ color: getReportColor(report.type) }}
                  >
                    {getReportIcon(report.type)}
                  </span>
                  <div className="report-details">
                    <h4 className="report-name">{report.name}</h4>
                    <p className="report-description">{report.description}</p>
                  </div>
                </div>
                <div className="report-meta">
                  <span className="report-type">{report.type.toUpperCase()}</span>
                  <span className="report-size">{report.size}</span>
                  <span className="report-format">{report.format}</span>
                  <span className="report-generated">{report.generated}</span>
                </div>
              </div>
              <div className="report-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setSelectedReport(report)}
                >
                  View
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleDownload(report.id)}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {selectedReport && (
        <Card className="report-preview-card">
          <div className="preview-header">
            <h3>Report Preview: {selectedReport.name}</h3>
            <button 
              className="btn btn-outline"
              onClick={() => setSelectedReport(null)}
            >
              Close
            </button>
          </div>
          <div className="preview-content">
            <div className="preview-info">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">{selectedReport.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Format:</span>
                <span className="info-value">{selectedReport.format}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Size:</span>
                <span className="info-value">{selectedReport.size}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Generated:</span>
                <span className="info-value">{selectedReport.generated}</span>
              </div>
            </div>
            <div className="preview-description">
              <h4>Report Summary</h4>
              <p>{selectedReport.description}</p>
              <div className="preview-placeholder">
                <div className="placeholder-content">
                  <span className="placeholder-icon">description</span>
                  <p>Report preview would be displayed here</p>
                  <small>This is a placeholder for the actual report content</small>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="schedule-card">
        <h3>Automated Reports</h3>
        <div className="schedule-list">
          <div className="schedule-item">
            <div className="schedule-info">
              <span className="schedule-name">Daily Security Report</span>
              <span className="schedule-time">Every day at 08:00</span>
            </div>
            <div className="schedule-status">
              <span className="status-badge active">Active</span>
            </div>
          </div>
          <div className="schedule-item">
            <div className="schedule-info">
              <span className="schedule-name">Weekly Threat Analysis</span>
              <span className="schedule-time">Every Monday at 09:00</span>
            </div>
            <div className="schedule-status">
              <span className="status-badge active">Active</span>
            </div>
          </div>
          <div className="schedule-item">
            <div className="schedule-info">
              <span className="schedule-name">Monthly Compliance Report</span>
              <span className="schedule-time">1st of each month at 10:00</span>
            </div>
            <div className="schedule-status">
              <span className="status-badge active">Active</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
