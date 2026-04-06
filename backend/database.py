import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from .config import settings, DB_TABLES
from .schemas import Alert, LogEntry, Stats, BlacklistEntry, MonitoringStatus
import json


class DatabaseManager:
    def __init__(self):
        self.supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
        self._connection_pool = None
        
    async def health_check(self) -> bool:
        """Check database connection health"""
        try:
            response = self.supabase.table(DB_TABLES["alerts"]).select("id").limit(1).execute()
            return True
        except Exception as e:
            print(f"Database health check failed: {e}")
            return False
    
    async def insert_alert(self, alert: Alert) -> str:
        """Insert a new alert into the database"""
        try:
            alert_data = {
                "source_ip": alert.source_ip,
                "destination_ip": alert.destination_ip,
                "protocol": alert.protocol.value,
                "timestamp": alert.timestamp.isoformat(),
                "attack_type": alert.attack_type.value,
                "risk_level": alert.risk_level.value,
                "confidence": alert.confidence,
                "description": alert.description,
                "threat_intel_data": json.dumps(alert.threat_intel_data) if alert.threat_intel_data else None,
                "packet_data": json.dumps(alert.packet_data.dict()) if alert.packet_data else None,
                "prediction_result": json.dumps(alert.prediction_result.dict()) if alert.prediction_result else None
            }
            
            response = self.supabase.table(DB_TABLES["alerts"]).insert(alert_data).execute()
            
            if response.data:
                return response.data[0]["id"]
            else:
                raise Exception("Failed to insert alert")
                
        except Exception as e:
            print(f"Error inserting alert: {e}")
            raise
    
    async def get_alerts(self, limit: int = 100, offset: int = 0, 
                        risk_level: Optional[str] = None,
                        start_time: Optional[datetime] = None,
                        end_time: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Retrieve alerts from database with filtering options"""
        try:
            query = self.supabase.table(DB_TABLES["alerts"]).select("*")
            
            if risk_level:
                query = query.eq("risk_level", risk_level)
            
            if start_time:
                query = query.gte("timestamp", start_time.isoformat())
            
            if end_time:
                query = query.lte("timestamp", end_time.isoformat())
            
            response = query.order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error retrieving alerts: {e}")
            return []
    
    async def insert_log(self, log_entry: LogEntry) -> str:
        """Insert a new log entry"""
        try:
            log_data = {
                "timestamp": log_entry.timestamp.isoformat(),
                "level": log_entry.level,
                "message": log_entry.message,
                "source": log_entry.source,
                "packet_data": json.dumps(log_entry.packet_data.dict()) if log_entry.packet_data else None,
                "alert_id": log_entry.alert_id
            }
            
            response = self.supabase.table(DB_TABLES["logs"]).insert(log_data).execute()
            
            if response.data:
                return response.data[0]["id"]
            else:
                raise Exception("Failed to insert log entry")
                
        except Exception as e:
            print(f"Error inserting log entry: {e}")
            raise
    
    async def get_logs(self, limit: int = 100, offset: int = 0,
                      level: Optional[str] = None,
                      start_time: Optional[datetime] = None,
                      end_time: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Retrieve log entries with filtering"""
        try:
            query = self.supabase.table(DB_TABLES["logs"]).select("*")
            
            if level:
                query = query.eq("level", level)
            
            if start_time:
                query = query.gte("timestamp", start_time.isoformat())
            
            if end_time:
                query = query.lte("timestamp", end_time.isoformat())
            
            response = query.order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error retrieving logs: {e}")
            return []
    
    async def update_stats(self, stats: Stats) -> str:
        """Insert or update statistics"""
        try:
            stats_data = {
                "timestamp": stats.timestamp.isoformat(),
                "total_packets": stats.total_packets,
                "malicious_packets": stats.malicious_packets,
                "normal_packets": stats.normal_packets,
                "alerts_generated": stats.alerts_generated,
                "top_source_ips": json.dumps(stats.top_source_ips),
                "top_destination_ips": json.dumps(stats.top_destination_ips),
                "protocol_distribution": json.dumps(stats.protocol_distribution),
                "attack_type_distribution": json.dumps(stats.attack_type_distribution)
            }
            
            response = self.supabase.table(DB_TABLES["stats"]).insert(stats_data).execute()
            
            if response.data:
                return response.data[0]["id"]
            else:
                raise Exception("Failed to update stats")
                
        except Exception as e:
            print(f"Error updating stats: {e}")
            raise
    
    async def get_latest_stats(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get statistics for the last N hours"""
        try:
            start_time = datetime.utcnow() - timedelta(hours=hours)
            
            response = self.supabase.table(DB_TABLES["stats"]).select("*")\
                .gte("timestamp", start_time.isoformat())\
                .order("timestamp", desc=True)\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error retrieving stats: {e}")
            return []
    
    async def add_to_blacklist(self, entry: BlacklistEntry) -> str:
        """Add an IP to the blacklist"""
        try:
            blacklist_data = {
                "ip_address": entry.ip_address,
                "reason": entry.reason,
                "added_at": entry.added_at.isoformat(),
                "risk_level": entry.risk_level.value,
                "source": entry.source,
                "is_active": entry.is_active
            }
            
            response = self.supabase.table(DB_TABLES["blacklist"]).insert(blacklist_data).execute()
            
            if response.data:
                return response.data[0]["id"]
            else:
                raise Exception("Failed to add to blacklist")
                
        except Exception as e:
            print(f"Error adding to blacklist: {e}")
            raise
    
    async def is_blacklisted(self, ip_address: str) -> bool:
        """Check if an IP is blacklisted"""
        try:
            response = self.supabase.table(DB_TABLES["blacklist"]).select("*")\
                .eq("ip_address", ip_address)\
                .eq("is_active", True)\
                .execute()
            
            return len(response.data) > 0 if response.data else False
            
        except Exception as e:
            print(f"Error checking blacklist: {e}")
            return False
    
    async def get_blacklist(self) -> List[Dict[str, Any]]:
        """Get all active blacklist entries"""
        try:
            response = self.supabase.table(DB_TABLES["blacklist"]).select("*")\
                .eq("is_active", True)\
                .order("added_at", desc=True)\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error retrieving blacklist: {e}")
            return []
    
    async def remove_from_blacklist(self, ip_address: str) -> bool:
        """Remove an IP from the blacklist (deactivate)"""
        try:
            response = self.supabase.table(DB_TABLES["blacklist"]).update({"is_active": False})\
                .eq("ip_address", ip_address)\
                .execute()
            
            return len(response.data) > 0 if response.data else False
            
        except Exception as e:
            print(f"Error removing from blacklist: {e}")
            return False
    
    async def cleanup_old_data(self, days: int = 30) -> bool:
        """Clean up old data to prevent database bloat"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Clean up old logs
            self.supabase.table(DB_TABLES["logs"]).delete()\
                .lt("timestamp", cutoff_date.isoformat())\
                .execute()
            
            # Clean up old stats
            self.supabase.table(DB_TABLES["stats"]).delete()\
                .lt("timestamp", cutoff_date.isoformat())\
                .execute()
            
            return True
            
        except Exception as e:
            print(f"Error cleaning up old data: {e}")
            return False
    
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get aggregated data for dashboard"""
        try:
            # Get recent alerts
            recent_alerts = await self.get_alerts(limit=10)
            
            # Get latest stats
            latest_stats = await self.get_latest_stats(hours=24)
            
            # Get alert counts by risk level
            high_risk_alerts = await self.get_alerts(limit=1000, risk_level="high")
            critical_alerts = await self.get_alerts(limit=1000, risk_level="critical")
            
            # Get blacklist count
            blacklist = await self.get_blacklist()
            
            return {
                "recent_alerts": recent_alerts,
                "latest_stats": latest_stats,
                "high_risk_count": len(high_risk_alerts),
                "critical_count": len(critical_alerts),
                "blacklist_count": len(blacklist),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting dashboard data: {e}")
            return {}


# Global database instance
db_manager = DatabaseManager()
