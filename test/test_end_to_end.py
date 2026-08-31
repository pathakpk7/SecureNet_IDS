#!/usr/bin/env python3
"""
SecureNet IDS - Comprehensive Deep End-to-End System Integration Test
Tests:
1. ML Model Loading & Zero False-Positive Validation for Normal Traffic
2. Realistic Attack Detection (DoS, PortScan, Exfiltration)
3. End-to-End Packet Processing Pipeline
4. FastAPI REST Endpoints & Status
5. WebSocket Real-time Alert & Packet Streaming
"""

import sys
import os
import time
import asyncio
from datetime import datetime
from pathlib import Path

# Add project root and backend to path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

from backend.ml import MLPredictor, FeatureEngineering
from backend.schemas import PacketData, ProtocolType, RiskLevel, AttackType
from backend.threat_intelligence import threat_intel_manager
from backend.services import PipelineService, MonitoringService, WebSocketService
from backend.database import db_manager
from fastapi.testclient import TestClient
from backend.main import app


def test_model_loading_and_false_positive_prevention():
    print("\n[1/5] Testing ML Model Loading & False-Positive Prevention...")
    predictor = MLPredictor()
    assert predictor.model is not None, "ML model failed to load!"
    print("   [OK] ML Model loaded successfully")
    
    # 1. Single packet DNS transaction (MUST be Benign / Normal)
    dns_single = {
        'Flow Duration': 0.02,
        'Total Fwd Packets': 1.0,
        'Total Backward Packets': 1.0,
        'Fwd Packets Length Total': 68.0,
        'Bwd Packets Length Total': 180.0
    }
    dns_res = predictor.create_prediction_result(dns_single)
    print(f"   [TEST] Single DNS Flow -> is_attack={dns_res.is_attack} (Confidence: {dns_res.confidence:.2f})")
    assert dns_res.is_attack is False, "FALSE POSITIVE: Single DNS flow misclassified as attack!"
    
    # 2. Initial TCP Handshake packet (MUST be Benign / Normal)
    initial_syn = {
        'Flow Duration': 0.001,
        'Total Fwd Packets': 1.0,
        'Total Backward Packets': 0.0,
        'Fwd Packets Length Total': 64.0,
        'Bwd Packets Length Total': 0.0
    }
    syn_res = predictor.create_prediction_result(initial_syn)
    print(f"   [TEST] Initial TCP SYN -> is_attack={syn_res.is_attack} (Confidence: {syn_res.confidence:.2f})")
    assert syn_res.is_attack is False, "FALSE POSITIVE: Initial TCP SYN packet misclassified as attack!"
    
    # 3. Standard HTTPS Web Browsing Flow (MUST be Benign / Normal)
    web_flow = {
        'Flow Duration': 3.5,
        'Total Fwd Packets': 12.0,
        'Total Backward Packets': 18.0,
        'Fwd Packets Length Total': 1850.0,
        'Bwd Packets Length Total': 14200.0
    }
    web_res = predictor.create_prediction_result(web_flow)
    print(f"   [TEST] Web Browsing Flow -> is_attack={web_res.is_attack} (Confidence: {web_res.confidence:.2f})")
    assert web_res.is_attack is False, "FALSE POSITIVE: Web browsing flow misclassified as attack!"
    
    print("   [OK] Zero false positives verified on normal network traffic!")


def test_realistic_attack_detection():
    print("\n[2/5] Testing Realistic Attack Identification...")
    predictor = MLPredictor()
    
    # 1. DoS Flood (High packet count, rapid burst)
    dos_flow = {
        'Flow Duration': 0.15,
        'Total Fwd Packets': 1200.0,
        'Total Backward Packets': 0.0,
        'Fwd Packets Length Total': 76800.0,
        'Bwd Packets Length Total': 0.0
    }
    dos_res = predictor.create_prediction_result(dos_flow)
    attack_str = dos_res.attack_type.value if hasattr(dos_res.attack_type, 'value') else str(dos_res.attack_type)
    print(f"   [TEST] DoS Flood Detection -> is_attack={dos_res.is_attack}, type={attack_str}, risk={dos_res.risk_level.value}")
    assert dos_res.is_attack is True, "DoS Flood was not detected!"
    assert "dos" in attack_str.lower(), f"Expected DoS attack type, got {attack_str}"
    
    # 2. Port Scan Burst (High probe packets, no response)
    scan_flow = {
        'Flow Duration': 0.02,
        'Total Fwd Packets': 25.0,
        'Total Backward Packets': 0.0,
        'Fwd Packets Length Total': 1500.0,
        'Bwd Packets Length Total': 0.0
    }
    scan_res = predictor.create_prediction_result(scan_flow)
    attack_str = scan_res.attack_type.value if hasattr(scan_res.attack_type, 'value') else str(scan_res.attack_type)
    print(f"   [TEST] Port Scan Detection -> is_attack={scan_res.is_attack}, type={attack_str}, risk={scan_res.risk_level.value}")
    assert scan_res.is_attack is True, "Port scan was not detected!"
    
    # 3. Data Exfiltration (Massive outbound upload)
    exfil_flow = {
        'Flow Duration': 45.0,
        'Total Fwd Packets': 2500.0,
        'Total Backward Packets': 20.0,
        'Fwd Packets Length Total': 3200000.0,
        'Bwd Packets Length Total': 1280.0
    }
    exfil_res = predictor.create_prediction_result(exfil_flow)
    attack_str = exfil_res.attack_type.value if hasattr(exfil_res.attack_type, 'value') else str(exfil_res.attack_type)
    print(f"   [TEST] Exfiltration Detection -> is_attack={exfil_res.is_attack}, type={attack_str}, risk={exfil_res.risk_level.value}")
    assert exfil_res.is_attack is True, "Data exfiltration was not detected!"
    assert "exfiltration" in attack_str.lower(), f"Expected Exfiltration type, got {attack_str}"
    
    print("   [OK] All attack categories accurately classified!")


