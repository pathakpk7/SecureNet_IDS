import React, { useMemo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const PieChart = ({ 
  data = [], 
  title, 
  subtitle,
  height = 300,
  colors = ['#00f5ff', '#22ff88', '#ffc857', '#ff3b3b'],
  className = '' 
}) => {
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  }, [data, colors]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-sm text-white font-medium mb-1">
            {payload[0].name}
          </p>
          <p className="text-lg text-neon-blue font-semibold">
            {payload[0].value}
          </p>
          <p className="text-xs text-gray-400">
            {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
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
          <RechartsPieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '12px',
                color: '#9ca3af'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Specialized chart components
export const ProtocolChart = ({ data = [] }) => (
  <PieChart
    title="Protocol Distribution"
    subtitle="Network protocols analysis"
    data={[
      { name: 'HTTP', value: 45, percentage: 45 },
      { name: 'HTTPS', value: 30, percentage: 30 },
      { name: 'FTP', value: 15, percentage: 15 },
      { name: 'SSH', value: 10, percentage: 10 }
    ]}
    height={300}
    colors={['#00f5ff', '#22ff88', '#ffc857', '#ff3b3b']}
  />
);

export const AttackTypeChart = ({ data = [] }) => (
  <PieChart
    title="Attack Types"
    subtitle="Distribution of security threats"
    data={[
      { name: 'DDoS', value: 35, percentage: 35 },
      { name: 'SQL Injection', value: 25, percentage: 25 },
      { name: 'XSS', value: 20, percentage: 20 },
      { name: 'Brute Force', value: 15, percentage: 15 },
      { name: 'Port Scan', value: 5, percentage: 5 }
    ]}
    height={300}
    colors={['#ff3b3b', '#ffc857', '#00f5ff', '#22ff88']}
  />
);

export const SeverityChart = ({ data = [] }) => (
  <PieChart
    title="Alert Severity"
    subtitle="Security alert classification"
    data={[
      { name: 'High', value: 15, percentage: 15 },
      { name: 'Medium', value: 35, percentage: 35 },
      { name: 'Low', value: 50, percentage: 50 }
    ]}
    height={300}
    colors={['#ff3b3b', '#ffc857', '#22ff88']}
  />
);

export default PieChart;
