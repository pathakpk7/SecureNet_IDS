import { useAuth } from "../context/AuthContext";
import AdminProfile from "../components/profile/AdminProfile";
import UserOnlyProfile from "../components/profile/UserOnlyProfile";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === "admin"
    ? <AdminProfile />
    : <UserOnlyProfile />;
}
