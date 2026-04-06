import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Application Settings
    app_name: str = "SecureNet IDS"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database Settings (Supabase)
    supabase_url: Optional[str] = Field(None, env="SUPABASE_URL")
    supabase_key: Optional[str] = Field(None, env="SUPABASE_KEY")
    
    # Model Settings
    model_path: str = "../model/model.pkl"
    
    # Network Interface for Packet Capture
    network_interface: str = "Wi-Fi"  # Change based on your system
    
    # Threat Intelligence API Keys
    virustotal_api_key: Optional[str] = Field(None, env="VIRUSTOTAL_API_KEY")
    abuseipdb_api_key: Optional[str] = Field(None, env="ABUSEIPDB_API_KEY")
    urlscan_api_key: Optional[str] = Field(None, env="URLSCAN_API_KEY")
    otx_api_key: Optional[str] = Field(None, env="OTX_API_KEY")
    google_safe_api_key: Optional[str] = Field(None, env="GOOGLE_SAFE_API_KEY")
    
    # Rate Limiting Settings
    api_rate_limit: int = 100  # requests per minute
    threat_intel_rate_limit: int = 4  # requests per minute per API
    
    # Detection Settings
    confidence_threshold: float = 0.7
    max_packet_size: int = 65535
    connection_timeout: int = 30
    
    # Logging Settings
    log_level: str = "INFO"
    log_file: str = "ids.log"
    
    # WebSocket Settings
    websocket_port: int = 8001
    
    # Risk Scoring Weights
    ml_weight: float = 0.4
    threat_intel_weight: float = 0.6
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()


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

# Database table names
DB_TABLES = {
    "alerts": "ids_alerts",
    "logs": "ids_logs",
    "stats": "ids_stats",
    "blacklist": "ids_blacklist"
}
