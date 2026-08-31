import { useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import AdminView from "../components/analysis/AdminView";
import UserView from "../components/analysis/UserView";
import AdminAIInsights from "../components/analysis/AdminAIInsights";
import UserAIInsights from "../components/analysis/UserAIInsights";
import Reports from "../components/analysis/Reports";
import AdminSimulation from "../components/simulation/AdminSimulation";
import UserSimulation from "../components/simulation/UserSimulation";

export default function AttackAnalysis() {
  const [activeTab, setActiveTab] = useState("analysis");
  const { can } = usePermissions();

  const tabs = [
    { id: "analysis", label: "Attack Analysis" },
    { id: "insights", label: "AI Insights" },
    { id: "reports", label: "Reports" },
    { id: "simulation", label: "Simulation" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "analysis":
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
      case "insights":
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminAIInsights /> : <UserAIInsights />;
      case "reports":
        return <Reports />;
      case "simulation":
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminSimulation /> : <UserSimulation />;
      default:
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
    }
  };

  return (
    <div className="analysis-page">
      <div className="analysis-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="analysis-content">
        {renderContent()}
      </div>
    </div>
  );
}
