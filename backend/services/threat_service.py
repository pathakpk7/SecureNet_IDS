"""
Threat Service for SecureNet IDs
Handles threat intelligence coordination, caching, and rate limiting
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict

from core.config import settings
from threat_intelligence import threat_intel_manager
from utils import validate_ip_address


logger = logging.getLogger(__name__)


class ThreatService:
    """
    Threat Service - Threat intelligence coordination
    
    Responsibilities:
    - Call Threat Intelligence Manager
    - Caching of threat intelligence results
    - Rate limiting for API calls
    - Threat score calculation
    - Threat enrichment
    - Provider coordination
    
    NO direct API calls to providers - use ThreatIntelManager.
    """
    
    def __init__(self):
        """Initialize Threat Service"""
        self.threat_intel_manager = threat_intel_manager
        
        # Cache configuration
        self.cache_ttl = timedelta(minutes=30)  # Cache for 30 minutes
        self.cache: Dict[str, Dict[str, Any]] = {}
        
        # Rate limiting
        self.rate_limit = settings.threat_intel_rate_limit
        self.request_timestamps: defaultdict = defaultdict(list)
        
        # Statistics
        self.threat_stats = {
            "total_checks": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "api_calls": 0,
            "malicious_ips": 0,
            "clean_ips": 0
        }
        
        logger.info("ThreatService initialized")
    
    async def check_ip_reputation(self, ip_address: str) -> Dict[str, Any]:
        """
        Check IP reputation using threat intelligence with caching and rate limiting
        
        Args:
            ip_address: IP address to check
            
        Returns:
            Threat intelligence results and analysis
        """
        # Validate IP address
        if not validate_ip_address(ip_address):
            raise ValueError(f"Invalid IP address: {ip_address}")
        
        self.threat_stats["total_checks"] += 1
        
        # Check cache first
        cached_result = self._get_from_cache(ip_address)
        if cached_result:
            self.threat_stats["cache_hits"] += 1
            logger.info(f"Cache hit for IP: {ip_address}")
            return cached_result
        
        self.threat_stats["cache_misses"] += 1
        
        # Check rate limit
        if not self._check_rate_limit():
            logger.warning("Rate limit exceeded for threat intelligence")
            return {
                "ip_address": ip_address,
                "error": "Rate limit exceeded",
                "analysis": {"risk_level": "unknown", "confidence": 0.0}
            }
        
        # Call threat intelligence manager
        try:
            threat_results = await self.threat_intel_manager.check_ip(ip_address)
            threat_analysis = self.threat_intel_manager.analyze_threat_intel(threat_results)
            
            self.threat_stats["api_calls"] += 1
            
            # Update statistics
            if threat_analysis.get('risk_level') in ['high', 'critical']:
                self.threat_stats["malicious_ips"] += 1
            else:
                self.threat_stats["clean_ips"] += 1
            
            # Prepare result
            result = {
                "ip_address": ip_address,
                "threat_intelligence": [r.dict() if hasattr(r, 'dict') else r for r in threat_results],
                "analysis": threat_analysis,
                "checked_at": datetime.now().isoformat()
            }
            
            # Cache result
            self._add_to_cache(ip_address, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error checking IP reputation: {e}")
            return {
                "ip_address": ip_address,
                "error": str(e),
                "analysis": {"risk_level": "unknown", "confidence": 0.0}
            }
    
    def _get_from_cache(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """
        Get threat intelligence result from cache
        
        Args:
            ip_address: IP address to check
            
        Returns:
            Cached result or None if not found or expired
        """
        if ip_address in self.cache:
            cached = self.cache[ip_address]
            cached_time = datetime.fromisoformat(cached['checked_at'])
            
            if datetime.now() - cached_time < self.cache_ttl:
                return cached
            else:
                # Expired, remove from cache
                del self.cache[ip_address]
        
        return None
    
    def _add_to_cache(self, ip_address: str, result: Dict[str, Any]) -> None:
        """
        Add threat intelligence result to cache
        
        Args:
            ip_address: IP address
            result: Threat intelligence result
        """
        self.cache[ip_address] = result
        logger.debug(f"Added to cache: {ip_address}")
    
    def _check_rate_limit(self) -> bool:
        """
        Check if rate limit allows another request
        
        Returns:
            True if request is allowed, False otherwise
        """
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old timestamps
        self.request_timestamps[now.minute] = [
            ts for ts in self.request_timestamps[now.minute] if ts > minute_ago
        ]
        
        # Check if under limit
        recent_requests = len(self.request_timestamps[now.minute])
        if recent_requests < self.rate_limit:
            self.request_timestamps[now.minute].append(now)
            return True
        
        return False
    
    def calculate_threat_score(self, threat_results: List, threat_analysis: Dict) -> float:
        """
        Calculate overall threat score from multiple sources
        
        Args:
            threat_results: List of threat intelligence results
            threat_analysis: Analysis from threat intelligence manager
            
        Returns:
            Threat score (0.0 to 1.0)
        """
        if not threat_results:
            return 0.0
        
        # Use confidence from analysis if available
        confidence = threat_analysis.get('confidence', 0.0)
        
        # If no confidence, calculate from results
        if confidence == 0.0:
            malicious_count = sum(1 for r in threat_results if hasattr(r, 'is_malicious') and r.is_malicious)
            confidence = malicious_count / len(threat_results)
        
        return confidence
    
    def enrich_with_threat_intel(self, detection_data: Dict[str, Any], ip_address: str) -> Dict[str, Any]:
        """
        Enrich detection data with threat intelligence
        
        Args:
            detection_data: Original detection data
            ip_address: IP address to check
            
        Returns:
            Enriched detection data
        """
        threat_result = asyncio.run(self.check_ip_reputation(ip_address))
        
        if 'error' not in threat_result:
            detection_data.update({
                "threat_intel": threat_result['threat_intelligence'],
                "threat_analysis": threat_result['analysis'],
                "threat_checked_at": threat_result['checked_at']
            })
        
        return detection_data
    
    def get_threat_stats(self) -> Dict[str, Any]:
        """
        Get threat intelligence statistics
        
        Returns:
            Threat statistics dictionary
        """
        return self.threat_stats.copy()
    
    def clear_cache(self) -> None:
        """Clear threat intelligence cache"""
        self.cache.clear()
        logger.info("Threat intelligence cache cleared")
    
    def get_cache_size(self) -> int:
        """
        Get current cache size
        
        Returns:
            Number of cached entries
        """
        return len(self.cache)
