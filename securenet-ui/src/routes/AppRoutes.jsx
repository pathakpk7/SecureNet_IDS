import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Import pages
import Landing from '../pages/Landing';
import CyberLanding from '../pages/CyberLanding';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import EnterpriseDashboard from '../pages/EnterpriseDashboard';
import Alerts from '../pages/Alerts';
import NetworkMonitor from '../pages/NetworkMonitor';
import AttackAnalysis from '../pages/AttackAnalysis';
import Logs from '../pages/Logs';
import AuditLogs from '../pages/AuditLogs';
import Reports from '../pages/Reports';
import SIEMExport from '../pages/SIEMExport';
import AdminPanel from '../pages/AdminPanel';
import EnhancedAdminPanel from '../pages/EnhancedAdminPanel';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import AIInsights from '../pages/AIInsights';
import Simulation from '../pages/Simulation';
import Integrations from '../pages/Integrations';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CyberLanding />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Core Dashboards & Monitoring */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enterprise-dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EnterpriseDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Alerts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/network-monitor"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NetworkMonitor />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Logs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Analysis & Intelligence */}
        <Route
          path="/attack-analysis"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AttackAnalysis />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AIInsights />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Tools & Simulations */}
        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Simulation />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Integrations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Center */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AdminPanel />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enhanced-admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <EnhancedAdminPanel />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <AuditLogs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/siem-export"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <SIEMExport />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Profile & User Management */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user_profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings & Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
