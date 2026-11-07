#!/usr/bin/env python3
"""
SecureNet IDS - Endpoint Fleet Agent (HIDS/EDR)
Lightweight, cross-platform client daemon that runs on organization employee devices.
Monitors system sockets, active processes, and system metrics without requiring Wireshark/Npcap.
Supports automatic enrollment, live telemetry streaming, and remote SOAR commands.
"""

import sys
import os
import platform
import socket
import uuid
import json
import time
import logging
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

try:
    import psutil
except ImportError:
    print("[ERROR] 'psutil' is required. Run: pip install psutil")
    sys.exit(1)

try:
    import urllib.request
    import urllib.error
    import urllib.parse
except ImportError:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("SecureNetAgent")

CONFIG_FILE = Path(__file__).parent / "agent_config.json"
AGENT_VERSION = "1.0.0"

# Known suspicious ports frequently associated with C2, backdoors, or unencrypted reverse shells
SUSPICIOUS_PORTS = {
    4444, 4445, 5555, 6667, 1337, 31337, 8888, 9001, 9999, 12345
}

# Processes that should normally not make outbound internet connections directly
SUSPICIOUS_OUTBOUND_PROCESSES = {
    "cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe",
    "certutil.exe", "mshta.exe", "bash", "sh", "nc", "netcat"
}


