"""
Common schemas
Shared enums and base models
"""

from pydantic import BaseModel
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

class APIResponse(BaseModel):
    """Standard API response"""
    success: bool
    message: str
    data: dict = {}

class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: str
