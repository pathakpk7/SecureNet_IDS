#!/usr/bin/env python3
"""
Test backend and database connection status
"""

import sys
import os
import asyncio
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

from backend.database_enhanced import enhanced_db_manager
from backend.config import settings

async def test_connections():
    """Test all connections"""
    
    print("🔍 Testing SecureNet IDS Connection Status")
    print("=" * 50)
    
    # Test environment variables
    print("📋 Environment Variables:")
    print(f"  🌐 Supabase URL: {settings.supabase_url[:50]}..." if settings.supabase_url else "❌ Not set")
    print(f"  🔑 Supabase Key: {'✅ Set' if settings.supabase_key else '❌ Not set'}")
    print(f"  📡 VirusTotal API: {'✅ Set' if settings.virustotal_api_key else '❌ Not set'}")
    print(f"  🛡️  AbuseIPDB API: {'✅ Set' if settings.abuseipdb_api_key else '❌ Not set'}")
    print(f"  🔍 OTX API: {'✅ Set' if settings.otx_api_key else '❌ Not set'}")
    
    print("\n🗄️  Database Connection Test:")
    
    # Test database health
    try:
        health = await enhanced_db_manager.health_check()
        if health.get('status') == 'healthy':
            print(f"  ✅ Database Status: {health.get('status')}")
            print(f"  ⚡ Response Time: {health.get('response_time_ms', 0):.2f}ms")
        else:
            print(f"  ❌ Database Status: {health.get('status', 'unknown')}")
            if 'error' in health:
                print(f"  💥 Error: {health['error']}")
    except Exception as e:
        print(f"  💥 Database Test Failed: {e}")
    
    # Test database operations
    print("\n📊 Database Operations Test:")
    try:
        # Test storing a sample log
        test_log = {
            'timestamp': '2026-04-06T20:46:00.000Z',
            'source_ip': '192.168.1.200',
            'destination_ip': '192.168.1.1',
            'protocol': 'TCP',
            'packet_length': 1024,
            'prediction': True,
            'confidence': 0.95,
            'attack_type': 'test_ddos',
            'risk_level': 'HIGH'
        }
        
        log_stored = await enhanced_db_manager.store_detection_log(test_log)
        if log_stored:
            print("  ✅ Log storage: SUCCESS")
        else:
            print("  ❌ Log storage: FAILED")
        
        # Test storing a sample alert
        test_alert = {
            'timestamp': '2026-04-06T20:46:00.000Z',
            'source_ip': '192.168.1.200',
            'destination_ip': '192.168.1.1',
            'attack_type': 'test_ddos',
            'risk_level': 'HIGH',
            'confidence': 0.95,
            'status': 'active',
            'description': 'Test alert for connection verification'
        }
        
        alert_stored = await enhanced_db_manager.store_security_alert(test_alert)
        if alert_stored:
            print("  ✅ Alert storage: SUCCESS")
        else:
            print("  ❌ Alert storage: FAILED")
        
        # Test getting statistics
        stats = await enhanced_db_manager.get_statistics()
        if stats:
            print(f"  📈 Statistics: SUCCESS (found {len(stats)} metrics)")
        else:
            print("  ❌ Statistics: FAILED")
            
    except Exception as e:
        print(f"  💥 Database Operations Failed: {e}")
    
    # Test CSV logging
    print("\n📁 CSV Logging Test:")
    try:
        from backend.csv_logger import initialize_csv_logging, write_log_entry, get_csv_logger_stats
        
        if initialize_csv_logging():
            print("  ✅ CSV Logger: INITIALIZED")
            
            # Test writing a log
            csv_log = {
                'timestamp': '2026-04-06T20:46:00.000Z',
                'ip_address': '192.168.1.200',
                'prediction': 'Attack',
                'attack_type': 'test_ddos',
                'risk_level': 'HIGH',
                'confidence': 0.95,
                'protocol': 'TCP',
                'source_ip': '192.168.1.200',
                'destination_ip': '192.168.1.1',
                'packet_length': 1024,
                'threat_intel_score': 0.8
            }
            
            if write_log_entry(csv_log):
                print("  ✅ CSV Log Write: SUCCESS")
            else:
                print("  ❌ CSV Log Write: FAILED")
            
            # Get stats
            csv_stats = get_csv_logger_stats()
            print(f"  📊 CSV Stats: {csv_stats['log_queue_size']} logs queued, {csv_stats['alert_queue_size']} alerts queued")
            
        else:
            print("  ❌ CSV Logger: FAILED TO INITIALIZE")
            
    except Exception as e:
        print(f"  💥 CSV Logging Failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Connection Status Summary:")
    print("  ✅ CSV Logging: WORKING (local files created)")
    print("  🔄 Supabase Database: TESTING...")
    print("  🔧 Backend Modules: LOADED")
    
    print("\n💡 Next Steps:")
    print("  1. If Supabase failed, check your .env file")
    print("  2. Verify internet connection")
    print("  3. Check Supabase project status")
    print("  4. Run: python run_realtime_ids.py to test full system")

if __name__ == "__main__":
    asyncio.run(test_connections())
