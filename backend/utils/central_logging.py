"""
SecureNet IDS - Central Logging System

This module provides centralized logging with structured logging,
multiple handlers, and integration with the audit system.
"""

import logging
import logging.handlers
import sys
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path
from core.config import settings


class StructuredFormatter(logging.Formatter):
    """
    Custom formatter for structured logging.
    
    Formats log messages as JSON for better parsing and analysis.
    """
    
    def __init__(self):
        """Initialize structured formatter."""
        super().__init__()
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON.
        
        Args:
            record: Log record to format
            
        Returns:
            JSON-formatted log string
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
        
        return json.dumps(log_data)


class CentralLogging:
    """
    Central logging system for the application.
    
    Provides unified logging configuration with multiple handlers,
    structured formatting, and audit integration.
    """
    
    def __init__(self):
        """Initialize central logging system."""
        self.loggers: Dict[str, logging.Logger] = {}
        self.audit_logger: Optional[logging.Logger] = None
    
    def setup_logging(
        self,
        log_level: str = "INFO",
        log_file: str = "ids.log",
        enable_console: bool = True,
        enable_file: bool = True,
        enable_structured: bool = False
    ):
        """
        Setup central logging configuration.
        
        Args:
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            log_file: Path to log file
            enable_console: Enable console handler
            enable_file: Enable file handler
            enable_structured: Enable structured JSON logging
        """
        # Root logger configuration
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, log_level.upper()))
        
        # Remove existing handlers
        root_logger.handlers.clear()
        
        # Console handler
        if enable_console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(getattr(logging, log_level.upper()))
            
            if enable_structured:
                console_handler.setFormatter(StructuredFormatter())
            else:
                console_handler.setFormatter(
                    logging.Formatter(
                        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S'
                    )
                )
            
            root_logger.addHandler(console_handler)
        
        # File handler with rotation
        if enable_file:
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            file_handler = logging.handlers.RotatingFileHandler(
                log_file,
                maxBytes=getattr(settings, 'log_max_size', 10485760),
                backupCount=getattr(settings, 'log_backup_count', 5)
            )
            file_handler.setLevel(getattr(logging, log_level.upper()))
            
            if enable_structured:
                file_handler.setFormatter(StructuredFormatter())
            else:
                file_handler.setFormatter(
                    logging.Formatter(
                        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S'
                    )
                )
            
            root_logger.addHandler(file_handler)
        
        # Setup audit logger separately
        self._setup_audit_logger(log_file, enable_structured)
    
    def _setup_audit_logger(self, log_file: str, enable_structured: bool):
        """
        Setup audit logger for security events.
        
        Args:
            log_file: Base log file path
            enable_structured: Enable structured logging
        """
        self.audit_logger = logging.getLogger("securenet.audit")
        self.audit_logger.setLevel(logging.INFO)
        self.audit_logger.propagate = False
        
        # Audit file handler
        audit_file = log_file.replace(".log", "_audit.log")
        audit_handler = logging.handlers.RotatingFileHandler(
            audit_file,
            maxBytes=getattr(settings, 'log_max_size', 10485760),
            backupCount=getattr(settings, 'log_backup_count', 5)
        )
        
        if enable_structured:
            audit_handler.setFormatter(StructuredFormatter())
        else:
            audit_handler.setFormatter(
                logging.Formatter(
                    '%(asctime)s - AUDIT - %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S'
                )
            )
        
        self.audit_logger.addHandler(audit_handler)
    
    def get_logger(self, name: str) -> logging.Logger:
        """
        Get or create a logger instance.
        
        Args:
            name: Logger name
            
        Returns:
            Logger instance
        """
        if name not in self.loggers:
            self.loggers[name] = logging.getLogger(name)
        return self.loggers[name]
    
    def log_audit_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log an audit event.
        
        Args:
            event_type: Type of audit event
            user_id: User ID
            org_id: Organization ID
            details: Additional event details
        """
        if not self.audit_logger:
            return
        
        log_data = {
            "event_type": event_type,
            "user_id": user_id,
            "org_id": org_id,
            "details": details or {}
        }
        
        # Create a log record with extra data
        record = self.audit_logger.makeRecord(
            self.audit_logger.name,
            logging.INFO,
            "",
            0,
            f"AUDIT: {event_type}",
            (),
            None
        )
        record.extra_data = log_data
        
        self.audit_logger.handle(record)
    
    def log_security_event(
        self,
        event_type: str,
        severity: str = "INFO",
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log a security event.
        
        Args:
            event_type: Type of security event
            severity: Event severity
            details: Additional event details
        """
        security_logger = self.get_logger("securenet.security")
        
        log_data = {
            "event_type": event_type,
            "severity": severity,
            "details": details or {}
        }
        
        # Create a log record with extra data
        record = security_logger.makeRecord(
            security_logger.name,
            getattr(logging, severity.upper()),
            "",
            0,
            f"SECURITY: {event_type}",
            (),
            None
        )
        record.extra_data = log_data
        
        security_logger.handle(record)


# Global central logging instance
central_logging = CentralLogging()


def setup_logging(
    log_level: str = "INFO",
    log_file: str = "ids.log",
    enable_console: bool = True,
    enable_file: bool = True,
    enable_structured: bool = False
):
    """
    Setup central logging for the application.
    
    Args:
        log_level: Logging level
        log_file: Path to log file
        enable_console: Enable console handler
        enable_file: Enable file handler
        enable_structured: Enable structured JSON logging
    """
    central_logging.setup_logging(log_level, log_file, enable_console, enable_file, enable_structured)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance.
    
    Args:
        name: Logger name
        
    Returns:
        Logger instance
    """
    return central_logging.get_logger(name)


def log_audit_event(
    event_type: str,
    user_id: Optional[str] = None,
    org_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    """
    Log an audit event.
    
    Args:
        event_type: Type of audit event
        user_id: User ID
        org_id: Organization ID
        details: Additional event details
    """
    central_logging.log_audit_event(event_type, user_id, org_id, details)


def log_security_event(
    event_type: str,
    severity: str = "INFO",
    details: Optional[Dict[str, Any]] = None
):
    """
    Log a security event.
    
    Args:
        event_type: Type of security event
        severity: Event severity
        details: Additional event details
    """
    central_logging.log_security_event(event_type, severity, details)
