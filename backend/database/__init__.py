"""
Database module for SecureNet IDS
Database manager and repositories
"""

from .database import DatabaseManager, db_manager

# Aliases for backward compatibility
FixedDatabaseManager = DatabaseManager
fixed_db_manager = db_manager
enhanced_db_manager = db_manager

__all__ = [
    'DatabaseManager',
    'db_manager',
    'FixedDatabaseManager',
    'fixed_db_manager',
    'enhanced_db_manager'
]
