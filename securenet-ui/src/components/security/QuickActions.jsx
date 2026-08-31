import React from 'react';
import Card from '../ui/Card';

export default function QuickActions() {
  const handleBlockIP = () => {
    console.log("Block IP action triggered");
  };

  const handleRunScan = () => {
    console.log("Run Scan action triggered");
  };

  const handleSimulateAttack = () => {
    console.log("Simulate Attack action triggered");
  };

  const handleIsolateSystem = () => {
    console.log("Isolate System action triggered");
  };

  const handleRunDiagnostics = () => {
    console.log("Run Diagnostics action triggered");
  };

  return (
    <Card className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        <button className="action-btn danger" onClick={handleBlockIP}>
          🚫 Block IP
        </button>
        <button className="action-btn warning" onClick={handleRunScan}>
          🔍 Run Scan
        </button>
        <button className="action-btn info" onClick={handleSimulateAttack}>
          ⚡ Simulate Attack
        </button>
        <button className="action-btn critical" onClick={handleIsolateSystem}>
          🔒 Isolate System
        </button>
        <button className="action-btn success" onClick={handleRunDiagnostics}>
          🩺 Run Diagnostics
        </button>
      </div>
    </Card>
  );
}
