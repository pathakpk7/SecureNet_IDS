from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AttackType(str, Enum):
    NORMAL = "normal"
    PROBE = "probe"
    DOS = "dos"
    U2R = "u2r"
    R2L = "r2l"


class ProtocolType(str, Enum):
    TCP = "tcp"
    UDP = "udp"
    ICMP = "icmp"
    ARP = "arp"
    IPV6 = "ipv6"


class PacketData(BaseModel):
    source_ip: str
    destination_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: ProtocolType
    packet_length: int
    timestamp: datetime
    tcp_flags: Optional[str] = None
    payload_size: Optional[int] = None


class MLFeatures(BaseModel):
    duration: float = 0.0
    protocol_type: int
    service: int = 0  # Simplified for live capture
    flag: int = 0
    src_bytes: int
    dst_bytes: int = 0
    land: int = 0
    wrong_fragment: int = 0
    urgent: int = 0
    hot: int = 0
    num_failed_logins: int = 0
    logged_in: int = 0
    num_compromised: int = 0
    root_shell: int = 0
    su_attempted: int = 0
    num_root: int = 0
    num_file_creations: int = 0
    num_shells: int = 0
    num_access_files: int = 0
    num_outbound_cmds: int = 0
    is_host_login: int = 0
    is_guest_login: int = 0
    count: int = 1
    srv_count: int = 1
    serror_rate: float = 0.0
    srv_serror_rate: float = 0.0
    rerror_rate: float = 0.0
    srv_rerror_rate: float = 0.0
    same_srv_rate: float = 1.0
    diff_srv_rate: float = 0.0
    srv_diff_host_rate: float = 0.0
    dst_host_count: int = 1
    dst_host_srv_count: int = 1
    dst_host_same_srv_rate: float = 1.0
    dst_host_diff_srv_rate: float = 0.0
    dst_host_same_src_port_rate: float = 0.0
    dst_host_srv_diff_host_rate: float = 0.0
    dst_host_serror_rate: float = 0.0
    dst_host_srv_serror_rate: float = 0.0
    dst_host_rerror_rate: float = 0.0
    dst_host_srv_rerror_rate: float = 0.0


class ThreatIntelResult(BaseModel):
    source: str  # "virustotal", "abuseipdb", etc.
    is_malicious: bool
    confidence_score: float
    details: Dict[str, Any]
    timestamp: datetime


class PredictionResult(BaseModel):
    is_attack: bool
    attack_type: AttackType
    confidence: float
    risk_level: RiskLevel
    features: MLFeatures
    threat_intel_results: List[ThreatIntelResult] = []


class Alert(BaseModel):
    id: Optional[str] = None
    source_ip: str
    destination_ip: str
    protocol: ProtocolType
    timestamp: datetime
    attack_type: AttackType
    risk_level: RiskLevel
    confidence: float
    description: str
    threat_intel_data: Optional[Dict[str, Any]] = None
    packet_data: PacketData
    prediction_result: PredictionResult


class LogEntry(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    level: str  # INFO, WARNING, ERROR, CRITICAL
    message: str
    source: str
    packet_data: Optional[PacketData] = None
    alert_id: Optional[str] = None


class Stats(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    total_packets: int = 0
    malicious_packets: int = 0
    normal_packets: int = 0
    alerts_generated: int = 0
    top_source_ips: List[Dict[str, Any]] = []
    top_destination_ips: List[Dict[str, Any]] = []
    protocol_distribution: Dict[str, int] = {}
    attack_type_distribution: Dict[str, int] = {}


class BlacklistEntry(BaseModel):
    id: Optional[str] = None
    ip_address: str
    reason: str
    added_at: datetime
    risk_level: RiskLevel
    source: str  # manual, threat_intel, ml_detection
    is_active: bool = True


class MonitoringStatus(BaseModel):
    is_monitoring: bool
    start_time: Optional[datetime] = None
    packets_captured: int = 0
    alerts_generated: int = 0
    current_interface: str
    uptime_seconds: Optional[int] = None


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class WebSocketMessage(BaseModel):
    type: str  # alert, stats, log, status
    data: Dict[str, Any]
    timestamp: datetime


class ThreatIntelQuery(BaseModel):
    ip_address: str
    domain: Optional[str] = None
    url: Optional[str] = None
    hash: Optional[str] = None


class RateLimitInfo(BaseModel):
    requests_remaining: int
    reset_time: datetime
    limit: int


class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, bool]
    uptime: int
    version: str
