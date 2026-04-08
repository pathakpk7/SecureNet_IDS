import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Activity, 
  Shield, 
  BarChart3, 
  FileText, 
  Brain, 
  Globe, 
  Lock, 
  Bell, 
  Play, 
  Plug, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Database,
  Users
} from 'lucide-react';

const Sidebar = ({ isAuthenticated, user, onLogout, isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const menuSections = [
    {
      title: 'Main',
      icon: LayoutDashboard,
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
        { name: 'Network Monitor', path: '/network-monitor', icon: Activity },
      ]
    },
    {
      title: 'Analysis',
      icon: BarChart3,
      items: [
        { name: 'Attack Analysis', path: '/attack-analysis', icon: BarChart3 },
        { name: 'System Logs', path: '/logs', icon: FileText },
        { name: 'AI Insights', path: '/ai-insights', icon: Brain },
        { name: 'Geo Tracker', path: '/geo-tracker', icon: Globe },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { name: 'Firewall', path: '/firewall', icon: Lock },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ]
    },
    {
      title: 'Tools',
      icon: Play,
      items: [
        { name: 'Attack Simulation', path: '/simulation', icon: Play },
        { name: 'Integrations', path: '/integrations', icon: Plug },
      ]
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full w-64 glass-card border-r border-white/20 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-neon-blue" />
              </div>
              <div>
                <h3 className="text-white font-semibold">SecureNet</h3>
                <p className="text-xs text-gray-400">IDS Control Panel</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neon-blue/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-neon-blue" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    user.role === 'admin' 
                      ? 'bg-neon-blue/20 text-neon-blue' 
                      : 'bg-neon-green/20 text-neon-green'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6">
              {menuSections.map((section, sectionIndex) => {
                const Icon = section.icon;
                return (
                  <div key={sectionIndex}>
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSections[section.title] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedSections[section.title] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-1 pl-9">
                            {section.items.map((item, itemIndex) => {
                              const ItemIcon = item.icon;
                              const active = isActive(item.path);
                              return (
                                <Link
                                  key={itemIndex}
                                  to={item.path}
                                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                                    active
                                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  <ItemIcon size={16} />
                                  <span className="text-sm font-medium">{item.name}</span>
                                  {active && (
                                    <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Panel Link */}
          {isAuthenticated && user?.role === 'admin' && (
            <div className="p-4 border-t border-white/10">
              <Link
                to="/admin"
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive('/admin')
                    ? 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                    : 'text-gray-300 hover:text-red-400 hover:bg-red-400/10'
                }`}
              >
                <Users size={18} />
                <Database size={16} />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              to="/settings"
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                isActive('/settings')
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings size={18} />
              <span className="font-medium">Settings</span>
            </Link>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="md:hidden fixed top-4 left-4 z-50 p-3 glass-card rounded-lg"
        >
          <Menu size={20} className="text-white" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