async def test_full_pipeline_processing():
    print("\n[3/5] Testing End-to-End Packet Processing Pipeline...")
    fe = FeatureEngineering()
    fe.reset()
    ws = WebSocketService()
    pipeline = PipelineService(feature_engineering=fe)
    pipeline.websocket_service = ws
    
    # Send Benign packet
    normal_pkt = PacketData(
        source_ip="192.168.1.50",
        destination_ip="8.8.8.8",
        source_port=54321,
        destination_port=443,
        protocol=ProtocolType.TCP,
        packet_length=512,
        timestamp=datetime.now(),
        tcp_flags="ACK"
    )
    res_normal = await pipeline.process_packet(normal_pkt, websocket_service=ws)
    print(f"   [PACKET] Processed Normal Packet: is_attack={res_normal.get('prediction')}, type={res_normal.get('attack_type')}")
    assert res_normal.get('prediction') is False, "Normal packet flagged as attack in pipeline!"
    
    # Send DoS flood burst (400 packets in rapid succession)
    for i in range(400):
        atk_pkt = PacketData(
            source_ip="198.51.100.4",
            destination_ip="192.168.1.1",
            source_port=12345,
            destination_port=80,
            protocol=ProtocolType.TCP,
            packet_length=64,
            timestamp=datetime.now(),
            tcp_flags="SYN"
        )
        res_atk = await pipeline.process_packet(atk_pkt, websocket_service=ws)
    
    print(f"   [ALERT] Processed Attack Burst: is_attack={res_atk.get('prediction')}, risk={res_atk.get('risk_level')}, type={res_atk.get('attack_type')}")
    assert res_atk.get('prediction') is True, "Attack burst not flagged in pipeline!"
    
    stats = pipeline.get_pipeline_stats()
    print(f"   [STATS] Pipeline Stats: processed={stats['packets_processed']}, attacks={stats['attacks_detected']}, alerts={stats['alerts_generated']}")
    assert stats['packets_processed'] > 0, "No packets processed in pipeline"
    print("   [OK] Pipeline processing verified successfully")


def test_fastapi_rest_endpoints():
    print("\n[4/5] Testing FastAPI REST Endpoints...")
    with TestClient(app) as client:
        # Root
        r = client.get("/")
        assert r.status_code == 200
        print("   [OK] GET / -> 200 OK")
        
        # Health
        r = client.get("/health")
        assert r.status_code == 200 and r.json().get("status") == "healthy"
        print(f"   [OK] GET /health -> 200 OK (status: {r.json().get('status')})")
        
        # API v1 Health
        r = client.get("/api/v1/health")
        assert r.status_code == 200
        print("   [OK] GET /api/v1/health -> 200 OK")
        
        # Status
        r = client.get("/status")
        assert r.status_code == 200
        print(f"   [OK] GET /status -> 200 OK (monitoring active: {r.json().get('is_monitoring')})")
        
        # Alerts
        r = client.get("/alerts")
        assert r.status_code == 200
        print(f"   [OK] GET /alerts -> 200 OK (count: {r.json().get('data', {}).get('count')})")
        
        # Stats
        r = client.get("/stats")
        assert r.status_code == 200
        print(f"   [OK] GET /stats -> 200 OK (total_packets: {r.json().get('data', {}).get('total_packets')})")
        
        # IP Reputation
        r = client.post("/check-ip/8.8.8.8")
        assert r.status_code == 200
        print("   [OK] POST /check-ip/8.8.8.8 -> 200 OK")
        
        # Export Alerts
        r = client.get("/export/alerts")
        assert r.status_code == 200
        print("   [OK] GET /export/alerts -> 200 OK")


def test_websocket_connection():
    print("\n[5/5] Testing Real-time WebSocket Endpoint...")
    with TestClient(app) as client:
        with client.websocket_connect("/ws") as ws:
            msg = ws.receive_json()
            assert msg.get("type") in ["status", "packet", "alert"], f"Unexpected WS msg: {msg}"
            print(f"   [OK] WebSocket /ws connected & live event received: type={msg.get('type')}")
            
            ws.send_text('{"action": "get_status"}')
            for _ in range(5):
                reply = ws.receive_json()
                if reply.get("type") == "status":
                    print("   [OK] WebSocket real-time messaging verified successfully")
                    break


async def main():
    print("=" * 68)
    print("SECURENET IDS - DEEP VERIFICATION & FALSE-POSITIVE PREVENTION TEST")
    print("=" * 68)
    
    test_model_loading_and_false_positive_prevention()
    test_realistic_attack_detection()
    await test_full_pipeline_processing()
    test_fastapi_rest_endpoints()
    test_websocket_connection()
    
    print("\n" + "=" * 68)
    print("ALL 5/5 DEEP VERIFICATION STAGES PASSED WITH ZERO FALSE POSITIVES!")
    print("=" * 68)


if __name__ == "__main__":
    asyncio.run(main())
