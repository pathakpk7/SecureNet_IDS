"""
SecureNet IDS - Real-Time Domain and Website Name Resolver
Provides multi-layer real-time mapping from IP addresses to human-readable website and domain names.

Methods:
1. In-Memory DNS Snooper & TLS SNI cache
2. Pre-seeded database of well-known public networks, search engines, CDNs, and threat actors
3. Non-blocking asynchronous Reverse DNS (rDNS/PTR) worker with caching
"""

import socket
import logging
import ipaddress
from typing import Optional, Dict, Any
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Pre-seeded well-known IP/CIDR to Website & Service mapping
KNOWN_SERVICES = {
    # DNS Providers
    "8.8.8.8": {"domain": "dns.google", "website": "Google Public DNS", "org": "Google LLC", "category": "DNS"},
    "8.8.4.4": {"domain": "dns.google", "website": "Google Public DNS", "org": "Google LLC", "category": "DNS"},
    "1.1.1.1": {"domain": "one.one.one.one", "website": "Cloudflare DNS", "org": "Cloudflare, Inc.", "category": "DNS"},
    "1.0.0.1": {"domain": "one.one.one.one", "website": "Cloudflare DNS", "org": "Cloudflare, Inc.", "category": "DNS"},
    "9.9.9.9": {"domain": "dns.quad9.net", "website": "Quad9 Secure DNS", "org": "Quad9", "category": "DNS"},
    
    # Major Tech & Web Platforms
    "142.250.190.46": {"domain": "youtube.com", "website": "YouTube / Google Video", "org": "Google LLC", "category": "Streaming"},
    "172.217.16.206": {"domain": "google.com", "website": "Google Search & Services", "org": "Google LLC", "category": "Search Engine"},
    "142.250.190.78": {"domain": "mail.google.com", "website": "Gmail / Google Workspace", "org": "Google LLC", "category": "Email"},
    "185.199.108.153": {"domain": "github.com", "website": "GitHub (Open Source Platform)", "org": "Microsoft / GitHub", "category": "Development"},
    "140.82.121.4": {"domain": "github.com", "website": "GitHub API & Web", "org": "Microsoft / GitHub", "category": "Development"},
    "151.101.65.140": {"domain": "reddit.com", "website": "Reddit Community & News", "org": "Fastly CDN / Reddit", "category": "Social Media"},
    "104.244.42.1": {"domain": "x.com", "website": "X (formerly Twitter)", "org": "X Corp", "category": "Social Media"},
    "157.240.22.35": {"domain": "instagram.com", "website": "Instagram (Meta Platforms)", "org": "Meta Platforms, Inc.", "category": "Social Media"},
    "157.240.1.35": {"domain": "facebook.com", "website": "Facebook (Meta Platforms)", "org": "Meta Platforms, Inc.", "category": "Social Media"},
    "13.107.42.14": {"domain": "linkedin.com", "website": "LinkedIn Professional", "org": "Microsoft Corp", "category": "Professional"},
    "52.94.233.129": {"domain": "amazon.com", "website": "Amazon Marketplace & AWS", "org": "Amazon.com, Inc.", "category": "E-Commerce"},
    "198.41.214.162": {"domain": "wikipedia.org", "website": "Wikipedia The Free Encyclopedia", "org": "Wikimedia Foundation", "category": "Knowledge"},
    "104.16.132.229": {"domain": "cloudflare.com", "website": "Cloudflare Edge Network", "org": "Cloudflare, Inc.", "category": "CDN / Security"},

    # Known Threat & Suspicious Simulation Nodes
    "185.220.101.5": {"domain": "tor-exit-node.org", "website": "Tor Exit Relay Node", "org": "Tor Anonymity Project", "category": "Anonymizer / Suspicious"},
    "45.33.32.156": {"domain": "scanme.nmap.org", "website": "Nmap Security Scanner Host", "org": "Linode / Nmap Security", "category": "Port Scanning Sensor"},
    "91.240.118.172": {"domain": "bot-c2-tracker.net", "website": "Known Mirai C2 Host", "org": "HostKey B.V.", "category": "Botnet / C2"},
    "198.51.100.22": {"domain": "recon-sensor.test", "website": "External Reconnaissance Scanner", "org": "TEST-NET-2", "category": "Scanning Tool"},
    "203.0.113.88": {"domain": "data-exfil-sink.org", "website": "Remote Data Exfiltration Drop", "org": "TEST-NET-3", "category": "Exfiltration"}
}


