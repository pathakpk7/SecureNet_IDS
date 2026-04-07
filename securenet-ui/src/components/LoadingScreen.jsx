import React, { useState, useEffect, useMemo } from 'react';
import { FiShield, FiActivity, FiDatabase, FiCpu, FiWifi, FiCheck } from 'react-icons/fi';

const LoadingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const loadingSteps = useMemo(() => [
    { text: 'Initializing Security Modules...', icon: FiShield, duration: 1500 },
    { text: 'Loading Firewall Rules...', icon: FiDatabase, duration: 1200 },
    { text: 'Connecting AI Engine...', icon: FiCpu, duration: 1800 },
    { text: 'Scanning Network Interfaces...', icon: FiWifi, duration: 1400 },
    { text: 'Activating Threat Detection...', icon: FiActivity, duration: 1600 },
    { text: 'System Ready', icon: FiCheck, duration: 800 }
  ], []);

  const particles = useMemo(() => {
    const positions = [
      { left: '10%', top: '15%', delay: '0.5s', duration: '2.5s' },
      { left: '85%', top: '25%', delay: '1.2s', duration: '3.1s' },
      { left: '45%', top: '80%', delay: '0.8s', duration: '2.8s' },
      { left: '70%', top: '60%', delay: '1.5s', duration: '3.5s' },
      { left: '25%', top: '45%', delay: '0.3s', duration: '2.2s' },
      { left: '90%', top: '10%', delay: '1.8s', duration: '2.9s' },
      { left: '15%', top: '70%', delay: '0.7s', duration: '3.3s' },
      { left: '60%', top: '35%', delay: '1.1s', duration: '2.6s' },
      { left: '35%', top: '20%', delay: '0.9s', duration: '3.0s' },
      { left: '80%', top: '85%', delay: '1.4s', duration: '2.7s' },
      { left: '20%', top: '55%', delay: '0.6s', duration: '3.2s' },
      { left: '75%', top: '30%', delay: '1.3s', duration: '2.4s' },
      { left: '40%', top: '75%', delay: '0.4s', duration: '2.9s' },
      { left: '95%', top: '50%', delay: '1.7s', duration: '3.1s' },
      { left: '5%', top: '40%', delay: '0.2s', duration: '2.3s' },
      { left: '55%', top: '15%', delay: '1.0s', duration: '3.4s' },
      { left: '30%', top: '90%', delay: '0.8s', duration: '2.6s' },
      { left: '65%', top: '70%', delay: '1.6s', duration: '3.0s' },
      { left: '50%', top: '25%', delay: '0.5s', duration: '2.8s' },
      { left: '85%', top: '95%', delay: '1.9s', duration: '3.2s' }
    ];
    
    return positions.map((pos, i) => ({
      id: i,
      left: pos.left,
      top: pos.top,
      animationDelay: pos.delay,
      animationDuration: pos.duration
    }));
  }, []);

  useEffect(() => {
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    let currentProgress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      
      // Update step based on progress
      const stepProgress = (currentProgress / 100) * loadingSteps.length;
      stepIndex = Math.min(Math.floor(stepProgress), loadingSteps.length - 1);
      
      setCurrentStep(stepIndex);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onComplete();
          }, 500);
        }, 500);
      }
    }, totalDuration / 50);

    return () => clearInterval(interval);
  }, [onComplete, loadingSteps]);

  if (!isVisible) return null;

  const currentStepData = loadingSteps[currentStep];
  const CurrentIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center overflow-hidden">
      {/* Cyber Background */}
      <div className="absolute inset-0">
        <div className="cyber-grid opacity-20"></div>
        <div className="radial-glow opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Logo and Ring */}
        <div className="relative">
          {/* Rotating Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
            <div className="absolute w-32 h-32 border-4 border-neon-green/30 border-r-neon-green rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
            <div className="absolute w-32 h-32 border-4 border-neon-red/30 border-b-neon-red rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
          </div>

          {/* Center Logo */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-neon-blue to-neon-green rounded-full flex items-center justify-center neon-border animate-pulse">
              <FiShield size={48} className="text-black" />
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-neon-blue/20 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white neon-text animate-fade-in">
            SecureNet IDS
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Advanced Intrusion Detection System
          </p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Current Step */}
          <div className="flex items-center justify-center space-x-3 animate-fade-in">
            <CurrentIcon size={20} className="text-neon-blue" />
            <span className="text-white text-lg font-medium">{currentStepData.text}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-blue to-neon-green rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-white/30 animate-shimmer"></div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-neon-blue font-semibold">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {loadingSteps.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index <= currentStep 
                    ? 'bg-neon-blue neon-glow' 
                    : 'bg-gray-600'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="text-gray-500 text-sm space-y-1">
            <div>Version 2.4.1</div>
            <div>© 2026 SecureNet IDS</div>
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-neon-blue rounded-full animate-pulse"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
