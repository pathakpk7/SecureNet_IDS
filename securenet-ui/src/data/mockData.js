export const threats = [
  {
    id: 1,
    type: 'malware',
    severity: 'high',
    source: '192.168.1.105',
    timestamp: '2026-04-07T07:45:00Z',
    status: 'blocked',
    description: 'Suspicious executable detected'
  },
  {
    id: 2,
    type: 'phishing',
    severity: 'medium',
    source: 'external-email',
    timestamp: '2026-04-07T07:30:00Z',
    status: 'quarantined',
    description: 'Phishing email attempt blocked'
  },
  {
    id: 3,
    type: 'brute-force',
    severity: 'low',
    source: '10.0.0.15',
    timestamp: '2026-04-07T07:15:00Z',
    status: 'monitoring',
    description: 'Multiple failed login attempts'
  }
];

export const networkStats = {
  totalPackets: 2847,
  blockedPackets: 12,
  activeConnections: 156,
  bandwidthUsage: 67.8,
  topPorts: [
    { port: 443, traffic: 34.2, protocol: 'HTTPS' },
    { port: 80, traffic: 28.1, protocol: 'HTTP' },
    { port: 22, traffic: 15.7, protocol: 'SSH' },
    { port: 53, traffic: 12.3, protocol: 'DNS' }
  ]
};

export const systemHealth = {
  cpu: 45.2,
  memory: 62.8,
  disk: 78.1,
  network: 23.4,
  uptime: '15 days, 7 hours',
  lastScan: '2026-04-07T07:47:00Z'
};
