import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings,
  Activity,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Shield, public: true },
    { name: 'Features', path: '/features', icon: Activity, public: true },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, public: false },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle, public: false },
    { name: 'Network Monitor', path: '/network-monitor', icon: Activity, public: false },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.public || isAuthenticated
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-card border-b border-white/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Shield 
                size={32} 
                className="text-neon-blue neon-text" 
              />
            </motion.div>
            <span className="text-xl font-bold text-white group-hover:text-neon-blue transition-colors">
              SecureNet IDS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <div className="hidden md:flex items-center space-x-2">
                  <User size={16} className="text-gray-300" />
                  <span className="text-sm text-gray-300">
                    {user?.name || 'User'}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>

                {/* User Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to="/settings"
                    className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Settings size={18} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="btn-secondary text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 glass-card border-t border-white/20"
            >
              <div className="py-4 space-y-2">
                {filteredNavItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        location.pathname === item.path
                          ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}

                {!isAuthenticated && (
                  <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center btn-primary mx-4"
                    >
                      Get Started
                    </Link>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <div className="px-4 py-3 flex items-center space-x-3">
                      <User size={18} className="text-gray-300" />
                      <div>
                        <div className="text-sm text-white">
                          {user?.name || 'User'}
                        </div>
                        {user?.role === 'admin' && (
                          <div className="text-xs text-neon-blue">Administrator</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all flex items-center space-x-3"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
