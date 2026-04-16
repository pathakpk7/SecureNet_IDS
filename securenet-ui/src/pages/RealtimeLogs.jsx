import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";

const RealtimeLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Fetch initial logs
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setLogs(data || []);
    };

    fetchLogs();

    // Realtime subscription
    const channel = supabase
      .channel("audit_logs_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        (payload) => {
          console.log("Realtime event:", payload);
          setLogs((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "cyan" }}>Realtime Audit Logs</h2>

      {logs.length === 0 && (
        <p style={{ color: "#888" }}>No logs yet...</p>
      )}

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            padding: "12px",
            marginBottom: "10px",
            border: "1px solid cyan",
            borderRadius: "8px",
            background: "#0a0f1c",
            color: "cyan",
            fontFamily: "monospace",
          }}
        >
          <div><b>Action:</b> {log.action}</div>

          <div style={{ fontSize: "12px", opacity: 0.7 }}>
            {new Date(log.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealtimeLogs;