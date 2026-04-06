import asyncio
import aiohttp
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
import time
import json
from .config import settings
from .schemas import ThreatIntelResult, RiskLevel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ThreatIntelCache:
    """Simple in-memory cache for threat intelligence results."""
    
    def __init__(self, ttl: int = 3600):  # 1 hour TTL
        self.cache = {}
        self.ttl = ttl
    
    def get(self, key: str) -> Optional[Dict]:
        """Get cached result if not expired."""
        if key in self.cache:
            result, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return result
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Dict):
        """Set cached result."""
        self.cache[key] = (value, time.time())
    
    def clear(self):
        """Clear all cache."""
        self.cache.clear()

# Global cache instance
threat_cache = ThreatIntelCache()

class RateLimiter:
    """Rate limiter for API calls."""
    
    def __init__(self, max_calls: int, time_window: int):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
    
    async def wait_if_needed(self):
        """Wait if rate limit would be exceeded."""
        now = time.time()
        # Remove old calls outside the time window
        self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
        
        if len(self.calls) >= self.max_calls:
            # Wait until the oldest call is outside the window
            wait_time = self.time_window - (now - self.calls[0])
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.calls.append(now)

class ThreatIntelAPI:
    """Enhanced threat intelligence API integration."""
    
    def __init__(self):
        self.session = None
        self.logger = logging.getLogger(__name__)
        
        # API Keys from environment
        self.api_keys = {
            'abuseipdb': os.getenv('ABUSEIPDB_API_KEY'),
            'virustotal': os.getenv('VIRUSTOTAL_API_KEY'),
            'otx': os.getenv('OTX_API_KEY'),
            'urlscan': os.getenv('URLSCAN_API_KEY'),
            'google_safe': os.getenv('GOOGLE_SAFE_API_KEY')
        }
        
        # Rate limiters (free tier limits)
        self.rate_limiters = {
            'abuseipdb': RateLimiter(5, 60),      # 5 calls/minute
            'virustotal': RateLimiter(4, 60),      # 4 calls/minute
            'otx': RateLimiter(5, 60),             # 5 calls/minute
            'urlscan': RateLimiter(2, 60),         # 2 calls/minute
            'google_safe': RateLimiter(100, 60)    # 100 calls/minute
        }
    
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=10),
            connector=aiohttp.TCPConnector(limit=10)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def check_abuseipdb(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """Check IP against AbuseIPDB."""
        try:
            # Check cache first
            cache_key = f"abuseipdb_{ip_address}"
            cached_result = threat_cache.get(cache_key)
            if cached_result:
                return cached_result
            
            await self.rate_limiters['abuseipdb'].wait_if_needed()
            
            api_key = self.api_keys.get('abuseipdb')
            if not api_key:
                return self._create_error_result("abuseipdb", "No API key")
            
            url = "https://api.abuseipdb.com/api/v2/check"
            headers = {
                'Key': api_key,
                'Accept': 'application/json'
            }
            params = {
                'ipAddress': ip_address,
                'maxAgeInDays': 90,
                'verbose': ''
            }
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    abuse_confidence = data.get('data', {}).get('abuseConfidencePercentage', 0)
                    
                    result = {
                        "source": "abuseipdb",
                        "malicious": abuse_confidence > 25,
                        "confidence": abuse_confidence / 100,
                        "type": self._classify_abuseipdb_threat(data.get('data', {})),
                        "details": {
                            "abuse_confidence": abuse_confidence,
                            "country_code": data.get('data', {}).get('countryCode'),
                            "usage_type": data.get('data', {}).get('usageType'),
                            "reports": data.get('data', {}).get('totalReports', 0)
                        }
                    }
                    
                    # Cache result
                    threat_cache.set(cache_key, result)
                    return result
                else:
                    return self._create_error_result("abuseipdb", f"API error: {response.status}")
                    
        except Exception as e:
            self.logger.error(f"AbuseIPDB check failed: {str(e)}")
            return self._create_error_result("abuseipdb", str(e))
    
    async def check_virustotal(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """Check IP against VirusTotal."""
        try:
            # Check cache first
            cache_key = f"virustotal_{ip_address}"
            cached_result = threat_cache.get(cache_key)
            if cached_result:
                return cached_result
            
            await self.rate_limiters['virustotal'].wait_if_needed()
            
            api_key = self.api_keys.get('virustotal')
            if not api_key:
                return self._create_error_result("virustotal", "No API key")
            
            url = "https://www.virustotal.com/vtapi/v2/ip-address/report"
            params = {
                'apikey': api_key,
                'ip': ip_address
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    positives = data.get('positives', 0)
                    total = data.get('total', 0)
                    
                    confidence = positives / total if total > 0 else 0
                    
                    result = {
                        "source": "virustotal",
                        "malicious": positives > 0,
                        "confidence": confidence,
                        "type": "malware" if positives > 0 else "benign",
                        "details": {
                            "positives": positives,
                            "total": total,
                            "scan_date": data.get('scan_date'),
                            "permalink": data.get('permalink')
                        }
                    }
                    
                    # Cache result
                    threat_cache.set(cache_key, result)
                    return result
                else:
                    return self._create_error_result("virustotal", f"API error: {response.status}")
                    
        except Exception as e:
            self.logger.error(f"VirusTotal check failed: {str(e)}")
            return self._create_error_result("virustotal", str(e))
    
    async def check_otx(self, ip_address: str) -> Optional[Dict[str, Any]]:
        """Check IP against OTX (AlienVault)."""
        try:
            # Check cache first
            cache_key = f"otx_{ip_address}"
            cached_result = threat_cache.get(cache_key)
            if cached_result:
                return cached_result
            
            await self.rate_limiters['otx'].wait_if_needed()
            
            api_key = self.api_keys.get('otx')
            if not api_key:
                return self._create_error_result("otx", "No API key")
            
            url = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{ip_address}/reputation"
            headers = {'X-OTX-API-KEY': api_key}
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    reputation = data.get('reputation', {}).get('reputation_val', 0)
                    
                    result = {
                        "source": "otx",
                        "malicious": reputation < 0,
                        "confidence": abs(reputation) / 100 if reputation != 0 else 0,
                        "type": self._classify_otx_threat(data),
                        "details": {
                            "reputation": reputation,
                            "threat_types": data.get('sections', []),
                            "activities": data.get('reputation', {}).get('activities', [])
                        }
                    }
                    
                    # Cache result
                    threat_cache.set(cache_key, result)
                    return result
                else:
                    return self._create_error_result("otx", f"API error: {response.status}")
                    
        except Exception as e:
            self.logger.error(f"OTX check failed: {str(e)}")
            return self._create_error_result("otx", str(e))
    
    async def check_urlscan(self, url: str) -> Optional[Dict[str, Any]]:
        """Check URL against URLScan."""
        try:
            # Check cache first
            cache_key = f"urlscan_{hash(url)}"
            cached_result = threat_cache.get(cache_key)
            if cached_result:
                return cached_result
            
            await self.rate_limiters['urlscan'].wait_if_needed()
            
            api_key = self.api_keys.get('urlscan')
            if not api_key:
                return self._create_error_result("urlscan", "No API key")
            
            # Submit URL for scanning
            submit_url = "https://urlscan.io/api/v1/scan/"
            headers = {
                'API-Key': api_key,
                'Content-Type': 'application/json'
            }
            payload = {"url": url, "public": "on"}
            
            async with self.session.post(submit_url, headers=headers, json=payload) as response:
                if response.status == 200:
                    submit_data = await response.json()
                    scan_id = submit_data.get("uuid")
                    
                    if scan_id:
                        # Wait for scan to complete
                        await asyncio.sleep(3)
                        
                        # Get results
                        result_url = f"https://urlscan.io/api/v1/result/{scan_id}/"
                        async with self.session.get(result_url, headers=headers) as result_response:
                            if result_response.status == 200:
                                result_data = await result_response.json()
                                verdicts = result_data.get("verdicts", {}).get("overall", {})
                                malicious = verdicts.get("malicious", False)
                                
                                result = {
                                    "source": "urlscan",
                                    "malicious": malicious,
                                    "confidence": 0.8 if malicious else 0.1,
                                    "type": self._classify_urlscan_threat(result_data),
                                    "details": {
                                        "score": verdicts.get("score", 0),
                                        "categories": verdicts.get("categories", []),
                                        "brands": result_data.get("lists", {}).get("brands", [])
                                    }
                                }
                                
                                # Cache result
                                threat_cache.set(cache_key, result)
                                return result
                
                return self._create_error_result("urlscan", "Scan failed")
                    
        except Exception as e:
            self.logger.error(f"URLScan check failed: {str(e)}")
            return self._create_error_result("urlscan", str(e))
    
    async def check_google_safe(self, url: str) -> Optional[Dict[str, Any]]:
        """Check URL against Google Safe Browsing."""
        try:
            # Check cache first
            cache_key = f"google_safe_{hash(url)}"
            cached_result = threat_cache.get(cache_key)
            if cached_result:
                return cached_result
            
            await self.rate_limiters['google_safe'].wait_if_needed()
            
            api_key = self.api_keys.get('google_safe')
            if not api_key:
                return self._create_error_result("google_safe", "No API key")
            
            safe_url = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "client": {
                    "clientId": "secretnet-ids",
                    "clientVersion": "1.0.0"
                },
                "threatInfo": {
                    "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                    "platformTypes": ["ANY_PLATFORM"],
                    "threatEntryTypes": ["URL"],
                    "threatEntries": [{"url": url}]
                }
            }
            
            async with self.session.post(safe_url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    matches = data.get('matches', [])
                    
                    result = {
                        "source": "google_safe",
                        "malicious": len(matches) > 0,
                        "confidence": 0.9 if matches else 0.1,
                        "type": self._classify_google_threat(matches),
                        "details": {
                            "matches": len(matches),
                            "threat_types": [match.get('threatType') for match in matches]
                        }
                    }
                    
                    # Cache result
                    threat_cache.set(cache_key, result)
                    return result
                else:
                    return self._create_error_result("google_safe", f"API error: {response.status}")
                    
        except Exception as e:
            self.logger.error(f"Google Safe Browsing check failed: {str(e)}")
            return self._create_error_result("google_safe", str(e))
    
    def _create_error_result(self, source: str, error: str) -> Dict[str, Any]:
        """Create error result."""
        return {
            "source": source,
            "malicious": False,
            "confidence": 0.0,
            "type": "unknown",
            "details": {"error": error}
        }
    
    def _classify_abuseipdb_threat(self, data: Dict) -> str:
        """Classify threat type from AbuseIPDB data."""
        usage_type = data.get('usageType', '').lower()
        
        if 'scanner' in usage_type or 'recon' in usage_type:
            return "scanning"
        elif 'ddos' in usage_type or 'flood' in usage_type:
            return "ddos"
        elif 'brute' in usage_type or 'login' in usage_type:
            return "brute_force"
        elif 'exploit' in usage_type or 'attack' in usage_type:
            return "exploitation"
        else:
            return "suspicious"
    
    def _classify_otx_threat(self, data: Dict) -> str:
        """Classify threat type from OTX data."""
        sections = data.get('sections', [])
        
        if 'malware' in sections:
            return "malware"
        elif 'phishing' in sections:
            return "phishing"
        elif 'scanning' in sections:
            return "scanning"
        elif 'c2' in sections:
            return "c2"
        else:
            return "suspicious"
    
    def _classify_urlscan_threat(self, data: Dict) -> str:
        """Classify threat type from URLScan data."""
        verdicts = data.get('verdicts', {}).get('overall', {})
        categories = verdicts.get('categories', [])
        
        if 'malicious' in categories:
            return "malware"
        elif 'phishing' in categories:
            return "phishing"
        elif 'scam' in categories:
            return "scam"
        else:
            return "suspicious"
    
    def _classify_google_threat(self, matches: List) -> str:
        """Classify threat type from Google Safe Browsing."""
        if not matches:
            return "benign"
        
        threat_types = [match.get('threatType', '') for match in matches]
        
        if 'MALWARE' in threat_types:
            return "malware"
        elif 'SOCIAL_ENGINEERING' in threat_types:
            return "phishing"
        elif 'UNWANTED_SOFTWARE' in threat_types:
            return "malware"
        else:
            return "suspicious"

class ThreatIntelligenceManager:
    """Enhanced threat intelligence manager."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.api = ThreatIntelAPI()
    
    async def check_ip(self, ip_address: str) -> List[Dict[str, Any]]:
        """Check IP across multiple threat intelligence sources."""
        results = []
        
        async with self.api:
            # Run all checks concurrently
            tasks = [
                self.api.check_abuseipdb(ip_address),
                self.api.check_virustotal(ip_address),
                self.api.check_otx(ip_address)
            ]
            
            try:
                api_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in api_results:
                    if isinstance(result, dict):
                        results.append(result)
                    elif isinstance(result, Exception):
                        self.logger.error(f"API check failed: {result}")
                
            except Exception as e:
                self.logger.error(f"Threat intelligence check failed: {e}")
        
        return results
    
    async def check_url(self, url: str) -> List[Dict[str, Any]]:
        """Check URL across multiple threat intelligence sources."""
        results = []
        
        async with self.api:
            # Run URL checks concurrently
            tasks = [
                self.api.check_urlscan(url),
                self.api.check_google_safe(url)
            ]
            
            try:
                api_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for result in api_results:
                    if isinstance(result, dict):
                        results.append(result)
                    elif isinstance(result, Exception):
                        self.logger.error(f"URL check failed: {result}")
                
            except Exception as e:
                self.logger.error(f"URL threat intelligence check failed: {e}")
        
        return results
    
    def analyze_threat_intel(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
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
        
        # Count malicious sources
        malicious_sources = [r for r in results if r.get('malicious', False)]
        total_sources = len(results)
        
        # Calculate overall confidence
        avg_confidence = sum(r.get('confidence', 0) for r in results) / total_sources
        malicious_ratio = len(malicious_sources) / total_sources
        
        # Determine attack type (most common among malicious sources)
        attack_types = [r.get('type') for r in malicious_sources if r.get('type') != 'unknown']
        attack_type = max(set(attack_types), key=attack_types.count) if attack_types else 'suspicious'
        
        # Calculate risk level
        if malicious_ratio >= 0.7:
            risk_level = "CRITICAL"
        elif malicious_ratio >= 0.5:
            risk_level = "HIGH"
        elif malicious_ratio >= 0.3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            "attack_type": attack_type,
            "risk_level": risk_level,
            "sources": [r.get('source') for r in results],
            "malicious_sources": len(malicious_sources),
            "total_sources": total_sources,
            "confidence": max(avg_confidence, malicious_ratio)
        }

# Global threat intelligence manager
threat_intel_manager = ThreatIntelligenceManager()


class RateLimiter:
    """Simple rate limiter for API calls"""
    
    def __init__(self, max_calls: int, time_window: int):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
    
    async def wait_if_needed(self):
        """Wait if rate limit would be exceeded"""
        now = time.time()
        # Remove old calls outside the time window
        self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
        
        if len(self.calls) >= self.max_calls:
            # Wait until the oldest call is outside the window
            wait_time = self.time_window - (now - self.calls[0])
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.calls.append(now)


class ThreatIntelligenceAPI:
    """Base class for threat intelligence APIs"""
    
    def __init__(self, name: str, api_key: str = None, rate_limit: int = 4):
        self.name = name
        self.api_key = api_key
        self.rate_limiter = RateLimiter(rate_limit, 60)  # rate_limit calls per minute
        self.logger = logging.getLogger(__name__)
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        """Check IP reputation - to be implemented by subclasses"""
        raise NotImplementedError
    
    async def check_domain(self, domain: str) -> ThreatIntelResult:
        """Check domain reputation - to be implemented by subclasses"""
        raise NotImplementedError
    
    async def check_url(self, url: str) -> ThreatIntelResult:
        """Check URL reputation - to be implemented by subclasses"""
        raise NotImplementedError
    
    def _create_result(self, is_malicious: bool, confidence: float, details: Dict[str, Any]) -> ThreatIntelResult:
        """Create a standardized threat intel result"""
        return ThreatIntelResult(
            source=self.name,
            is_malicious=is_malicious,
            confidence_score=confidence,
            details=details,
            timestamp=datetime.now()
        )


class VirusTotalAPI(ThreatIntelligenceAPI):
    """VirusTotal API integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__("virustotal", api_key or settings.virustotal_api_key)
        self.base_url = "https://www.virustotal.com/vtapi/v2"
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        """Check IP reputation using VirusTotal"""
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        await self.rate_limiter.wait_if_needed()
        
        try:
            url = f"{self.base_url}/ip-address/report"
            params = {
                "apikey": self.api_key,
                "ip": ip_address
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_ip_response(data)
                    else:
                        return self._create_result(False, 0.0, {"error": f"API error: {response.status}"})
                        
        except Exception as e:
            self.logger.error(f"VirusTotal IP check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})
    
    def _parse_ip_response(self, data: Dict[str, Any]) -> ThreatIntelResult:
        """Parse VirusTotal IP response"""
        try:
            positive = data.get("positives", 0)
            total = data.get("total", 0)
            
            if total == 0:
                return self._create_result(False, 0.0, {"message": "No data available"})
            
            malicious_ratio = positive / total
            is_malicious = positive > 0
            confidence = min(malicious_ratio * 2, 1.0)  # Scale confidence
            
            details = {
                "positives": positive,
                "total": total,
                "scan_date": data.get("scan_date"),
                "permalink": data.get("permalink"),
                "country": data.get("country"),
                "as_owner": data.get("as_owner")
            }
            
            return self._create_result(is_malicious, confidence, details)
            
        except Exception as e:
            self.logger.error(f"Error parsing VirusTotal response: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class AbuseIPDBAPI(ThreatIntelligenceAPI):
    """AbuseIPDB API integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__("abuseipdb", api_key or settings.abuseipdb_api_key)
        self.base_url = "https://api.abuseipdb.com/api/v2"
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        """Check IP reputation using AbuseIPDB"""
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        await self.rate_limiter.wait_if_needed()
        
        try:
            url = f"{self.base_url}/check"
            headers = {
                "Key": self.api_key,
                "Accept": "application/json"
            }
            params = {
                "ipAddress": ip_address,
                "maxAgeInDays": 90,
                "verbose": ""
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_ip_response(data)
                    else:
                        return self._create_result(False, 0.0, {"error": f"API error: {response.status}"})
                        
        except Exception as e:
            self.logger.error(f"AbuseIPDB IP check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})
    
    def _parse_ip_response(self, data: Dict[str, Any]) -> ThreatIntelResult:
        """Parse AbuseIPDB response"""
        try:
            ip_data = data.get("data", {})
            abuse_confidence = ip_data.get("abuseConfidencePercentage", 0)
            total_reports = ip_data.get("totalReports", 0)
            
            is_malicious = abuse_confidence > 0
            confidence = min(abuse_confidence / 100.0, 1.0)
            
            details = {
                "abuse_confidence": abuse_confidence,
                "total_reports": total_reports,
                "country_code": ip_data.get("countryCode"),
                "usage_type": ip_data.get("usageType"),
                "isp": ip_data.get("isp"),
                "domain": ip_data.get("domain"),
                "last_reported_at": ip_data.get("lastReportedAt")
            }
            
            return self._create_result(is_malicious, confidence, details)
            
        except Exception as e:
            self.logger.error(f"Error parsing AbuseIPDB response: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class URLScanAPI(ThreatIntelligenceAPI):
    """URLScan.io API integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__("urlscan", api_key or settings.urlscan_api_key)
        self.base_url = "https://urlscan.io/api/v1"
    
    async def check_url(self, url: str) -> ThreatIntelResult:
        """Check URL reputation using URLScan.io"""
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        await self.rate_limiter.wait_if_needed()
        
        try:
            # First submit the URL for scanning
            submit_url = f"{self.base_url}/scan/"
            headers = {
                "API-Key": self.api_key,
                "Content-Type": "application/json"
            }
            payload = {"url": url, "public": "on"}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(submit_url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        submit_data = await response.json()
                        scan_id = submit_data.get("uuid")
                        
                        if scan_id:
                            # Wait a bit for the scan to complete
                            await asyncio.sleep(5)
                            
                            # Get the results
                            result_url = f"{self.base_url}/result/{scan_id}/"
                            async with session.get(result_url, headers=headers) as result_response:
                                if result_response.status == 200:
                                    result_data = await result_response.json()
                                    return self._parse_url_response(result_data)
                                else:
                                    return self._create_result(False, 0.0, {"error": "Scan result not available"})
                    
                    return self._create_result(False, 0.0, {"error": f"API error: {response.status}"})
                        
        except Exception as e:
            self.logger.error(f"URLScan URL check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})
    
    def _parse_url_response(self, data: Dict[str, Any]) -> ThreatIntelResult:
        """Parse URLScan.io response"""
        try:
            verdicts = data.get("verdicts", {})
            overall = verdicts.get("overall", {})
            
            malicious = overall.get("malicious", False)
            categories = overall.get("categories", [])
            
            is_malicious = malicious or any(cat in ["malicious", "phishing", "malware"] for cat in categories)
            confidence = 0.8 if is_malicious else 0.2
            
            details = {
                "malicious": malicious,
                "categories": categories,
                "score": overall.get("score", 0),
                "brands": data.get("lists", {}).get("brands", []),
                "ip_addresses": data.get("lists", {}).get("ips", []),
                "domains": data.get("lists", {}).get("domains", [])
            }
            
            return self._create_result(is_malicious, confidence, details)
            
        except Exception as e:
            self.logger.error(f"Error parsing URLScan response: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class OTXAPI(ThreatIntelligenceAPI):
    """AlienVault OTX API integration"""
    
    def __init__(self, api_key: str = None):
        super().__init__("otx", api_key or settings.otx_api_key)
        self.base_url = "https://otx.alienvault.com/api/v1"
    
    async def check_ip(self, ip_address: str) -> ThreatIntelResult:
        """Check IP reputation using OTX"""
        if not self.api_key:
            return self._create_result(False, 0.0, {"error": "No API key provided"})
        
        await self.rate_limiter.wait_if_needed()
        
        try:
            url = f"{self.base_url}/indicators/IPv4/{ip_address}/reputation"
            headers = {"X-OTX-API-KEY": self.api_key}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_ip_response(data)
                    else:
                        return self._create_result(False, 0.0, {"error": f"API error: {response.status}"})
                        
        except Exception as e:
            self.logger.error(f"OTX IP check error: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})
    
    def _parse_ip_response(self, data: Dict[str, Any]) -> ThreatIntelResult:
        """Parse OTX response"""
        try:
            reputation_data = data.get("reputation", {})
            threat_score = reputation_data.get("threat_score", 0)
            
            is_malicious = threat_score > 2
            confidence = min(threat_score / 5.0, 1.0)
            
            details = {
                "threat_score": threat_score,
                "first_seen": data.get("first_seen"),
                "last_seen": data.get("last_seen"),
                "activities": data.get("activities", []),
                "geo": data.get("geo", {}),
                "whois": data.get("whois", {})
            }
            
            return self._create_result(is_malicious, confidence, details)
            
        except Exception as e:
            self.logger.error(f"Error parsing OTX response: {e}")
            return self._create_result(False, 0.0, {"error": str(e)})


class ThreatIntelligenceManager:
    """Main threat intelligence manager that coordinates multiple APIs"""
    
    def __init__(self):
        self.apis = {}
        self.logger = logging.getLogger(__name__)
        
        # Initialize available APIs
        if settings.virustotal_api_key:
            self.apis["virustotal"] = VirusTotalAPI()
        
        if settings.abuseipdb_api_key:
            self.apis["abuseipdb"] = AbuseIPDBAPI()
        
        if settings.urlscan_api_key:
            self.apis["urlscan"] = URLScanAPI()
        
        if settings.otx_api_key:
            self.apis["otx"] = OTXAPI()
        
        self.logger.info(f"Initialized {len(self.apis)} threat intelligence APIs")
    
    async def check_ip(self, ip_address: str, sources: List[str] = None) -> List[ThreatIntelResult]:
        """
        Check IP reputation across multiple threat intelligence sources
        
        Args:
            ip_address: IP address to check
            sources: List of specific sources to use (optional)
            
        Returns:
            List of threat intelligence results
        """
        if not self.apis:
            return []
        
        # Determine which APIs to use
        if sources:
            apis_to_use = [name for name in sources if name in self.apis]
        else:
            apis_to_use = list(self.apis.keys())
        
        # Run checks concurrently
        tasks = []
        for api_name in apis_to_use:
            task = asyncio.create_task(self.apis[api_name].check_ip(ip_address))
            tasks.append(task)
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and return valid results
            valid_results = []
            for result in results:
                if isinstance(result, ThreatIntelResult):
                    valid_results.append(result)
                elif isinstance(result, Exception):
                    self.logger.error(f"Threat intel check error: {result}")
            
            return valid_results
            
        except Exception as e:
            self.logger.error(f"Error in threat intelligence check: {e}")
            return []
    
    async def check_domain(self, domain: str, sources: List[str] = None) -> List[ThreatIntelResult]:
        """Check domain reputation across multiple sources"""
        # Similar implementation to check_ip
        # For now, return empty as most APIs focus on IP checking
        return []
    
    async def check_url(self, url: str, sources: List[str] = None) -> List[ThreatIntelResult]:
        """Check URL reputation across multiple sources"""
        if not self.apis:
            return []
        
        # Determine which APIs to use
        if sources:
            apis_to_use = [name for name in sources if name in self.apis]
        else:
            apis_to_use = list(self.apis.keys())
        
        # Run checks concurrently
        tasks = []
        for api_name in apis_to_use:
            if hasattr(self.apis[api_name], 'check_url'):
                task = asyncio.create_task(self.apis[api_name].check_url(url))
                tasks.append(task)
        
        if not tasks:
            return []
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and return valid results
            valid_results = []
            for result in results:
                if isinstance(result, ThreatIntelResult):
                    valid_results.append(result)
                elif isinstance(result, Exception):
                    self.logger.error(f"Threat intel check error: {result}")
            
            return valid_results
            
        except Exception as e:
            self.logger.error(f"Error in threat intelligence check: {e}")
            return []
    
    def get_available_sources(self) -> List[str]:
        """Get list of available threat intelligence sources"""
        return list(self.apis.keys())
    
    def get_source_status(self) -> Dict[str, bool]:
        """Get status of all threat intelligence sources"""
        return {name: bool(api.api_key) for name, api in self.apis.items()}


# Global threat intelligence manager
threat_intel_manager = ThreatIntelligenceManager()
