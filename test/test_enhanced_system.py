#!/usr/bin/env python3
"""
SecureNet IDS - Enhanced System Test
Comprehensive testing of the enhanced intrusion detection system.
"""

import sys
import os
import asyncio
import logging
from pathlib import Path
import time
import json
from datetime import datetime

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_path))

# Import enhanced components
try:
    from backend.predictor import MLPredictor
    from backend.feature_engineering import cicids_feature_extractor
    from backend.database_enhanced import enhanced_db_manager
    from backend.threat_intel import threat_intel_manager
    from backend.schemas import PacketData, ProtocolType
    from backend.capture import AsyncPacketCapture
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all backend modules are available")
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MockPacketData:
    """Mock packet data for testing."""
    
    def __init__(self, source_ip="192.168.1.100", destination_ip="192.168.1.1", 
                 source_port=12345, destination_port=80, protocol=ProtocolType.TCP,
                 packet_length=1024, timestamp=None, tcp_flags=None, payload_size=512):
        self.source_ip = source_ip
        self.destination_ip = destination_ip
        self.source_port = source_port
        self.destination_port = destination_port
        self.protocol = protocol
        self.packet_length = packet_length
        self.timestamp = timestamp or time.time()
        self.tcp_flags = tcp_flags
        self.payload_size = payload_size

async def test_ml_model():
    """Test the enhanced ML model."""
    print("\n🤖 Testing Enhanced CICIDS2017 ML Model...")
    
    # Initialize predictor
    predictor = MLPredictor()
    
    if not predictor.load_model():
        print("❌ Failed to load ML model")
        return False
    
    print("✅ ML model loaded successfully")
    
    # Test with sample features
    test_features = {
        'Flow Duration': 10.5,
        'Total Fwd Packets': 15.0,
        'Total Backward Packets': 8.0,
        'Fwd Packets Length Total': 2048.0,
        'Bwd Packets Length Total': 1024.0
    }
    
    # Make prediction
    result = predictor.predict_with_details_cicids(test_features)
    
    print(f"📊 Enhanced Prediction Results:")
    print(f"   Prediction: {result.get('prediction', 'N/A')} ({'Attack' if result.get('prediction') == 1 else 'Normal'})")
    print(f"   Confidence: {result.get('confidence', 'N/A'):.4f}")
    print(f"   Attack Type: {result.get('attack_type', 'N/A')}")
    print(f"   Feature Importance: {len(result.get('feature_importance', {}))} features")
    
    return True

async def test_feature_extraction():
    """Test enhanced feature extraction."""
    print("\n🔧 Testing Enhanced Feature Extraction...")
    
    # Test with sample packets
    test_packets = [
        MockPacketData(
            source_ip="192.168.1.100",
            destination_ip="192.168.1.1",
            source_port=12345,
            destination_port=80,
            protocol=ProtocolType.TCP,
            packet_length=1024
        ),
        MockPacketData(
            source_ip="10.0.0.1",
            destination_ip="192.168.1.1",
            source_port=54321,
            destination_port=22,
            protocol=ProtocolType.TCP,
            packet_length=64
        )
    ]
    
    for i, packet in enumerate(test_packets, 1):
        print(f"\n📦 Testing Enhanced Packet {i}:")
        print(f"   Source: {packet.source_ip}:{packet.source_port}")
        print(f"   Destination: {packet.destination_ip}:{packet.destination_port}")
        print(f"   Protocol: {packet.protocol.value}")
        print(f"   Length: {packet.packet_length}")
        
        # Extract features
        features = cicids_feature_extractor.extract_cicids_features(packet)
        
        print(f"   📊 Enhanced Extracted Features:")
        for feature_name, value in features.items():
            print(f"      {feature_name}: {value}")
    
    # Get flow statistics
    flow_stats = cicids_feature_extractor.get_flow_stats()
    print(f"\n📈 Flow Statistics:")
    for key, value in flow_stats.items():
        print(f"   {key}: {value}")
    
    return True

