import { supabase } from "../api/supabase";

const API_BASE = "http://localhost:8000/api/v1";

export const fetchLogs = async () => {
  try {
    const res = await fetch(`${API_BASE}/logs`);
    if (res.ok) {
      const json = await res.json();
      const logs = json?.data?.logs || json?.data || [];
      if (Array.isArray(logs) && logs.length > 0) return logs;
    }
  } catch (err) {
    // Continue to Supabase
  }

  try {
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) return data;
  } catch (err) {
    // Fallback
  }

  return [];
};

export const createLog = async (log) => {
  try {
    const { data } = await supabase.from("audit_logs").insert(log).select();
    return data;
  } catch (e) {
    return [log];
  }
};

export const fetchLogsByUser = async (userId) => {
  try {
    const { data } = await supabase.from("audit_logs").select("*").eq("user_id", userId);
    return data;
  } catch (e) {
    return [];
  }
};

export const fetchLogsByDateRange = async (startDate, endDate) => {
  try {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate);
    return data;
  } catch (e) {
    return [];
  }
};
