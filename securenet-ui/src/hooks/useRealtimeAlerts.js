import { useEffect, useState, useRef } from "react";
import { supabase } from "../api/supabase";

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial alerts from FastAPI backend or Supabase
    const fetchInitial = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/alerts?limit=20");
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.alerts || json?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setAlerts(list);
            return;
          }
        }
      } catch (err) {
        // Fallback to Supabase
      }

      try {
        const { data } = await supabase.from("alerts").select("*").order("timestamp", { ascending: false }).limit(20);
        if (data && data.length > 0) {
          setAlerts(data);
        }
      } catch (e) {}
    };

    fetchInitial();

    // 2. Connect to real-time FastAPI WebSocket
    let reconnectTimeout = null;
    const connectWs = () => {
      try {
        const ws = new WebSocket("ws://localhost:8000/ws");
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("Connected to SecureNet IDS Real-time Stream");
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "alert" && message.data) {
              setAlerts(prev => [message.data, ...prev.slice(0, 49)]);
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    // 3. Also listen on Supabase channel if available
    let channel = null;
    try {
      channel = supabase
        .channel("alerts-channel")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "alerts" },
          (payload) => {
            if (payload?.new) {
              setAlerts(prev => [payload.new, ...prev.slice(0, 49)]);
            }
          }
        )
        .subscribe();
    } catch (e) {}

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return alerts;
}

export default useRealtimeAlerts;
