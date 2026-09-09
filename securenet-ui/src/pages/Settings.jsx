import { usePermissions } from "../hooks/usePermissions";
import AdminView from "../components/settings/AdminView";
import UserView from "../components/settings/UserView";
import "../styles/pages/settings.css";

export default function Settings() {
  const { can } = usePermissions();

  return (
    <div className="settings-page">
      <div className="settings-content">
        {can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />}
      </div>
    </div>
  );
}