class DomainResolver:
    """Thread-safe, non-blocking resolver for mapping IP addresses to website and domain names."""
    
    def __init__(self, max_cache_size: int = 5000):
        self._dns_cache: Dict[str, Dict[str, str]] = {}
        self._executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="DomainResolver")
        self._pending_lookups = set()
        
        # Load known services into cache
        for ip, info in KNOWN_SERVICES.items():
            self._dns_cache[ip] = info

    def register_dns_mapping(self, ip: str, domain: str, category: str = "Web"):
        """Record a live DNS response or TLS SNI handshake into the resolver cache."""
        if not ip or not domain:
            return
        
        clean_domain = domain.rstrip('.').lower()
        website_label = clean_domain
        
        # Friendly website name generation
        parts = clean_domain.split('.')
        if len(parts) >= 2:
            website_label = f"{parts[-2].capitalize()}.{parts[-1]}"
            
        self._dns_cache[ip] = {
            "domain": clean_domain,
            "website": website_label,
            "org": "Live DNS Capture",
            "category": category
        }

    def _is_private_or_special(self, ip_str: str) -> Optional[Dict[str, str]]:
        """Identify RFC1918 private, loopback, and local network addresses."""
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            if ip_obj.is_loopback:
                return {
                    "domain": "localhost",
                    "website": "Localhost (Loopback)",
                    "org": "Local Machine",
                    "category": "Loopback"
                }
            if ip_obj.is_private:
                if str(ip_obj).endswith(".1"):
                    return {
                        "domain": "gateway.local",
                        "website": f"Default Gateway Router ({ip_str})",
                        "org": "Local Network",
                        "category": "LAN Gateway"
                    }
                return {
                    "domain": f"host-{ip_str.replace('.', '-')}.lan",
                    "website": f"Local LAN Device ({ip_str})",
                    "org": "Internal Network",
                    "category": "Internal LAN"
                }
            if ip_obj.is_multicast:
                return {
                    "domain": "multicast.local",
                    "website": "Local Multicast Broadcast",
                    "org": "Local Network",
                    "category": "Multicast"
                }
        except ValueError:
            pass
        return None

    def _async_reverse_dns(self, ip: str):
        """Perform reverse DNS in background thread pool without lagging the packet engine."""
        try:
            hostname, _, _ = socket.gethostbyaddr(ip)
            if hostname:
                parts = hostname.split('.')
                site_name = f"{parts[-2]}.{parts[-1]}" if len(parts) >= 2 else hostname
                self._dns_cache[ip] = {
                    "domain": hostname,
                    "website": site_name,
                    "org": "Reverse DNS Lookup",
                    "category": "Public Host"
                }
        except Exception:
            # If rDNS fails, store a fallback to prevent repeated failing queries
            self._dns_cache[ip] = {
                "domain": ip,
                "website": f"Host ({ip})",
                "org": "External IP",
                "category": "Internet"
            }
        finally:
            self._pending_lookups.discard(ip)

    def resolve(self, ip: str) -> Dict[str, str]:
        """
        Synchronously get the best known domain/website name for an IP.
        Dispatches background rDNS if not yet cached.
        """
        if not ip or ip == "Unknown":
            return {"domain": "Unknown", "website": "Unknown Host", "org": "N/A", "category": "Unknown"}

        # 1. Check in-memory cache
        if ip in self._dns_cache:
            return self._dns_cache[ip]

        # 2. Check private/special IP ranges
        private_info = self._is_private_or_special(ip)
        if private_info:
            self._dns_cache[ip] = private_info
            return private_info

        # 3. Trigger background reverse DNS if not already queued
        if ip not in self._pending_lookups:
            self._pending_lookups.add(ip)
            self._executor.submit(self._async_reverse_dns, ip)

        # Fallback while lookup is in flight
        return {
            "domain": ip,
            "website": f"Host ({ip})",
            "org": "External Network",
            "category": "Internet"
        }

    def resolve_flow(self, src_ip: str, dst_ip: str) -> Dict[str, Any]:
        """
        Resolve a bidirectional flow and determine the primary target website and client.
        """
        src_info = self.resolve(src_ip)
        dst_info = self.resolve(dst_ip)
        
        # For typical outbound client->server flows, destination is the target website.
        # If destination is internal and source is external, source is the external host.
        is_dst_private = self._is_private_or_special(dst_ip) is not None
        is_src_private = self._is_private_or_special(src_ip) is not None
        
        if not is_dst_private and is_src_private:
            primary_site = dst_info["website"]
            primary_domain = dst_info["domain"]
        elif not is_src_private and is_dst_private:
            primary_site = src_info["website"]
            primary_domain = src_info["domain"]
        else:
            primary_site = dst_info["website"]
            primary_domain = dst_info["domain"]

        return {
            "source_domain": src_info["domain"],
            "source_website": src_info["website"],
            "destination_domain": dst_info["domain"],
            "destination_website": dst_info["website"],
            "target_website": primary_site,
            "target_domain": primary_domain,
            "category": dst_info.get("category", "General")
        }


# Global singleton instance
domain_resolver = DomainResolver()
