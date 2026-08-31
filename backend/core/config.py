import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from .constants import (
    DEFAULT_RATE_LIMIT,
    DEFAULT_THREAT_INTEL_RATE_LIMIT,
    DEFAULT_CONFIDENCE_THRESHOLD,
    DEFAULT_MAX_PACKET_SIZE,
    DEFAULT_CONNECTION_TIMEOUT,
    DEFAULT_LOG_LEVEL,
    DEFAULT_WEBSOCKET_PORT,
    DEFAULT_ML_WEIGHT,
    DEFAULT_THREAT_INTEL_WEIGHT
)


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
    model_path: str = "../../model/model.pkl"  # Adjusted for new architecture (ml/ needs to go up 2 levels)
    
    # Network Interface for Packet Capture
    network_interface: str = "Wi-Fi"  # Change based on your system
    
    # Threat Intelligence API Keys
    virustotal_api_key: Optional[str] = Field(None, env="VIRUSTOTAL_API_KEY")
    abuseipdb_api_key: Optional[str] = Field(None, env="ABUSEIPDB_API_KEY")
    urlscan_api_key: Optional[str] = Field(None, env="URLSCAN_API_KEY")
    otx_api_key: Optional[str] = Field(None, env="OTX_API_KEY")
    google_safe_api_key: Optional[str] = Field(None, env="GOOGLE_SAFE_API_KEY")
    
    # Rate Limiting Settings
    api_rate_limit: int = DEFAULT_RATE_LIMIT
    threat_intel_rate_limit: int = DEFAULT_THREAT_INTEL_RATE_LIMIT
    
    # Detection Settings
    confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD
    max_packet_size: int = DEFAULT_MAX_PACKET_SIZE
    connection_timeout: int = DEFAULT_CONNECTION_TIMEOUT
    
    # Logging Settings
    log_level: str = DEFAULT_LOG_LEVEL
    log_file: str = "ids.log"
    
    # WebSocket Settings
    websocket_port: int = DEFAULT_WEBSOCKET_PORT
    
    # Risk Scoring Weights
    ml_weight: float = DEFAULT_ML_WEIGHT
    threat_intel_weight: float = DEFAULT_THREAT_INTEL_WEIGHT
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables


# Global settings instance
settings = Settings()

