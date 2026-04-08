import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { getRequest } from '../api';

const GeoTracker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoData, setGeoData] = useState({
    attacks: [],
    heatmap: [],
    countries: [],
    selectedCountry: null
  });

  // Mock data for development
  const mockData = {
    attacks: [
      {
        id: 1,
        ip: '192.168.1.100',
        country: 'US',
        city: 'New York',
        lat: 40.7128,
        lng: -74.0060,
        type: 'DDoS',
        severity: 'high',
        timestamp: '2024-01-15 14:32:15',
        target: 'Web Server',
        blocked: false
      },
      {
        id: 2,
        ip: '203.0.113.42',
        country: 'JP',
        city: 'Tokyo',
        lat: 35.6762,
        lng: 139.6503,
        type: 'SQL Injection',
        severity: 'medium',
        timestamp: '2024-01-15 14:28:42',
        target: 'Database',
        blocked: true
      },
      {
        id: 3,
        ip: '172.16.0.1',
        country: 'DE',
        city: 'Berlin',
        lat: 52.5200,
        lng: 13.4050,
        type: 'Port Scan',
        severity: 'low',
        timestamp: '2024-01-15 14:15:33',
        target: 'Firewall',
        blocked: false
      },
      {
        id: 4,
        ip: '198.51.100.42',
        country: 'RU',
        city: 'Moscow',
        lat: 55.7558,
        lng: 37.6173,
        type: 'Brute Force',
        severity: 'medium',
        timestamp: '2024-01-15 14:05:18',
        target: 'SSH Server',
        blocked: true
      },
      {
        id: 5,
        ip: '185.199.108.153',
        country: 'CN',
        city: 'Beijing',
        lat: 39.9042,
        lng: 116.4074,
        type: 'XSS',
        severity: 'medium',
        timestamp: '2024-01-15 13:45:22',
        target: 'Web Application',
        blocked: true
      },
    ],
    heatmap: [
      { country: 'US', attacks: 45, lat: 40.7128, lng: -74.0060 },
      { country: 'JP', attacks: 30, lat: 35.6762, lng: 139.6503 },
      { country: 'DE', attacks: 25, lat: 52.5200, lng: 13.4050 },
      { country: 'RU', attacks: 20, lat: 55.7558, lng: 37.6173 },
      { country: 'CN', attacks: 15, lat: 39.9042, lng: 116.4074 },
      { country: 'FR', attacks: 10, lat: 48.8566, lng: 2.3522 },
      { country: 'GB', attacks: 8, lat: 51.5074, lng: -0.1278 },
      { country: 'BR', attacks: 12, lat: -23.5505, lng: -46.6333 },
    ],
    countries: [
      { code: 'US', name: 'United States', attacks: 45, blocked: 12 },
      { code: 'JP', name: 'Japan', attacks: 30, blocked: 8 },
      { code: 'DE', name: 'Germany', attacks: 25, blocked: 15 },
      { code: 'RU', name: 'Russia', attacks: 20, blocked: 10 },
      { code: 'CN', name: 'China', attacks: 15, blocked: 7 },
      { code: 'FR', name: 'France', attacks: 10, blocked: 5 },
      { code: 'GB', name: 'United Kingdom', attacks: 8, blocked: 3 },
      { code: 'BR', name: 'Brazil', attacks: 12, blocked: 2 },
    ]
  };

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setGeoData(mockData);
      } catch (err) {
        setError(err.message || 'Failed to fetch geo data');
        console.error('Geo data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time geo data updates
      setGeoData(prev => ({
        ...prev,
        attacks: prev.attacks.map(attack => ({
          ...attack,
          timestamp: new Date().toLocaleString()
        })),
        heatmap: prev.heatmap.map(point => ({
          ...point,
          attacks: Math.max(0, point.attacks + (Math.random() - 0.5) * 2)
        }))
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refetch geo data
    setGeoData(mockData);
  };

  const handleCountryClick = (country) => {
    setGeoData(prev => ({
      ...prev,
      selectedCountry: country
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10';
      case 'low':
        return 'bg-blue-400/10';
      default:
        return 'bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Geo Tracker
          </h1>
          <p className="text-gray-400">
            Global threat intelligence with geographic visualization
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center space-x-2 p-3 glass-card rounded-lg hover:bg-white/10 transition-all"
        >
          <RefreshCw size={18} className="text-neon-blue" />
          <span className="text-sm text-gray-300">Refresh</span>
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Global Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-blue neon-text">
                {geoData.attacks.length}
              </div>
              <div className="text-sm text-gray-400">
                Total Attacks
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-red neon-text">
                {geoData.attacks.filter(a => a.severity === 'high').length}
              </div>
              <div className="text-sm text-gray-400">
                High Severity
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-yellow neon-text">
                {geoData.attacks.filter(a => a.severity === 'medium').length}
              </div>
              <div className="text-sm text-gray-400">
                Medium Severity
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Blocked Attacks
          </h3>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-green neon-text">
              {geoData.attacks.filter(a => a.blocked).length}
            </div>
            <div className="text-sm text-gray-400">
                Successfully Blocked
              </div>
            </div>
        </motion.div>
      </div>

      {/* World Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Global Attack Map
        </h3>
        
        <div className="relative h-96 bg-gray-800 rounded-lg overflow-hidden">
          {/* Simple world map visualization */}
          <svg className="w-full h-full" viewBox="0 0 800 400">
            {/* Map background */}
            <rect width="800" height="400" fill="#1a1a2a" />
            
            {/* Grid lines */}
            {[...Array(8)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 50}
                x2="800"
                y2={i * 50}
                stroke="#374151"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            
            {[...Array(16)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2="400"
                stroke="#374151"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            
            {/* Attack markers */}
            {geoData.attacks.map((attack, index) => {
              const x = ((parseFloat(attack.lng) + 180) % 360) / 360 * 800;
              const y = ((90 - parseFloat(attack.lat)) / 180) * 400;
              
              return (
                <g key={attack.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={attack.severity === 'high' ? '#ff3b3b' : 
                           attack.severity === 'medium' ? '#ffc857' : 
                           attack.severity === 'low' ? '#22ff88' : '#6b7280'}
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="8;12;8;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                  >
                    {attack.country}
                  </text>
                  
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8;1"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </motion.div>

      {/* Country Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Attack by Country
        </h3>
        
        <div className="space-y-3">
          {geoData.countries.map((country, index) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleCountryClick(country)}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-neon-blue">
                  {country.code}
                </div>
                <div className="text-sm text-gray-400">
                  {country.name}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-red-500">
                  {country.attacks}
                </div>
                <div className="text-sm text-gray-400">
                  attacks
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Selected Country Details */}
      {geoData.selectedCountry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card p-6 border-2 border-neon-blue/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {geoData.selectedCountry.name}
            </h3>
            <button
              onClick={() => setGeoData(prev => ({ ...prev, selectedCountry: null }))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Attacks</div>
              <div className="text-3xl font-bold text-neon-blue">
                {geoData.selectedCountry.attacks}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Blocked Attacks</div>
              <div className="text-3xl font-bold text-neon-green">
                {geoData.selectedCountry.blocked}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-2">Success Rate</div>
              <div className="text-3xl font-bold text-neon-green">
                {((geoData.selectedCountry.blocked / geoData.selectedCountry.attacks) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GeoTracker;
