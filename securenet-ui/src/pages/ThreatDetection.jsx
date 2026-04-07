import React, { useState } from 'react';
import { FiServer, FiMail, FiShield, FiAlertTriangle, FiActivity, FiEye } from 'react-icons/fi';

const ThreatDetection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const threatTypes = [
    {
      id: 'ddos',
      icon: FiServer,
      title: 'DDoS Attacks',
      description: 'Distributed Denial of Service attacks detected',
      risk: 'HIGH',
      count: 47,
      trend: '+12%',
      details: {
        lastDetected: '2 min ago',
        sourceIPs: '23 unique sources',
        targetPorts: '80, 443, 8080',
        severity: '8.5/10'
      }
    },
    {
      id: 'phishing',
      icon: FiMail,
      title: 'Phishing Attempts',
      description: 'Email and website phishing campaigns',
      risk: 'MEDIUM',
      count: 15,
      trend: '+3%',
      details: {
        lastDetected: '15 min ago',
        blockedEmails: '142',
        maliciousURLs: '8 domains',
        severity: '6.2/10'
      }
    },
    {
      id: 'malware',
      icon: FiShield,
      title: 'Malware Detection',
      description: 'Virus, trojan, and ransomware threats',
      risk: 'CRITICAL',
      count: 3,
      trend: '0%',
      details: {
        lastDetected: '1 hour ago',
        quarantinedFiles: '7',
        signaturesUpdated: '2 min ago',
        severity: '9.8/10'
      }
    }
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return {
          bg: 'bg-neon-green/10',
          border: 'border-neon-green',
          text: 'text-neon-green',
          glow: 'shadow-neon-green/30',
          pulse: false
        };
      case 'MEDIUM':
        return {
          bg: 'bg-neon-yellow/10',
          border: 'border-neon-yellow',
          text: 'text-neon-yellow',
          glow: 'shadow-neon-yellow/30',
          pulse: false
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500',
          text: 'text-orange-500',
          glow: 'shadow-orange-500/30',
          pulse: false
        };
      case 'CRITICAL':
        return {
          bg: 'bg-neon-red/10',
          border: 'border-neon-red',
          text: 'text-neon-red',
          glow: 'shadow-neon-red/50',
          pulse: true
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500',
          text: 'text-gray-500',
          glow: 'shadow-gray-500/30',
          pulse: false
        };
    }
  };

  const getTrendColor = (trend) => {
    if (trend.startsWith('+')) return 'text-neon-red';
    if (trend.startsWith('-')) return 'text-neon-green';
    return 'text-gray-400';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Threat Detection Center</h1>
          <p className="text-gray-400">Real-time monitoring and analysis of security threats</p>
        </div>
        <div className="flex items-center space-x-2">
          <FiActivity className="text-neon-blue" size={20} />
          <span className="text-sm text-neon-blue">System Active</span>
        </div>
      </div>

      {/* Threat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {threatTypes.map((threat) => {
          const Icon = threat.icon;
          const riskColors = getRiskColor(threat.risk);
          const isHovered = hoveredCard === threat.id;
          
          return (
            <div
              key={threat.id}
              onMouseEnter={() => setHoveredCard(threat.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`
                glass-card p-6 relative overflow-hidden transition-all duration-300 cursor-pointer
                ${isHovered ? 'scale-105 -translate-y-2' : ''}
                ${riskColors.pulse && isHovered ? 'animate-pulse' : ''}
                shadow-lg hover:shadow-2xl hover:${riskColors.glow}
              `}
            >
              {/* Risk Badge */}
              <div className={`
                absolute top-4 right-4 px-3 py-1 rounded-full border text-xs font-bold
                ${riskColors.bg} ${riskColors.border} ${riskColors.text}
                ${riskColors.pulse ? 'animate-pulse' : ''}
              `}>
                {riskColors.pulse && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-neon-red/20"></div>
                )}
                {threat.risk}
              </div>

              {/* Icon and Title */}
              <div className="flex items-center space-x-4 mb-4">
                <div className={`
                  p-3 rounded-lg border transition-all duration-300
                  ${isHovered ? 'scale-110' : ''}
                  ${riskColors.bg} ${riskColors.border}
                `}>
                  <Icon 
                    size={24} 
                    className={`${riskColors.text} ${isHovered ? 'neon-text' : ''}`}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{threat.title}</h3>
                  <p className="text-sm text-gray-400">{threat.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-3xl font-bold ${riskColors.text} ${isHovered ? 'neon-text' : ''}`}>
                    {threat.count}
                  </span>
                  <span className="text-sm text-gray-400">threats</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${getTrendColor(threat.trend)}`}>
                    {threat.trend}
                  </span>
                  <p className="text-xs text-gray-500">24h trend</p>
                </div>
              </div>

              {/* Details */}
              <div className={`space-y-2 transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-70'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Last detected:</span>
                  <span className="text-white">{threat.details.lastDetected}</span>
                </div>
                
                {threat.id === 'ddos' && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Source IPs:</span>
                      <span className="text-white">{threat.details.sourceIPs}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Target ports:</span>
                      <span className="text-white">{threat.details.targetPorts}</span>
                    </div>
                  </>
                )}
                
                {threat.id === 'phishing' && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Blocked emails:</span>
                      <span className="text-white">{threat.details.blockedEmails}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Malicious URLs:</span>
                      <span className="text-white">{threat.details.maliciousURLs}</span>
                    </div>
                  </>
                )}
                
                {threat.id === 'malware' && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Quarantined:</span>
                      <span className="text-white">{threat.details.quarantinedFiles}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Signatures:</span>
                      <span className="text-white">{threat.details.signaturesUpdated}</span>
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-gray-400">Severity:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${riskColors.text.replace('text-', 'bg-')}`}
                        style={{ width: `${(parseFloat(threat.details.severity) / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold ${riskColors.text}`}>
                      {threat.details.severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Action */}
              {isHovered && (
                <div className="absolute bottom-4 right-4">
                  <button className={`
                    p-2 rounded-lg transition-all duration-300
                    ${riskColors.bg} ${riskColors.border} ${riskColors.text}
                    hover:scale-110 hover-glow
                  `}>
                    <FiEye size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Threat Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-green neon-text">LOW</div>
            <div className="text-sm text-gray-400">0 threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-yellow neon-text">MEDIUM</div>
            <div className="text-sm text-gray-400">15 threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500 neon-text">HIGH</div>
            <div className="text-sm text-gray-400">47 threats</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-red neon-text animate-pulse">CRITICAL</div>
            <div className="text-sm text-gray-400">3 threats</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetection;
