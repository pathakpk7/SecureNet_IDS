#!/usr/bin/env python3
"""
SecureNet IDS - CICIDS2017 Test System
Simple test of the intrusion detection system without database dependencies.
"""

import sys
import os
import asyncio
import logging
import json
from pathlib import Path
import time

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_path))

# Import components
try:
    from backend.predictor import MLPredictor
    from backend.feature_engineering import cicids_feature_extractor
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
    """Test the ML model with sample data."""
    print("\n🤖 Testing CICIDS2017 ML Model...")
    
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
    
    print(f"📊 Prediction Results:")
    print(f"   Prediction: {result.get('prediction', 'N/A')} ({'Attack' if result.get('prediction') == 1 else 'Normal'})")
    print(f"   Confidence: {result.get('confidence', 'N/A'):.4f}")
    print(f"   Attack Type: {result.get('attack_type', 'N/A')}")
    
    return True

async def test_feature_extraction():
    """Test feature extraction with sample packets."""
    print("\n🔧 Testing Feature Extraction...")
    
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
        print(f"\n📦 Testing Packet {i}:")
        print(f"   Source: {packet.source_ip}:{packet.source_port}")
        print(f"   Destination: {packet.destination_ip}:{packet.destination_port}")
        print(f"   Protocol: {packet.protocol.value}")
        print(f"   Length: {packet.packet_length}")
        
        # Extract features
        features = cicids_feature_extractor.extract_cicids_features(packet)
        
        print(f"   📊 Extracted Features:")
        for feature_name, value in features.items():
            print(f"      {feature_name}: {value}")
    
    return True

async def test_integration():
    """Test full integration of ML and feature extraction."""
    print("\n🔄 Testing Full Integration...")
    
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
    
    # Extract features
    features = cicids_feature_extractor.extract_cicids_features(attack_packet)
    
    # Make prediction
    result = predictor.predict_with_details_cicids(features)
    
    print(f"\n🚨 Integration Test Results:")
    print(f"   Input: Large packet from {attack_packet.source_ip} -> {attack_packet.destination_ip}")
    print(f"   Features: {features}")
    print(f"   Prediction: {result.get('prediction', 'N/A')} ({'Attack' if result.get('prediction') == 1 else 'Normal'})")
    print(f"   Confidence: {result.get('confidence', 'N/A'):.4f}")
    print(f"   Attack Type: {result.get('attack_type', 'N/A')}")
    
    return True

def check_model_files():
    """Check if all required model files exist."""
    print("\n📁 Checking Model Files...")
    
    required_files = [
        "model/cicids_model.pkl",
        "model/cicids_scaler.pkl",
        "model/cicids_features.pkl"
    ]
    
    all_exist = True
    for file_path in required_files:
        if Path(file_path).exists():
            size = Path(file_path).stat().st_size
            print(f"   ✅ {file_path} ({size:,} bytes)")
        else:
            print(f"   ❌ {file_path} (MISSING)")
            all_exist = False
    
    return all_exist

def display_system_info():
    """Display system information."""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║              SecureNet IDS - CICIDS2017 Test System           ║
    ║                                                              ║
    ║  This test script validates:                                     ║
    ║  • CICIDS2017 ML model loading                              ║
    ║  • Feature extraction from network packets                    ║
    ║  • ML prediction pipeline                                 ║
    ║  • Integration testing                                    ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

async def main():
    """Main test function."""
    
    display_system_info()
    
    # Check model files
    if not check_model_files():
        print("\n❌ Missing model files!")
        print("Please run 'python train_cicids_model.py' first to generate the model.")
        return 1
    
    print("\n✅ All model files found!")
    
    try:
        # Run tests
        tests = [
            ("ML Model", test_ml_model),
            ("Feature Extraction", test_feature_extraction),
            ("Full Integration", test_integration)
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n{'='*60}")
            print(f"Running {test_name} Test...")
            print(f"{'='*60}")
            
            try:
                result = await test_func()
                results.append((test_name, result))
                print(f"\n✅ {test_name} Test: {'PASSED' if result else 'FAILED'}")
            except Exception as e:
                print(f"\n❌ {test_name} Test: FAILED - {str(e)}")
                results.append((test_name, False))
        
        # Summary
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"   {test_name}: {status}")
        
        print(f"\n📊 Overall: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All tests passed! The CICIDS2017 system is ready for deployment.")
            print("\n🚀 Next steps:")
            print("   1. Set up Supabase database credentials")
            print("   2. Configure environment variables")
            print("   3. Run 'python run_cicids_ids.py' for production deployment")
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
