#!/usr/bin/env python3
"""
SecureNet IDS - Enhanced Production Launcher
Production-ready startup script for the enhanced intrusion detection system.
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

from backend.main_enhanced import app
from backend.config import settings

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('secretnet_ids_production.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def check_production_readiness():
    """Check if system is ready for production deployment."""
    print("🔍 Checking Production Readiness...")
    
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
    
    # Check environment variables
    required_env_vars = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'ABUSEIPDB_API_KEY',
        'VIRUSTOTAL_API_KEY',
        'OTX_API_KEY',
        'URLSCAN_API_KEY',
        'GOOGLE_SAFE_API_KEY'
    ]
    
    env_status = {}
    for var in required_env_vars:
        value = os.getenv(var)
        if value:
            env_status[var] = True
            masked_value = value[:8] + "..." if len(value) > 8 else "***"
            print(f"   ✅ {var}: {masked_value}")
        else:
            env_status[var] = False
            print(f"   ⚠️ {var}: Not set (optional)")
    
    # Check critical dependencies
    critical_deps = ['fastapi', 'uvicorn', 'scapy', 'sklearn', 'pandas', 'numpy', 'aiohttp']
    
    print(f"\n📦 Critical Dependencies:")
    for dep in critical_deps:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ❌ {dep} (MISSING)")
            return False
    
    # Check optional dependencies
    optional_deps = ['supabase', 'pyshark']
    
    print(f"\n📦 Optional Dependencies:")
    for dep in optional_deps:
        try:
            __import__(dep)
            print(f"   ✅ {dep}")
        except ImportError:
            print(f"   ⚠️ {dep} (MISSING - some features may be limited)")
    
    return True

def display_production_banner():
    """Display production deployment banner."""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║              SecureNet IDS - Enhanced Production              ║
    ║                  Real-time Intrusion Detection                 ║
    ║                                                              ║
    ║  🚀 Production Features:                                     ║
    ║  • CICIDS2017 ML Model (99.56% accuracy)               ║
    ║  • Real-time Packet Capture                               ║
    ║  • 5 Threat Intelligence APIs                            ║
    ║  • Supabase Database Integration                        ║
    ║  • WebSocket Real-time Updates                         ║
    ║  • Production Logging & Monitoring                     ║
    ║  • Rate Limiting & Caching                            ║
    ║  • Health Checks & Metrics                           ║
    ║                                                              ║
    ║  📡 API Endpoints:                                            ║
    ║  • GET  /status     - System status                 ║
    ║  • POST /start      - Start monitoring              ║
    ║  • POST /stop       - Stop monitoring               ║
    ║  • GET  /logs       - Detection logs               ║
    ║  • GET  /alerts     - Security alerts              ║
    ║  • GET  /stats      - Statistics                   ║
    ║  • GET  /health     - Health check                 ║
    ║  • WS   /ws         - Real-time WebSocket          ║
    ║                                                              ║
    ║  🛡️  Security Features:                                      ║
    ║  • ML-based Attack Detection                           ║
    ║  • Threat Intelligence Correlation                   ║
    ║  • Risk Level Assessment                            ║
    ║  • Real-time Alert Generation                        ║
    ║  • Comprehensive Logging                              ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def main():
    """Main production launcher function."""
    
    display_production_banner()
    
    # Check production readiness
    if not check_production_readiness():
        print("\n❌ System not ready for production deployment!")
        print("Please address the issues above before proceeding.")
        return 1
    
    print("\n✅ System is ready for production deployment!")
    print(f"🌐 Server will run on http://{settings.host}:{settings.port}")
    print(f"📡 Network interface: {settings.network_interface}")
    print(f"📊 Logs will be saved to: secretnet_ids_production.log")
    
    # Display API information
    print(f"\n📚 API Documentation:")
    print(f"   • Swagger UI: http://{settings.host}:{settings.port}/docs")
    print(f"   • ReDoc: http://{settings.host}:{settings.port}/redoc")
    
    # Display monitoring information
    print(f"\n📈 Monitoring Endpoints:")
    print(f"   • System Status: http://{settings.host}:{settings.port}/status")
    print(f"   • Health Check: http://{settings.host}:{settings.port}/health")
    print(f"   • Statistics: http://{settings.host}:{settings.port}/stats")
    
    # Display WebSocket information
    print(f"\n🔌 WebSocket Connection:")
    print(f"   • Real-time Updates: ws://{settings.host}:{settings.port}/ws")
    
    print(f"\n🚀 Starting Enhanced SecureNet IDS Production Server...")
    
    try:
        import uvicorn
        
        # Production configuration
        uvicorn_config = {
            "app": "backend.main_enhanced:app",
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
        
        logger.info("🎯 Production Configuration:")
        for key, value in uvicorn_config.items():
            if key != "app":  # Don't log the app import path
                logger.info(f"   {key}: {value}")
        
        # Run the production server
        uvicorn.run(**uvicorn_config)
        
    except KeyboardInterrupt:
        logger.info("⏹ Production server stopped by user")
        return 0
    except Exception as e:
        logger.error(f"❌ Production server error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
