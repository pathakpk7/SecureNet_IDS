import { usePermissions } from "../hooks/usePermissions";
import AdminView from "../components/logs/AdminView";
import UserView from "../components/logs/UserView";

export default function Logs() {
  const { can } = usePermissions();

  return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
}
