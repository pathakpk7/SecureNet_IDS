import { supabase } from "../api/supabase";

export const fetchLogs = async () => {
  const { data } = await supabase.from("audit_logs").select("*");
  return data;
};

export const createLog = async (log) => {
  const { data } = await supabase.from("audit_logs").insert(log).select();
  return data;
};

export const fetchLogsByUser = async (userId) => {
  const { data } = await supabase.from("audit_logs").select("*").eq("user_id", userId);
  return data;
};

export const fetchLogsByDateRange = async (startDate, endDate) => {
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  return data;
};
