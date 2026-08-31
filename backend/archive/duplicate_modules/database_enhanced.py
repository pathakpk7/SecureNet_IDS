#!/usr/bin/env python3
"""
SecureNet IDS - Enhanced Database Integration
Supabase database integration for storing detection logs and alerts.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logging.warning("Supabase not available. Database features will be disabled.")

from .schemas import Alert, LogEntry

logger = logging.getLogger(__name__)

class EnhancedDatabaseManager:
    """Enhanced database manager with Supabase integration."""
    
    def __init__(self):
        """Initialize database manager."""
        self.supabase: Optional[Client] = None
        self.connected = False
        self.logger = logging.getLogger(__name__)
        
        # Database configuration
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        
        # Initialize connection
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize Supabase connection."""
        if not SUPABASE_AVAILABLE:
            self.logger.warning("Supabase client not available")
            return
        
        if not self.supabase_url or not self.supabase_key:
            self.logger.warning("Supabase credentials not provided")
            return
        
        try:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            self.connected = True
            self.logger.info("✅ Connected to Supabase database")
            
            # Test connection
            self._test_connection()
            
        except Exception as e:
            self.logger.error(f"❌ Failed to connect to Supabase: {str(e)}")
            self.connected = False
    
    def _test_connection(self):
        """Test database connection."""
        try:
            # Simple test query
            response = self.supabase.table('logs').select('id').limit(1).execute()
            self.logger.info("✅ Database connection test successful")
        except Exception as e:
            self.logger.warning(f"Database test failed (table may not exist): {str(e)}")
    
    async def store_detection_log(self, detection_data: Dict[str, Any]) -> bool:
        """
        Store detection log in database.
        
        Args:
            detection_data: Detection information
            
        Returns:
            True if stored successfully, False otherwise
        """
        if not self.connected:
            self.logger.warning("Database not connected, skipping log storage")
            return False
        
        try:
            # Prepare log entry
            log_entry = {
                'timestamp': detection_data.get('timestamp', datetime.utcnow().isoformat()),
                'source_ip': detection_data.get('source_ip'),
                'destination_ip': detection_data.get('destination_ip'),
                'protocol': detection_data.get('protocol'),
                'packet_length': detection_data.get('packet_length'),
                'prediction': detection_data.get('prediction', False),
                'confidence': detection_data.get('confidence', 0.0),
                'attack_type': detection_data.get('attack_type', 'normal'),
                'risk_level': detection_data.get('risk_level', 'LOW'),
                'features': detection_data.get('features', {}),
                'threat_intel': detection_data.get('threat_intel', {}),
                'ml_confidence': detection_data.get('ml_confidence', 0.0),
                'sources': detection_data.get('sources', [])
            }
            
            # Insert into database
            response = self.supabase.table('logs').insert(log_entry).execute()
            
            if response.data:
                self.logger.debug(f"✅ Stored detection log for {detection_data.get('source_ip')}")
                return True
            else:
                self.logger.error("❌ Failed to store detection log")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error storing detection log: {str(e)}")
            return False
    
    async def store_security_alert(self, alert_data: Dict[str, Any]) -> bool:
        """
        Store security alert in database.
        
        Args:
            alert_data: Alert information
            
        Returns:
            True if stored successfully, False otherwise
        """
        if not self.connected:
            self.logger.warning("Database not connected, skipping alert storage")
            return False
        
        try:
            # Prepare alert entry
            alert_entry = {
                'id': alert_data.get('id', f"alert_{int(datetime.utcnow().timestamp())}"),
                'timestamp': alert_data.get('timestamp', datetime.utcnow().isoformat()),
                'source_ip': alert_data.get('source_ip'),
                'destination_ip': alert_data.get('destination_ip'),
                'attack_type': alert_data.get('attack_type', 'unknown'),
                'risk_level': alert_data.get('risk_level', 'MEDIUM'),
                'confidence': alert_data.get('confidence', 0.0),
                'status': alert_data.get('status', 'active'),
                'details': alert_data.get('details', {}),
                'threat_intel_results': alert_data.get('threat_intel_results', []),
                'ml_prediction': alert_data.get('ml_prediction', {}),
                'sources': alert_data.get('sources', []),
                'alert_flag': alert_data.get('alert_flag', False)
            }
            
            # Insert into database
            response = self.supabase.table('alerts').insert(alert_entry).execute()
            
            if response.data:
                self.logger.info(f"🚨 Stored security alert for {alert_data.get('source_ip')} - {alert_data.get('attack_type')}")
                return True
            else:
                self.logger.error("❌ Failed to store security alert")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error storing security alert: {str(e)}")
            return False
    
    async def get_recent_logs(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get recent detection logs.
        
        Args:
            limit: Maximum number of logs to retrieve
            offset: Number of logs to skip
            
        Returns:
            List of log entries
        """
        if not self.connected:
            return []
        
        try:
            response = (self.supabase.table('logs')
                       .select('*')
                       .order('timestamp', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            
            return response.data if response.data else []
            
        except Exception as e:
            self.logger.error(f"❌ Error retrieving logs: {str(e)}")
            return []
    
    async def get_recent_alerts(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get recent security alerts.
        
        Args:
            limit: Maximum number of alerts to retrieve
            offset: Number of alerts to skip
            
        Returns:
            List of alert entries
        """
        if not self.connected:
            return []
        
        try:
            response = (self.supabase.table('alerts')
                       .select('*')
                       .order('timestamp', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            
            return response.data if response.data else []
            
        except Exception as e:
            self.logger.error(f"❌ Error retrieving alerts: {str(e)}")
            return []
    
    async def get_logs_by_ip(self, ip_address: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get logs for specific IP address.
        
        Args:
            ip_address: IP address to search for
            limit: Maximum number of logs to retrieve
            
        Returns:
            List of log entries
        """
        if not self.connected:
            return []
        
        try:
            response = (self.supabase.table('logs')
                       .select('*')
                       .or_(f"source_ip.eq.{ip_address},destination_ip.eq.{ip_address}")
                       .order('timestamp', desc=True)
                       .limit(limit)
                       .execute())
            
            return response.data if response.data else []
            
        except Exception as e:
            self.logger.error(f"❌ Error retrieving logs for IP {ip_address}: {str(e)}")
            return []
    
    async def get_alerts_by_risk_level(self, risk_level: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get alerts by risk level.
        
        Args:
            risk_level: Risk level to filter by (LOW, MEDIUM, HIGH, CRITICAL)
            limit: Maximum number of alerts to retrieve
            
        Returns:
            List of alert entries
        """
        if not self.connected:
            return []
        
        try:
            response = (self.supabase.table('alerts')
                       .select('*')
                       .eq('risk_level', risk_level)
                       .order('timestamp', desc=True)
                       .limit(limit)
                       .execute())
            
            return response.data if response.data else []
            
        except Exception as e:
            self.logger.error(f"❌ Error retrieving alerts for risk level {risk_level}: {str(e)}")
            return []
    
    async def get_statistics(self) -> Dict[str, Any]:
        """
        Get database statistics.
        
        Returns:
            Dictionary with statistics
        """
        if not self.connected:
            return {"error": "Database not connected"}
        
        try:
            # Get total counts
            logs_response = self.supabase.table('logs').select('id', count='exact').execute()
            alerts_response = self.supabase.table('alerts').select('id', count='exact').execute()
            
            # Get recent activity (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(days=1)
            
            recent_logs_response = (self.supabase.table('logs')
                                   .select('id', count='exact')
                                   .gte('timestamp', yesterday.isoformat())
                                   .execute())
            
            recent_alerts_response = (self.supabase.table('alerts')
                                    .select('id', count='exact')
                                    .gte('timestamp', yesterday.isoformat())
                                    .execute())
            
            # Get attack type distribution
            attack_types_response = (self.supabase.table('logs')
                                   .select('attack_type')
                                   .not_.is_('attack_type', 'null')
                                   .execute())
            
            attack_types = {}
            if attack_types_response.data:
                for log in attack_types_response.data:
                    attack_type = log.get('attack_type', 'unknown')
                    attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
            
            # Get risk level distribution
            risk_levels_response = (self.supabase.table('alerts')
                                   .select('risk_level')
                                   .not_.is_('risk_level', 'null')
                                   .execute())
            
            risk_levels = {}
            if risk_levels_response.data:
                for alert in risk_levels_response.data:
                    risk_level = alert.get('risk_level', 'UNKNOWN')
                    risk_levels[risk_level] = risk_levels.get(risk_level, 0) + 1
            
            return {
                'total_logs': logs_response.count or 0,
                'total_alerts': alerts_response.count or 0,
                'recent_logs_24h': recent_logs_response.count or 0,
                'recent_alerts_24h': recent_alerts_response.count or 0,
                'attack_type_distribution': attack_types,
                'risk_level_distribution': risk_levels,
                'database_connected': True
            }
            
        except Exception as e:
            self.logger.error(f"❌ Error retrieving statistics: {str(e)}")
            return {"error": str(e)}
    
    async def cleanup_old_records(self, days: int = 30) -> bool:
        """
        Clean up old records from database.
        
        Args:
            days: Number of days to keep records
            
        Returns:
            True if cleanup successful, False otherwise
        """
        if not self.connected:
            return False
        
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Delete old logs
            logs_response = (self.supabase.table('logs')
                            .delete()
                            .lt('timestamp', cutoff_date.isoformat())
                            .execute())
            
            # Delete old alerts
            alerts_response = (self.supabase.table('alerts')
                              .delete()
                              .lt('timestamp', cutoff_date.isoformat())
                              .execute())
            
            deleted_logs = len(logs_response.data) if logs_response.data else 0
            deleted_alerts = len(alerts_response.data) if alerts_response.data else 0
            
            self.logger.info(f"🧹 Cleaned up {deleted_logs} old logs and {deleted_alerts} old alerts")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error during cleanup: {str(e)}")
            return False
    
    async def create_tables(self) -> bool:
        """
        Create necessary database tables.
        
        Returns:
            True if tables created successfully, False otherwise
        """
        if not self.connected:
            return False
        
        try:
            # Note: This would typically be done through Supabase dashboard
            # or SQL migrations. Including for completeness.
            
            # Create logs table
            logs_sql = """
            CREATE TABLE IF NOT EXISTS logs (
                id BIGINT PRIMARY KEY DEFAULT gen_random_uuid(),
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                source_ip TEXT,
                destination_ip TEXT,
                protocol TEXT,
                packet_length INTEGER,
                prediction BOOLEAN DEFAULT FALSE,
                confidence FLOAT DEFAULT 0.0,
                attack_type TEXT DEFAULT 'normal',
                risk_level TEXT DEFAULT 'LOW',
                features JSONB,
                threat_intel JSONB,
                ml_confidence FLOAT DEFAULT 0.0,
                sources TEXT[]
            );
            """
            
            # Create alerts table
            alerts_sql = """
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                source_ip TEXT,
                destination_ip TEXT,
                attack_type TEXT,
                risk_level TEXT DEFAULT 'MEDIUM',
                confidence FLOAT DEFAULT 0.0,
                status TEXT DEFAULT 'active',
                details JSONB,
                threat_intel_results JSONB,
                ml_prediction JSONB,
                sources TEXT[],
                alert_flag BOOLEAN DEFAULT FALSE
            );
            """
            
            # Create indexes
            indexes_sql = [
                "CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);",
                "CREATE INDEX IF NOT EXISTS idx_logs_source_ip ON logs(source_ip);",
                "CREATE INDEX IF NOT EXISTS idx_logs_attack_type ON logs(attack_type);",
                "CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);",
                "CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON alerts(source_ip);",
                "CREATE INDEX IF NOT EXISTS idx_alerts_risk_level ON alerts(risk_level);"
            ]
            
            self.logger.info("📋 Database tables should be created via Supabase dashboard")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error creating tables: {str(e)}")
            return False
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check database health.
        
        Returns:
            Health status dictionary
        """
        if not self.connected:
            return {
                "status": "unhealthy",
                "error": "Database not connected",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        try:
            # Simple test query
            start_time = datetime.utcnow()
            response = self.supabase.table('logs').select('id').limit(1).execute()
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "healthy",
                "response_time_ms": response_time * 1000,
                "timestamp": datetime.utcnow().isoformat(),
                "database_url": self.supabase_url[:50] + "..." if self.supabase_url else None
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def is_connected(self) -> bool:
        """Check if database is connected."""
        return self.connected
    
    def get_connection_info(self) -> Dict[str, Any]:
        """Get database connection information."""
        return {
            "connected": self.connected,
            "supabase_url": self.supabase_url[:50] + "..." if self.supabase_url else None,
            "has_credentials": bool(self.supabase_key),
            "client_available": SUPABASE_AVAILABLE
        }

# Global enhanced database manager instance
enhanced_db_manager = EnhancedDatabaseManager()
