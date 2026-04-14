import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Import pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Alerts from '../pages/Alerts';
import NetworkMonitor from '../pages/NetworkMonitor';
import AttackAnalysis from '../pages/AttackAnalysis';
import AIInsights from '../pages/AIInsights';
import Logs from '../pages/Logs';
import Reports from '../pages/Reports';
import AdminPanel from '../pages/AdminPanel';
import UserProfile from '../pages/UserProfile';
import Notifications from '../pages/Notifications';
import Simulation from '../pages/Simulation';
import Integrations from '../pages/Integrations';
import Settings from '../pages/Settings';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
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
        path="/logs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Logs />
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
        path="/user-profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
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
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
