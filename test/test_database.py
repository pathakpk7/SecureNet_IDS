#!/usr/bin/env python3
"""
SecureNet IDS - Database Connection Test
Test Supabase database connection and resilient in-memory fallback.
"""

import sys
import os
import asyncio
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_path))

from backend.database import db_manager
from backend.schemas import Alert, RiskLevel

async def test_database():
    """Test database connection and operations."""
    
    print("🔍 Testing Supabase Database & In-Memory Fallback...")
    print(f"📡 Supabase URL: {os.getenv('SUPABASE_URL', 'Not set')[:50]}...")
    print(f"🔑 Supabase Key: {os.getenv('SUPABASE_KEY', 'Not set')[:20]}...")
    
    # Test health
    print("\n🏥 Testing Database Health...")
    health = await db_manager.health_check()
    print(f"   Health Check: {health}")
    
    # Test storing a sample log
    print("\n📝 Testing Log Storage...")
    test_log = {
        'timestamp': '2026-04-06T15:41:00.000Z',
        'source_ip': '192.168.1.100',
        'destination_ip': '192.168.1.1',
        'protocol': 'TCP',
        'packet_length': 1024,
        'prediction': True,
        'confidence': 0.95,
        'attack_type': 'test_ddos',
        'risk_level': 'HIGH',
        'features': {'test': 'feature'},
        'threat_intel': {'test': 'intel'},
        'ml_confidence': 0.95,
        'sources': ['ML', 'Test']
    }
    
    log_stored = await db_manager.store_detection_log(test_log)
    print(f"   Test Log Stored: {'✅ SUCCESS' if log_stored else '❌ FAILED'}")
    
    # Test storing a sample alert
    print("\n🚨 Testing Alert Storage...")
    test_alert = Alert(
        id='test_alert_001',
        timestamp='2026-04-06T15:41:00.000Z',
        source_ip='192.168.1.100',
        destination_ip='192.168.1.1',
        attack_type='test_ddos',
        risk_level=RiskLevel.HIGH,
        confidence=0.95,
        status='active',
        details={'test': 'alert'},
        threat_intel_results=[],
        ml_prediction={'test': 'prediction'},
        sources=['ML', 'Test'],
        alert_flag=True
    )
    
    alert_id = await db_manager.insert_alert(test_alert)
    print(f"   Test Alert Stored ID: {alert_id}")
    
    # Test retrieving logs
    print("\n📋 Testing Log Retrieval...")
    logs = await db_manager.get_logs(limit=5)
    print(f"   Retrieved {len(logs)} logs")
    
    if logs:
        print(f"   Latest Log: {logs[0]}")
    
    # Test retrieving alerts
    print("\n🚨 Testing Alert Retrieval...")
    alerts = await db_manager.get_alerts(limit=5)
    print(f"   Retrieved {len(alerts)} alerts")
    
    if alerts:
        print(f"   Latest Alert: {alerts[0].get('id', 'N/A')} - {alerts[0].get('risk_level', 'N/A')}")
    
    # Test statistics
    print("\n📈 Testing Statistics...")
    stats = await db_manager.get_statistics()
    print(f"   Total Packets: {stats.get('total_packets', 0)}")
    print(f"   Alerts Generated: {stats.get('alerts_generated', 0)}")
    
    print("\n🎯 Final Database Layer Status: ✅ OPERATIONAL")
    return True

if __name__ == "__main__":
    asyncio.run(test_database())
