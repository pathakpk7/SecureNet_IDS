import { useEffect, useState, useRef } from "react";
import { supabase } from "../api/supabase";
import { API_V1, WS_URL } from '@/config/api';

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial alerts from FastAPI backend or Supabase
    const fetchInitial = async () => {
      try {
        const res = await fetch(`${API_V1}/alerts?limit=20`);
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.alerts || json?.data || [];
          if (Array.isArray(list)) {
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
    let isDisposed = false;
    let reconnectTimeout = null;

    const connectWs = () => {
      if (isDisposed) return;
      try {
        const ws = new WebSocket(WS_URL);
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
          if (!isDisposed) {
            reconnectTimeout = setTimeout(connectWs, 3000);
          }
        };

        ws.onerror = () => {};
      } catch (err) {
        if (!isDisposed) {
          reconnectTimeout = setTimeout(connectWs, 3000);
        }
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
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        const ws = wsRef.current;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws.close();
        }
        wsRef.current = null;
      }
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return alerts;
}

export default useRealtimeAlerts;
