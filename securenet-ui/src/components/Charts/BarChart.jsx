import React, { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const BarChart = ({ 
  data = [], 
  title, 
  subtitle,
  bars = [],
  height = 300,
  color = '#00f5ff',
  gridColor = 'rgba(0, 245, 255, 0.1)',
  className = '' 
}) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      name: item.name || item.type || item.category
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-neon-blue/30">
          <p className="text-sm text-neon-blue font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-gray-300">
              <span 
                style={{ color: entry.color || color }}
                className="font-medium"
              >
                {entry.name}:
              </span>
              {' '}
              <span className="text-white font-semibold">
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card p-6 ${className}`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
      )}

      {/* Chart */}
      <div style={{ height }} className="cyber-grid-bg rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={processedData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor} 
            />
            <XAxis 
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                fill={bar.color || color}
                radius={[4, 4, 0, 0]}
                name={bar.name}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            {bars.length > 1 && (
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px'
                }}
                iconType="rect"
              />
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Specialized chart components
export const AttackBarChart = ({ data = [] }) => (
  <BarChart
    title="Attack Distribution"
    subtitle="Security threats by type"
    data={[
      { name: 'DDoS', value: 45 },
      { name: 'SQL Injection', value: 30 },
      { name: 'XSS', value: 25 },
      { name: 'Brute Force', value: 20 },
      { name: 'Port Scan', value: 15 }
    ]}
    height={300}
    bars={[
      {
        name: 'Attacks',
        dataKey: 'value',
        color: '#ff3b3b'
      }
    ]}
    gridColor="rgba(255, 59, 59, 0.1)"
  />
);

export const ProtocolBarChart = ({ data = [] }) => (
  <BarChart
    title="Protocol Usage"
    subtitle="Network traffic by protocol"
    data={[
      { name: 'HTTP', value: 120 },
      { name: 'HTTPS', value: 85 },
      { name: 'FTP', value: 45 },
      { name: 'SSH', value: 30 },
      { name: 'DNS', value: 25 }
    ]}
    height={300}
    bars={[
      {
        name: 'Requests',
        dataKey: 'value',
        color: '#00f5ff'
      }
    ]}
    gridColor="rgba(0, 245, 255, 0.1)"
  />
);

export const SeverityBarChart = ({ data = [] }) => (
  <BarChart
    title="Alert Severity"
    subtitle="Security alerts by severity level"
    data={[
      { name: 'High', value: 15 },
      { name: 'Medium', value: 35 },
      { name: 'Low', value: 50 }
    ]}
    height={300}
    bars={[
      {
        name: 'Alerts',
        dataKey: 'value',
        color: '#ffc857'
      }
    ]}
    gridColor="rgba(255, 200, 87, 0.1)"
  />
);

export const BandwidthChart = ({ data = [] }) => (
  <BarChart
    title="Bandwidth Usage"
    subtitle="Network bandwidth consumption"
    data={[
      { name: '00:00', value: 45 },
      { name: '04:00', value: 52 },
      { name: '08:00', value: 78 },
      { name: '12:00', value: 65 },
      { name: '16:00', value: 58 },
      { name: '20:00', value: 42 }
    ]}
    height={300}
    bars={[
      {
        name: 'Inbound',
        dataKey: 'inbound',
        color: '#22ff88'
      },
      {
        name: 'Outbound',
        dataKey: 'outbound',
        color: '#00f5ff'
      }
    ]}
    gridColor="rgba(0, 245, 255, 0.1)"
  />
);

export default BarChart;
