import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Filter, RefreshCw, Terminal } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);
  const logsEndRef = React.useRef(null);

  // Mock log data
  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:32:15',
      level: 'ERROR',
      source: 'firewall',
      message: 'DDoS attack blocked from IP 192.168.1.100',
      details: {
        rule: 'BLOCK_DDoS',
        action: 'BLOCK',
        ip: '192.168.1.100',
        port: 80,
        protocol: 'TCP'
      }
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:31:22',
      level: 'WARNING',
      source: 'ids',
      message: 'Suspicious SQL injection pattern detected',
      details: {
        pattern: 'UNION SELECT',
        confidence: 0.75,
        user_agent: 'sqlmap/1.0'
      }
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:30:45',
      level: 'INFO',
      source: 'auth',
      message: 'User login successful: admin@securenet.com',
      details: {
        user_id: 'admin_001',
        ip: '192.168.1.50',
        session_id: 'sess_abc123'
      }
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:32:08',
      level: 'DEBUG',
      source: 'system',
      message: 'Network scan completed: 192.168.1.0/24 - 254 ports scanned',
      details: {
        scan_type: 'port_scan',
        duration: '2.3s',
        open_ports: 23,
        closed_ports: 231
      }
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:33:15',
      level: 'ERROR',
      source: 'webapp',
      message: 'XSS attack attempt blocked',
      details: {
        attack_vector: 'reflected_xss',
        payload: '<script>alert("xss")</script>',
        blocked: true,
        referer: 'http://evil.com'
      }
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:34:52',
      level: 'CRITICAL',
      source: 'database',
      message: 'Database connection failed: Connection timeout',
      details: {
        error_code: 'CONNECTION_TIMEOUT',
        retry_count: 3,
        last_attempt: '2024-01-15 14:34:50'
      }
    }
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLogs(mockLogs);
        setFilteredLogs(mockLogs);
      } catch (err) {
        console.error('Logs fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Auto-scroll to bottom
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // Filter logs based on search and level
    const filtered = logs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
      
      return matchesSearch && matchesLevel;
    });
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLevelFilter = (level) => {
    setLevelFilter(level);
  };

  const handleExport = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level}] ${log.source}: ${log.message}`
    ).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securenet_logs_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    // Refetch logs
    setLogs(mockLogs);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-500';
      case 'ERROR':
        return 'text-red-400';
      case 'WARNING':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-400';
      case 'DEBUG':
        return 'text-gray-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLevelBg = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/10';
      case 'ERROR':
        return 'bg-red-400/10';
      case 'WARNING':
        return 'bg-yellow-500/10';
      case 'INFO':
        return 'bg-blue-400/10';
      case 'DEBUG':
        return 'bg-gray-400/10';
      default:
        return 'bg-gray-300/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            System Logs
          </h1>
          <p className="text-gray-400">
            Real-time system events and security logs
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearch}
              className="input-field pl-10 pr-4 w-64"
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={levelFilter}
              onChange={(e) => handleLevelFilter(e.target.value)}
              className="input-field pl-10 pr-4 appearance-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              autoScroll 
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' 
                : 'bg-gray-600/10 text-gray-300 border border-gray-600/30'
            }`}
          >
            <Terminal size={16} />
            <span className="text-sm">Auto-scroll</span>
          </button>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw size={18} />
            </button>
            
            <button
              onClick={handleExport}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Log Viewer */}
      <div className="glass-card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-blue border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Log Count */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-600/10 rounded-lg">
              <span className="text-sm text-gray-300">
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
              <span className="text-xs text-gray-400">
                {levelFilter !== 'all' && `(${levelFilter} level)`}
              </span>
            </div>

            {/* Terminal-style Log Display */}
            <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="mb-2"
                >
                  <div className="flex items-start space-x-4">
                    {/* Timestamp */}
                    <span className="text-gray-500 min-w-[200px]">
                      {log.timestamp}
                    </span>
                    
                    {/* Level */}
                    <span className={`min-w-[80px] font-semibold ${getLevelColor(log.level)}`}>
                      [{log.level}]
                    </span>
                    
                    {/* Source */}
                    <span className="text-blue-400 min-w-[120px]">
                      {log.source}
                    </span>
                    
                    {/* Message */}
                    <span className="text-gray-300 flex-1">
                      {log.message}
                    </span>
                  </div>

                  {/* Details */}
                  {log.details && (
                    <div className="ml-4 text-gray-500 text-xs">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key}>
                          {key}: {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Auto-scroll indicator */}
            {autoScroll && (
              <div className="text-center py-2 text-gray-400 text-sm">
                <Terminal size={16} className="inline mr-2" />
                Auto-scrolling to new logs...
              </div>
            )}
          </div>
        )}
        
        {/* Scroll to bottom indicator */}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default Logs;
