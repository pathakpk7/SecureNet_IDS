import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Activity, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Zap,
  Target,
  Globe,
  Lock,
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Simulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('ddos');
  const [simulationResults, setSimulationResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const scenarios = [
    {
      id: 'ddos',
      name: 'DDoS Attack',
      description: 'Simulate distributed denial of service attack',
      icon: Globe,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      id: 'sql',
      name: 'SQL Injection',
      description: 'Test SQL injection vulnerability detection',
      icon: Database,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'xss',
      name: 'XSS Attack',
      description: 'Cross-site scripting attack simulation',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'malware',
      name: 'Malware Detection',
      description: 'Simulate malware infiltration attempt',
      icon: Shield,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    }
  ];

  const [simulationConfig, setSimulationConfig] = useState({
    intensity: 50,
    duration: 60,
    targetSystem: 'web-server',
    defenseLevel: 'high'
  });

  useEffect(() => {
    let interval;
    if (isRunning && simulationTime < simulationConfig.duration) {
      interval = setInterval(() => {
        setSimulationTime(prev => prev + 1);
      }, 1000);
    } else if (simulationTime >= simulationConfig.duration) {
      handleSimulationComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, simulationTime, simulationConfig.duration]);

  const handleStart = () => {
    setIsRunning(true);
    setSimulationTime(0);
    setSimulationResults(null);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    setSimulationResults(null);
  };

  const handleSimulationComplete = () => {
    setIsRunning(false);
    const results = {
      totalAttacks: Math.floor(Math.random() * 1000) + 500,
      blockedAttacks: Math.floor(Math.random() * 800) + 400,
      detectedThreats: Math.floor(Math.random() * 200) + 100,
      systemPerformance: Math.floor(Math.random() * 30) + 70,
      responseTime: Math.floor(Math.random() * 50) + 10,
      accuracy: Math.floor(Math.random() * 20) + 80
    };
    setSimulationResults(results);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScenarioIcon = (scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.icon : Activity;
  };

  const getScenarioColor = (scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    return scenario ? scenario.color : 'text-blue-400';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Attack Simulation</h1>
        <p className="text-gray-400">Test your IDS against various cyber attack scenarios</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Scenario Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Attack Scenario</h3>
            <div className="space-y-3">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <motion.button
                    key={scenario.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`w-full p-4 rounded-lg border transition-all ${
                      selectedScenario === scenario.id
                        ? `${scenario.bgColor} ${scenario.borderColor} border`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${scenario.color}`} />
                      <div className="text-left">
                        <div className={`font-medium ${selectedScenario === scenario.id ? 'text-white' : 'text-gray-300'}`}>
                          {scenario.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {scenario.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Simulation Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Controls</h3>
            
            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-3xl font-mono font-bold text-blue-400 mb-2">
                {formatTime(simulationTime)}
              </div>
              <div className="text-sm text-gray-400">
                Duration: {simulationConfig.duration}s
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                disabled={isRunning}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                  isRunning
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/50'
                }`}
              >
                <Play className="w-4 h-4" />
                Start
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                disabled={!isRunning}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                  !isRunning
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50'
                }`}
              >
                <Pause className="w-4 h-4" />
                Pause
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            </div>

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configuration
            </motion.button>
          </motion.div>

          {/* Configuration Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Intensity: {simulationConfig.intensity}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={simulationConfig.intensity}
                    onChange={(e) => setSimulationConfig(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration: {simulationConfig.duration}s
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="30"
                    value={simulationConfig.duration}
                    onChange={(e) => setSimulationConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target System
                  </label>
                  <select
                    value={simulationConfig.targetSystem}
                    onChange={(e) => setSimulationConfig(prev => ({ ...prev, targetSystem: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="web-server">Web Server</option>
                    <option value="database">Database</option>
                    <option value="network">Network Infrastructure</option>
                    <option value="application">Application Layer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Defense Level
                  </label>
                  <select
                    value={simulationConfig.defenseLevel}
                    onChange={(e) => setSimulationConfig(prev => ({ ...prev, defenseLevel: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Simulation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Simulation Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Simulation Status</h3>
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400">Running</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-gray-400">Stopped</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round((simulationTime / simulationConfig.duration) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${(simulationTime / simulationConfig.duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Scenario Display */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              {(() => {
                const Icon = getScenarioIcon(selectedScenario);
                const color = getScenarioColor(selectedScenario);
                return (
                  <>
                    <Icon className={`w-8 h-8 ${color}`} />
                    <div>
                      <div className="text-white font-medium">
                        {scenarios.find(s => s.id === selectedScenario)?.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        Target: {simulationConfig.targetSystem.replace('-', ' ')}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>

          {/* Simulation Results */}
          {simulationResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Simulation Results</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {simulationResults.totalAttacks}
                  </div>
                  <div className="text-sm text-gray-400">Total Attacks</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {simulationResults.blockedAttacks}
                  </div>
                  <div className="text-sm text-gray-400">Blocked</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {simulationResults.detectedThreats}
                  </div>
                  <div className="text-sm text-gray-400">Threats Detected</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {simulationResults.systemPerformance}%
                  </div>
                  <div className="text-sm text-gray-400">System Performance</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {simulationResults.responseTime}ms
                  </div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">
                    {simulationResults.accuracy}%
                  </div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Simulation Complete</span>
                </div>
                <p className="text-gray-300">
                  Your system successfully defended against {simulationResults.blockedAttacks} out of {simulationResults.totalAttacks} attacks 
                  with {simulationResults.accuracy}% accuracy and maintained {simulationResults.systemPerformance}% system performance.
                </p>
              </div>
            </motion.div>
          )}

          {/* Attack Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Attack Visualization</h3>
            
            <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
              {isRunning ? (
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-4"
                  >
                    <Zap className="w-full h-full text-yellow-400" />
                  </motion.div>
                  <p className="text-gray-400">Simulation in progress...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Start simulation to see attack patterns</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
