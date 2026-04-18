import { useAuth } from "../../context/AuthContext";

export default function RoleBasedRenderer({ admin, user }) {
  const { user: currentUser } = useAuth();

  if (!currentUser) return null;

  return currentUser.role === "admin" ? admin : user;
}
