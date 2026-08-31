import { usePermissions } from "../hooks/usePermissions";
import AdminView from "../components/network/AdminView";
import UserView from "../components/network/UserView";

export default function NetworkMonitor() {
  const { can } = usePermissions();

  return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
}
