"""
Core constants for SecureNet IDS
Centralized constant definitions used across the application
"""

# Network protocol mappings
PROTOCOL_MAPPING = {
    "tcp": 1,
    "udp": 2,
    "icmp": 3,
    "arp": 4,
    "ipv6": 5,
}

# Risk levels
RISK_LEVELS = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}

# Attack types based on NSL-KDD dataset
ATTACK_TYPES = {
    "normal": "normal",
    "probe": "probe",
    "dos": "dos", 
    "u2r": "u2r",
    "r2l": "r2l"
}

# TCP flags mapping
TCP_FLAGS = {
    "FIN": 0x01,
    "SYN": 0x02,
    "RST": 0x04,
    "PSH": 0x08,
    "ACK": 0x10,
    "URG": 0x20,
    "ECE": 0x40,
    "CWR": 0x80,
}

import os

# Database table names
DB_TABLES = {
    "alerts": os.getenv("SUPABASE_ALERTS_TABLE", "alerts"),
    "logs": os.getenv("SUPABASE_LOGS_TABLE", "logs"),
    "stats": os.getenv("SUPABASE_STATS_TABLE", "stats"),
    "blacklist": os.getenv("SUPABASE_BLACKLIST_TABLE", "blacklist")
}

# Default values
DEFAULT_RATE_LIMIT = 100  # requests per minute
DEFAULT_THREAT_INTEL_RATE_LIMIT = 4  # requests per minute per API
DEFAULT_CONFIDENCE_THRESHOLD = 0.7
DEFAULT_MAX_PACKET_SIZE = 65535
DEFAULT_CONNECTION_TIMEOUT = 30
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_WEBSOCKET_PORT = 8001

# Risk scoring weights
DEFAULT_ML_WEIGHT = 0.4
DEFAULT_THREAT_INTEL_WEIGHT = 0.6
