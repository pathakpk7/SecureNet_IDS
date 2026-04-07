import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CyberBackground from './components/CyberBackground';
import CursorGlow from './components/CursorGlow';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './pages/Dashboard';
import LiveTraffic from './pages/LiveTraffic';
import ThreatDetection from './pages/ThreatDetection';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import About from './pages/About';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Live Traffic':
        return <LiveTraffic />;
      case 'Threat Detection':
        return <ThreatDetection />;
      case 'Alerts':
        return <Alerts />;
      case 'Logs':
        return <Logs />;
      case 'Analytics':
        return <Analytics />;
      case 'Reports':
        return <Reports />;
      case 'Settings':
        return <Settings />;
      case 'About':
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="flex h-screen bg-bg-primary relative">
      <CyberBackground />
      <CursorGlow />
      <Sidebar activeItem={activePage} setActiveItem={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App
