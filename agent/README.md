# SecureNet IDS - Endpoint Fleet Agent (HIDS/EDR)

The **SecureNet Endpoint Agent** is a lightweight, cross-platform security daemon designed to be installed on all company and organization devices (Windows, macOS, Linux).

Unlike heavy network packet sniffers (like Wireshark or WinPcap), this agent requires **no special network drivers**, runs with minimal CPU/battery impact (<1%), and works across Wi-Fi, Ethernet, and VPN connections.

---

## 🚀 Key Capabilities

1. **Automatic Fleet Enrollment**:
   * Devices enroll into an organization using a 6-letter join key (e.g. `SEC789`).
   * Receives a cryptographic `device_token` for authenticated cloud communication.

2. **Socket-to-Process Telemetry**:
   * Inspects all active outbound connections.
   * Associates every remote connection with its **Process Name, PID, and Executable**.

3. **Built-in Local Threat Heuristics**:
   * Detects connections to known Command & Control (C2) / backdoor ports (e.g. `4444`, `1337`, `6667`).
   * Flags suspicious command shells (`powershell.exe`, `cmd.exe`, `bash`, `nc`) initiating uncharacteristic internet connections.
   * Dispatches instant alerts directly to the SOC Admin dashboard.

4. **SOAR Remote Response (1-Click Actions from Admin Console)**:
   * **Host Network Isolation (`isolate_network`)**: Cuts device network access if an infection is detected, preventing lateral movement while maintaining communication with the SecureNet cloud.
   * **Process Termination (`kill_process`)**: Remotely kills malicious processes by PID or process name.
   * **Diagnostics & Auditing (`scan_system`)**: Collects real-time CPU, memory, and top active processes.

---

## 🛠️ Installation & Usage

### 1. Requirements
* Python 3.8+
* `psutil>=5.9.0`

Install requirements:
```bash
pip install psutil
```

### 2. Check Device Status
```bash
python agent/agent.py --status
```

### 3. Enroll Device into Organization
```bash
python agent/agent.py --enroll --key SEC789 --server http://localhost:8000 --email employee@company.com --start
```
* `--key`: The 6-letter organization Join Key provided by the SOC Admin.
* `--server`: The URL of your SecureNet SaaS API backend.
* `--email`: (Optional) The email address of the employee assigned to this device.
* `--start`: Immediately begins background monitoring upon successful enrollment.

### 4. Running as a Daemon / Service
Once enrolled, simply run:
```bash
python agent/agent.py --start
```
On Windows, you can wrap `agent/agent.py` as a Windows Service using NSSM (Non-Sucking Service Manager) or run it as a background scheduled task on startup. On Linux/macOS, use a systemd unit or LaunchDaemon.