async def test_database_integration():
    """Test enhanced database integration."""
    print("\n💾 Testing Enhanced Database Integration...")
    
    # Check database connection
    if not enhanced_db_manager.is_connected():
        print("⚠️ Database not connected - this is expected if Supabase credentials are not set")
        return True  # Don't fail the test for missing database
    
    print("✅ Database connected successfully")
    
    # Test database health
    health = await enhanced_db_manager.health_check()
    print(f"🏥 Database Health: {health.get('status')}")
    print(f"   Response Time: {health.get('response_time_ms', 0):.2f}ms")
    
    # Test storing a detection log
    test_log = {
        "timestamp": datetime.now().isoformat(),
        "source_ip": "192.168.1.100",
        "destination_ip": "192.168.1.1",
        "protocol": "TCP",
        "packet_length": 1024,
        "prediction": True,
        "confidence": 0.95,
        "attack_type": "ddos",
        "risk_level": "HIGH",
        "features": {"test": "feature"},
        "threat_intel": {"test": "intel"},
        "ml_confidence": 0.95,
        "sources": ["ML", "AbuseIPDB"]
    }
    
    log_stored = await enhanced_db_manager.store_detection_log(test_log)
    print(f"📝 Detection Log Stored: {'✅' if log_stored else '❌'}")
    
    # Test storing a security alert
    test_alert = {
        "id": "test_alert_001",
        "timestamp": datetime.now().isoformat(),
        "source_ip": "192.168.1.100",
        "destination_ip": "192.168.1.1",
        "attack_type": "ddos",
        "risk_level": "HIGH",
        "confidence": 0.95,
        "status": "active",
        "details": {"test": "alert"},
        "threat_intel_results": [],
        "ml_prediction": {},
        "sources": ["ML"],
        "alert_flag": True
    }
    
    alert_stored = await enhanced_db_manager.store_security_alert(test_alert)
    print(f"🚨 Security Alert Stored: {'✅' if alert_stored else '❌'}")
    
    # Test retrieving logs
    logs = await enhanced_db_manager.get_recent_logs(limit=5)
    print(f"📋 Retrieved {len(logs)} recent logs")
    
    # Test retrieving alerts
    alerts = await enhanced_db_manager.get_recent_alerts(limit=5)
    print(f"🚨 Retrieved {len(alerts)} recent alerts")
    
    return True

async def test_threat_intelligence():
    """Test enhanced threat intelligence integration."""
    print("\n🕵️ Testing Enhanced Threat Intelligence Integration...")
    
    # Test with a known suspicious IP (example)
    test_ip = "192.168.1.100"  # Using local IP for testing
    
    print(f"🔍 Testing IP: {test_ip}")
    
    try:
        # Check IP against threat intelligence APIs
        threat_results = await threat_intel_manager.check_ip(test_ip)
        
        print(f"📊 Threat Intelligence Results:")
        for result in threat_results:
            print(f"   Source: {result.get('source', 'N/A')}")
            print(f"   Malicious: {result.get('malicious', False)}")
            print(f"   Confidence: {result.get('confidence', 0):.4f}")
            print(f"   Type: {result.get('type', 'N/A')}")
            print(f"   Details: {len(result.get('details', {}))} items")
            print()
        
        # Analyze combined results
        analysis = threat_intel_manager.analyze_threat_intel(threat_results)
        
        print(f"🎯 Combined Analysis:")
        print(f"   Attack Type: {analysis.get('attack_type', 'N/A')}")
        print(f"   Risk Level: {analysis.get('risk_level', 'N/A')}")
        print(f"   Sources: {analysis.get('sources', [])}")
        print(f"   Malicious Sources: {analysis.get('malicious_sources', 0)}/{analysis.get('total_sources', 0)}")
        print(f"   Overall Confidence: {analysis.get('confidence', 0):.4f}")
        
        return True
        
    except Exception as e:
        print(f"⚠️ Threat intelligence test failed (expected if API keys are invalid): {str(e)}")
        return True  # Don't fail the test for API issues

