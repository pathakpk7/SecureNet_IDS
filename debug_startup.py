#!/usr/bin/env python3
"""Debug startup to find where the hang occurs"""

import sys
import os
import logging
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("1. Starting imports...")

try:
    logger.info("1.1 Loading dotenv...")
    from dotenv import load_dotenv
    load_dotenv()
    logger.info("✅ dotenv loaded")
except Exception as e:
    logger.error(f"❌ dotenv error: {e}")

try:
    logger.info("1.2 Loading core...")
    from core.config import settings
    logger.info("✅ core.config loaded")
except Exception as e:
    logger.error(f"❌ core.config error: {e}")

try:
    logger.info("1.3 Loading database...")
    from database import db_manager
    logger.info("✅ database loaded")
except Exception as e:
    logger.error(f"❌ database error: {e}")

try:
    logger.info("1.4 Loading schemas...")
    from schemas import Alert
    logger.info("✅ schemas loaded")
except Exception as e:
    logger.error(f"❌ schemas error: {e}")

try:
    logger.info("1.5 Loading ML module...")
    from ml import FeatureEngineering, ml_predictor
    logger.info("✅ ML module loaded")
except Exception as e:
    logger.error(f"❌ ML module error: {e}")

try:
    logger.info("1.6 Loading services...")
    from services import PipelineService, MonitoringService
    logger.info("✅ services loaded")
except Exception as e:
    logger.error(f"❌ services error: {e}")

try:
    logger.info("1.7 Loading FastAPI...")
    from fastapi import FastAPI
    logger.info("✅ FastAPI loaded")
except Exception as e:
    logger.error(f"❌ FastAPI error: {e}")

try:
    logger.info("1.8 Creating FastAPI app...")
    app = FastAPI(title="test")
    logger.info("✅ FastAPI app created")
except Exception as e:
    logger.error(f"❌ FastAPI app error: {e}")

logger.info("✅ All imports successful!")
