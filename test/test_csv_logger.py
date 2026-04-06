#!/usr/bin/env python3
"""
Test script for CSV Logger functionality
"""

import sys
import os
import time
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

from backend.csv_logger import initialize_csv_logging, write_log_entry, get_csv_logger_stats

def test_csv_logger():
    """Test CSV logger functionality"""
    
    print("🧪 Testing CSV Logger System")
    print("=" * 50)
    
    # Test initialization
    print("📋 Testing CSV initialization...")
    if initialize_csv_logging():
        print("✅ CSV logger initialized successfully")
    else:
        print("❌ CSV logger initialization failed")
        return False
    
    # Test log writing
    print("\n📝 Testing log entry writing...")
    
    # Sample log entries
    test_logs = [
        {
            'timestamp': '2026-04-06T20:18:00.000Z',
            'ip_address': '192.168.1.100',
            'prediction': 'Attack',
            'attack_type': 'DDoS',
            'risk_level': 'HIGH',
            'confidence': 0.95,
            'protocol': 'TCP',
            'source_ip': '192.168.1.100',
            'destination_ip': '192.168.1.1',
            'packet_length': 1024,
            'threat_intel_score': 0.8
        },
        {
            'timestamp': '2026-04-06T20:18:01.000Z',
            'ip_address': '192.168.1.101',
            'prediction': 'Normal',
            'attack_type': 'benign',
            'risk_level': 'LOW',
            'confidence': 0.98,
            'protocol': 'UDP',
            'source_ip': '192.168.1.101',
            'destination_ip': '192.168.1.2',
            'packet_length': 512,
            'threat_intel_score': 0.1
        },
        {
            'timestamp': '2026-04-06T20:18:02.000Z',
            'ip_address': '10.0.0.50',
            'prediction': 'Attack',
            'attack_type': 'Port_Scan',
            'risk_level': 'CRITICAL',
            'confidence': 0.89,
            'protocol': 'TCP',
            'source_ip': '10.0.0.50',
            'destination_ip': '10.0.0.1',
            'packet_length': 64,
            'threat_intel_score': 0.95
        }
    ]
    
    # Write test logs
    for i, log_data in enumerate(test_logs, 1):
        print(f"  📊 Writing test log {i}...")
        if write_log_entry(log_data):
            print(f"    ✅ Log {i} queued successfully")
        else:
            print(f"    ❌ Log {i} failed to queue")
    
    # Wait for background processing
    print("\n⏳ Waiting for background processing...")
    time.sleep(2)
    
    # Get statistics
    print("\n📈 Getting CSV logger statistics...")
    stats = get_csv_logger_stats()
    
    print(f"  📂 Database directory: {stats['database_dir']}")
    print(f"  📊 Log queue size: {stats['log_queue_size']}")
    print(f"  🚨 Alert queue size: {stats['alert_queue_size']}")
    print(f"  📄 Log files: {len(stats['log_files'])}")
    print(f"  📄 Alert files: {len(stats['alert_files'])}")
    
    # Check files
    print("\n📁 Checking generated files...")
    database_dir = Path("database")
    
    if database_dir.exists():
        log_files = list(database_dir.glob("logs_*.csv"))
        alert_files = list(database_dir.glob("alerts_*.csv"))
        
        print(f"  📄 Found {len(log_files)} log files:")
        for file in log_files:
            size = file.stat().st_size
            print(f"    - {file.name} ({size} bytes)")
        
        print(f"  🚨 Found {len(alert_files)} alert files:")
        for file in alert_files:
            size = file.stat().st_size
            print(f"    - {file.name} ({size} bytes)")
        
        # Show sample content
        if log_files:
            print(f"\n📋 Sample content from {log_files[0].name}:")
            with open(log_files[0], 'r', encoding='utf-8') as f:
                lines = f.readlines()[:5]  # First 5 lines
                for line in lines:
                    print(f"    {line.strip()}")
        
        if alert_files:
            print(f"\n🚨 Sample content from {alert_files[0].name}:")
            with open(alert_files[0], 'r', encoding='utf-8') as f:
                lines = f.readlines()[:5]  # First 5 lines
                for line in lines:
                    print(f"    {line.strip()}")
    
    print("\n✅ CSV Logger test completed successfully!")
    return True

if __name__ == "__main__":
    try:
        success = test_csv_logger()
        if success:
            print("\n🎉 All tests passed!")
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