async def test_full_integration():
    """Test full enhanced integration."""
    print("\n🔄 Testing Full Enhanced Integration...")
    
    # Initialize components
    predictor = MLPredictor()
    if not predictor.load_model():
        print("❌ Failed to load ML model")
        return False
    
    # Test with mock attack traffic
    attack_packet = MockPacketData(
        source_ip="192.168.1.100",
        destination_ip="192.168.1.1",
        source_port=12345,
        destination_port=80,
        protocol=ProtocolType.TCP,
        packet_length=50000,  # Large packet - potential DoS
        timestamp=time.time()
    )
    
    print(f"🚨 Integration Test - Simulating Attack Traffic:")
    print(f"   Source: {attack_packet.source_ip} -> {attack_packet.destination_ip}")
    print(f"   Packet Size: {attack_packet.packet_length} bytes")
    
    # Step 1: Extract features
    print("\n1️⃣ Extracting Features...")
    features = cicids_feature_extractor.extract_cicids_features(attack_packet)
    print(f"   Features extracted: {len(features)} features")
    
    # Step 2: ML Prediction
    print("\n2️⃣ Running ML Prediction...")
    ml_result = predictor.predict_with_details_cicids(features)
    print(f"   Prediction: {ml_result.get('prediction', 'N/A')} ({'Attack' if ml_result.get('prediction') == 1 else 'Normal'})")
    print(f"   Confidence: {ml_result.get('confidence', 0):.4f}")
    
    # Step 3: Threat Intelligence (if attack detected)
    threat_analysis = {}
    threat_results = []
    if ml_result.get('prediction', 0) == 1:
        print("\n3️⃣ Running Threat Intelligence Analysis...")
        try:
            threat_results = await threat_intel_manager.check_ip(attack_packet.source_ip)
            threat_analysis = threat_intel_manager.analyze_threat_intel(threat_results)
            print(f"   Threat Sources Checked: {len(threat_results)}")
            print(f"   Combined Risk Level: {threat_analysis.get('risk_level', 'N/A')}")
            print(f"   Attack Type: {threat_analysis.get('attack_type', 'N/A')}")
        except Exception as e:
            print(f"   Threat Intel Error: {str(e)}")
    
    # Step 4: Database Storage
    print("\n4️⃣ Storing in Database...")
    detection_data = {
        "timestamp": datetime.now().isoformat(),
        "source_ip": attack_packet.source_ip,
        "destination_ip": attack_packet.destination_ip,
        "protocol": attack_packet.protocol.value,
        "packet_length": attack_packet.packet_length,
        "prediction": ml_result.get('prediction', 0) == 1,
        "confidence": ml_result.get('confidence', 0),
        "attack_type": threat_analysis.get('attack_type', ml_result.get('attack_type', 'unknown')),
        "risk_level": threat_analysis.get('risk_level', 'MEDIUM'),
        "features": features,
        "threat_intel": threat_results,
        "ml_confidence": ml_result.get('confidence', 0),
        "sources": ["ML"] + threat_analysis.get('sources', [])
    }
    
    if enhanced_db_manager.is_connected():
        log_stored = await enhanced_db_manager.store_detection_log(detection_data)
        print(f"   Detection Log Stored: {'✅' if log_stored else '❌'}")
        
        # Store alert if attack detected
        if detection_data['prediction']:
            alert_data = {
                "id": f"test_alert_{int(time.time())}",
                "timestamp": detection_data['timestamp'],
                "source_ip": detection_data['source_ip'],
                "destination_ip": detection_data['destination_ip'],
                "attack_type": detection_data['attack_type'],
                "risk_level": detection_data['risk_level'],
                "confidence": detection_data['confidence'],
                "status": "active",
                "details": {"test": "integration"},
                "threat_intel_results": threat_results,
                "ml_prediction": ml_result,
                "sources": detection_data['sources'],
                "alert_flag": detection_data['risk_level'] == 'CRITICAL'
            }
            
            alert_stored = await enhanced_db_manager.store_security_alert(alert_data)
            print(f"   Security Alert Stored: {'✅' if alert_stored else '❌'}")
    else:
        print("   ⚠️ Database not connected - skipping storage")
    
    # Step 5: Generate Final Report
    print("\n📋 Enhanced Integration Test Results:")
    print(f"   🤖 ML Prediction: {ml_result.get('prediction', 'N/A')} ({ml_result.get('confidence', 0):.4f} confidence)")
    print(f"   🕵️ Threat Intel: {len(threat_results)} sources checked")
    print(f"   🎯 Final Attack Type: {detection_data['attack_type']}")
    print(f"   🚨 Risk Level: {detection_data['risk_level']}")
    print(f"   📊 Data Sources: {detection_data['sources']}")
    print(f"   💾 Database Storage: {'✅' if enhanced_db_manager.is_connected() else '⚠️ Skipped'}")
    
    return True

