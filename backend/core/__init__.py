"""
Core module for SecureNet IDS
Centralized configuration, logging, security, exceptions, and dependency management
"""

# Import only the most essential items to avoid circular dependencies
from .config import Settings, settings
from .settings import (
    PROTOCOL_MAPPING,
    RISK_LEVELS,
    ATTACK_TYPES,
    TCP_FLAGS,
    DB_TABLES
)

__all__ = [
    'Settings',
    'settings',
    'PROTOCOL_MAPPING',
    'RISK_LEVELS',
    'ATTACK_TYPES',
    'TCP_FLAGS',
    'DB_TABLES',
]

# Other modules can be imported directly:
# from core.logging import setup_logging, get_logger, LoggerMixin
# from core.exceptions import SecureNetException, ConfigurationError, ...
# from core.dependencies import container, get_settings, get_config
# from core.security import Permission, Role, ROLE_PERMISSIONS, PermissionChecker
