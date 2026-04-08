import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  Brain, 
  Lock, 
  Globe, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Play, 
  Check,
  TrendingUp,
  Users,
  Eye,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { FeatureCard } from '../components/Card';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState([
    { value: '99.9%', label: 'Detection Accuracy' },
    { value: '24/7', label: 'Monitoring' },
    { value: '1M+', label: 'Threats Blocked' },
    { value: '150ms', label: 'Response Time' },
  ]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms analyze network patterns in real-time, identifying sophisticated threats before they cause damage.',
      color: 'info'
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Continuous surveillance of network traffic with instant alerts and detailed logging of all security events.',
      color: 'success'
    },
    {
      icon: Lock,
      title: 'Firewall Control',
      description: 'Intelligent firewall management with automated rule updates and custom security policies.',
      color: 'warning'
    },
    {
      icon: Globe,
      title: 'Geo-Tracking',
      description: 'Global threat intelligence with geographic visualization of attack origins and patterns.',
      color: 'info'
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Network Monitoring',
      description: 'Continuous surveillance of all incoming and outgoing network traffic patterns.',
      icon: Activity
    },
    {
      step: 2,
      title: 'Anomaly Detection',
      description: 'AI algorithms analyze traffic patterns to identify suspicious activities and potential threats.',
      icon: Brain
    },
    {
      step: 3,
      title: 'Threat Analysis',
      description: 'Advanced correlation engine examines multiple data points to determine threat severity.',
      icon: BarChart3
    },
    {
      step: 4,
      title: 'Instant Alerts',
      description: 'Real-time notifications sent to administrators with detailed threat information.',
      icon: Zap
    },
  ];

  const mockData = {
    traffic: [
      { time: '00:00', value: 45 },
      { time: '04:00', value: 52 },
      { time: '08:00', value: 38 },
      { time: '12:00', value: 65 },
      { time: '16:00', value: 48 },
      { time: '20:00', value: 42 },
    ],
    threats: [
      { type: 'DDoS', count: 45, color: '#ff3b3b' },
      { type: 'SQL Injection', count: 30, color: '#ffc857' },
      { type: 'XSS', count: 25, color: '#00f5ff' },
    ],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => ((prev + 1) % features.length));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Animated Background */}
      <div className="fixed inset-0 cyber-grid-bg opacity-20"></div>
      <div className="fixed inset-0">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0.8, 0.4, 0],
              scale: [1, 1.2, 0.8, 1],
              y: [0, -100, -200, -300, -400]
            }}
            transition={{ 
              duration: 10 + i * 2, 
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute w-1 h-1 bg-neon-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20"
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
              <Link
                to="/features"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                Pricing
              </Link>
            </div>

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
                <Link
                  to="/features"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg btn-secondary text-center mx-4"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 neon-text"
            >
              SecureNet IDS
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              AI-Powered Intrusion Detection System
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                to="/login"
                className="btn-primary group"
              >
                <span className="flex items-center space-x-2">
                  <Lock size={20} />
                  <span>Login</span>
                </span>
              </Link>
              
              <Link
                to="/signup"
                className="btn-secondary group"
              >
                <span className="flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Get Started</span>
                </span>
              </Link>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="glass-card p-4 text-center"
                >
                  <div className="text-3xl font-bold text-neon-green mb-2 neon-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              What is SecureNet IDS?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              SecureNet IDS is an advanced <span className="text-neon-blue font-semibold">Intrusion Detection System</span> that uses artificial intelligence to monitor, analyze, and protect your network infrastructure from cyber threats in real-time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-4">
                What We Do
              </h3>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-neon-blue">Real-time Monitoring:</strong> Continuous surveillance of all network traffic and activities.
                </p>
                <p>
                  <strong className="text-neon-green">AI Analysis:</strong> Machine learning algorithms identify patterns and anomalies.
                </p>
                <p>
                  <strong className="text-neon-yellow">Instant Alerts:</strong> Immediate notifications when threats are detected.
                </p>
                <p>
                  <strong className="text-neon-red">Automated Response:</strong> Intelligent threat mitigation and blocking.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-4">
                Why Choose SecureNet
              </h3>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-neon-blue">99.9% Accuracy:</strong> Industry-leading threat detection rate.
                </p>
                <p>
                  <strong className="text-neon-green">Sub-second Response:</strong> Lightning-fast threat identification and response.
                </p>
                <p>
                  <strong className="text-neon-yellow">Easy Integration:</strong> Works with existing infrastructure seamlessly.
                </p>
                <p>
                  <strong className="text-neon-red">24/7 Protection:</strong> Round-the-clock security monitoring and defense.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Advanced Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Cutting-edge capabilities that keep your network secure and your team informed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Our intelligent system follows a four-step process to ensure comprehensive network protection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-neon-blue/20 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-neon-blue">
                      {step.step}
                    </span>
                  </div>
                  <Icon size={32} className="text-neon-blue mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-300">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Live Dashboard Preview
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Experience the power of SecureNet IDS with our interactive dashboard preview.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mini Traffic Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Network Traffic
              </h3>
              <div className="h-48 cyber-grid-bg rounded-lg p-2 relative">
                {/* Animated Line */}
                <svg className="w-full h-full" viewBox="0 0 300 200">
                  <motion.path
                    d="M 0 100 Q 75 50 150 100 T 300 100"
                    stroke="#00f5ff"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute top-2 left-2 text-xs text-neon-blue">
                  Live
                </div>
              </div>
            </motion.div>

            {/* Mini Threat Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Threat Distribution
              </h3>
              <div className="space-y-3">
                {mockData.threats.map((threat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300">{threat.type}</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-32 h-2 bg-gray-600 rounded-full overflow-hidden"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(threat.count / 50) * 100}%` }}
                          transition={{ duration: 1.5, delay: 0.8 + index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: threat.color }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{threat.count}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              to="/signup"
              className="btn-primary group text-lg px-8 py-4"
            >
              <span className="flex items-center space-x-3">
                <Play size={24} />
                <span>Start Securing Your Network Today</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card border-t border-white/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400">
              © 2024 SecureNet IDS. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-neon-blue transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-neon-blue transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
