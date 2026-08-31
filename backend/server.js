// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import logsRoutes from './routes/logsRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SecureNet IDS Backend API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      logs: '/api/logs',
      alerts: '/api/alerts',
      traffic: '/api/traffic'
    }
  });
});

// API Routes
app.use('/api/logs', logsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/traffic', trafficRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n===================================`);
  console.log(`   SecureNet IDS Backend Server`);
  console.log(`===================================`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /api/logs      - Get all logs`);
  console.log(`  POST /api/logs      - Add new log`);
  console.log(`  GET  /api/alerts    - Get all alerts`);
  console.log(`  POST /api/alerts    - Add new alert`);
  console.log(`  GET  /api/traffic   - Get all traffic data`);
  console.log(`  POST /api/traffic   - Add new traffic entry`);
  console.log(`===================================`);
});