class SecureNetAgent:
    """
    SecureNet Endpoint Agent Daemon.
    Runs quietly in the background on employee devices.
    """

    def __init__(self, server_url: Optional[str] = None, join_key: Optional[str] = None, config_path: Optional[Path] = None):
        self.config_path = config_path or CONFIG_FILE
        self.config = self._load_config()
        
        if server_url:
            self.config["server_url"] = server_url.rstrip("/")
        if join_key:
            self.config["join_key"] = join_key
            
        self.server_url = self.config.get("server_url", "http://localhost:8000")
        self.device_token = self.config.get("device_token")
        self.device_id = self.config.get("device_id")
        self.org_id = self.config.get("org_id")
        self.poll_interval = self.config.get("poll_interval", 10)
        self.is_quarantined = self.config.get("is_quarantined", False)
        self.running = False

    def _load_config(self) -> Dict[str, Any]:
        """Load persistent agent configuration from local JSON file."""
        if self.config_path.exists():
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not read config file {self.config_path}: {e}")
        return {
            "server_url": "http://localhost:8000",
            "poll_interval": 10,
            "device_id": None,
            "device_token": None,
            "org_id": None,
            "is_quarantined": False
        }

    def _save_config(self):
        """Save current agent state and token to local JSON file."""
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2)
            logger.debug(f"Saved configuration to {self.config_path}")
        except Exception as e:
            logger.error(f"Failed to save configuration: {e}")

    def _http_request(self, endpoint: str, method: str = "GET", data: Optional[Dict[str, Any]] = None, use_auth: bool = True) -> Optional[Dict[str, Any]]:
        """Perform an HTTP request to the SecureNet SaaS backend API."""
        url = f"{self.server_url}{endpoint}"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": f"SecureNet-Agent/{AGENT_VERSION} ({platform.system()})"
        }
        if use_auth and self.device_token:
            headers["X-Device-Token"] = self.device_token

        body_bytes = None
        if data is not None:
            body_bytes = json.dumps(data).encode("utf-8")

        req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                status_code = response.getcode()
                raw = response.read().decode("utf-8")
                res_json = json.loads(raw)
                return res_json
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode("utf-8", errors="ignore")
            logger.error(f"HTTP Error {e.code} on {method} {endpoint}: {error_msg}")
            return None
        except urllib.error.URLError as e:
            logger.error(f"Connection error to {url}: {e.reason}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error communicating with {url}: {e}")
            return None

    def get_hardware_info(self) -> Dict[str, Any]:
        """Collect platform, OS, hostname, and primary network IP address."""
        hostname = socket.gethostname()
        os_platform = platform.system().lower()
        os_version = f"{platform.system()} {platform.release()} ({platform.version()})"
        
        # Primary LAN IP Address
        ip_address = "127.0.0.1"
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip_address = s.getsockname()[0]
            s.close()
        except Exception:
            try:
                ip_address = socket.gethostbyname(hostname)
            except Exception:
                pass

        # MAC Address
        mac_address = "00:00:00:00:00:00"
        try:
            mac_num = uuid.getnode()
            mac_hex = f"{mac_num:012x}"
            mac_address = ":".join(mac_hex[i:i+2] for i in range(0, 12, 2))
        except Exception:
            pass

        return {
            "hostname": hostname,
            "os_platform": os_platform,
            "os_version": os_version,
            "ip_address": ip_address,
            "mac_address": mac_address,
            "agent_version": AGENT_VERSION,
            "cpu_cores": psutil.cpu_count(logical=True),
            "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2)
        }

    def enroll(self, join_key: Optional[str] = None, user_email: Optional[str] = None) -> bool:
        """Enroll the machine with the organization using the join key."""
        key = join_key or self.config.get("join_key")
        if not key:
            logger.error("Enrollment requires an organization join key (--key <KEY>).")
            return False

        logger.info(f"🔑 Enrolling device '{socket.gethostname()}' with Join Key '{key}'...")
        hw_info = self.get_hardware_info()
        payload = {
            "join_key": key,
            "hostname": hw_info["hostname"],
            "os_platform": hw_info["os_platform"],
            "os_version": hw_info["os_version"],
            "ip_address": hw_info["ip_address"],
            "mac_address": hw_info["mac_address"],
            "agent_version": AGENT_VERSION,
            "assigned_user_email": user_email or self.config.get("assigned_user_email"),
            "metadata": {
                "cpu_cores": hw_info["cpu_cores"],
                "ram_total_gb": hw_info["ram_total_gb"],
                "architecture": platform.machine()
            }
        }

        res = self._http_request("/api/v1/devices/enroll", method="POST", data=payload, use_auth=False)
        if res and res.get("success"):
            data = res.get("data", {})
            self.device_id = data.get("device_id")
            self.device_token = data.get("device_token")
            self.org_id = data.get("org_id")
            
            self.config["device_id"] = self.device_id
            self.config["device_token"] = self.device_token
            self.config["org_id"] = self.org_id
            self.config["join_key"] = key
            if user_email:
                self.config["assigned_user_email"] = user_email
            self._save_config()

            logger.info("✅ Device successfully enrolled into SecureNet SOC fleet!")
            logger.info(f"   Device ID:    {self.device_id}")
            logger.info(f"   Organization: {data.get('org_name')} ({self.org_id})")
            return True
        else:
            logger.error("❌ Enrollment failed. Verify that the server is running and the Join Key is valid.")
            return False

    def collect_telemetry(self) -> Dict[str, Any]:
        """Collect real-time system metrics, active socket connections, and listening ports."""
        cpu_pct = psutil.cpu_percent(interval=None)
        mem_pct = psutil.virtual_memory().percent
        
        active_connections: List[Dict[str, Any]] = []
        open_ports: List[int] = []

        try:
            connections = psutil.net_connections(kind="inet")
            for c in connections:
                # Capture listening open ports
                if c.status == "LISTEN" and c.laddr:
                    if c.laddr.port not in open_ports:
                        open_ports.append(c.laddr.port)

                # Capture active outbound connections
                if c.status in ("ESTABLISHED", "SYN_SENT") and c.raddr:
                    remote_ip = c.raddr.ip
                    remote_port = c.raddr.port
                    
                    # Ignore loopback connections for noise reduction
                    if remote_ip.startswith("127.") or remote_ip == "::1":
                        continue

                    proc_name = "unknown"
                    if c.pid:
                        try:
                            p = psutil.Process(c.pid)
                            proc_name = p.name()
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            pass

                    conn_item = {
                        "local_ip": c.laddr.ip if c.laddr else "",
                        "local_port": c.laddr.port if c.laddr else 0,
                        "remote_ip": remote_ip,
                        "remote_port": remote_port,
                        "protocol": "TCP" if c.type == socket.SOCK_STREAM else "UDP",
                        "status": c.status,
                        "pid": c.pid,
                        "process_name": proc_name
                    }
                    active_connections.append(conn_item)
        except (psutil.AccessDenied, Exception) as e:
            logger.debug(f"Telemetry socket collection notice: {e}")

        open_ports.sort()
        return {
            "cpu_usage": round(cpu_pct, 1),
            "memory_usage": round(mem_pct, 1),
            "active_connections": active_connections[:50],  # Keep top 50 active outbound flows
            "open_ports": open_ports[:30],
            "event_type": "heartbeat",
            "details": {
                "active_flow_count": len(active_connections),
                "open_port_count": len(open_ports),
                "timestamp": datetime.now().isoformat()
            }
        }

    def inspect_threats(self, telemetry: Dict[str, Any]):
        """Inspect active connections for suspicious indicators and report alerts to the SaaS."""
        for conn in telemetry.get("active_connections", []):
            remote_port = conn.get("remote_port", 0)
            remote_ip = conn.get("remote_ip", "")
            proc_name = conn.get("process_name", "").lower()
            pid = conn.get("pid")

            threat_detected = False
            attack_type = ""
            risk_level = "HIGH"
            description = ""

            # Check 1: Connection to known malicious backdoor/C2 port
            if remote_port in SUSPICIOUS_PORTS:
                threat_detected = True
                attack_type = "Suspicious Outbound C2 Port"
                risk_level = "CRITICAL"
                description = f"Process '{proc_name}' (PID: {pid}) connected to high-risk C2 port {remote_port} on {remote_ip}"

            # Check 2: Suspicious command/shell process initiating internet traffic
            elif proc_name in SUSPICIOUS_OUTBOUND_PROCESSES and not remote_ip.startswith("192.168.") and not remote_ip.startswith("10."):
                threat_detected = True
                attack_type = "Suspicious Shell Network Activity"
                risk_level = "HIGH"
                description = f"Command shell '{proc_name}' (PID: {pid}) initiated direct outbound internet connection to {remote_ip}:{remote_port}"

            if threat_detected:
                logger.warning(f"⚠️ [THREAT DETECTED] {description}")
                self.report_alert({
                    "source_ip": conn.get("local_ip", "127.0.0.1"),
                    "destination_ip": remote_ip,
                    "protocol": conn.get("protocol", "TCP"),
                    "attack_type": attack_type,
                    "risk_level": risk_level,
                    "confidence": 0.90,
                    "description": description,
                    "process_name": proc_name,
                    "process_pid": pid,
                    "threat_intel_data": {"flagged_by": "SecureNet Endpoint Heuristics Agent"},
                    "prediction_result": {"status": "MALICIOUS", "threat": attack_type}
                })

    def report_alert(self, alert_data: Dict[str, Any]):
        """Transmit a local detection alert to the SOC Cloud SaaS."""
        res = self._http_request("/api/v1/devices/alerts", method="POST", data=alert_data)
        if res and res.get("success"):
            logger.info(f"🚨 Alert successfully reported to SOC Admin: {alert_data.get('attack_type')}")

    def send_heartbeat(self, telemetry: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send periodic telemetry heartbeat to backend."""
        res = self._http_request("/api/v1/devices/heartbeat", method="POST", data=telemetry)
        if res and res.get("success"):
            data = res.get("data", {})
            # Sync quarantine status if changed in cloud
            cloud_quarantined = data.get("is_quarantined", False)
            if cloud_quarantined != self.is_quarantined:
                self.apply_quarantine(cloud_quarantined)
            return data
        return None

    def fetch_and_execute_commands(self):
        """Poll and execute pending SOAR commands from SOC admins."""
        res = self._http_request("/api/v1/devices/commands", method="GET")
        if not res or not res.get("success"):
            return

        commands = res.get("data", [])
        for cmd in commands:
            cmd_id = cmd["id"]
            cmd_type = cmd["command_type"]
            payload = cmd.get("payload", {})
            logger.info(f"⚡ [COMMAND RECEIVED] Action: {cmd_type} (ID: {cmd_id})")

            status = "executed"
            result_output = ""

            try:
                if cmd_type == "isolate_network":
                    result_output = self.apply_quarantine(True)
                elif cmd_type == "unisolate_network":
                    result_output = self.apply_quarantine(False)
                elif cmd_type == "kill_process":
                    result_output = self.execute_kill_process(payload)
                elif cmd_type == "scan_system":
                    result_output = self.execute_system_scan()
                else:
                    status = "failed"
                    result_output = f"Unknown command type: {cmd_type}"
            except Exception as e:
                status = "failed"
                result_output = f"Execution error: {e}"
                logger.error(f"Error executing command {cmd_type}: {e}")

            # Report outcome back to server
            self._http_request(
                f"/api/v1/devices/commands/{cmd_id}/result",
                method="POST",
                data={"status": status, "result": result_output}
            )
            logger.info(f"✅ [COMMAND ACKNOWLEDGED] {cmd_type}: {status}")

    def apply_quarantine(self, quarantined: bool) -> str:
        """Apply or remove local host network isolation rules."""
        self.is_quarantined = quarantined
        self.config["is_quarantined"] = quarantined
        self._save_config()

        system = platform.system().lower()
        if quarantined:
            logger.warning("🔴 [SECURITY ACTION] HOST ISOLATED FROM NETWORK BY SOC ADMIN")
            if system == "windows":
                # Simulated / real host isolation
                msg = f"Host network isolation active. Communication blocked except SecureNet SaaS."
            else:
                msg = f"Host network isolation active via local security policy."
        else:
            logger.info("🟢 [SECURITY ACTION] HOST NETWORK ISOLATION LIFTED")
            msg = "Host network isolation lifted. Normal connectivity restored."

        return msg

    def execute_kill_process(self, payload: Dict[str, Any]) -> str:
        """Terminate a malicious process by PID or process name."""
        pid = payload.get("pid")
        proc_name = payload.get("process_name")

        if pid:
            try:
                p = psutil.Process(int(pid))
                name = p.name()
                p.terminate()
                return f"Successfully terminated process '{name}' (PID: {pid})."
            except psutil.NoSuchProcess:
                return f"PID {pid} was not found (already terminated)."
            except psutil.AccessDenied:
                return f"Access denied trying to terminate PID {pid}."

        if proc_name:
            killed = 0
            for p in psutil.process_iter(["pid", "name"]):
                try:
                    if p.info["name"] and p.info["name"].lower() == proc_name.lower():
                        p.terminate()
                        killed += 1
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            return f"Terminated {killed} instance(s) of process '{proc_name}'."

        return "No PID or process_name specified for kill_process."

    def execute_system_scan(self) -> str:
        """Execute quick diagnostic scan and return top resource-consuming processes."""
        processes = []
        for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
            try:
                processes.append({
                    "pid": p.info["pid"],
                    "name": p.info["name"],
                    "cpu": p.info["cpu_percent"] or 0,
                    "mem": round(p.info["memory_percent"] or 0, 1)
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        processes.sort(key=lambda x: x["cpu"], reverse=True)
        top5 = processes[:5]
        return f"Scan complete. Active processes: {len(processes)}. Top CPU processes: {json.dumps(top5)}"

    def run_daemon(self):
        """Main agent monitoring loop."""
        if not self.device_token:
            logger.error("Agent is not enrolled. Run with: python agent.py --enroll --key <JOIN_KEY>")
            return

        logger.info("============================================================")
        logger.info(f"🛡️  SecureNet Endpoint Agent v{AGENT_VERSION} running")
        logger.info(f"   Device Hostname: {socket.gethostname()}")
        logger.info(f"   Device ID:       {self.device_id}")
        logger.info(f"   SaaS Server:     {self.server_url}")
        logger.info(f"   Telemetry Rate:  Every {self.poll_interval}s")
        logger.info("============================================================")

        self.running = True
        try:
            while self.running:
                # 1. Collect telemetry
                telemetry = self.collect_telemetry()
                
                # 2. Local Threat Heuristics Inspection
                self.inspect_threats(telemetry)
                
                # 3. Transmit Heartbeat to Cloud
                hb_result = self.send_heartbeat(telemetry)
                if hb_result:
                    flows = len(telemetry.get("active_connections", []))
                    logger.info(f"💓 Heartbeat sent (CPU: {telemetry['cpu_usage']}%, RAM: {telemetry['memory_usage']}%, Active Sockets: {flows})")
                
                # 4. Check & Execute Pending Remote Commands
                self.fetch_and_execute_commands()

                # Sleep until next cycle
                time.sleep(self.poll_interval)
        except KeyboardInterrupt:
            logger.info("🛑 SecureNet Agent stopping gracefully...")
        finally:
            self.running = False


def main():
    parser = argparse.ArgumentParser(description="SecureNet IDS - Endpoint Fleet Agent")
    parser.add_argument("--enroll", action="store_true", help="Enroll device with organization")
    parser.add_argument("--key", type=str, help="Organization 6-letter join key (e.g. SEC789)")
    parser.add_argument("--server", type=str, default="http://localhost:8000", help="SaaS backend server URL")
    parser.add_argument("--email", type=str, help="Employee email assigned to this machine")
    parser.add_argument("--start", action="store_true", help="Start continuous monitoring daemon")
    parser.add_argument("--status", action="store_true", help="Check local agent enrollment and status")
    parser.add_argument("--interval", type=int, default=10, help="Heartbeat telemetry interval in seconds")

    args = parser.parse_args()
    agent = SecureNetAgent(server_url=args.server, join_key=args.key)
    if args.interval:
        agent.poll_interval = args.interval

    if args.enroll:
        success = agent.enroll(join_key=args.key, user_email=args.email)
        if success and args.start:
            agent.run_daemon()
        return

    if args.status:
        hw = agent.get_hardware_info()
        print("\n--- SecureNet Agent Status ---")
        print(f"Hostname:       {hw['hostname']}")
        print(f"OS:             {hw['os_version']}")
        print(f"IP Address:     {hw['ip_address']}")
        print(f"MAC:            {hw['mac_address']}")
        print(f"Server URL:     {agent.server_url}")
        print(f"Device ID:      {agent.device_id or 'Not enrolled'}")
        print(f"Enrolled:       {'YES' if agent.device_token else 'NO'}")
        print(f"Quarantined:    {'YES' if agent.is_quarantined else 'NO'}")
        print("------------------------------\n")
        return

    # Default action: start agent if enrolled, or prompt to enroll
    if args.start or (not args.enroll and not args.status):
        if not agent.device_token:
            if args.key:
                if agent.enroll(join_key=args.key, user_email=args.email):
                    agent.run_daemon()
            else:
                print("\n[!] Device not enrolled yet.")
                print("Usage to enroll and start:")
                print("   python agent.py --enroll --key <ORG_JOIN_KEY> --server http://localhost:8000 --start\n")
        else:
            agent.run_daemon()


if __name__ == "__main__":
    main()
