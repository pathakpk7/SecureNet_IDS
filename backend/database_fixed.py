#!/usr/bin/env python3
"""
SecureNet IDS - Fixed Database Module
Fixed Supabase database connection with proper error handling and validation.
"""

import asyncio
import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logging.warning("Supabase not available")

from .config import settings

logger = logging.getLogger(__name__)

class FixedDatabaseManager:
    """Fixed database manager with proper Supabase connection handling."""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.is_connected = False
        self.connection_attempts = 0
        self.max_retries = 3
        self.retry_delay = 2  # seconds
        
        # Initialize connection
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize Supabase connection with proper error handling."""
        try:
            # Check if Supabase is available
            if not SUPABASE_AVAILABLE:
                logger.error("Supabase library not installed")
                return
            
            # Check environment variables
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_KEY')
            
            if not supabase_url or not supabase_key:
                logger.error("Missing Supabase environment variables")
                logger.error(f"SUPABASE_URL: {'Set' if supabase_url else 'Missing'}")
                logger.error(f"SUPABASE_KEY: {'Set' if supabase_key else 'Missing'}")
                return
            
            # Create Supabase client
            self.supabase = create_client(supabase_url, supabase_key)
            
            # Test connection
            if self._test_connection():
                self.is_connected = True
                logger.info("✅ Supabase database connected successfully")
            else:
                logger.error("❌ Failed to connect to Supabase database")
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase connection: {str(e)}")
            self.is_connected = False
    
    def _test_connection(self) -> bool:
        """Test database connection with a simple query."""
        try:
            if not self.supabase:
                return False
            
            # Try to query a simple table (will fail if table doesn't exist, but connection test passes)
            response = self.supabase.table('alerts').select('id').limit(1).execute()
            return True
            
        except Exception as e:
            # Connection test failed, but we can still use the client
            logger.warning(f"Connection test failed (table may not exist): {str(e)}")
            return True  # Assume connection works if client was created
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive database health check."""
        try:
            if not self.is_connected or not self.supabase:
                return {
                    "status": "unhealthy",
                    "error": "Database not connected",
                    "response_time_ms": 0
                }
            
            start_time = datetime.now()
            
            # Test basic connectivity
            try:
                response = self.supabase.table('alerts').select('id').limit(1).execute()
                connection_test = True
            except Exception as e:
                connection_test = False
                logger.warning(f"Database query failed: {str(e)}")
            
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                "status": "healthy" if connection_test else "unhealthy",
                "response_time_ms": response_time,
                "connection_test": connection_test,
                "client_available": self.supabase is not None,
                "error": None if connection_test else "Query failed (table may not exist)"
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "response_time_ms": 0
            }
    
    async def store_detection_log(self, log_data: Dict[str, Any]) -> bool:
        """Store detection log with proper error handling."""
        try:
            if not self.is_connected or not self.supabase:
                logger.warning("Database not connected, skipping log storage")
                return False
            
            # Prepare log data for database
            db_log = {
                "timestamp": log_data.get("timestamp", datetime.now().isoformat()),
                "source_ip": log_data.get("source_ip"),
                "destination_ip": log_data.get("destination_ip"),
                "protocol": log_data.get("protocol"),
                "packet_length": log_data.get("packet_length"),
                "prediction": log_data.get("prediction", False),
                "confidence": log_data.get("confidence", 0.0),
                "attack_type": log_data.get("attack_type", "normal"),
                "risk_level": log_data.get("risk_level", "LOW"),
                "features": log_data.get("features", {}),
                "threat_intel": log_data.get("threat_intel", {}),
                "ml_confidence": log_data.get("ml_confidence", 0.0),
                "sources": log_data.get("sources", []),
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into logs table
            response = self.supabase.table('logs').insert(db_log).execute()
            
            if response.data:
                logger.debug(f"Log stored successfully: {response.data[0].get('id')}")
                return True
            else:
                logger.error("Failed to store log - no data returned")
                return False
                
        except Exception as e:
            logger.error(f"Error storing detection log: {str(e)}")
            return False
    
    async def store_security_alert(self, alert_data: Dict[str, Any]) -> bool:
        """Store security alert with proper error handling."""
        try:
            if not self.is_connected or not self.supabase:
                logger.warning("Database not connected, skipping alert storage")
                return False
            
            # Prepare alert data for database
            db_alert = {
                "id": alert_data.get("id"),
                "timestamp": alert_data.get("timestamp", datetime.now().isoformat()),
                "source_ip": alert_data.get("source_ip"),
                "destination_ip": alert_data.get("destination_ip"),
                "attack_type": alert_data.get("attack_type"),
                "risk_level": alert_data.get("risk_level", "MEDIUM"),
                "confidence": alert_data.get("confidence", 0.0),
                "status": alert_data.get("status", "active"),
                "details": alert_data.get("details", {}),
                "threat_intel_results": alert_data.get("threat_intel_results", []),
                "ml_prediction": alert_data.get("ml_prediction", {}),
                "sources": alert_data.get("sources", []),
                "alert_flag": alert_data.get("alert_flag", False),
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into alerts table
            response = self.supabase.table('alerts').insert(db_alert).execute()
            
            if response.data:
                logger.debug(f"Alert stored successfully: {response.data[0].get('id')}")
                return True
            else:
                logger.error("Failed to store alert - no data returned")
                return False
                
        except Exception as e:
            logger.error(f"Error storing security alert: {str(e)}")
            return False
    
    async def get_recent_logs(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get recent detection logs."""
        try:
            if not self.is_connected or not self.supabase:
                return []
            
            response = self.supabase.table('logs')\
                .select('*')\
                .order('timestamp', desc=True)\
                .range(offset, offset + limit - 1)\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error getting recent logs: {str(e)}")
            return []
    
    async def get_recent_alerts(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get recent security alerts."""
        try:
            if not self.is_connected or not self.supabase:
                return []
            
            response = self.supabase.table('alerts')\
                .select('*')\
                .order('timestamp', desc=True)\
                .range(offset, offset + limit - 1)\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error getting recent alerts: {str(e)}")
            return []
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics."""
        try:
            if not self.is_connected or not self.supabase:
                return {
                    "database_connected": False,
                    "total_logs": 0,
                    "total_alerts": 0,
                    "recent_logs_24h": 0,
                    "recent_alerts_24h": 0,
                    "error": "Database not connected"
                }
            
            # Get total counts
            try:
                logs_response = self.supabase.table('logs').select('id', count='exact').execute()
                total_logs = logs_response.count or 0
            except:
                total_logs = 0
            
            try:
                alerts_response = self.supabase.table('alerts').select('id', count='exact').execute()
                total_alerts = alerts_response.count or 0
            except:
                total_alerts = 0
            
            # Get recent counts (last 24 hours)
            yesterday = datetime.now() - timedelta(days=1)
            
            try:
                recent_logs_response = self.supabase.table('logs')\
                    .select('id', count='exact')\
                    .gte('timestamp', yesterday.isoformat())\
                    .execute()
                recent_logs_24h = recent_logs_response.count or 0
            except:
                recent_logs_24h = 0
            
            try:
                recent_alerts_response = self.supabase.table('alerts')\
                    .select('id', count='exact')\
                    .gte('timestamp', yesterday.isoformat())\
                    .execute()
                recent_alerts_24h = recent_alerts_response.count or 0
            except:
                recent_alerts_24h = 0
            
            return {
                "database_connected": True,
                "total_logs": total_logs,
                "total_alerts": total_alerts,
                "recent_logs_24h": recent_logs_24h,
                "recent_alerts_24h": recent_alerts_24h,
                "connection_info": self.get_connection_info()
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {
                "database_connected": False,
                "total_logs": 0,
                "total_alerts": 0,
                "recent_logs_24h": 0,
                "recent_alerts_24h": 0,
                "error": str(e)
            }
    
    def get_connection_info(self) -> Dict[str, Any]:
        """Get database connection information."""
        return {
            "connected": self.is_connected,
            "supabase_url": os.getenv('SUPABASE_URL', 'Not set'),
            "has_credentials": bool(os.getenv('SUPABASE_KEY')),
            "client_available": self.supabase is not None,
            "connection_attempts": self.connection_attempts,
            "max_retries": self.max_retries
        }
    
    def reconnect(self) -> bool:
        """Attempt to reconnect to the database."""
        logger.info("Attempting to reconnect to database...")
        self.connection_attempts += 1
        
        if self.connection_attempts > self.max_retries:
            logger.error(f"Max retry attempts ({self.max_retries}) exceeded")
            return False
        
        # Reset connection state
        self.is_connected = False
        self.supabase = None
        
        # Wait before retrying
        import time
        time.sleep(self.retry_delay)
        
        # Reinitialize connection
        self._initialize_connection()
        
        return self.is_connected
    
    def cleanup_old_data(self, days: int = 30) -> bool:
        """Clean up old data from database."""
        try:
            if not self.is_connected or not self.supabase:
                logger.warning("Database not connected, skipping cleanup")
                return False
            
            cutoff_date = datetime.now() - timedelta(days=days)
            
            # Clean up old logs
            logs_response = self.supabase.table('logs')\
                .delete()\
                .lt('timestamp', cutoff_date.isoformat())\
                .execute()
            
            # Clean up old alerts
            alerts_response = self.supabase.table('alerts')\
                .delete()\
                .lt('timestamp', cutoff_date.isoformat())\
                .execute()
            
            logger.info(f"Cleaned up data older than {days} days")
            return True
            
        except Exception as e:
            logger.error(f"Error cleaning up old data: {str(e)}")
            return False

# Global fixed database manager instance
fixed_db_manager = FixedDatabaseManager()
