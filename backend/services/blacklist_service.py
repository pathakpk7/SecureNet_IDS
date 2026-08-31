"""
Blacklist Service for SecureNet IDS
Handles blacklist, whitelist, IP validation, and repository interaction
"""

import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

from core.config import settings
from database import db_manager
from schemas import BlacklistEntry
from utils import validate_ip_address, validate_ip


logger = logging.getLogger(__name__)


class BlacklistService:
    """
    Blacklist Service - Blacklist management
    
    Responsibilities:
    - Blacklist management
    - Whitelist management
    - IP validation
    - Repository interaction
    
    NO direct database access - use db_manager.
    """
    
    def __init__(self):
        """Initialize Blacklist Service"""
        self.blacklist_cache: Dict[str, BlacklistEntry] = {}
        self.whitelist_cache: Dict[str, BlacklistEntry] = {}
        
        logger.info("BlacklistService initialized")
    
    async def add_to_blacklist(
        self,
        ip_address: str,
        reason: Optional[str] = None,
        source: Optional[str] = None
    ) -> bool:
        """
        Add IP address to blacklist
        
        Args:
            ip_address: IP address to blacklist
            reason: Reason for blacklisting
            source: Source of the blacklist entry
            
        Returns:
            True if added successfully, False otherwise
        """
        try:
            # Validate IP address
            if not validate_ip_address(ip_address):
                logger.error(f"Invalid IP address: {ip_address}")
                return False
            
            # Check if already blacklisted
            if ip_address in self.blacklist_cache:
                logger.warning(f"IP already blacklisted: {ip_address}")
                return True
            
            # Create blacklist entry
            entry = BlacklistEntry(
                ip_address=ip_address,
                added_at=datetime.now(),
                reason=reason or "Manual blacklist",
                source=source or "manual"
            )
            
            # Store in database
            success = await db_manager.add_to_blacklist(entry)
            
            if success:
                # Update cache
                self.blacklist_cache[ip_address] = entry
                logger.info(f"IP added to blacklist: {ip_address}")
                return True
            else:
                logger.error(f"Failed to add IP to blacklist: {ip_address}")
                return False
                
        except Exception as e:
            logger.error(f"Error adding to blacklist: {e}")
            return False
    
    async def remove_from_blacklist(self, ip_address: str) -> bool:
        """
        Remove IP address from blacklist
        
        Args:
            ip_address: IP address to remove
            
        Returns:
            True if removed successfully, False otherwise
        """
        try:
            # Validate IP address
            if not validate_ip_address(ip_address):
                logger.error(f"Invalid IP address: {ip_address}")
                return False
            
            # Remove from database
            success = await db_manager.remove_from_blacklist(ip_address)
            
            if success:
                # Update cache
                if ip_address in self.blacklist_cache:
                    del self.blacklist_cache[ip_address]
                logger.info(f"IP removed from blacklist: {ip_address}")
                return True
            else:
                logger.error(f"Failed to remove IP from blacklist: {ip_address}")
                return False
                
        except Exception as e:
            logger.error(f"Error removing from blacklist: {e}")
            return False
    
    async def get_blacklist(self) -> List[BlacklistEntry]:
        """
        Get all blacklisted IP addresses
        
        Returns:
            List of BlacklistEntry objects
        """
        try:
            blacklist = await db_manager.get_blacklist()
            
            # Update cache
            self.blacklist_cache = {entry.ip_address: entry for entry in blacklist}
            
            return blacklist
            
        except Exception as e:
            logger.error(f"Error retrieving blacklist: {e}")
            return []
    
    async def is_blacklisted(self, ip_address: str) -> bool:
        """
        Check if IP address is blacklisted
        
        Args:
            ip_address: IP address to check
            
        Returns:
            True if blacklisted, False otherwise
        """
        try:
            # Check cache first
            if ip_address in self.blacklist_cache:
                return True
            
            # Check database
            blacklist = await self.get_blacklist()
            for entry in blacklist:
                if entry.ip_address == ip_address:
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking blacklist: {e}")
            return False
    
    async def add_to_whitelist(
        self,
        ip_address: str,
        reason: Optional[str] = None,
        source: Optional[str] = None
    ) -> bool:
        """
        Add IP address to whitelist
        
        Args:
            ip_address: IP address to whitelist
            reason: Reason for whitelisting
            source: Source of the whitelist entry
            
        Returns:
            True if added successfully, False otherwise
        """
        try:
            # Validate IP address
            if not validate_ip_address(ip_address):
                logger.error(f"Invalid IP address: {ip_address}")
                return False
            
            # Check if already whitelisted
            if ip_address in self.whitelist_cache:
                logger.warning(f"IP already whitelisted: {ip_address}")
                return True
            
            # Create whitelist entry (reuse BlacklistEntry schema for now)
            entry = BlacklistEntry(
                ip_address=ip_address,
                added_at=datetime.now(),
                reason=reason or "Manual whitelist",
                source=source or "manual"
            )
            
            # For now, we don't have a separate whitelist table
            # We'll use a different approach or extend the schema
            # For this implementation, we'll just cache it
            self.whitelist_cache[ip_address] = entry
            logger.info(f"IP added to whitelist: {ip_address}")
            return True
                
        except Exception as e:
            logger.error(f"Error adding to whitelist: {e}")
            return False
    
    async def remove_from_whitelist(self, ip_address: str) -> bool:
        """
        Remove IP address from whitelist
        
        Args:
            ip_address: IP address to remove
            
        Returns:
            True if removed successfully, False otherwise
        """
        try:
            # Validate IP address
            if not validate_ip_address(ip_address):
                logger.error(f"Invalid IP address: {ip_address}")
                return False
            
            # Update cache
            if ip_address in self.whitelist_cache:
                del self.whitelist_cache[ip_address]
                logger.info(f"IP removed from whitelist: {ip_address}")
                return True
            else:
                logger.warning(f"IP not in whitelist: {ip_address}")
                return False
                
        except Exception as e:
            logger.error(f"Error removing from whitelist: {e}")
            return False
    
    async def is_whitelisted(self, ip_address: str) -> bool:
        """
        Check if IP address is whitelisted
        
        Args:
            ip_address: IP address to check
            
        Returns:
            True if whitelisted, False otherwise
        """
        return ip_address in self.whitelist_cache
    
    async def validate_ip_access(self, ip_address: str) -> Dict[str, Any]:
        """
        Validate IP access based on blacklist and whitelist
        
        Args:
            ip_address: IP address to validate
            
        Returns:
            Validation result dictionary
        """
        try:
            # Validate IP format
            if not validate_ip_address(ip_address):
                return {
                    "ip_address": ip_address,
                    "valid": False,
                    "reason": "Invalid IP address format",
                    "blacklisted": False,
                    "whitelisted": False
                }
            
            # Check whitelist (whitelist takes precedence)
            if await self.is_whitelisted(ip_address):
                return {
                    "ip_address": ip_address,
                    "valid": True,
                    "reason": "IP is whitelisted",
                    "blacklisted": False,
                    "whitelisted": True
                }
            
            # Check blacklist
            if await self.is_blacklisted(ip_address):
                return {
                    "ip_address": ip_address,
                    "valid": False,
                    "reason": "IP is blacklisted",
                    "blacklisted": True,
                    "whitelisted": False
                }
            
            # IP is valid and not blacklisted
            return {
                "ip_address": ip_address,
                "valid": True,
                "reason": "IP is allowed",
                "blacklisted": False,
                "whitelisted": False
            }
            
        except Exception as e:
            logger.error(f"Error validating IP access: {e}")
            return {
                "ip_address": ip_address,
                "valid": False,
                "reason": f"Error: {str(e)}",
                "blacklisted": False,
                "whitelisted": False
            }
    
    def get_blacklist_cache_size(self) -> int:
        """
        Get current blacklist cache size
        
        Returns:
            Number of cached blacklist entries
        """
        return len(self.blacklist_cache)
    
    def get_whitelist_cache_size(self) -> int:
        """
        Get current whitelist cache size
        
        Returns:
            Number of cached whitelist entries
        """
        return len(self.whitelist_cache)
    
    def clear_caches(self) -> None:
        """Clear blacklist and whitelist caches"""
        self.blacklist_cache.clear()
        self.whitelist_cache.clear()
        logger.info("Blacklist and whitelist caches cleared")
    
    async def refresh_blacklist_cache(self) -> None:
        """Refresh blacklist cache from database"""
        await self.get_blacklist()
        logger.info("Blacklist cache refreshed")
