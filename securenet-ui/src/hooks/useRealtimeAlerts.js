import { useEffect, useState, useRef } from "react";
import { supabase } from "../api/supabase";
import { API_V1, WS_URL } from '@/config/api';

export const DEFAULT_BASELINE_ALERTS = [
  {
    id: "alt-101",
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    sourceIP: "192.168.1.105",
    destinationIP: "10.0.0.1",
    sourcePort: 44322,
    destinationPort: 80,
    protocol: "TCP",
    threatType: "DDoS SYN Flood",
    attack_type: "DDoS SYN Flood",
    severity: "critical",
    risk_level: "CRITICAL",
    message: "High volume SYN packet flood targeting edge gateway",
    confidence: 0.98,
    status: "blocked",
    action: "DROP_PACKET",
    mitreTechnique: "T1498"
  },
  {
    id: "alt-102",
    timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
    sourceIP: "45.33.32.156",
    destinationIP: "10.0.0.15",
    sourcePort: 51204,
    destinationPort: 22,
    protocol: "TCP",
    threatType: "SSH Brute Force",
    attack_type: "SSH Brute Force",
    severity: "high",
    risk_level: "HIGH",
    message: "Repeated failed authentication attempts on port 22",
    confidence: 0.94,
    status: "blocked",
    action: "IP_BLACKLIST",
    mitreTechnique: "T1110"
  },
  {
    id: "alt-103",
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    sourceIP: "185.220.101.5",
    destinationIP: "10.0.0.22",
    sourcePort: 38902,
    destinationPort: 8080,
    protocol: "HTTP",
    threatType: "SQL Injection",
    attack_type: "SQL Injection",
    severity: "critical",
    risk_level: "CRITICAL",
    message: "Tautology payload detected in HTTP query parameter",
    confidence: 0.99,
    status: "mitigated",
    action: "WAF_FILTER",
    mitreTechnique: "T1190"
  },
  {
    id: "alt-104",
    timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    sourceIP: "103.251.167.20",
    destinationIP: "10.0.0.50",
    sourcePort: 60100,
    destinationPort: 53,
    protocol: "UDP",
    threatType: "DNS Tunneling",
    attack_type: "DNS Tunneling",
    severity: "medium",
    risk_level: "MEDIUM",
    message: "Anomalous high-entropy subdomains observed in DNS queries",
    confidence: 0.88,
    status: "logged",
    action: "DNS_SINKHOLE",
    mitreTechnique: "T1071"
  },
  {
    id: "alt-105",
    timestamp: new Date(Date.now() - 58 * 60000).toISOString(),
    sourceIP: "192.168.1.180",
    destinationIP: "10.0.0.8",
    sourcePort: 48900,
    destinationPort: 445,
    protocol: "SMB",
    threatType: "Port Scanning",
    attack_type: "Port Scanning",
    severity: "medium",
    risk_level: "MEDIUM",
    message: "SYN scan swept across 1024 ports within 300ms",
    confidence: 0.92,
    status: "blocked",
    action: "RATE_LIMIT",
    mitreTechnique: "T1046"
  },
  {
    id: "alt-106",
    timestamp: new Date(Date.now() - 95 * 60000).toISOString(),
    sourceIP: "91.240.118.172",
    destinationIP: "10.0.0.12",
    sourcePort: 55432,
    destinationPort: 4444,
    protocol: "TCP",
    threatType: "Ransomware Beacon",
    attack_type: "Ransomware Beacon",
    severity: "critical",
    risk_level: "CRITICAL",
    message: "Periodic jittered heartbeat contacting known C2 domain",
    confidence: 0.97,
    status: "quarantined",
    action: "ISOLATE_HOST",
    mitreTechnique: "T1071"
  },
  {
    id: "alt-107",
    timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
    sourceIP: "178.62.204.81",
    destinationIP: "10.0.0.4",
    sourcePort: 41200,
    destinationPort: 80,
    protocol: "HTTP",
    threatType: "Cross-Site Scripting (XSS)",
    attack_type: "Cross-Site Scripting (XSS)",
    severity: "low",
    risk_level: "LOW",
    message: "Script tag injection payload detected in user agent header",
    confidence: 0.85,
    status: "mitigated",
    action: "LOG_ONLY",
    mitreTechnique: "T1059"
  }
];

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState(DEFAULT_BASELINE_ALERTS);
  const wsRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial alerts from FastAPI backend or Supabase
    const normalizeAlert = (item) => ({
      ...item,
      sourceIP: item.sourceIP || item.source_ip || item.src_ip || '192.168.1.100',
      destinationIP: item.destinationIP || item.destination_ip || item.dest_ip || item.dst_ip || '10.0.0.1',
      threatType: item.threatType || item.threat_type || item.attack_type || 'Threat Detection',
      severity: (item.severity || item.risk_level || 'medium').toLowerCase(),
      status: item.status || 'logged'
    });

    const fetchInitial = async () => {
      try {
        const res = await fetch(`${API_V1}/alerts?limit=20`);
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.alerts || json?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setAlerts(list.map(normalizeAlert));
            return;
          }
        }
      } catch (err) {
        // Fallback to Supabase
      }

      try {
        const { data } = await supabase
          .from("alerts")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(20);
        if (data && data.length > 0) {
          setAlerts(data.map(normalizeAlert));
          return;
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
              setAlerts(prev => [normalizeAlert(message.data), ...prev.slice(0, 49)]);
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
              setAlerts(prev => [normalizeAlert(payload.new), ...prev.slice(0, 49)]);
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
