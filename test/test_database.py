#!/usr/bin/env python3
"""
SecureNet IDS - Database Connection Test
Test Supabase database connection and basic operations.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_path))

from backend.database_enhanced import enhanced_db_manager

async def test_database():
    """Test database connection and operations."""
    
    print("🔍 Testing Supabase Database Connection...")
    print(f"📡 Supabase URL: {os.getenv('SUPABASE_URL', 'Not set')[:50]}...")
    print(f"🔑 Supabase Key: {os.getenv('SUPABASE_KEY', 'Not set')[:20]}...")
    
    # Check connection info
    conn_info = enhanced_db_manager.get_connection_info()
    print(f"\n📊 Connection Info:")
    for key, value in conn_info.items():
        print(f"   {key}: {value}")
    
    # Test health
    print(f"\n🏥 Testing Database Health...")
    health = await enhanced_db_manager.health_check()
    print(f"   Status: {health.get('status', 'Unknown')}")
    print(f"   Response Time: {health.get('response_time_ms', 0):.2f}ms")
    if 'error' in health:
        print(f"   Error: {health['error']}")
    
    # Test storing a sample log
    print(f"\n📝 Testing Log Storage...")
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
    
    log_stored = await enhanced_db_manager.store_detection_log(test_log)
    print(f"   Test Log Stored: {'✅ SUCCESS' if log_stored else '❌ FAILED'}")
    
    # Test storing a sample alert
    print(f"\n🚨 Testing Alert Storage...")
    test_alert = {
        'id': 'test_alert_001',
        'timestamp': '2026-04-06T15:41:00.000Z',
        'source_ip': '192.168.1.100',
        'destination_ip': '192.168.1.1',
        'attack_type': 'test_ddos',
        'risk_level': 'HIGH',
        'confidence': 0.95,
        'status': 'active',
        'details': {'test': 'alert'},
        'threat_intel_results': [],
        'ml_prediction': {'test': 'prediction'},
        'sources': ['ML', 'Test'],
        'alert_flag': True
    }
    
    alert_stored = await enhanced_db_manager.store_security_alert(test_alert)
    print(f"   Test Alert Stored: {'✅ SUCCESS' if alert_stored else '❌ FAILED'}")
    
    # Test retrieving logs
    print(f"\n📋 Testing Log Retrieval...")
    logs = await enhanced_db_manager.get_recent_logs(limit=5)
    print(f"   Retrieved {len(logs)} logs")
    
    if logs:
        print(f"   Latest Log ID: {logs[0].get('id', 'N/A')}")
        print(f"   Latest Source IP: {logs[0].get('source_ip', 'N/A')}")
        print(f"   Latest Attack Type: {logs[0].get('attack_type', 'N/A')}")
    
    # Test retrieving alerts
    print(f"\n🚨 Testing Alert Retrieval...")
    alerts = await enhanced_db_manager.get_recent_alerts(limit=5)
    print(f"   Retrieved {len(alerts)} alerts")
    
    if alerts:
        print(f"   Latest Alert ID: {alerts[0].get('id', 'N/A')}")
        print(f"   Latest Risk Level: {alerts[0].get('risk_level', 'N/A')}")
        print(f"   Latest Attack Type: {alerts[0].get('attack_type', 'N/A')}")
    
    # Test statistics
    print(f"\n📈 Testing Statistics...")
    stats = await enhanced_db_manager.get_statistics()
    print(f"   Database Connected: {stats.get('database_connected', False)}")
    print(f"   Total Logs: {stats.get('total_logs', 0)}")
    print(f"   Total Alerts: {stats.get('total_alerts', 0)}")
    if 'error' in stats:
        print(f"   Error: {stats['error']}")
    
    # Final status
    print(f"\n🎯 Final Database Status: {'✅ CONNECTED' if enhanced_db_manager.is_connected() else '❌ DISCONNECTED'}")
    
    if enhanced_db_manager.is_connected():
        print(f"✅ Database is ready for production!")
        print(f"📊 Tables should be created via Supabase dashboard:")
        print(f"   - logs table")
        print(f"   - alerts table")
        print(f"   - Indexes on timestamp, source_ip, attack_type, risk_level")
    else:
        print(f"❌ Database connection failed!")
        print(f"🔧 Troubleshooting:")
        print(f"   1. Check Supabase URL format")
        print(f"   2. Verify Supabase key permissions")
        print(f"   3. Ensure tables exist in Supabase")
        print(f"   4. Check network connectivity")

if __name__ == "__main__":
    asyncio.run(test_database())
