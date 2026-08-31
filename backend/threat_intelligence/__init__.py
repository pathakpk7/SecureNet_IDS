"""
Threat Intelligence module for SecureNet IDS
Threat intelligence manager and provider integrations
"""

from .manager import ThreatIntelligenceManager

# Create global instance
threat_intel_manager = ThreatIntelligenceManager()

__all__ = [
    'ThreatIntelligenceManager',
    'threat_intel_manager'
]