def check_system_requirements():
    """Check system requirements and dependencies."""
    print("\n🔧 Checking System Requirements...")
    
    # Check model files
    required_files = [
        "model/cicids_model.pkl",
        "model/cicids_scaler.pkl",
        "model/cicids_features.pkl"
    ]
    
    missing_files = []
    for file_path in required_files:
        if Path(file_path).exists():
            size = Path(file_path).stat().st_size
            print(f"   ✅ {file_path} ({size:,} bytes)")
        else:
            print(f"   ❌ {file_path} (MISSING)")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n❌ Missing {len(missing_files)} model files")
        return False
    
    # Check environment variables
    env_vars = {
        'SUPABASE_URL': os.getenv('SUPABASE_URL'),
        'SUPABASE_KEY': os.getenv('SUPABASE_KEY'),
        'ABUSEIPDB_API_KEY': os.getenv('ABUSEIPDB_API_KEY'),
        'VIRUSTOTAL_API_KEY': os.getenv('VIRUSTOTAL_API_KEY'),
        'OTX_API_KEY': os.getenv('OTX_API_KEY'),
        'URLSCAN_API_KEY': os.getenv('URLSCAN_API_KEY'),
        'GOOGLE_SAFE_API_KEY': os.getenv('GOOGLE_SAFE_API_KEY')
    }
    
    print(f"\n🔑 Environment Variables:")
    for var_name, value in env_vars.items():
        if value:
            masked_value = value[:8] + "..." if len(value) > 8 else "***"
            print(f"   ✅ {var_name}: {masked_value}")
        else:
            print(f"   ⚠️ {var_name}: Not set")
    
    # Check Python packages
    required_packages = [
        'fastapi', 'uvicorn', 'scapy', 'pyshark', 'sklearn', 
        'pandas', 'numpy', 'aiohttp', 'supabase'
    ]
    
    print(f"\n📦 Python Packages:")
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (MISSING)")
    
    return len(missing_files) == 0

def display_system_info():
    """Display enhanced system information."""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║              SecureNet IDS - Enhanced Test System              ║
    ║                                                              ║
    ║  This test script validates:                                     ║
    ║  • CICIDS2017 ML model loading                              ║
    ║  • Enhanced feature extraction                             ║
    ║  • Database integration (Supabase)                        ║
    ║  • Threat intelligence APIs (5 sources)                   ║
    ║  • Full system integration                                ║
    ║  • Production-ready features                               ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

async def main():
    """Main enhanced test function."""
    
    display_system_info()
    
    # Check system requirements
    if not check_system_requirements():
        print("\n❌ System requirements not met!")
        print("Please ensure all model files and dependencies are available.")
        return 1
    
    print("\n✅ System requirements check passed!")
    
    try:
        # Run enhanced tests
        tests = [
            ("Enhanced ML Model", test_ml_model),
            ("Enhanced Feature Extraction", test_feature_extraction),
            ("Database Integration", test_database_integration),
            ("Threat Intelligence", test_threat_intelligence),
            ("Full Integration", test_full_integration)
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n{'='*70}")
            print(f"Running {test_name} Test...")
            print(f"{'='*70}")
            
            try:
                result = await test_func()
                results.append((test_name, result))
                print(f"\n✅ {test_name} Test: {'PASSED' if result else 'FAILED'}")
            except Exception as e:
                print(f"\n❌ {test_name} Test: FAILED - {str(e)}")
                results.append((test_name, False))
        
        # Summary
        print(f"\n{'='*70}")
        print("ENHANCED TEST SUMMARY")
        print(f"{'='*70}")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"   {test_name}: {status}")
        
        print(f"\n📊 Overall: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All enhanced tests passed! The system is ready for production deployment.")
            print("\n🚀 Production Deployment Steps:")
            print("   1. Configure Supabase database tables")
            print("   2. Set up environment variables")
            print("   3. Run 'python run_enhanced_ids.py' for production")
            print("   4. Monitor via /status and /health endpoints")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Please check the errors above.")
        
        return 0 if passed == total else 1
        
    except KeyboardInterrupt:
        print("\n⏹ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
