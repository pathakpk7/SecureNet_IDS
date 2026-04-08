import React, { useMemo } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const LineChart = ({ 
  data = [], 
  title, 
  subtitle,
  lines = [],
  height = 300,
  color = '#00f5ff',
  gridColor = 'rgba(0, 245, 255, 0.1)',
  className = '' 
}) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleTimeString()
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
          <RechartsLineChart data={processedData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor} 
            />
            <XAxis 
              dataKey="timestamp"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#9ca3af' }}
            />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color || color}
                strokeWidth={2}
                dot={{ 
                  fill: line.color || color, 
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{ 
                  r: 6,
                  fill: line.color || color
                }}
                name={line.name}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            {lines.length > 1 && (
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px'
                }}
                iconType="line"
              />
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Specialized chart components
export const TrafficChart = ({ data = [] }) => (
  <LineChart
    title="Network Traffic"
    subtitle="Real-time traffic monitoring"
    data={data}
    height={300}
    lines={[
      {
        name: 'Inbound Traffic',
        dataKey: 'inbound',
        color: '#22ff88'
      },
      {
        name: 'Outbound Traffic',
        dataKey: 'outbound',
        color: '#00f5ff'
      }
    ]}
    gridColor="rgba(0, 245, 255, 0.1)"
  />
);

export const AttackChart = ({ data = [] }) => (
  <LineChart
    title="Attack Attempts"
    subtitle="Security threats detected over time"
    data={data}
    height={300}
    color="#ff3b3b"
    lines={[
      {
        name: 'Attack Attempts',
        dataKey: 'attacks',
        color: '#ff3b3b'
      }
    ]}
    gridColor="rgba(255, 59, 59, 0.1)"
  />
);

export const PerformanceChart = ({ data = [] }) => (
  <LineChart
    title="System Performance"
    subtitle="CPU and Memory usage"
    data={data}
    height={300}
    lines={[
      {
        name: 'CPU Usage',
        dataKey: 'cpu',
        color: '#ffc857'
      },
      {
        name: 'Memory Usage',
        dataKey: 'memory',
        color: '#00f5ff'
      }
    ]}
    gridColor="rgba(255, 200, 87, 0.1)"
  />
);

export default LineChart;
