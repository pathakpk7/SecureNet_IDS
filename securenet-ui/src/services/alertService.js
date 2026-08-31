import { supabase } from "../api/supabase";

const API_BASE = "http://localhost:8000/api/v1";

export const fetchAlerts = async () => {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    if (res.ok) {
      const json = await res.json();
      return json?.data?.alerts || json?.data || [];
    }
  } catch (err) {
    // Continue to Supabase fallback
  }

  try {
    const { data } = await supabase.from("alerts").select("*").order("timestamp", { ascending: false });
    if (data) return data;
  } catch (err) {
    // Continue to mock fallback
  }

  return [];
};

export const createAlert = async (alert) => {
  try {
    const { data } = await supabase.from("alerts").insert(alert).select();
    return data;
  } catch (e) {
    return [alert];
  }
};

export const updateAlert = async (id, updates) => {
  try {
    const { data } = await supabase.from("alerts").update(updates).eq("id", id).select();
    return data;
  } catch (e) {
    return [{ id, ...updates }];
  }
};

export const deleteAlert = async (id) => {
  try {
    const { data } = await supabase.from("alerts").delete().eq("id", id).select();
    return data;
  } catch (e) {
    return true;
  }
};
