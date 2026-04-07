import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchFocus, setSearchFocus] = useState(false);
  const [notificationCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-16 bg-bg-secondary/80 backdrop-blur-xl border-b border-neon-blue/20 glass-card relative">
      {/* Subtle bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent animate-pulse"></div>
      
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Section - Project Name */}
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold neon-text text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            SecureNet IDS
          </h1>
          
          {/* Real-time Clock */}
          <div className="hidden md:flex flex-col">
            <span className="text-sm text-neon-blue font-mono neon-text">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(currentTime)}
            </span>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <div className={`
              absolute inset-0 rounded-lg transition-all duration-300
              ${searchFocus 
                ? 'shadow-lg shadow-neon-blue/50 ring-2 ring-neon-blue/50' 
                : 'shadow-md'
              }
            `}></div>
            
            <FiSearch 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
              size={18}
            />
            
            <input
              type="text"
              placeholder="Search threats, logs, systems..."
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className={`
                w-full pl-10 pr-4 py-2 bg-bg-primary/50 border border-neon-blue/30 
                rounded-lg text-white placeholder-gray-500 outline-none transition-all duration-300
                hover:bg-bg-primary/70 focus:bg-bg-primary/90 focus:border-neon-blue/60
                backdrop-blur-sm relative z-10
              `}
            />
          </div>
        </div>

        {/* Right Section - Notifications & User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover-glow group">
              <FiBell 
                size={20} 
                className="text-gray-300 group-hover:text-neon-blue transition-colors" 
              />
              
              {/* Notification Badge */}
              {notificationCount > 0 && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-red rounded-full animate-pulse shadow-lg shadow-neon-red/50"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-red rounded-full animate-ping"></div>
                </>
              )}
            </button>
            
            {/* Notification Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-primary/95 backdrop-blur-xl border border-neon-blue/30 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="text-xs text-white">
                <div className="font-semibold text-neon-red mb-1">New Alerts</div>
                <div className="text-gray-400">3 security notifications</div>
              </div>
            </div>
          </div>

          {/* User Avatar */}
          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover-glow">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-green rounded-full flex items-center justify-center neon-border">
                <FiUser size={16} className="text-black" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">Admin</div>
                <div className="text-xs text-neon-green">Online</div>
              </div>
            </button>
            
            {/* User Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-bg-primary/95 backdrop-blur-xl border border-neon-blue/30 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="text-xs text-white space-y-1">
                <div className="font-semibold">System Administrator</div>
                <div className="text-gray-400">admin@securenet.local</div>
                <div className="pt-2 border-t border-gray-600">
                  <div className="text-neon-green">● Active Session</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
