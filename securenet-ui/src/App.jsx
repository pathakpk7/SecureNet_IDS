import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import NetworkMonitor from './pages/NetworkMonitor';
import AttackAnalysis from './pages/AttackAnalysis';
import Logs from './pages/Logs';
import AIInsights from './pages/AIInsights';
import GeoTracker from './pages/GeoTracker';
import Firewall from './pages/Firewall';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Simulation from './pages/Simulation';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isAuthenticated={true}
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        <Navbar
          isAuthenticated={true}
          user={user}
          onLogout={onLogout}
        />
        
        <main className="flex-1 bg-bg-primary">
          <div className="container mx-auto px-4 py-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

// Public layout wrapper
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar isAuthenticated={false} />
    
    <main className="flex-1">
      <PageTransition>
        {children}
      </PageTransition>
    </main>
    
    <Footer />
  </div>
);

const App = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Landing />
                </PublicLayout>
              }
            />
            
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />
            
            <Route
              path="/signup"
              element={
                <PublicLayout>
                  <Signup />
                </PublicLayout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Dashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Alerts />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/network-monitor"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <NetworkMonitor />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/attack-analysis"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <AttackAnalysis />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/logs"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Logs />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/ai-insights"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <AIInsights />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/geo-tracker"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <GeoTracker />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/firewall"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Firewall />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Reports />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Notifications />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/simulation"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Simulation />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/integrations"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Integrations />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <Settings />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AuthenticatedLayout user={user}>
                    <UserProfile />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute 
                  isAuthenticated={isAuthenticated} 
                  requiredRole="admin"
                >
                  <AuthenticatedLayout user={user}>
                    <AdminPanel />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route
              path="*"
              element={
                <Navigate 
                  to={isAuthenticated ? "/dashboard" : "/"} 
                  replace 
                />
              }
            />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
};

export default App;
