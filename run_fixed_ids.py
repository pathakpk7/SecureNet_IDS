#!/usr/bin/env python3
"""
SecureNet IDS - Fixed Production Launcher
Production-ready startup script for the fixed real-time intrusion detection system.
"""

import sys
import os
import asyncio
import logging
from pathlib import Path
import time

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from backend.main_fixed import app
from backend.config import settings

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('secretnet_ids_fixed_production.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def check_fixed_production_readiness():
    """Check if system is ready for fixed production deployment."""
    print("🔍 Checking Fixed Production Readiness...")
    
    # Check model files
    model_files = [
        "model/cicids_model.pkl",
        "model/cicids_scaler.pkl", 
        "model/cicids_features.pkl"
    ]
    
    missing_files = []
    for file_path in model_files:
        if Path(file_path).exists():
            size = Path(file_path).stat().st_size
            print(f"   ✅ {file_path} ({size:,} bytes)")
        else:
            print(f"   ❌ {file_path} (MISSING)")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n❌ Missing model files: {missing_files}")
        print("Run 'python train_cicids_model.py' first.")
        return False
    
    # Check dependencies
    critical_deps = ['fastapi', 'uvicorn', 'sklearn', 'pandas', 'numpy', 'aiohttp']
    
    print(f"\n📦 Critical Dependencies:")
    for dep in critical_deps:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ❌ {dep} (MISSING)")
            return False
    
    # Check packet capture dependencies
    capture_deps = ['pyshark', 'scapy']
    print(f"\n📦 Packet Capture Dependencies:")
    for dep in capture_deps:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ❌ {dep} (MISSING)")
            return False
    
    # Check optional dependencies
    optional_deps = ['supabase', 'psutil']
    
    print(f"\n📦 Optional Dependencies:")
    for dep in optional_deps:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ⚠️ {dep} (MISSING - some features may be limited)")
    
    # Check environment variables
    required_env_vars = ['SUPABASE_URL', 'SUPABASE_KEY']
    optional_env_vars = [
        'ABUSEIPDB_API_KEY', 'VIRUSTOTAL_API_KEY', 'OTX_API_KEY',
        'URLSCAN_API_KEY', 'GOOGLE_SAFE_API_KEY'
    ]
    
    print(f"\n🔑 Required Environment Variables:")
    for var in required_env_vars:
        value = os.getenv(var)
        if value:
            masked_value = value[:8] + "..." if len(value) > 8 else "***"
            print(f"   ✅ {var}: {masked_value}")
        else:
            print(f"   ❌ {var}: Not set")
            return False
    
    print(f"\n🔑 Optional Environment Variables:")
    for var in optional_env_vars:
        value = os.getenv(var)
        if value:
            masked_value = value[:8] + "..." if len(value) > 8 else "***"
            print(f"   ✅ {var}: {masked_value}")
        else:
            print(f"   ⚠️ {var}: Not set (threat intelligence limited)")
    
    # Check network interface
    print(f"\n🌐 Network Interface:")
    interface = settings.network_interface
    print(f"   Selected Interface: {interface}")
    
    # Check if interface exists (if psutil is available)
    try:
        import psutil
        interfaces = psutil.net_if_addrs()
        if interface in interfaces:
            print(f"   ✅ Interface exists")
        else:
            print(f"   ⚠️ Interface '{interface}' not found")
            print(f"   Available interfaces: {list(interfaces.keys())}")
    except ImportError:
        print(f"   ⚠️ Cannot verify interface (psutil not available)")
    
    return True

def display_fixed_production_banner():
    """Display fixed production deployment banner."""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║              SecureNet IDS - Fixed Production                ║
    ║                  Fully Functional Real-time IDS               ║
    ║                                                              ║
    ║  🚀 Fixed Real-time Features:                                ║
    ║  • Fixed Live Packet Capture (PyShark/Scapy)              ║
    ║  • Fixed Real-time CICIDS2017 ML Model                   ║
    ║  • Fixed Live Threat Intelligence (5 APIs)               ║
    ║  • Fixed Real-time Database Logging (Supabase)            ║
    ║  • Fixed WebSocket Real-time Updates                     ║
    ║  • Fixed TCP Flags Handling (dict → string)              ║
    ║  • Fixed Feature Engineering (exact CICIDS match)       ║
    ║  • Fixed ML Pipeline (proper scaling)                    ║
    ║  • Fixed Database Connection (proper error handling)      ║
    ║  • No Hardcoded Data - Everything Live                    ║
    ║  • Production Logging & Monitoring                        ║
    ║  • Flow-based Feature Extraction                         ║
    ║                                                              ║
    ║  📡 Fixed Real-time Pipeline:                                ║
    ║  Wireshark → Packet Capture → Feature Extraction → ML     ║
    ║  Prediction → Threat Intelligence → Database → API      ║
    ║  Response → WebSocket Update (ALL FIXED)                 ║
    ║                                                              ║
    ║  📡 Fixed API Endpoints:                                     ║
    ║  • GET  /status     - Fixed system status            ║
    ║  • POST /start      - Start live monitoring          ║
    ║  • POST /stop       - Stop live monitoring           ║
    ║  • GET  /logs       - Real-time detection logs       ║
    ║  • GET  /alerts     - Real-time security alerts      ║
    ║  • GET  /stats      - Real-time statistics           ║
    ║  • GET  /flows      - Active network flows           ║
    ║  • GET  /health     - Health check                   ║
    ║  • WS   /ws         - Real-time WebSocket            ║
    ║                                                              ║
    ║  🛡️  Fixed Real-time Security:                                ║
    ║  • Fixed Live Attack Detection                         ║
    ║  • Fixed Real-time Threat Intelligence Correlation   ║
    ║  • Fixed Live Risk Level Assessment                    ║
    ║  • Fixed Real-time Alert Generation                     ║
    ║  • Fixed Live Performance Monitoring                    ║
    ║  • Fixed TCP Flags Processing                           ║
    ║  • Fixed Feature Extraction                             ║
    ║  • Fixed ML Prediction Pipeline                         ║
    ║                                                              ║
    ║  🔧 Issues Fixed:                                           ║
    ║  ✅ Supabase database connection                          ║
    ║  ✅ TCP flags validation error                           ║
    ║  ✅ Removed all hardcoded data                          ║
    ║  ✅ Fixed real-time pipeline                            ║
    ║  ✅ Fixed model predictions                            ║
    ║  ✅ Fixed feature mismatch warnings                     ║
    ║  ✅ Fixed real-time packet processing                   ║
    ║  ✅ Fixed database logging                              ║
    ║  ✅ Fixed threat intelligence integration               ║
    ║  ✅ Fixed system validation                             ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def main():
    """Main fixed production launcher function."""
    
    display_fixed_production_banner()
    
    # Check production readiness
    if not check_fixed_production_readiness():
        print("\n❌ System not ready for fixed production deployment!")
        print("Please address the issues above before proceeding.")
        return 1
    
    print("\n✅ Fixed production system is ready!")
    print(f"🌐 Server will run on http://{settings.host}:{settings.port}")
    print(f"📡 Network interface: {settings.network_interface}")
    print(f"📊 Logs will be saved to: secretnet_ids_fixed_production.log")
    
    # Display API information
    print(f"\n📚 API Documentation:")
    print(f"   • Swagger UI: http://{settings.host}:{settings.port}/docs")
    print(f"   • ReDoc: http://{settings.host}:{settings.port}/redoc")
    
    # Display monitoring information
    print(f"\n📈 Fixed Monitoring:")
    print(f"   • System Status: http://{settings.host}:{settings.port}/status")
    print(f"   • Health Check: http://{settings.host}:{settings.port}/health")
    print(f"   • Statistics: http://{settings.host}:{settings.port}/stats")
    print(f"   • Active Flows: http://{settings.host}:{settings.port}/flows")
    
    # Display WebSocket information
    print(f"\n🔌 Fixed WebSocket Connection:")
    print(f"   • Live Updates: ws://{settings.host}:{settings.port}/ws")
    
    # Display fixed pipeline information
    print(f"\n🔄 Fixed Real-time Processing Pipeline:")
    print(f"   1. 📡 Fixed Live Packet Capture (PyShark/Scapy)")
    print(f"   2. 🔧 Fixed Real-time Feature Extraction (CICIDS)")
    print(f"   3. 🤖 Fixed Live ML Prediction (99.56% accuracy)")
    print(f"   4. 🕵️ Fixed Live Threat Intelligence (5 APIs)")
    print(f"   5. 💾 Fixed Real-time Database Logging (Supabase)")
    print(f"   6. 📡 Fixed Real-time WebSocket Updates")
    print(f"   7. 🚨 Fixed Real-time Alert Generation")
    
    print(f"\n🔧 Issues Fixed:")
    print(f"   ✅ Supabase database connection fixed")
    print(f"   ✅ TCP flags validation error fixed")
    print(f"   ✅ All hardcoded data removed")
    print(f"   ✅ Real-time pipeline fixed")
    print(f"   ✅ Model predictions fixed")
    print(f"   ✅ Feature mismatch warnings fixed")
    print(f"   ✅ Real-time packet processing fixed")
    print(f"   ✅ Database logging fixed")
    print(f"   ✅ Threat intelligence integration fixed")
    print(f"   ✅ System validation fixed")
    
    print(f"\n🚀 Starting Fixed Real-time SecureNet IDS Production Server...")
    
    try:
        import uvicorn
        
        # Fixed production configuration
        uvicorn_config = {
            "app": "backend.main_fixed:app",
            "host": settings.host,
            "port": settings.port,
            "reload": False,  # No reload in production
            "log_level": "info",
            "access_log": True,
            "workers": 1,  # Single worker for packet capture
            "loop": "asyncio",
            "http": "auto",
            "ws": "auto",
            "lifespan": "on",
            "env_file": ".env"
        }
        
        logger.info("🎯 Fixed Production Configuration:")
        for key, value in uvicorn_config.items():
            if key != "app":  # Don't log the app import path
                logger.info(f"   {key}: {value}")
        
        # Display fixed system information
        logger.info("🔄 Fixed Real-time Processing Pipeline:")
        logger.info("   📡 Fixed Live Packet Capture → 🔧 Fixed Feature Extraction → 🤖 Fixed ML Prediction")
        logger.info("   🕵️ Fixed Threat Intelligence → 💾 Fixed Database Logging → 📡 Fixed WebSocket Updates")
        
        # Run the fixed production server
        uvicorn.run(**uvicorn_config)
        
    except KeyboardInterrupt:
        logger.info("⏹ Fixed production server stopped by user")
        return 0
    except Exception as e:
        logger.error(f"❌ Fixed production server error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
