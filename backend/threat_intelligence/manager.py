import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import time
import os
from dotenv import load_dotenv

from core.config import settings
from schemas import ThreatIntelResult

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class ThreatIntelCache:
    """Simple in-memory cache for threat intelligence results with TTL."""
    
    def __init__(self, ttl: int = 3600):  # 1 hour TTL
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached result if not expired."""
        if key in self.cache:
            result, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return result
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any):
        """Set cached result."""
        self.cache[key] = (value, time.time())
    
    def clear(self):
        """Clear all cache."""
        self.cache.clear()


# Global cache instance
threat_cache = ThreatIntelCache()


class RateLimiter:
    """Non-blocking rate limiter for API calls."""
    
    def __init__(self, max_calls: int, time_window: int):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
    
    async def allow_or_wait(self, max_wait: float = 0.2) -> bool:
        """Check if call is allowed without long blocking."""
        now = time.time()
        self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
        
        if len(self.calls) >= self.max_calls:
            wait_time = self.time_window - (now - self.calls[0])
            if wait_time > max_wait:
                return False
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.calls.append(time.time())
        return True

    async def wait_if_needed(self, max_wait: float = 0.2) -> bool:
        """Backwards compatible wait."""
        return await self.allow_or_wait(max_wait=max_wait)


class ThreatIntelligenceAPI:
    """Base class for threat intelligence APIs with strict timeouts."""
    
    def __init__(self, name: str, api_key: Optional[str] = None, rate_limit: int = 5, timeout_seconds: float = 2.0):
        self.name = name
        self.api_key = api_key
        self.rate_limiter = RateLimiter(rate_limit, 60)
        self.timeout = aiohttp.ClientTimeout(total=timeout_seconds)
        self.logger = logging.getLogger(__name__)
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        raise NotImplementedError
    
    async def check_domain(self, domain: str) -> ThreatIntelResult:
        raise NotImplementedError
    
    async def check_url(self, url: str) -> ThreatIntelResult:
        raise NotImplementedError
    
    def _create_result(self, is_malicious: bool, confidence: float, details: Dict[str, Any]) -> ThreatIntelResult:
        return ThreatIntelResult(
            source=self.name,
            is_malicious=is_malicious,
            confidence_score=float(confidence),
            details=details,
            timestamp=datetime.now()
        )


class VirusTotalAPI(ThreatIntelligenceAPI):
    """VirusTotal API integration."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("virustotal", api_key or settings.virustotal_api_key, rate_limit=4, timeout_seconds=2.0)
        self.base_url = "https://www.virustotal.com/vtapi/v2"
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        allowed = await self.rate_limiter.allow_or_wait(max_wait=0.2)
        if not allowed:
            return self._create_result(False, 0.0, {"error": "Rate limit exceeded"})
        
        try:
            url = f"{self.base_url}/ip-address/report"
            params = {"apikey": self.api_key, "ip": ip_address}
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        positives = data.get("positives", 0)
                        total = data.get("total", 0)
                        malicious = positives > 0
                        confidence = min(positives / total * 2, 1.0) if total > 0 else 0.0
                        return self._create_result(
                            malicious,
                            confidence,
                            {
                                "positives": positives,
                                "total": total,
                                "country": data.get("country"),
                                "as_owner": data.get("as_owner")
                            }
                        )
                    return self._create_result(False, 0.0, {"error": f"API error {response.status}"})
        except Exception as e:
            self.logger.debug(f"VirusTotal check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class AbuseIPDBAPI(ThreatIntelligenceAPI):
    """AbuseIPDB API integration."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("abuseipdb", api_key or settings.abuseipdb_api_key, rate_limit=5, timeout_seconds=2.0)
        self.base_url = "https://api.abuseipdb.com/api/v2"
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        allowed = await self.rate_limiter.allow_or_wait(max_wait=0.2)
        if not allowed:
            return self._create_result(False, 0.0, {"error": "Rate limit exceeded"})
        
        try:
            url = f"{self.base_url}/check"
            headers = {"Key": self.api_key, "Accept": "application/json"}
            params = {"ipAddress": ip_address, "maxAgeInDays": 90, "verbose": ""}
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        ip_data = data.get("data", {})
                        abuse_confidence = ip_data.get("abuseConfidencePercentage", 0)
                        return self._create_result(
                            abuse_confidence > 25,
                            min(abuse_confidence / 100.0, 1.0),
                            {
                                "abuse_confidence": abuse_confidence,
                                "total_reports": ip_data.get("totalReports", 0),
                                "country_code": ip_data.get("countryCode"),
                                "usage_type": ip_data.get("usageType"),
                                "isp": ip_data.get("isp")
                            }
                        )
                    return self._create_result(False, 0.0, {"error": f"API error {response.status}"})
        except Exception as e:
            self.logger.debug(f"AbuseIPDB check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class OTXAPI(ThreatIntelligenceAPI):
    """AlienVault OTX API integration."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("otx", api_key or settings.otx_api_key, rate_limit=5, timeout_seconds=2.0)
        self.base_url = "https://otx.alienvault.com/api/v1"
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        allowed = await self.rate_limiter.allow_or_wait(max_wait=0.2)
        if not allowed:
            return self._create_result(False, 0.0, {"error": "Rate limit exceeded"})
        
        try:
            url = f"{self.base_url}/indicators/IPv4/{ip_address}/reputation"
            headers = {"X-OTX-API-KEY": self.api_key}
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        reputation = data.get("reputation", {}) if isinstance(data, dict) else {}
                        threat_score = reputation.get("threat_score", 0) if isinstance(reputation, dict) else 0
                        return self._create_result(
                            threat_score > 2,
                            min(threat_score / 5.0, 1.0),
                            {"threat_score": threat_score, "activities": data.get("activities", [])}
                        )
                    return self._create_result(False, 0.0, {"error": f"API error {response.status}"})
        except Exception as e:
            self.logger.debug(f"OTX check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class URLScanAPI(ThreatIntelligenceAPI):
    """URLScan.io API integration."""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__("urlscan", api_key or settings.urlscan_api_key, rate_limit=2, timeout_seconds=2.0)
        self.base_url = "https://urlscan.io/api/v1"
    
    async def check_url(self, url: str) -> ThreatIntelResult:
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        allowed = await self.rate_limiter.allow_or_wait(max_wait=0.2)
        if not allowed:
            return self._create_result(False, 0.0, {"error": "Rate limit exceeded"})
        
        try:
            submit_url = f"{self.base_url}/scan/"
            headers = {"API-Key": self.api_key, "Content-Type": "application/json"}
            payload = {"url": url, "public": "on"}
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(submit_url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        return self._create_result(False, 0.0, {"status": "scan_submitted"})
                    return self._create_result(False, 0.0, {"error": f"API error {response.status}"})
        except Exception as e:
            self.logger.debug(f"URLScan check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class ThreatIntelligenceManager:
    """Unified Threat Intelligence Manager that coordinates providers with fast timeout protection."""
    
    def __init__(self):
        self.apis = {}
        self.logger = logging.getLogger(__name__)
        
        def is_valid_key(key):
            return bool(key and str(key).strip() and not str(key).startswith("your_") and str(key) not in ("None", "null", "undefined"))
        
        if is_valid_key(settings.virustotal_api_key):
            self.apis["virustotal"] = VirusTotalAPI()
        
        if is_valid_key(settings.abuseipdb_api_key):
            self.apis["abuseipdb"] = AbuseIPDBAPI()
        
        if is_valid_key(settings.otx_api_key):
            self.apis["otx"] = OTXAPI()
        
        if is_valid_key(settings.urlscan_api_key):
            self.apis["urlscan"] = URLScanAPI()
        
        self.logger.info(f"Initialized {len(self.apis)} threat intelligence APIs")
    
    async def check_ip(self, ip_address: str, sources: Optional[List[str]] = None) -> List[ThreatIntelResult]:
        """Check IP reputation across threat intelligence sources."""
        cache_key = f"ip_{ip_address}"
        cached = threat_cache.get(cache_key)
        if cached is not None:
            return cached
        
        if not self.apis:
            threat_cache.set(cache_key, [])
            return []
        
        apis_to_use = [name for name in sources if name in self.apis] if sources else list(self.apis.keys())
        tasks = [self.apis[name].check_ip(ip_address) for name in apis_to_use if hasattr(self.apis[name], "check_ip")]
        
        if not tasks:
            threat_cache.set(cache_key, [])
            return []
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            valid_results = [r for r in results if isinstance(r, ThreatIntelResult)]
            threat_cache.set(cache_key, valid_results)
            return valid_results
        except Exception as e:
            self.logger.debug(f"Threat intelligence check notice: {e}")
            threat_cache.set(cache_key, [])
            return []
    
    async def check_url(self, url: str, sources: Optional[List[str]] = None) -> List[ThreatIntelResult]:
        """Check URL reputation across sources."""
        cache_key = f"url_{hash(url)}"
        cached = threat_cache.get(cache_key)
        if cached is not None:
            return cached
        
        if not self.apis:
            return []
        
        apis_to_use = [name for name in sources if name in self.apis] if sources else list(self.apis.keys())
        tasks = [self.apis[name].check_url(url) for name in apis_to_use if hasattr(self.apis[name], "check_url")]
        
        if not tasks:
            return []
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            valid_results = [r for r in results if isinstance(r, ThreatIntelResult)]
            threat_cache.set(cache_key, valid_results)
            return valid_results
        except Exception as e:
            self.logger.debug(f"Threat intelligence URL check error: {e}")
            return []

    async def check_domain(self, domain: str, sources: Optional[List[str]] = None) -> List[ThreatIntelResult]:
        """Check domain reputation."""
        return []

    def analyze_threat_intel(self, results: List[Any]) -> Dict[str, Any]:
        """Analyze combined threat intelligence results."""
        if not results:
            return {
                "attack_type": "unknown",
                "risk_level": "LOW",
                "sources": [],
                "malicious_sources": 0,
                "total_sources": 0,
                "confidence": 0.0
            }
        
        malicious_results = [r for r in results if r.is_malicious]
        total_sources = len(results)
        malicious_count = len(malicious_results)
        total_confidence = sum(r.confidence_score for r in results)
        avg_confidence = total_confidence / total_sources
        malicious_ratio = malicious_count / total_sources
        
        if malicious_ratio >= 0.5 or (malicious_count > 0 and avg_confidence >= 0.8):
            risk_level = "CRITICAL"
        elif malicious_ratio >= 0.25 or malicious_count > 0:
            risk_level = "HIGH"
        elif avg_confidence >= 0.5:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        return {
            "attack_type": "suspicious" if malicious_count > 0 else "normal",
            "risk_level": risk_level,
            "sources": [r.source for r in results],
            "malicious_sources": malicious_count,
            "total_sources": total_sources,
            "confidence": max(avg_confidence, malicious_ratio)
        }
    
    def get_available_sources(self) -> List[str]:
        return list(self.apis.keys())
    
    def get_source_status(self) -> Dict[str, bool]:
        return {name: bool(getattr(api, 'api_key', None)) for name, api in self.apis.items()}


# Global singleton instance
threat_intel_manager = ThreatIntelligenceManager()
