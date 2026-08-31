"""
SecureNet IDS - Enhanced Configuration

This module provides enhanced configuration management with
environment-specific settings, validation, and hot-reload support.
"""

import os
from typing import Optional, Dict, Any, List
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class Environment(str, Enum):
    """Application environment types."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class EnhancedSettings(BaseSettings):
    """Enhanced application settings with validation."""
    
    # Application Settings
    app_name: str = "SecureNet IDS"
    app_version: str = "2.0.0"
    environment: Environment = Environment.DEVELOPMENT
    debug: bool = False
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    
    # Database Settings (Supabase)
    supabase_url: Optional[str] = Field(None, env="SUPABASE_URL")
    supabase_key: Optional[str] = Field(None, env="SUPABASE_KEY")
    supabase_pool_size: int = 10
    supabase_max_overflow: int = 20
    
    # Model Settings
    model_path: str = "../model/cicids_model.pkl"
    scaler_path: str = "../model/cicids_scaler.pkl"
    features_path: str = "../model/cicids_features.pkl"
    model_confidence_threshold: float = 0.7
    
    # Network Interface for Packet Capture
    network_interface: str = "Wi-Fi"
    capture_buffer_size: int = 1024
    capture_timeout: int = 30
    
    # Threat Intelligence API Keys
    virustotal_api_key: Optional[str] = Field(None, env="VIRUSTOTAL_API_KEY")
    abuseipdb_api_key: Optional[str] = Field(None, env="ABUSEIPDB_API_KEY")
    urlscan_api_key: Optional[str] = Field(None, env="URLSCAN_API_KEY")
    otx_api_key: Optional[str] = Field(None, env="OTX_API_KEY")
    google_safe_api_key: Optional[str] = Field(None, env="GOOGLE_SAFE_API_KEY")
    
    # Rate Limiting Settings
    api_rate_limit: int = 100
    api_rate_limit_period: int = 60  # seconds
    threat_intel_rate_limit: int = 4
    threat_intel_cache_ttl: int = 3600  # seconds
    
    # Detection Settings
    confidence_threshold: float = 0.7
    max_packet_size: int = 65535
    connection_timeout: int = 30
    ml_weight: float = 0.4
    threat_intel_weight: float = 0.6
    
    # Logging Settings
    log_level: str = "INFO"
    log_file: str = "ids.log"
    log_max_size: int = 10485760  # 10MB
    log_backup_count: int = 5
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # WebSocket Settings
    websocket_port: int = 8001
    websocket_ping_interval: int = 20
    websocket_ping_timeout: int = 20
    
    # Background Jobs Settings
    enable_background_jobs: bool = True
    report_generation_interval: int = 86400  # 24 hours
    cleanup_interval: int = 604800  # 7 days
    health_check_interval: int = 300  # 5 minutes
    
    # SIEM Settings
    enable_siem_export: bool = False
    siem_export_interval: int = 300  # 5 minutes
    siem_batch_size: int = 100
    
    # Report Settings
    enable_reporting: bool = True
    report_retention_days: int = 90
    pdf_reports_enabled: bool = True
    csv_reports_enabled: bool = True
    
    # Security Settings
    enable_cors: bool = True
    cors_origins: List[str] = ["*"]
    enable_rate_limiting: bool = True
    enable_audit_logging: bool = True
    
    # Monitoring Settings
    enable_metrics: bool = True
    metrics_port: int = 9090
    enable_health_endpoint: bool = True
    
    # Multi-Tenant Settings
    enable_multi_tenant: bool = True
    default_max_users_per_org: int = 100
    default_max_alerts_per_month: int = 10000
    
    @field_validator('environment')
    @classmethod
    def validate_environment(cls, v):
        """Validate environment setting."""
        if isinstance(v, str):
            try:
                return Environment(v.lower())
            except ValueError:
                logger.warning(f"Invalid environment '{v}', defaulting to development")
                return Environment.DEVELOPMENT
        return v
    
    @field_validator('log_level')
    @classmethod
    def validate_log_level(cls, v):
        """Validate log level."""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            logger.warning(f"Invalid log level '{v}', defaulting to INFO")
            return 'INFO'
        return v.upper()
    
    @field_validator('confidence_threshold', 'ml_weight', 'threat_intel_weight')
    @classmethod
    def validate_float_range(cls, v):
        """Validate float values are between 0 and 1."""
        if not 0 <= v <= 1:
            logger.warning(f"Value {v} out of range [0,1], clamping")
            return max(0, min(1, v))
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"
    
    def get_database_url(self) -> str:
        """Get database connection URL."""
        return self.supabase_url or ""
    
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == Environment.DEVELOPMENT
    
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == Environment.PRODUCTION
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins based on environment."""
        if self.is_development():
            return ["*"]
        return self.cors_origins


# Global enhanced settings instance
enhanced_settings = EnhancedSettings()


def get_settings() -> EnhancedSettings:
    """
    Get enhanced settings instance.
    
    Returns:
        EnhancedSettings instance
    """
    return enhanced_settings


def reload_settings() -> EnhancedSettings:
    """
    Reload settings from environment.
    
    Returns:
        New EnhancedSettings instance
    """
    global enhanced_settings
    enhanced_settings = EnhancedSettings()
    logger.info("Settings reloaded from environment")
    return enhanced_settings
