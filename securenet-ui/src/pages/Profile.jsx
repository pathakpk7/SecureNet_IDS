import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminProfile from "../components/profile/AdminProfile";
import UserOnlyProfile from "../components/profile/UserOnlyProfile";

export default function Profile() {
  const { user } = useAuth();
  const role = user?.role || user?.user_metadata?.role || (localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser'))?.role : 'user');

  return role === "admin"
    ? <AdminProfile />
    : <UserOnlyProfile />;
}
