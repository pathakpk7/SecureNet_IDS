import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";

export default function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel("alerts-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          setAlerts(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return alerts;
}
