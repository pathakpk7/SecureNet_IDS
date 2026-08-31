#!/usr/bin/env python3
"""
Comprehensive Live Feature-by-Feature Verification Script
Verifies every single feature and API endpoint specified in the project README.
"""

import sys
import os
import asyncio
import time
import json
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Add project root and backend to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

from fastapi.testclient import TestClient
from backend.main import app
from backend.ml import MLPredictor, FeatureEngineering, cicids_feature_extractor
from backend.database import db_manager
from backend.threat_intelligence import threat_intel_manager
from backend.schemas import PacketData, ProtocolType

client = TestClient(app)

results = []

def record(test_name: str, passed: bool, details: str = ""):
    results.append({
        "name": test_name,
        "passed": passed,
        "details": details
    })
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} | {test_name}: {details}")

print("\n" + "="*70)
print("SECURENET IDS - LIVE FEATURE-BY-FEATURE VERIFICATION")
print("="*70 + "\n")

# 1. ROOT & HEALTH ENDPOINTS
print("[1] Verifying System Health & Root Endpoints...")
try:
    res = client.get("/")
    record("GET / (Root Info)", res.status_code == 200, f"Status: {res.status_code}, App: {res.json().get('app_name')}")
    
    res = client.get("/health")
    record("GET /health", res.status_code == 200, f"Status: {res.json().get('status')}")
    
    res = client.get("/api/v1/health")
    record("GET /api/v1/health", res.status_code == 200, f"Status: {res.status_code}")
except Exception as e:
    record("System Health Endpoints", False, str(e))

# 2. MONITORING CONTROL
print("\n[2] Verifying Monitoring Controls & Status...")
try:
    res = client.get("/status")
    record("GET /status", res.status_code == 200, f"Status: {res.status_code}")
    
    res = client.post("/start-monitoring")
    record("POST /start-monitoring", res.status_code == 200, f"Active: {res.json().get('active', True)}")
    
    res = client.post("/stop-monitoring")
    record("POST /stop-monitoring", res.status_code == 200, f"Active: {res.json().get('active', False)}")
except Exception as e:
    record("Monitoring Controls", False, str(e))

# 3. ML MODEL & FEATURE EXTRACTION
print("\n[3] Verifying ML Model & Feature Extraction Engine...")
try:
    predictor = MLPredictor()
    loaded = predictor.load_model()
    record("ML Model Loading", loaded, f"Model file: {predictor.model_path}")
    
    packet = PacketData(
        source_ip="192.168.1.100",
        destination_ip="192.168.1.1",
        source_port=5353,
        destination_port=53,
        protocol=ProtocolType.UDP,
        packet_length=128,
        timestamp=time.time()
    )
    features = cicids_feature_extractor.extract_cicids_features(packet)
    record("Feature Extraction", len(features) >= 5, f"Extracted {len(features)} features")
    
    pred_res = predictor.predict_with_details_cicids(features)
    record("ML Prediction Inference", "prediction" in pred_res, f"is_attack: {pred_res.get('prediction')==1}, confidence: {pred_res.get('confidence'):.2f}")
except Exception as e:
    record("ML Inference Engine", False, str(e))

# 4. DATABASE RETRIEVAL & STORAGE
print("\n[4] Verifying Database Layer (SQLite & Supabase Sync)...")
try:
    res = client.get("/alerts?limit=10")
    record("GET /alerts", res.status_code == 200, f"Retrieved {len(res.json().get('alerts', []))} alerts")
    
    res = client.get("/logs?limit=10")
    record("GET /logs", res.status_code == 200, f"Retrieved {len(res.json().get('logs', []))} logs")
    
    res = client.get("/stats")
    record("GET /stats", res.status_code == 200, f"Stats total_packets: {res.json().get('stats', {}).get('total_packets')}")
except Exception as e:
    record("Database Retrieval Endpoints", False, str(e))

# 5. BLACKLIST MANAGEMENT
print("\n[5] Verifying Blacklist Management...")
try:
    # Add IP to blacklist
    res = client.post("/blacklist", json={"ip_address": "198.51.100.25", "reason": "Automated verification test"})
    record("POST /blacklist (Add IP)", res.status_code == 200, f"Success: {res.json().get('success')}")
    
    # Retrieve blacklist
    res = client.get("/blacklist")
    bl_ips = [item.get("ip_address") for item in res.json().get("blacklist", [])]
    record("GET /blacklist", res.status_code == 200, f"Blacklist contains {len(bl_ips)} IP(s)")
    
    # Remove IP from blacklist
    res = client.delete("/blacklist/198.51.100.25")
    record("DELETE /blacklist/{ip}", res.status_code == 200, f"Deleted: {res.json().get('success')}")
except Exception as e:
    record("Blacklist Management", False, str(e))

# 6. THREAT INTELLIGENCE
print("\n[6] Verifying Threat Intelligence Endpoint...")
try:
    res = client.post("/check-ip/8.8.8.8")
    record("POST /check-ip/{ip}", res.status_code == 200, f"Checked 8.8.8.8, sources: {len(res.json().get('sources', []))}")
except Exception as e:
    record("Threat Intelligence", False, str(e))

# 7. EXPORTS & REPORT GENERATION (CSV & PDF)
print("\n[7] Verifying Export & Reporting Services...")
try:
    res = client.get("/export/alerts")
    record("GET /export/alerts (CSV)", res.status_code == 200 and "text/csv" in res.headers.get("content-type", ""), f"Content-Type: {res.headers.get('content-type')}")
    
    res = client.get("/api/v1/reports/alerts/export?format=csv")
    record("GET /api/v1/reports/alerts/export", res.status_code == 200, f"Length: {len(res.content)} bytes")
    
    res = client.get("/api/v1/reports/generate?report_type=executive_summary&format=pdf")
    record("GET /api/v1/reports/generate (PDF)", res.status_code == 200 and "pdf" in res.headers.get("content-type", ""), f"PDF generated: {len(res.content)} bytes")
except Exception as e:
    record("Export & Reporting", False, str(e))

# 8. WEBSOCKET REAL-TIME STREAMING
print("\n[8] Verifying WebSocket Streaming...")
try:
    with client.websocket_connect("/ws") as ws:
        msg = ws.receive_json()
        record("WebSocket /ws Connection", True, f"Initial message received: {msg.get('type')}")
except Exception as e:
    record("WebSocket /ws Connection", False, str(e))

# FINAL SUMMARY
print("\n" + "="*70)
total_tests = len(results)
passed_tests = sum(1 for r in results if r["passed"])
print(f"VERIFICATION SUMMARY: {passed_tests}/{total_tests} FEATURES OPERATIONAL ({passed_tests/total_tests*100:.1f}%)")
print("="*70)

if passed_tests == total_tests:
    print("🎉 ALL FEATURES CONFIRMED 100% OPERATIONAL AND CONNECTED END-TO-END!")
    sys.exit(0)
else:
    print("⚠️ Some checks failed. Inspect details above.")
    sys.exit(1)
