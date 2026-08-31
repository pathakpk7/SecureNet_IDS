"""
SecureNet IDS - Consolidated Database Manager
Production-ready database management with repository pattern and in-memory fallback
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import uuid
import json

from core.config import settings
from core.settings import DB_TABLES
from schemas import Alert, LogEntry, Stats, BlacklistEntry, MonitoringStatus
from .sqlite_db import sqlite_db, SQLiteDatabase

try:
    from supabase import create_client, Client
    SUPABASE_LIB_AVAILABLE = True
except ImportError:
    SUPABASE_LIB_AVAILABLE = False
    Client = Any

# Try to import repositories if available
try:
    from .repositories.base_repository import BaseRepository
    from .repositories.alert_repository import AlertRepository
    from .repositories.audit_repository import AuditRepository
    from .repositories.organization_repository import OrganizationRepository
    from .repositories.user_repository import UserRepository
    REPOSITORIES_AVAILABLE = True
except ImportError:
    REPOSITORIES_AVAILABLE = False

logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Consolidated database manager with SQLite persistent database, Supabase cloud sync, and in-memory caching.
    """
    
    def __init__(self):
        """Initialize database manager and repositories"""
        self.sqlite = sqlite_db
        self.supabase = None
        self._in_memory_alerts: List[Dict[str, Any]] = []
        self._in_memory_logs: List[Dict[str, Any]] = []
        self._in_memory_stats: List[Dict[str, Any]] = []
        self._in_memory_blacklist: List[Dict[str, Any]] = []
        
        if SUPABASE_LIB_AVAILABLE and settings.supabase_url and settings.supabase_key:
            try:
                self.supabase = create_client(settings.supabase_url, settings.supabase_key)
                logger.info("Supabase client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Operating in resilient in-memory mode.")
                self.supabase = None
        else:
            logger.info("Supabase client not configured. Operating in in-memory mode.")
            self.supabase = None
        
        self._supabase_enabled = True if self.supabase else False
        
        # Initialize repositories if available
        if REPOSITORIES_AVAILABLE and self.supabase:
            try:
                self.alerts = AlertRepository(self.supabase)
                self.audit = AuditRepository(self.supabase)
                self.organizations = OrganizationRepository(self.supabase)
                self.users = UserRepository(self.supabase)
            except Exception:
                self.alerts = None
                self.audit = None
                self.organizations = None
                self.users = None
        else:
            self.alerts = None
            self.audit = None
            self.organizations = None
            self.users = None
    
    async def health_check(self) -> bool:
        """Check database connection health"""
        if not self.supabase or not self._supabase_enabled:
            return False
        try:
            response = await asyncio.to_thread(
                lambda: self.supabase.table(DB_TABLES.get("alerts", "ids_alerts")).select("id").limit(1).execute()
            )
            return True
        except Exception as e:
            logger.info(f"Supabase health check notice ({e}). Operating in resilient in-memory mode.")
            self._supabase_enabled = False
            return False
    
    def is_connected(self) -> bool:
        """Check if database layer is operational (Supabase or In-Memory)"""
        return True
    
    # ============================================================
    # ALERTS OPERATIONS
    # ============================================================
    
    async def insert_alert(self, alert: Alert) -> str:
        """Insert a new alert into the database with fallback"""
        alert_id = str(uuid.uuid4())
        alert_dict = {
            "id": alert_id,
            "source_ip": alert.source_ip,
            "destination_ip": alert.destination_ip,
            "protocol": alert.protocol.value if hasattr(alert.protocol, 'value') else str(alert.protocol),
            "timestamp": alert.timestamp.isoformat() if hasattr(alert.timestamp, 'isoformat') else str(alert.timestamp),
            "attack_type": alert.attack_type.value if hasattr(alert.attack_type, 'value') else str(alert.attack_type),
            "risk_level": alert.risk_level.value if hasattr(alert.risk_level, 'value') else str(alert.risk_level),
            "confidence": alert.confidence,
            "description": alert.description,
            "threat_intel_data": alert.threat_intel_data,
            "packet_data": alert.packet_data.dict() if hasattr(alert.packet_data, 'dict') else alert.packet_data,
            "prediction_result": alert.prediction_result.dict() if hasattr(alert.prediction_result, 'dict') else alert.prediction_result
        }
        
        # Always maintain in-memory buffer and SQLite persistent store
        self._in_memory_alerts.insert(0, alert_dict)
        if len(self._in_memory_alerts) > 1000:
            self._in_memory_alerts.pop()
        
        # Persist to embedded SQLite database
        self.sqlite.insert_alert(alert_dict)
        
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("alerts", "alerts")
                db_data = {
                    "source_ip": alert_dict["source_ip"],
                    "destination_ip": alert_dict["destination_ip"],
                    "protocol": alert_dict["protocol"],
                    "timestamp": alert_dict["timestamp"],
                    "attack_type": alert_dict["attack_type"],
                    "risk_level": alert_dict["risk_level"],
                    "confidence": alert_dict["confidence"],
                    "description": alert_dict["description"],
                    "threat_intel_data": json.dumps(alert_dict["threat_intel_data"], default=str) if alert_dict["threat_intel_data"] is not None else None,
                    "packet_data": json.dumps(alert_dict["packet_data"], default=str) if alert_dict["packet_data"] is not None else None,
                    "prediction_result": json.dumps(alert_dict["prediction_result"], default=str) if alert_dict["prediction_result"] is not None else None
                }
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(db_data).execute()
                )
                if res and res.data:
                    return res.data[0].get("id", alert_id)
                else:
                    self._supabase_enabled = False
            except Exception as e:
                logger.debug(f"Supabase alert insert fallback: {e}")
                self._supabase_enabled = False
        
        return alert_id
    
    async def get_alerts(self, limit: int = 100, offset: int = 0, 
                         risk_level: Optional[str] = None,
                         start_time: Optional[datetime] = None,
                         end_time: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Retrieve alerts from database with in-memory and SQLite fallback"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("alerts", "alerts")
                def _fetch():
                    query = self.supabase.table(table_name).select("*")
                    if risk_level:
                        query = query.eq("risk_level", risk_level)
                    if start_time:
                        query = query.gte("timestamp", start_time.isoformat())
                    if end_time:
                        query = query.lte("timestamp", end_time.isoformat())
                    return query.order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
                response = await asyncio.to_thread(_fetch)
                if response and response.data:
                    return response.data
                else:
                    self._supabase_enabled = False
            except Exception as e:
                logger.debug(f"Supabase get_alerts fallback: {e}")
                self._supabase_enabled = False
        
        if self._in_memory_alerts:
            filtered = self._in_memory_alerts
            if risk_level:
                filtered = [a for a in filtered if a.get("risk_level") == risk_level]
            return filtered[offset:offset + limit]
        
        return self.sqlite.get_alerts(limit=limit, offset=offset, risk_level=risk_level)
    
    # ============================================================
    # LOGS OPERATIONS
    # ============================================================
    
    async def insert_log(self, log_entry: LogEntry) -> str:
        """Insert a new log entry"""
        log_id = str(uuid.uuid4())
        log_dict = {
            "id": log_id,
            "timestamp": log_entry.timestamp.isoformat() if hasattr(log_entry.timestamp, 'isoformat') else str(log_entry.timestamp),
            "level": log_entry.level,
            "message": log_entry.message,
            "source": log_entry.source,
            "packet_data": log_entry.packet_data.dict() if hasattr(log_entry.packet_data, 'dict') else log_entry.packet_data,
            "alert_id": log_entry.alert_id
        }
        
        self._in_memory_logs.insert(0, log_dict)
        if len(self._in_memory_logs) > 2000:
            self._in_memory_logs.pop()
            
        # Persist to SQLite
        self.sqlite.insert_log(log_dict)
        
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("logs", "ids_logs")
                db_data = {
                    "timestamp": log_dict["timestamp"],
                    "level": log_dict["level"],
                    "message": log_dict["message"],
                    "source": log_dict["source"],
                    "packet_data": json.dumps(log_dict["packet_data"], default=str) if log_dict["packet_data"] is not None else None,
                    "alert_id": log_dict["alert_id"]
                }
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(db_data).execute()
                )
                if res and res.data:
                    return res.data[0].get("id", log_id)
                else:
                    self._supabase_enabled = False
            except Exception as e:
                logger.debug(f"Supabase log insert fallback: {e}")
                self._supabase_enabled = False
        
        return log_id
    
    async def get_logs(self, limit: int = 100, offset: int = 0,
                       level: Optional[str] = None,
                       start_time: Optional[datetime] = None,
                       end_time: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Retrieve log entries"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("logs", "ids_logs")
                def _fetch_logs():
                    query = self.supabase.table(table_name).select("*")
                    if level:
                        query = query.eq("level", level)
                    if start_time:
                        query = query.gte("timestamp", start_time.isoformat())
                    if end_time:
                        query = query.lte("timestamp", end_time.isoformat())
                    return query.order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
                response = await asyncio.to_thread(_fetch_logs)
                if response and response.data:
                    return response.data
                else:
                    self._supabase_enabled = False
            except Exception as e:
                logger.debug(f"Supabase get_logs fallback: {e}")
                self._supabase_enabled = False
        
        filtered = self._in_memory_logs
        if level:
            filtered = [l for l in filtered if l.get("level") == level]
        return filtered[offset:offset + limit]
    
    async def get_recent_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Alias for get_logs"""
        return await self.get_logs(limit=limit)
        
    async def get_recent_alerts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Alias for get_alerts"""
        return await self.get_alerts(limit=limit)
    
    async def store_detection_log(self, detection_data: Dict[str, Any]) -> bool:
        """Store detection log with enhanced data"""
        self._in_memory_logs.insert(0, detection_data)
        if len(self._in_memory_logs) > 2000:
            self._in_memory_logs.pop()
        
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("logs", "ids_logs")
                log_data = {
                    "timestamp": detection_data.get("timestamp"),
                    "source_ip": detection_data.get("source_ip"),
                    "destination_ip": detection_data.get("destination_ip"),
                    "protocol": str(detection_data.get("protocol")),
                    "prediction": detection_data.get("prediction"),
                    "confidence": detection_data.get("confidence"),
                    "attack_type": detection_data.get("attack_type"),
                    "risk_level": detection_data.get("risk_level"),
                    "features": json.dumps(detection_data.get("features")) if detection_data.get("features") else None,
                    "threat_intel": json.dumps(detection_data.get("threat_intel")) if detection_data.get("threat_intel") else None
                }
                response = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(log_data).execute()
                )
                if response and response.data:
                    return True
                else:
                    self._supabase_enabled = False
            except Exception as e:
                logger.debug(f"Supabase store_detection_log fallback: {e}")
                self._supabase_enabled = False
        return True
    
    async def store_log_entry(self, log_entry: LogEntry) -> bool:
        """Store detection log entry"""
        await self.insert_log(log_entry)
        return True

    async def store_security_alert(self, alert_data: Dict[str, Any]) -> bool:
        """Store security alert dictionary"""
        self._in_memory_alerts.insert(0, alert_data)
        if len(self._in_memory_alerts) > 1000:
            self._in_memory_alerts.pop()
            
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("alerts", "alerts")
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(alert_data).execute()
                )
                return bool(res and res.data)
            except Exception as e:
                logger.debug(f"Supabase store_security_alert fallback: {e}")
        return True

    # ============================================================
    # STATS OPERATIONS
    # ============================================================
    
    async def update_stats(self, stats: Stats) -> str:
        """Insert or update statistics"""
        stat_id = str(uuid.uuid4())
        stats_dict = {
            "id": stat_id,
            "timestamp": stats.timestamp.isoformat() if hasattr(stats.timestamp, 'isoformat') else str(stats.timestamp),
            "total_packets": stats.total_packets,
            "malicious_packets": stats.malicious_packets,
            "normal_packets": stats.normal_packets,
            "alerts_generated": stats.alerts_generated,
            "top_source_ips": stats.top_source_ips,
            "top_destination_ips": stats.top_destination_ips,
            "protocol_distribution": stats.protocol_distribution,
            "attack_type_distribution": stats.attack_type_distribution
        }
        self._in_memory_stats.insert(0, stats_dict)
        if len(self._in_memory_stats) > 500:
            self._in_memory_stats.pop()
        
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("stats", "ids_stats")
                db_data = {
                    "timestamp": stats_dict["timestamp"],
                    "total_packets": stats_dict["total_packets"],
                    "malicious_packets": stats_dict["malicious_packets"],
                    "normal_packets": stats_dict["normal_packets"],
                    "alerts_generated": stats_dict["alerts_generated"],
                    "top_source_ips": json.dumps(stats_dict["top_source_ips"]),
                    "top_destination_ips": json.dumps(stats_dict["top_destination_ips"]),
                    "protocol_distribution": json.dumps(stats_dict["protocol_distribution"]),
                    "attack_type_distribution": json.dumps(stats_dict["attack_type_distribution"])
                }
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(db_data).execute()
                )
                if res.data:
                    return res.data[0].get("id", stat_id)
            except Exception as e:
                logger.debug(f"Supabase update_stats fallback: {e}")
                self._supabase_enabled = False
        return stat_id
    
    async def get_latest_stats(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get statistics for the last N hours"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("stats", "ids_stats")
                start_time = datetime.utcnow() - timedelta(hours=hours)
                def _fetch_stats():
                    return self.supabase.table(table_name).select("*")\
                        .gte("timestamp", start_time.isoformat())\
                        .order("timestamp", desc=True)\
                        .execute()
                response = await asyncio.to_thread(_fetch_stats)
                if response.data:
                    return response.data
            except Exception as e:
                logger.debug(f"Supabase get_latest_stats fallback: {e}")
                self._supabase_enabled = False
        
        return self._in_memory_stats
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get current system statistics"""
        stats_list = await self.get_latest_stats(hours=1)
        if stats_list:
            return stats_list[0]
        
        # Calculate from in-memory logs and alerts
        total = len(self._in_memory_logs)
        alerts_count = len(self._in_memory_alerts)
        return {
            "total_packets": total or alerts_count,
            "malicious_packets": alerts_count,
            "normal_packets": max(0, total - alerts_count),
            "alerts_generated": alerts_count,
            "top_source_ips": {},
            "top_destination_ips": {},
            "protocol_distribution": {"tcp": total or alerts_count},
            "attack_type_distribution": {}
        }
    
    # ============================================================
    # BLACKLIST OPERATIONS
    # ============================================================
    
    async def add_to_blacklist(self, entry: BlacklistEntry) -> str:
        """Add an IP to the blacklist"""
        entry_id = str(uuid.uuid4())
        item = {
            "id": entry_id,
            "ip_address": entry.ip_address,
            "reason": entry.reason,
            "added_at": entry.added_at.isoformat() if hasattr(entry.added_at, 'isoformat') else str(entry.added_at),
            "risk_level": entry.risk_level.value if hasattr(entry.risk_level, 'value') else str(entry.risk_level),
            "source": entry.source,
            "is_active": entry.is_active
        }
        # Update or append
        self._in_memory_blacklist = [b for b in self._in_memory_blacklist if b.get("ip_address") != entry.ip_address]
        self._in_memory_blacklist.insert(0, item)
        
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("blacklist", "ids_blacklist")
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(item).execute()
                )
                if res.data:
                    return res.data[0].get("id", entry_id)
            except Exception as e:
                logger.debug(f"Supabase add_to_blacklist fallback: {e}")
                self._supabase_enabled = False
        return entry_id
    
    async def is_blacklisted(self, ip_address: str) -> bool:
        """Check if an IP is blacklisted"""
        for item in self._in_memory_blacklist:
            if item.get("ip_address") == ip_address and item.get("is_active", True):
                return True
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("blacklist", "ids_blacklist")
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).select("*").eq("ip_address", ip_address).eq("is_active", True).execute()
                )
                return len(res.data) > 0 if res.data else False
            except Exception:
                self._supabase_enabled = False
        return False
    
    async def get_blacklist(self) -> List[Dict[str, Any]]:
        """Get all active blacklist entries"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("blacklist", "ids_blacklist")
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).select("*").eq("is_active", True).execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.debug(f"Supabase get_blacklist fallback: {e}")
                self._supabase_enabled = False
        return [b for b in self._in_memory_blacklist if b.get("is_active", True)]
    
    async def remove_from_blacklist(self, ip_address: str) -> bool:
        """Remove IP from blacklist"""
        for item in self._in_memory_blacklist:
            if item.get("ip_address") == ip_address:
                item["is_active"] = False
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("blacklist", "ids_blacklist")
                await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).update({"is_active": False}).eq("ip_address", ip_address).execute()
                )
            except Exception as e:
                logger.debug(f"Supabase remove_from_blacklist fallback: {e}")
                self._supabase_enabled = False
        return True

    # ============================================================
    # ORGANIZATIONS OPERATIONS
    # ============================================================

    async def get_organizations(self) -> List[Dict[str, Any]]:
        """Get all organizations"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("organizations", "organizations")
                res = await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).select("*").execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.debug(f"Supabase get_organizations fallback: {e}")
                self._supabase_enabled = False
        return self.sqlite.get_organizations()

    async def create_organization(self, org_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new organization"""
        res = self.sqlite.create_organization(org_data)
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("organizations", "organizations")
                await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(org_data).execute()
                )
            except Exception as e:
                logger.debug(f"Supabase create_organization fallback: {e}")
                self._supabase_enabled = False
        return res

    # ============================================================
    # USERS OPERATIONS
    # ============================================================

    async def get_users(self, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get users with optional org filtering"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("users", "profiles")
                query = self.supabase.table(table_name).select("*")
                if org_id:
                    query = query.eq("org_id", org_id)
                res = await asyncio.to_thread(lambda: query.execute())
                if res.data:
                    return res.data
            except Exception as e:
                logger.debug(f"Supabase get_users fallback: {e}")
                self._supabase_enabled = False
        return self.sqlite.get_users(org_id=org_id)

    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a user profile"""
        res = self.sqlite.create_user(user_data)
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("users", "profiles")
                await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).upsert(user_data).execute()
                )
            except Exception as e:
                logger.debug(f"Supabase create_user fallback: {e}")
                self._supabase_enabled = False
        return res

    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        res = self.sqlite.update_user(user_id, updates)
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("users", "profiles")
                await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).update(updates).eq("id", user_id).execute()
                )
            except Exception as e:
                logger.debug(f"Supabase update_user fallback: {e}")
                self._supabase_enabled = False
        return res

    async def delete_user(self, user_id: str) -> bool:
        """Delete user profile"""
        res = self.sqlite.delete_user(user_id)
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("users", "profiles")
                await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).delete().eq("id", user_id).execute()
                )
            except Exception as e:
                logger.debug(f"Supabase delete_user fallback: {e}")
                self._supabase_enabled = False
        return res

    # ============================================================
    # AUDIT LOGS OPERATIONS
    # ============================================================

    async def insert_audit_log(self, audit_dict: Dict[str, Any]) -> str:
        """Insert an audit log entry"""
        log_id = self.sqlite.insert_audit_log(audit_dict)
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("audit_logs", "audit_logs")
                await asyncio.to_thread(
                    lambda: self.supabase.table(table_name).insert(audit_dict).execute()
                )
            except Exception as e:
                logger.debug(f"Supabase insert_audit_log fallback: {e}")
                self._supabase_enabled = False
        return log_id

    async def get_audit_logs(
        self,
        limit: int = 100,
        offset: int = 0,
        action: Optional[str] = None,
        user_id: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get audit logs"""
        if self.supabase and self._supabase_enabled:
            try:
                table_name = DB_TABLES.get("audit_logs", "audit_logs")
                query = self.supabase.table(table_name).select("*")
                if action:
                    query = query.eq("action", action)
                if user_id:
                    query = query.eq("user_id", user_id)
                res = await asyncio.to_thread(
                    lambda: query.order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
                )
                if res.data:
                    return res.data
            except Exception as e:
                logger.debug(f"Supabase get_audit_logs fallback: {e}")
                self._supabase_enabled = False
        return self.sqlite.get_audit_logs(
            limit=limit, offset=offset, action=action, user_id=user_id, start_time=start_time, end_time=end_time
        )


# Global database manager instance
db_manager = DatabaseManager()
