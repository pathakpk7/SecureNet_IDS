"""
SecureNet IDS - SQLite Persistent Database Engine
Provides embedded, zero-configuration persistent storage for alerts, logs, stats, blacklist, organizations, users, and audit trails.
"""

import sqlite3
import json
import os
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

logger = logging.getLogger(__name__)

DB_FILE = Path(__file__).parent.parent.parent / "securenet.db"


class SQLiteDatabase:
    """Embedded SQLite database for SecureNet IDS."""
    
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = str(db_path or DB_FILE)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Create all required tables and indexes if they do not exist."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                
                # Alerts table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS alerts (
                        id TEXT PRIMARY KEY,
                        source_ip TEXT NOT NULL,
                        destination_ip TEXT NOT NULL,
                        protocol TEXT NOT NULL,
                        timestamp TEXT NOT NULL,
                        attack_type TEXT NOT NULL,
                        risk_level TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        description TEXT,
                        threat_intel_data TEXT,
                        packet_data TEXT,
                        prediction_result TEXT,
                        org_id TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_risk ON alerts(risk_level)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON alerts(source_ip)")

                # Logs table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS logs (
                        id TEXT PRIMARY KEY,
                        timestamp TEXT NOT NULL,
                        level TEXT NOT NULL,
                        message TEXT NOT NULL,
                        source TEXT,
                        packet_data TEXT,
                        alert_id TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)")

                # Stats table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS stats (
                        id TEXT PRIMARY KEY,
                        timestamp TEXT NOT NULL,
                        total_packets INTEGER DEFAULT 0,
                        attack_count INTEGER DEFAULT 0,
                        normal_count INTEGER DEFAULT 0,
                        protocols TEXT,
                        attack_types TEXT,
                        risk_levels TEXT,
                        performance TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_stats_timestamp ON stats(timestamp DESC)")

                # Blacklist table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS blacklist (
                        ip_address TEXT PRIMARY KEY,
                        reason TEXT,
                        added_at TEXT NOT NULL,
                        expires_at TEXT,
                        threat_intel TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Organizations table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS organizations (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        join_key TEXT UNIQUE,
                        slug TEXT,
                        description TEXT,
                        plan TEXT DEFAULT 'enterprise',
                        owner_id TEXT,
                        is_active INTEGER DEFAULT 1,
                        settings TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Profiles / Users table (with Multi-Admin support)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS profiles (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        name TEXT,
                        role TEXT DEFAULT 'user',
                        specialty_role TEXT DEFAULT 'General Security',
                        org_id TEXT,
                        assigned_admin_id TEXT,
                        is_active INTEGER DEFAULT 1,
                        permissions TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Guidance & Help Requests table (Admin Volunteer & Guidance System)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS guidance_requests (
                        id TEXT PRIMARY KEY,
                        org_id TEXT NOT NULL,
                        user_id TEXT NOT NULL,
                        user_name TEXT,
                        user_email TEXT,
                        admin_id TEXT,
                        admin_name TEXT,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL,
                        category TEXT DEFAULT 'threat_analysis',
                        priority TEXT DEFAULT 'medium',
                        status TEXT DEFAULT 'open',
                        guidance_notes TEXT,
                        related_alert_id TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # User Activities table (Real-time telemetry and user action tracking)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_activities (
                        id TEXT PRIMARY KEY,
                        org_id TEXT NOT NULL,
                        user_id TEXT,
                        email TEXT,
                        action TEXT NOT NULL,
                        resource_type TEXT,
                        resource_id TEXT,
                        details TEXT,
                        ip_address TEXT,
                        timestamp TEXT NOT NULL
                    )
                """)

                # Audit logs table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS audit_logs (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        email TEXT,
                        role TEXT,
                        org_id TEXT,
                        action TEXT NOT NULL,
                        resource_type TEXT,
                        resource_id TEXT,
                        status TEXT DEFAULT 'success',
                        details TEXT,
                        ip_address TEXT,
                        timestamp TEXT NOT NULL,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Safe migrations for pre-existing tables
                def ensure_column(table: str, column: str, col_type: str):
                    try:
                        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
                    except Exception:
                        pass

                ensure_column("organizations", "join_key", "TEXT")
                ensure_column("organizations", "slug", "TEXT")
                ensure_column("organizations", "description", "TEXT")
                ensure_column("organizations", "plan", "TEXT DEFAULT 'enterprise'")
                ensure_column("organizations", "is_active", "INTEGER DEFAULT 1")
                ensure_column("organizations", "settings", "TEXT")
                ensure_column("organizations", "updated_at", "TEXT DEFAULT CURRENT_TIMESTAMP")

                ensure_column("profiles", "name", "TEXT")
                ensure_column("profiles", "specialty_role", "TEXT DEFAULT 'General Security'")
                ensure_column("profiles", "assigned_admin_id", "TEXT")
                ensure_column("profiles", "is_active", "INTEGER DEFAULT 1")
                ensure_column("profiles", "updated_at", "TEXT DEFAULT CURRENT_TIMESTAMP")

                ensure_column("audit_logs", "email", "TEXT")
                ensure_column("audit_logs", "role", "TEXT")
                ensure_column("audit_logs", "status", "TEXT DEFAULT 'success'")

                # Create indexes after column migrations
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_org_join_key ON organizations(join_key)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(assigned_admin_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_guidance_org ON guidance_requests(org_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_guidance_status ON guidance_requests(status)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_act_org ON user_activities(org_id, timestamp DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC)")
                
                # Backfill join_key for organizations without one
                cursor.execute("SELECT id, join_key FROM organizations")
                for row in cursor.fetchall():
                    if not row["join_key"]:
                        new_k = "SEC789" if row["id"] == "demo-org-id" else self.generate_join_key()
                        cursor.execute("UPDATE organizations SET join_key = ? WHERE id = ?", (new_k, row["id"]))

                # Seed default demo organization and admin if empty
                cursor.execute("SELECT COUNT(*) as count FROM organizations")
                if cursor.fetchone()["count"] == 0:
                    cursor.execute("""
                        INSERT INTO organizations (id, name, join_key, slug, description, plan, is_active)
                        VALUES ('demo-org-id', 'SecureNet Enterprise', 'SEC789', 'securenet-enterprise', 'Primary security operations center', 'enterprise', 1)
                    """)
                
                cursor.execute("SELECT COUNT(*) as count FROM profiles")
                if cursor.fetchone()["count"] == 0:
                    cursor.execute("""
                        INSERT INTO profiles (id, email, name, role, specialty_role, org_id, is_active, permissions)
                        VALUES ('demo-admin-id', 'admin@securenet.com', 'Security Administrator', 'admin', 'Network & Threat Defense Lead', 'demo-org-id', 1, '["ALL"]')
                    """)
                    cursor.execute("""
                        INSERT INTO profiles (id, email, name, role, specialty_role, org_id, assigned_admin_id, is_active, permissions)
                        VALUES ('demo-user-id', 'user@securenet.com', 'SOC Analyst Operator', 'user', 'Tier-1 Incident Response', 'demo-org-id', 'demo-admin-id', 1, '["read","write"]')
                    """)

                conn.commit()
                logger.info(f"SQLite database initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Error initializing SQLite database: {e}")

    # ================= ALERTS =================
    def insert_alert(self, alert_dict: Dict[str, Any]) -> str:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO alerts 
                    (id, source_ip, destination_ip, protocol, timestamp, attack_type, risk_level, confidence, description, threat_intel_data, packet_data, prediction_result, org_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    alert_dict.get("id"),
                    alert_dict.get("source_ip"),
                    alert_dict.get("destination_ip"),
                    str(alert_dict.get("protocol")),
                    str(alert_dict.get("timestamp")),
                    str(alert_dict.get("attack_type")),
                    str(alert_dict.get("risk_level")),
                    float(alert_dict.get("confidence", 0.0)),
                    alert_dict.get("description"),
                    json.dumps(alert_dict.get("threat_intel_data"), default=str) if alert_dict.get("threat_intel_data") is not None else None,
                    json.dumps(alert_dict.get("packet_data"), default=str) if alert_dict.get("packet_data") is not None else None,
                    json.dumps(alert_dict.get("prediction_result"), default=str) if alert_dict.get("prediction_result") is not None else None,
                    alert_dict.get("org_id")
                ))
                conn.commit()
                return alert_dict.get("id")
        except Exception as e:
            logger.error(f"SQLite insert_alert error: {e}")
            return alert_dict.get("id")

    def get_alerts(self, limit: int = 100, offset: int = 0, risk_level: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                if risk_level:
                    cursor.execute("""
                        SELECT * FROM alerts WHERE risk_level = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?
                    """, (risk_level, limit, offset))
                else:
                    cursor.execute("""
                        SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ? OFFSET ?
                    """, (limit, offset))
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    for key in ["threat_intel_data", "packet_data", "prediction_result"]:
                        if item.get(key) and isinstance(item[key], str):
                            try:
                                item[key] = json.loads(item[key])
                            except Exception:
                                pass
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_alerts error: {e}")
            return []

    # ================= LOGS =================
    def insert_log(self, log_dict: Dict[str, Any]) -> str:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO logs 
                    (id, timestamp, level, message, source, packet_data, alert_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    log_dict.get("id"),
                    str(log_dict.get("timestamp")),
                    str(log_dict.get("level", "INFO")),
                    str(log_dict.get("message", "")),
                    log_dict.get("source"),
                    json.dumps(log_dict.get("packet_data"), default=str) if log_dict.get("packet_data") is not None else None,
                    log_dict.get("alert_id")
                ))
                conn.commit()
                return log_dict.get("id")
        except Exception as e:
            logger.error(f"SQLite insert_log error: {e}")
            return log_dict.get("id")

    def get_logs(self, limit: int = 100, offset: int = 0, level: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                if level:
                    cursor.execute("""
                        SELECT * FROM logs WHERE level = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?
                    """, (level, limit, offset))
                else:
                    cursor.execute("""
                        SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?
                    """, (limit, offset))
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    if item.get("packet_data") and isinstance(item["packet_data"], str):
                        try:
                            item["packet_data"] = json.loads(item["packet_data"])
                        except Exception:
                            pass
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_logs error: {e}")
            return []

    # ================= STATS =================
    def insert_stats(self, stats_dict: Dict[str, Any]) -> str:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO stats
                    (id, timestamp, total_packets, attack_count, normal_count, protocols, attack_types, risk_levels, performance)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    stats_dict.get("id"),
                    str(stats_dict.get("timestamp")),
                    int(stats_dict.get("total_packets", 0)),
                    int(stats_dict.get("attack_count", 0)),
                    int(stats_dict.get("normal_count", 0)),
                    json.dumps(stats_dict.get("protocols", {}), default=str),
                    json.dumps(stats_dict.get("attack_types", {}), default=str),
                    json.dumps(stats_dict.get("risk_levels", {}), default=str),
                    json.dumps(stats_dict.get("performance", {}), default=str)
                ))
                conn.commit()
                return stats_dict.get("id")
        except Exception as e:
            logger.error(f"SQLite insert_stats error: {e}")
            return stats_dict.get("id")

    def get_latest_stats(self) -> Optional[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM stats ORDER BY timestamp DESC LIMIT 1")
                row = cursor.fetchone()
                if row:
                    item = dict(row)
                    for key in ["protocols", "attack_types", "risk_levels", "performance"]:
                        if item.get(key) and isinstance(item[key], str):
                            try:
                                item[key] = json.loads(item[key])
                            except Exception:
                                pass
                    return item
                return None
        except Exception as e:
            logger.error(f"SQLite get_latest_stats error: {e}")
            return None

    # ================= BLACKLIST =================
    def add_to_blacklist(self, entry: Dict[str, Any]) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO blacklist (ip_address, reason, added_at, expires_at, threat_intel)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    entry.get("ip_address"),
                    entry.get("reason"),
                    str(entry.get("added_at")),
                    str(entry.get("expires_at")) if entry.get("expires_at") else None,
                    json.dumps(entry.get("threat_intel"), default=str) if entry.get("threat_intel") is not None else None
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"SQLite add_to_blacklist error: {e}")
            return False

    def is_blacklisted(self, ip_address: str) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1 FROM blacklist WHERE ip_address = ?", (ip_address,))
                return cursor.fetchone() is not None
        except Exception as e:
            logger.error(f"SQLite is_blacklisted error: {e}")
            return False

    def get_blacklist(self) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM blacklist ORDER BY added_at DESC")
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"SQLite get_blacklist error: {e}")
            return []

    def remove_from_blacklist(self, ip_address: str) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM blacklist WHERE ip_address = ?", (ip_address,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"SQLite remove_from_blacklist error: {e}")
            return False

    # ================= 6-LETTER KEY GENERATOR =================
    @staticmethod
    def generate_join_key() -> str:
        """Generate a random 6-character uppercase alphanumeric join key (avoiding ambiguous chars)"""
        import random
        chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
        return ''.join(random.choices(chars, k=6))

    # ================= ORGANIZATIONS =================
    def get_organizations(self) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM organizations ORDER BY created_at DESC")
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    item["is_active"] = bool(item.get("is_active", 1))
                    # Get user count & admin count for organization
                    c_cursor = conn.cursor()
                    c_cursor.execute("SELECT COUNT(*) as u_count FROM profiles WHERE org_id = ?", (item["id"],))
                    u_row = c_cursor.fetchone()
                    item["users_count"] = u_row["u_count"] if u_row else 0
                    
                    c_cursor.execute("SELECT COUNT(*) as a_count FROM profiles WHERE org_id = ? AND role = 'admin'", (item["id"],))
                    a_row = c_cursor.fetchone()
                    item["admins_count"] = a_row["a_count"] if a_row else 0
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_organizations error: {e}")
            return []

    def get_org_by_join_key(self, join_key: str) -> Optional[Dict[str, Any]]:
        try:
            clean_key = (join_key or "").strip().upper()
            if not clean_key:
                return None
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM organizations WHERE UPPER(join_key) = ? OR id = ?", (clean_key, clean_key))
                row = cursor.fetchone()
                if not row:
                    return None
                item = dict(row)
                item["is_active"] = bool(item.get("is_active", 1))
                
                # Fetch active admins for this org
                cursor.execute("SELECT id, name, email, role, specialty_role FROM profiles WHERE org_id = ? AND role = 'admin'", (item["id"],))
                admins = [dict(r) for r in cursor.fetchall()]
                item["admins"] = admins
                return item
        except Exception as e:
            logger.error(f"SQLite get_org_by_join_key error: {e}")
            return None

    def regenerate_org_join_key(self, org_id: str) -> str:
        try:
            new_key = self.generate_join_key()
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE organizations SET join_key = ?, updated_at = ? WHERE id = ?", (new_key, datetime.now().isoformat(), org_id))
                conn.commit()
                return new_key
        except Exception as e:
            logger.error(f"SQLite regenerate_org_join_key error: {e}")
            return ""

    def create_organization(self, org_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            org_id = org_data.get("id") or str(uuid.uuid4())
            join_key = (org_data.get("join_key") or self.generate_join_key()).strip().upper()
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO organizations (id, name, join_key, slug, description, plan, owner_id, is_active, settings)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    org_id,
                    org_data.get("name", "New Organization"),
                    join_key,
                    org_data.get("slug", org_data.get("name", "new-org").lower().replace(" ", "-")),
                    org_data.get("description", ""),
                    org_data.get("plan", "enterprise"),
                    org_data.get("owner_id"),
                    1 if org_data.get("is_active", True) else 0,
                    json.dumps(org_data.get("settings", {}), default=str)
                ))
                conn.commit()
                org_data["id"] = org_id
                org_data["join_key"] = join_key
                org_data["created_at"] = datetime.now().isoformat()
                return org_data
        except Exception as e:
            logger.error(f"SQLite create_organization error: {e}")
            raise e

    # ================= USERS / PROFILES =================
    def get_users(self, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                if org_id:
                    cursor.execute("SELECT * FROM profiles WHERE org_id = ? ORDER BY created_at DESC", (org_id,))
                else:
                    cursor.execute("SELECT * FROM profiles ORDER BY created_at DESC")
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    item["is_active"] = bool(item.get("is_active", 1))
                    if item.get("permissions") and isinstance(item["permissions"], str):
                        try:
                            item["permissions"] = json.loads(item["permissions"])
                        except Exception:
                            pass
                    
                    # If assigned_admin_id is present, get admin name
                    if item.get("assigned_admin_id"):
                        a_cursor = conn.cursor()
                        a_cursor.execute("SELECT name, email, specialty_role FROM profiles WHERE id = ?", (item["assigned_admin_id"],))
                        a_row = a_cursor.fetchone()
                        if a_row:
                            item["assigned_admin_name"] = a_row["name"] or a_row["email"]
                            item["assigned_admin_specialty"] = a_row["specialty_role"]
                    
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_users error: {e}")
            return []

    def get_org_admins(self, org_id: str) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, name, email, role, specialty_role, is_active, created_at 
                    FROM profiles 
                    WHERE org_id = ? AND role = 'admin'
                    ORDER BY created_at ASC
                """, (org_id,))
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    # Count users mentored/assigned under this admin
                    c_cursor = conn.cursor()
                    c_cursor.execute("SELECT COUNT(*) as guided_count FROM profiles WHERE assigned_admin_id = ?", (item["id"],))
                    g_row = c_cursor.fetchone()
                    item["users_guided_count"] = g_row["guided_count"] if g_row else 0
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_org_admins error: {e}")
            return []

    def assign_user_admin(self, user_id: str, admin_id: Optional[str]) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE profiles 
                    SET assigned_admin_id = ?, updated_at = ?
                    WHERE id = ?
                """, (admin_id, datetime.now().isoformat(), user_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"SQLite assign_user_admin error: {e}")
            return False

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            user_id = user_data.get("id") or str(uuid.uuid4())
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO profiles (id, email, name, role, specialty_role, org_id, assigned_admin_id, is_active, permissions)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    user_data.get("email"),
                    user_data.get("name", user_data.get("email", "").split("@")[0]),
                    user_data.get("role", "user"),
                    user_data.get("specialty_role", "General Security"),
                    user_data.get("org_id", "demo-org-id"),
                    user_data.get("assigned_admin_id"),
                    1 if user_data.get("is_active", True) else 0,
                    json.dumps(user_data.get("permissions", ["read"]), default=str)
                ))
                conn.commit()
                user_data["id"] = user_id
                user_data["created_at"] = datetime.now().isoformat()
                return user_data
        except Exception as e:
            logger.error(f"SQLite create_user error: {e}")
            raise e

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                fields = []
                values = []
                for key in ["name", "role", "specialty_role", "org_id", "assigned_admin_id", "is_active"]:
                    if key in updates:
                        fields.append(f"{key} = ?")
                        values.append(1 if updates[key] is True else (0 if updates[key] is False else updates[key]))
                if "permissions" in updates:
                    fields.append("permissions = ?")
                    values.append(json.dumps(updates["permissions"], default=str))
                
                if not fields:
                    return False
                
                fields.append("updated_at = ?")
                values.append(datetime.now().isoformat())
                values.append(user_id)
                
                query = f"UPDATE profiles SET {', '.join(fields)} WHERE id = ?"
                cursor.execute(query, values)
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"SQLite update_user error: {e}")
            return False

    def delete_user(self, user_id: str) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM profiles WHERE id = ?", (user_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"SQLite delete_user error: {e}")
            return False

    # ================= GUIDANCE & HELP REQUESTS =================
    def get_guidance_requests(
        self,
        org_id: Optional[str] = None,
        user_id: Optional[str] = None,
        admin_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                conditions = []
                params = []
                
                if org_id:
                    conditions.append("org_id = ?")
                    params.append(org_id)
                if user_id:
                    conditions.append("user_id = ?")
                    params.append(user_id)
                if admin_id:
                    conditions.append("(admin_id = ? OR admin_id IS NULL)")
                    params.append(admin_id)
                if status:
                    conditions.append("status = ?")
                    params.append(status)
                
                where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
                query = f"SELECT * FROM guidance_requests {where_clause} ORDER BY created_at DESC LIMIT ?"
                params.append(limit)
                
                cursor.execute(query, params)
                return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"SQLite get_guidance_requests error: {e}")
            return []

    def create_guidance_request(self, req_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            req_id = req_data.get("id") or str(uuid.uuid4())
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO guidance_requests 
                    (id, org_id, user_id, user_name, user_email, admin_id, admin_name, title, description, category, priority, status, guidance_notes, related_alert_id, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    req_id,
                    req_data.get("org_id", "demo-org-id"),
                    req_data.get("user_id", "demo-user-id"),
                    req_data.get("user_name", "SOC Analyst"),
                    req_data.get("user_email", "user@securenet.com"),
                    req_data.get("admin_id"),
                    req_data.get("admin_name"),
                    req_data.get("title", "Guidance Request"),
                    req_data.get("description", ""),
                    req_data.get("category", "threat_analysis"),
                    req_data.get("priority", "medium"),
                    req_data.get("status", "open"),
                    req_data.get("guidance_notes"),
                    req_data.get("related_alert_id"),
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                conn.commit()
                req_data["id"] = req_id
                req_data.setdefault("status", "open")
                req_data.setdefault("category", "threat_analysis")
                req_data.setdefault("priority", "medium")
                req_data["created_at"] = datetime.now().isoformat()
                return req_data
        except Exception as e:
            logger.error(f"SQLite create_guidance_request error: {e}")
            raise e

    def volunteer_for_request(self, request_id: str, admin_id: str, admin_name: str) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE guidance_requests 
                    SET admin_id = ?, admin_name = ?, status = 'in_progress', updated_at = ?
                    WHERE id = ?
                """, (admin_id, admin_name, datetime.now().isoformat(), request_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"SQLite volunteer_for_request error: {e}")
            return False

    def respond_guidance_request(self, request_id: str, guidance_notes: str, status: str = "resolved", admin_id: Optional[str] = None) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                if admin_id:
                    cursor.execute("""
                        UPDATE guidance_requests 
                        SET guidance_notes = ?, status = ?, admin_id = ?, updated_at = ?
                        WHERE id = ?
                    """, (guidance_notes, status, admin_id, datetime.now().isoformat(), request_id))
                else:
                    cursor.execute("""
                        UPDATE guidance_requests 
                        SET guidance_notes = ?, status = ?, updated_at = ?
                        WHERE id = ?
                    """, (guidance_notes, status, datetime.now().isoformat(), request_id))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"SQLite respond_guidance_request error: {e}")
            return False

    # ================= USER ACTIVITIES =================
    def log_user_activity(self, activity_data: Dict[str, Any]) -> str:
        try:
            act_id = activity_data.get("id") or str(uuid.uuid4())
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO user_activities (id, org_id, user_id, email, action, resource_type, resource_id, details, ip_address, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    act_id,
                    activity_data.get("org_id", "demo-org-id"),
                    activity_data.get("user_id"),
                    activity_data.get("email"),
                    activity_data.get("action", "page_visit"),
                    activity_data.get("resource_type"),
                    activity_data.get("resource_id"),
                    json.dumps(activity_data.get("details"), default=str) if activity_data.get("details") is not None else None,
                    activity_data.get("ip_address", "127.0.0.1"),
                    str(activity_data.get("timestamp") or datetime.now().isoformat())
                ))
                conn.commit()
                return act_id
        except Exception as e:
            logger.error(f"SQLite log_user_activity error: {e}")
            return activity_data.get("id") or str(uuid.uuid4())

    def get_user_activities(
        self,
        org_id: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                conditions = []
                params = []
                
                if org_id:
                    conditions.append("org_id = ?")
                    params.append(org_id)
                if user_id:
                    conditions.append("user_id = ?")
                    params.append(user_id)
                
                where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
                query = f"SELECT * FROM user_activities {where_clause} ORDER BY timestamp DESC LIMIT ?"
                params.append(limit)
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    if item.get("details") and isinstance(item["details"], str):
                        try:
                            item["details"] = json.loads(item["details"])
                        except Exception:
                            pass
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_user_activities error: {e}")
            return []

    # ================= AUDIT LOGS =================
    def insert_audit_log(self, audit_dict: Dict[str, Any]) -> str:
        try:
            log_id = audit_dict.get("id") or str(uuid.uuid4())
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO audit_logs (id, user_id, email, role, org_id, action, resource_type, resource_id, status, details, ip_address, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    log_id,
                    audit_dict.get("user_id"),
                    audit_dict.get("email"),
                    audit_dict.get("role"),
                    audit_dict.get("org_id"),
                    audit_dict.get("action", "action_performed"),
                    audit_dict.get("resource_type"),
                    audit_dict.get("resource_id"),
                    audit_dict.get("status", "success"),
                    json.dumps(audit_dict.get("details"), default=str) if audit_dict.get("details") is not None else None,
                    audit_dict.get("ip_address"),
                    str(audit_dict.get("timestamp") or datetime.now().isoformat())
                ))
                conn.commit()
                return log_id
        except Exception as e:
            logger.error(f"SQLite insert_audit_log error: {e}")
            return audit_dict.get("id") or str(uuid.uuid4())

    def get_audit_logs(
        self,
        limit: int = 100,
        offset: int = 0,
        action: Optional[str] = None,
        user_id: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                conditions = []
                params = []
                
                if action:
                    conditions.append("action = ?")
                    params.append(action)
                if user_id:
                    conditions.append("(user_id = ? OR email LIKE ?)")
                    params.extend([user_id, f"%{user_id}%"])
                if start_time:
                    conditions.append("timestamp >= ?")
                    params.append(start_time)
                if end_time:
                    conditions.append("timestamp <= ?")
                    params.append(end_time)
                
                where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
                query = f"SELECT * FROM audit_logs {where_clause} ORDER BY timestamp DESC LIMIT ? OFFSET ?"
                params.extend([limit, offset])
                
                cursor.execute(query, params)
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    item = dict(row)
                    if item.get("details") and isinstance(item["details"], str):
                        try:
                            item["details"] = json.loads(item["details"])
                        except Exception:
                            pass
                    results.append(item)
                return results
        except Exception as e:
            logger.error(f"SQLite get_audit_logs error: {e}")
            return []


# Singleton instance
sqlite_db = SQLiteDatabase()

