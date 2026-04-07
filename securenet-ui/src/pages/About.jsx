import React from 'react';
import { FiCode, FiShield, FiUsers, FiGithub, FiMail, FiGlobe, FiAward, FiTarget, FiActivity } from 'react-icons/fi';

const About = () => {
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'Lead Security Engineer',
      avatar: 'AC',
      expertise: 'Threat Detection & ML'
    },
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      avatar: 'SJ',
      expertise: 'UI/UX & React'
    },
    {
      name: 'Michael Park',
      role: 'Backend Architect',
      avatar: 'MP',
      expertise: 'System Design & APIs'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Security Analyst',
      avatar: 'ER',
      expertise: 'Incident Response'
    }
  ];

  const techStack = [
    { name: 'React', icon: '⚛️', color: 'text-cyan-400' },
    { name: 'Vite', icon: '⚡', color: 'text-yellow-400' },
    { name: 'Tailwind CSS', icon: '🎨', color: 'text-blue-400' },
    { name: 'Node.js', icon: '🟢', color: 'text-green-400' },
    { name: 'Python', icon: '🐍', color: 'text-blue-500' },
    { name: 'TensorFlow', icon: '🧠', color: 'text-orange-400' }
  ];

  const features = [
    {
      icon: FiShield,
      title: 'Advanced Threat Detection',
      description: 'AI-powered real-time threat identification and prevention'
    },
    {
      icon: FiActivity,
      title: 'Live Monitoring',
      description: 'Continuous network traffic analysis and alerting'
    },
    {
      icon: FiTarget,
      title: 'Precision Targeting',
      description: 'Accurate threat classification with minimal false positives'
    },
    {
      icon: FiAward,
      title: 'Industry Certified',
      description: 'Compliant with international security standards'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <FiShield className="text-neon-blue" size={48} />
          <h1 className="text-4xl font-bold text-white neon-text text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            SecureNet IDS
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Advanced Intrusion Detection System providing real-time network security monitoring and threat intelligence
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
          <span>Version 2.4.1</span>
          <span>•</span>
          <span>Released April 2026</span>
        </div>
      </div>

      {/* Project Description */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FiCode className="text-neon-blue" size={24} />
          <h2 className="text-2xl font-semibold text-white">Project Overview</h2>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed mb-4">
            SecureNet IDS is a cutting-edge intrusion detection system designed to protect modern networks from sophisticated cyber threats. 
            Leveraging advanced machine learning algorithms and real-time data processing, our system provides comprehensive security monitoring 
            with minimal false positives and maximum detection accuracy.
          </p>
          
          <p className="text-gray-300 leading-relaxed mb-4">
            Built with a focus on performance and scalability, SecureNet IDS can monitor thousands of network connections simultaneously, 
            providing instant alerts and automated responses to potential security breaches. Our intuitive dashboard offers security professionals 
            the tools they need to effectively manage and respond to threats in real-time.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-blue neon-text mb-2">99.7%</div>
              <div className="text-sm text-gray-400">Detection Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green neon-text mb-2">&lt;100ms</div>
              <div className="text-sm text-gray-400">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-yellow neon-text mb-2">24/7</div>
              <div className="text-sm text-gray-400">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="glass-card p-6 hover-glow transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-neon-blue/20 rounded-lg border border-neon-blue/30">
                  <Icon size={24} className="text-neon-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technology Stack */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FiCode className="text-neon-green" size={24} />
          <h2 className="text-2xl font-semibold text-white">Technology Stack</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techStack.map((tech, index) => (
            <div key={index} className="text-center p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <div className={`text-3xl mb-2 ${tech.color}`}>{tech.icon}</div>
              <div className="text-sm text-white font-medium">{tech.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FiUsers className="text-neon-yellow" size={24} />
          <h2 className="text-2xl font-semibold text-white">Our Team</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-neon-blue to-neon-green rounded-full flex items-center justify-center mx-auto mb-4 neon-border">
                <span className="text-2xl font-bold text-black">{member.avatar}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-neon-blue text-sm mb-2">{member.role}</p>
              <p className="text-gray-400 text-xs">{member.expertise}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Links */}
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FiMail className="text-neon-blue" size={24} />
          <h2 className="text-2xl font-semibold text-white">Get in Touch</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="#" className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group">
            <FiGithub size={20} className="text-gray-400 group-hover:text-white" />
            <div>
              <div className="text-white font-medium">GitHub</div>
              <div className="text-gray-400 text-sm">View source code</div>
            </div>
          </a>
          
          <a href="#" className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group">
            <FiGlobe size={20} className="text-gray-400 group-hover:text-white" />
            <div>
              <div className="text-white font-medium">Website</div>
              <div className="text-gray-400 text-sm">securnet-ids.com</div>
            </div>
          </a>
          
          <a href="#" className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors group">
            <FiMail size={20} className="text-gray-400 group-hover:text-white" />
            <div>
              <div className="text-white font-medium">Contact</div>
              <div className="text-gray-400 text-sm">support@securnet-ids.com</div>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-white/10">
        <p className="text-gray-400 mb-2">
          © 2026 SecureNet IDS. All rights reserved.
        </p>
        <p className="text-sm text-gray-500">
          Protecting networks worldwide with advanced threat intelligence
        </p>
      </div>
    </div>
  );
};

export default About;
