from datetime import datetime
from typing import Optional, Dict, Any, List, Union
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
    SCAN = "scan"
    EXFILTRATION = "exfiltration"
    BRUTEFORCE = "bruteforce"
    UNKNOWN = "unknown"


class ProtocolType(str, Enum):
    TCP = "tcp"
    UDP = "udp"
    ICMP = "icmp"
    ARP = "arp"
    IPV6 = "ipv6"
    OTHER = "other"


class PacketData(BaseModel):
    source_ip: str
    destination_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: Union[ProtocolType, str] = ProtocolType.TCP
    packet_length: int = 64
    timestamp: Union[datetime, str, float] = Field(default_factory=datetime.now)
    tcp_flags: Optional[Any] = None
    payload_size: Optional[int] = None


class MLFeatures(BaseModel):
    duration: float = 0.0
    protocol_type: int = 1
    service: int = 0
    flag: int = 0
    src_bytes: int = 0
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
    source: str = "threat_intel"
    is_malicious: bool = False
    confidence_score: float = 0.0
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Union[datetime, str] = Field(default_factory=datetime.now)


class PredictionResult(BaseModel):
    is_attack: bool
    attack_type: Union[AttackType, str] = AttackType.NORMAL
    confidence: float = 0.0
    risk_level: Union[RiskLevel, str] = RiskLevel.LOW
    features: Optional[Any] = None
    threat_intel_results: List[ThreatIntelResult] = Field(default_factory=list)


class Alert(BaseModel):
    id: Optional[str] = None
    source_ip: str
    destination_ip: str
    protocol: Union[ProtocolType, str] = ProtocolType.TCP
    timestamp: Union[datetime, str] = Field(default_factory=datetime.now)
    attack_type: Union[AttackType, str] = AttackType.NORMAL
    risk_level: Union[RiskLevel, str] = RiskLevel.LOW
    confidence: float = 0.0
    description: str = ""
    threat_intel_data: Optional[Any] = None
    packet_data: Optional[Any] = None
    prediction_result: Optional[Any] = None


class LogEntry(BaseModel):
    id: Optional[str] = None
    timestamp: Union[datetime, str] = Field(default_factory=datetime.now)
    level: str = "INFO"
    message: str = ""
    source: str = "IDS"
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    protocol: Optional[str] = None
    prediction: Optional[bool] = None
    confidence: Optional[float] = None
    attack_type: Optional[str] = None
    risk_level: Optional[str] = None
    features: Optional[Any] = None
    threat_intel: Optional[Any] = None
    packet_data: Optional[Any] = None
    alert_id: Optional[str] = None


class Stats(BaseModel):
    id: Optional[str] = None
    timestamp: Union[datetime, str] = Field(default_factory=datetime.now)
    total_packets: int = 0
    malicious_packets: int = 0
    normal_packets: int = 0
    alerts_generated: int = 0
    top_source_ips: Union[List[Any], Dict[str, Any]] = Field(default_factory=list)
    top_destination_ips: Union[List[Any], Dict[str, Any]] = Field(default_factory=list)
    protocol_distribution: Dict[str, int] = Field(default_factory=dict)
    attack_type_distribution: Dict[str, int] = Field(default_factory=dict)


class BlacklistEntry(BaseModel):
    id: Optional[str] = None
    ip_address: str
    reason: str = "Suspicious traffic"
    added_at: Union[datetime, str] = Field(default_factory=datetime.now)
    risk_level: Union[RiskLevel, str] = RiskLevel.HIGH
    source: str = "manual"
    is_active: bool = True


class MonitoringStatus(BaseModel):
    is_monitoring: Optional[bool] = None
    monitoring_active: Optional[bool] = None
    start_time: Optional[Union[datetime, str]] = None
    packets_captured: Optional[int] = 0
    alerts_generated: Optional[int] = 0
    current_interface: Optional[str] = "Wi-Fi"
    uptime_seconds: Optional[int] = 0
    statistics: Optional[Dict[str, Any]] = None


class APIResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None


class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: Union[datetime, str] = Field(default_factory=datetime.now)


class ThreatIntelQuery(BaseModel):
    ip_address: str
    domain: Optional[str] = None
    url: Optional[str] = None
    hash: Optional[str] = None


class RateLimitInfo(BaseModel):
    requests_remaining: int
    reset_time: Union[datetime, str]
    limit: int


class HealthCheck(BaseModel):
    status: str = "healthy"
    timestamp: Union[datetime, str] = Field(default_factory=datetime.now)
    components: Optional[Dict[str, Any]] = None
    services: Optional[Dict[str, Any]] = None
    uptime: Optional[int] = 0
    version: Optional[str] = "1.0.0"
