"""
SecureNet IDS - Base Repository Pattern

This module provides the base repository class with common database operations,
caching, and audit logging support.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from datetime import datetime
import logging
from supabase import Client

logger = logging.getLogger(__name__)

T = TypeVar('T')


class BaseRepository(ABC, Generic[T]):
    """
    Base repository with common database operations.
    
    This class provides CRUD operations, caching support, and audit logging
    for all repositories in the system.
    """
    
    def __init__(self, supabase_client: Client, table_name: str):
        """
        Initialize base repository.
        
        Args:
            supabase_client: Supabase client instance
            table_name: Database table name
        """
        self.supabase = supabase_client
        self.table_name = table_name
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes default
    
    async def create(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create a new record.
        
        Args:
            data: Record data
            
        Returns:
            Created record or None if failed
        """
        try:
            response = self.supabase.table(self.table_name).insert(data).select().single().execute()
            if response.data:
                self._invalidate_cache()
                logger.info(f"Created record in {self.table_name}: {response.data.get('id')}")
                return response.data
            return None
        except Exception as e:
            logger.error(f"Error creating record in {self.table_name}: {e}")
            raise
    
    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """
        Get record by ID.
        
        Args:
            id: Record ID
            
        Returns:
            Record or None if not found
        """
        try:
            cache_key = f"{self.table_name}:{id}"
            if cache_key in self._cache:
                cached_data, timestamp = self._cache[cache_key]
                if (datetime.utcnow() - timestamp).total_seconds() < self._cache_ttl:
                    return cached_data
            
            response = self.supabase.table(self.table_name).select("*").eq("id", id).single().execute()
            if response.data:
                self._cache[cache_key] = (response.data, datetime.utcnow())
                return response.data
            return None
        except Exception as e:
            logger.error(f"Error getting record {id} from {self.table_name}: {e}")
            return None
    
    async def get_all(
        self,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0,
        order_by: str = "created_at",
        ascending: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get all records with optional filtering and pagination.
        
        Args:
            filters: Optional filter dictionary
            limit: Maximum records to return
            offset: Number of records to skip
            order_by: Field to order by
            ascending: Sort direction
            
        Returns:
            List of records
        """
        try:
            query = self.supabase.table(self.table_name).select("*")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            query = query.order(order_by, desc=not ascending).range(offset, offset + limit - 1)
            response = query.execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting records from {self.table_name}: {e}")
            return []
    
    async def update(self, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a record.
        
        Args:
            id: Record ID
            data: Update data
            
        Returns:
            Updated record or None if failed
        """
        try:
            response = self.supabase.table(self.table_name).update(data).eq("id", id).select().single().execute()
            if response.data:
                self._invalidate_cache()
                logger.info(f"Updated record {id} in {self.table_name}")
                return response.data
            return None
        except Exception as e:
            logger.error(f"Error updating record {id} in {self.table_name}: {e}")
            raise
    
    async def delete(self, id: str) -> bool:
        """
        Delete a record.
        
        Args:
            id: Record ID
            
        Returns:
            True if deleted, False otherwise
        """
        try:
            response = self.supabase.table(self.table_name).delete().eq("id", id).execute()
            self._invalidate_cache()
            logger.info(f"Deleted record {id} from {self.table_name}")
            return len(response.data) > 0 if response.data else False
        except Exception as e:
            logger.error(f"Error deleting record {id} from {self.table_name}: {e}")
            return False
    
    async def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Count records with optional filtering.
        
        Args:
            filters: Optional filter dictionary
            
        Returns:
            Number of records
        """
        try:
            query = self.supabase.table(self.table_name).select("*", count="exact")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            response = query.execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting records in {self.table_name}: {e}")
            return 0
    
    async def exists(self, id: str) -> bool:
        """
        Check if a record exists.
        
        Args:
            id: Record ID
            
        Returns:
            True if exists, False otherwise
        """
        record = await self.get_by_id(id)
        return record is not None
    
    def _invalidate_cache(self):
        """Clear all cached data."""
        self._cache.clear()
    
    def set_cache_ttl(self, ttl: int):
        """
        Set cache time-to-live.
        
        Args:
            ttl: Cache TTL in seconds
        """
        self._cache_ttl = ttl
