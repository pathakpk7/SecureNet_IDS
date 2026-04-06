#!/usr/bin/env python3
"""
SecureNet IDS - CICIDS2017 Real-time Intrusion Detection System
Startup script for the intrusion detection backend.
"""

import sys
import os
import asyncio
import logging
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from backend.main_cicids import app
from backend.config import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main entry point for SecureNet IDS."""
    
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                    SecureNet IDS - Real-time Detection              ║
    ║                  CICIDS2017 Model Integration                ║
    ║                                                              ║
    ║  Features:                                                     ║
    ║  • Real-time packet capture                                   ║
    ║  • CICIDS2017 ML model (99.56% accuracy)               ║
    ║  • Threat intelligence integration                            ║
    ║  • WebSocket real-time updates                             ║
    ║  • Supabase database storage                              ║
    ║                                                              ║
    ║  API Endpoints:                                               ║
    ║  • GET  /status  - System status                        ║
    ║  • POST /start   - Start monitoring                     ║
    ║  • POST /stop    - Stop monitoring                      ║
    ║  • GET  /logs    - Recent detection logs               ║
    ║  • GET  /alerts  - Recent alerts                       ║
    ║  • GET  /stats   - System statistics                    ║
    ║  • WS   /ws      - Real-time WebSocket updates        ║
    ║                                                              ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    
    logger.info("🚀 Starting SecureNet IDS with CICIDS2017 model...")
    logger.info(f"📡 Server will run on http://{settings.host}:{settings.port}")
    logger.info(f"🌐 Network interface: {settings.network_interface}")
    
    # Check if model files exist
    model_files = [
        "model/cicids_model.pkl",
        "model/cicids_scaler.pkl", 
        "model/cicids_features.pkl"
    ]
    
    missing_files = []
    for file_path in model_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        logger.error("❌ Missing model files:")
        for file_path in missing_files:
            logger.error(f"   - {file_path}")
        logger.error("Please run train_cicids_model.py first to generate the model.")
        return 1
    
    logger.info("✅ All model files found")
    
    try:
        import uvicorn
        logger.info("🌟 Starting FastAPI server...")
        
        # Run the application
        uvicorn.run(
            app,
            host=settings.host,
            port=settings.port,
            reload=False,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("⏹ Server stopped by user")
        return 0
    except Exception as e:
        logger.error(f"❌ Server error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
