import { supabase } from "../api/supabase";

export const fetchAlerts = async () => {
  const { data } = await supabase.from("alerts").select("*");
  return data;
};

export const createAlert = async (alert) => {
  const { data } = await supabase.from("alerts").insert(alert).select();
  return data;
};

export const updateAlert = async (id, updates) => {
  const { data } = await supabase.from("alerts").update(updates).eq("id", id).select();
  return data;
};

export const deleteAlert = async (id) => {
  const { data } = await supabase.from("alerts").delete().eq("id", id).select();
  return data;
};
