import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../config/permissionsMap";

export function usePermissions() {
  const { user } = useAuth();

  return {
    can: (perm) => hasPermission(user, perm)
  };
}
