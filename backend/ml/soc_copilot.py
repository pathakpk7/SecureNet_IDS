"""
SecureNet IDS - GenAI / LLM SOC Analyst Assistant (Autonomous Triage Copilot)
Correlates endpoint telemetry, process trees, threat intel, and network alerts.
Provides automated root-cause analysis, MITRE ATT&CK framework mapping, and 1-click SOAR remediation playbooks.
Supports Google Gemini API with fallback to built-in deterministic MITRE knowledge engine.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Check for Gemini SDK
GEMINI_SDK_AVAILABLE = False
try:
    from google import genai
    from google.genai import types
    GEMINI_SDK_AVAILABLE = True
except ImportError:
    pass


# Deterministic MITRE ATT&CK Knowledge Base
MITRE_ATTACK_MATRIX = {
    "c2": {
        "tactic": "Command and Control",
        "technique_id": "T1071.001",
        "technique_name": "Application Layer Protocol: Web Protocols",
        "sub_techniques": ["T1071.004 - DNS", "T1573 - Encrypted Channel", "T1090 - Proxy"],
        "severity": "CRITICAL"
    },
    "powershell": {
        "tactic": "Execution",
        "technique_id": "T1059.001",
        "technique_name": "Command and Scripting Interpreter: PowerShell",
        "sub_techniques": ["T1059.003 - Windows Command Shell", "T1105 - Ingress Tool Transfer"],
        "severity": "HIGH"
    },
    "shell": {
        "tactic": "Execution",
        "technique_id": "T1059.004",
        "technique_name": "Command and Scripting Interpreter: Unix Shell",
        "sub_techniques": ["T1059 - Command and Scripting Interpreter"],
        "severity": "HIGH"
    },
    "dos": {
        "tactic": "Impact",
        "technique_id": "T1498.001",
        "technique_name": "Network Denial of Service: Direct Network Flood",
        "sub_techniques": ["T1499 - Endpoint Denial of Service"],
        "severity": "HIGH"
    },
    "portscan": {
        "tactic": "Discovery",
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "sub_techniques": ["T1018 - Remote System Discovery", "T1082 - System Information Discovery"],
        "severity": "MEDIUM"
    },
    "bruteforce": {
        "tactic": "Credential Access",
        "technique_id": "T1110.001",
        "technique_name": "Brute Force: Password Guessing",
        "sub_techniques": ["T1110.003 - Password Spraying"],
        "severity": "HIGH"
    },
    "botnet": {
        "tactic": "Command and Control",
        "technique_id": "T1584.005",
        "technique_name": "Compromise Infrastructure: Botnet",
        "sub_techniques": ["T1583.003 - Virtual Private Server"],
        "severity": "CRITICAL"
    },
    "ransomware": {
        "tactic": "Impact",
        "technique_id": "T1486",
        "technique_name": "Data Encrypted for Impact",
        "sub_techniques": ["T1490 - Inhibit System Recovery"],
        "severity": "CRITICAL"
    }
}


class SOCCopilot:
    """
    Autonomous SOC Analyst Assistant powered by Gemini GenAI & MITRE ATT&CK.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.client = None

        if self.api_key and GEMINI_SDK_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("GenAI SOC Copilot initialized with Google Gemini Client")
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}. Using deterministic engine.")
                self.client = None
        else:
            logger.info("Operating SOC Copilot in offline MITRE deterministic engine mode.")

    def _determine_mitre(self, attack_type: str, proc_name: str) -> Dict[str, Any]:
        """Correlate attack type and process into MITRE ATT&CK matrix."""
        key = "c2"
        text = f"{attack_type} {proc_name}".lower()

        if "power" in text or "ps1" in text:
            key = "powershell"
        elif "cmd" in text or "bash" in text or "sh" in text:
            key = "shell"
        elif "c2" in text or "beacon" in text or "backdoor" in text or "rat" in text:
            key = "c2"
        elif "dos" in text or "flood" in text:
            key = "dos"
        elif "scan" in text or "probe" in text:
            key = "portscan"
        elif "brute" in text or "login" in text:
            key = "bruteforce"
        elif "bot" in text or "mirai" in text:
            key = "botnet"
        elif "ransom" in text or "encrypt" in text:
            key = "ransomware"

        return MITRE_ATTACK_MATRIX.get(key, MITRE_ATTACK_MATRIX["c2"])

    def triage_alert(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze an alert and generate:
        1. Human-readable executive summary
        2. MITRE ATT&CK tactics & techniques
        3. Root-cause analysis
        4. Actionable 1-click SOAR remediation playbook
        """
        dest_ip = alert_data.get("destination_ip", "Unknown IP")
        source_ip = alert_data.get("source_ip", "Unknown IP")
        attack_type = alert_data.get("attack_type", "Suspicious Activity")
        risk_level = alert_data.get("risk_level", "HIGH")
        hostname = alert_data.get("hostname") or "Unknown Endpoint"
        proc_name = alert_data.get("process_name") or "unknown_process"
        proc_pid = alert_data.get("process_pid")
        device_id = alert_data.get("device_id")
        confidence = float(alert_data.get("confidence", 0.85))

        # 1. Attempt LLM-Powered Reasoning if Gemini Client is Active
        if self.client:
            try:
                prompt = f"""
You are a Lead SOC Cyber Analyst. Triage this security alert and provide structured response in valid JSON.
Alert Details:
- Endpoint Hostname: {hostname} (Device ID: {device_id})
- Process: {proc_name} (PID: {proc_pid})
- Source IP: {source_ip}
- Destination IP: {dest_ip}
- Attack Classification: {attack_type}
- Risk Level: {risk_level}
- Model Confidence: {confidence}
- Threat Intel Data: {json.dumps(alert_data.get('threat_intel_data', {}))}

Return only a valid JSON object with the following schema:
{{
  "incident_title": "string",
  "executive_summary": "string",
  "mitre_attack": {{
    "tactic": "string",
    "technique_id": "string",
    "technique_name": "string",
    "sub_techniques": ["string"]
  }},
  "root_cause_analysis": "string",
  "threat_actor_profile": "string",
  "severity_assessment": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "confidence_score": float,
  "remediation_playbook": [
    {{
      "step": 1,
      "action_type": "isolate_network" | "kill_process" | "block_ip" | "audit_persistence",
      "command": "string",
      "description": "string"
    }}
  ]
}}
"""
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text = response.text.strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                return json.loads(text)
            except Exception as e:
                logger.warning(f"Gemini GenAI inference fallback to expert system: {e}")

        # 2. Fallback: Expert Deterministic Security Knowledge Engine
        mitre = self._determine_mitre(attack_type, proc_name)

        incident_title = f"{attack_type} on {hostname} ({proc_name})"
        summary = (
            f"At {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}, an alert was triggered on device '{hostname}'. "
            f"The process '{proc_name}' (PID: {proc_pid or 'N/A'}) established a suspicious connection "
            f"from {source_ip} to destination {dest_ip}. "
            f"Classified as '{attack_type}' with {risk_level} risk level (Confidence: {int(confidence * 100)}%)."
        )

        root_cause = (
            f"Outbound communication initiated by process '{proc_name}' targeting destination IP '{dest_ip}'. "
            f"Matches behavioral signature of {mitre['tactic']} utilizing {mitre['technique_name']}."
        )

        remediation_playbook = [
            {
                "step": 1,
                "action_type": "isolate_network",
                "target_device_id": device_id,
                "title": "Quarantine & Isolate Host",
                "description": f"Isolate endpoint '{hostname}' from corporate subnet to stop lateral movement while preserving SOC SaaS telemetry."
            },
            {
                "step": 2,
                "action_type": "kill_process",
                "target_pid": proc_pid,
                "target_process": proc_name,
                "title": f"Terminate Process {proc_name}",
                "description": f"Terminate PID {proc_pid or 'active PID'} remotely using SecureNet Agent."
            },
            {
                "step": 3,
                "action_type": "block_ip",
                "target_ip": dest_ip,
                "title": f"Block IP {dest_ip}",
                "description": f"Add {dest_ip} to company-wide firewall blacklist and propagate to all enrolled fleet devices."
            },
            {
                "step": 4,
                "action_type": "audit_persistence",
                "title": "Inspect Scheduled Tasks & Run Keys",
                "description": f"Inspect registry Run keys and scheduled tasks on '{hostname}' for malware persistence."
            }
        ]

        return {
            "incident_title": incident_title,
            "executive_summary": summary,
            "mitre_attack": mitre,
            "root_cause_analysis": root_cause,
            "threat_actor_profile": "Commodity C2 or Automated Exploit Tooling",
            "severity_assessment": risk_level,
            "confidence_score": confidence,
            "remediation_playbook": remediation_playbook,
            "analyzed_at": datetime.now().isoformat(),
            "engine": "SecureNet GenAI Copilot (Deterministic + ATT&CK Core)"
        }


# Global Singleton Instance
soc_copilot = SOCCopilot()
