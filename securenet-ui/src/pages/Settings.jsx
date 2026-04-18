import { useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import AdminView from "../components/settings/AdminView";
import UserView from "../components/settings/UserView";
import AdminIntegrations from "../components/integrations/AdminIntegrations";
import UserIntegrations from "../components/integrations/UserIntegrations";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("settings");
  const { can } = usePermissions();

  const tabs = [
    { id: "settings", label: "Settings" },
    { id: "integrations", label: "Integrations" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "settings":
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
      case "integrations":
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminIntegrations /> : <UserIntegrations />;
      default:
        return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-tabs">
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
      <div className="settings-content">
        {renderContent()}
      </div>
    </div>
  );
}
