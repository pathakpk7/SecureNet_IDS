import time
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging

from schemas import PacketData, PredictionResult, Alert, LogEntry, AttackType, RiskLevel, ProtocolType
from ml import FeatureEngineering, ml_predictor
from threat_intelligence import threat_intel_manager
from database import db_manager
from core.config import settings

logger = logging.getLogger(__name__)


class PipelineService:
    """
    Pipeline Service - End-to-End Packet Processing
    Orchestrates: Feature Extraction -> ML Flow Classification -> Threat Intel -> Storage -> WebSocket Broadcast.
    """
    
    def __init__(
        self,
        feature_engineering: FeatureEngineering,
        csv_logging_available: bool = False,
        csv_logger_functions: Optional[Dict[str, Any]] = None
    ):
        self.feature_engineering = feature_engineering
        self.csv_logging_available = csv_logging_available
        self.csv_logger_functions = csv_logger_functions
        self.websocket_service = None
        
        # Pipeline statistics
        self.pipeline_stats = {
            "packets_processed": 0,
            "ml_predictions": 0,
            "attacks_detected": 0,
            "threat_intel_checks": 0,
            "database_stores": 0,
            "alerts_generated": 0,
            "last_packet_time": None,
            "last_attack_time": None,
            "last_threat_intel_time": None,
            "performance_metrics": {
                "avg_feature_time": 0.0,
                "avg_prediction_time": 0.0,
                "avg_threat_intel_time": 0.0,
                "avg_database_time": 0.0
            }
        }
        
        logger.info("PipelineService initialized")
    
    async def process_packet(
        self,
        packet: PacketData,
        websocket_service = None
    ) -> Dict[str, Any]:
        """
        Process packet through the complete IDS pipeline.
        
        Pipeline stages:
        1. Feature extraction
        2. ML prediction
        3. Threat intelligence (if attack detected)
        4. Database / in-memory storage
        5. CSV logging (if available)
        6. WebSocket broadcast
        """
        try:
            ws = websocket_service or self.websocket_service
            
            # Update statistics
            self.pipeline_stats["packets_processed"] += 1
            self.pipeline_stats["last_packet_time"] = datetime.now()
            
            # Step 1: Extract features
            f_start = time.time()
            features = self.feature_engineering.extract_features(packet)
            f_time = time.time() - f_start
            
            if not features:
                features = {
                    'Flow Duration': 0.5,
                    'Total Fwd Packets': 1.0,
                    'Total Backward Packets': 1.0,
                    'Fwd Packets Length Total': 128.0,
                    'Bwd Packets Length Total': 128.0
                }
            
            # Step 2: ML flow prediction
            ml_start = time.time()
            prediction_result = ml_predictor.create_prediction_result(features)
            ml_time = time.time() - ml_start
            self.pipeline_stats["ml_predictions"] += 1
            
            proto_str = packet.protocol.value if hasattr(packet.protocol, 'value') else str(packet.protocol).lower()
            attack_str = prediction_result.attack_type.value if hasattr(prediction_result.attack_type, 'value') else str(prediction_result.attack_type).lower()
            risk_str = prediction_result.risk_level.value if hasattr(prediction_result.risk_level, 'value') else str(prediction_result.risk_level).lower()
            
            # Step 3: Prepare detection payload
            detection_data = {
                "timestamp": datetime.now().isoformat(),
                "source_ip": packet.source_ip,
                "destination_ip": packet.destination_ip,
                "protocol": proto_str,
                "packet_length": getattr(packet, 'packet_length', 64),
                "prediction": prediction_result.is_attack,
                "confidence": prediction_result.confidence,
                "attack_type": attack_str,
                "risk_level": risk_str,
                "features": features,
                "threat_intel": {},
                "ml_confidence": prediction_result.confidence,
                "sources": ["ML"]
            }
            
            # Update performance metrics
            self.pipeline_stats["performance_metrics"]["avg_feature_time"] = (
                (self.pipeline_stats["performance_metrics"]["avg_feature_time"] + f_time) / 2
            )
            self.pipeline_stats["performance_metrics"]["avg_prediction_time"] = (
                (self.pipeline_stats["performance_metrics"]["avg_prediction_time"] + ml_time) / 2
            )
            
            # Step 4: Threat intelligence (for detected attacks)
            threat_results = []
            threat_analysis = {}
            
            if prediction_result.is_attack:
                self.pipeline_stats["attacks_detected"] += 1
                self.pipeline_stats["last_attack_time"] = datetime.now()
                
                # Check threat intelligence with fast timeout
                try:
                    threat_results = await asyncio.wait_for(
                        threat_intel_manager.check_ip(packet.source_ip),
                        timeout=1.5
                    )
                    threat_analysis = threat_intel_manager.analyze_threat_intel(threat_results)
                    self.pipeline_stats["threat_intel_checks"] += 1
                    self.pipeline_stats["last_threat_intel_time"] = datetime.now()
                except Exception:
                    threat_analysis = {
                        "attack_type": attack_str,
                        "risk_level": risk_str,
                        "confidence": prediction_result.confidence
                    }
                
                # Create security alert
                alert = await self._create_alert(packet, prediction_result, threat_analysis, threat_results)
                if alert:
                    self.pipeline_stats["alerts_generated"] += 1
                    if ws:
                        await ws.broadcast_alert(alert)
            
            # Step 5: Database storage
            try:
                log_entry = LogEntry(
                    timestamp=datetime.now(),
                    source_ip=packet.source_ip,
                    destination_ip=packet.destination_ip,
                    protocol=proto_str,
                    prediction=prediction_result.is_attack,
                    confidence=prediction_result.confidence,
                    attack_type=attack_str,
                    risk_level=risk_str,
                    features=features,
                    threat_intel=detection_data.get('threat_intel', {})
                )
                await db_manager.store_log_entry(log_entry)
                self.pipeline_stats["database_stores"] += 1
            except Exception as e:
                logger.error(f"Database log storage error: {e}")
            
            # Step 6: CSV logging (if available)
            if self.csv_logging_available and self.csv_logger_functions:
                try:
                    self.csv_logger_functions['write'](detection_data)
                except Exception:
                    pass
            
            # Step 7: Send real-time updates via WebSocket
            if ws:
                await ws.broadcast_packet_update(packet, prediction_result, detection_data, self.pipeline_stats)
            
            return detection_data
            
        except Exception as e:
            logger.error(f"Error processing packet in pipeline: {e}")
            return {"error": str(e)}
    
    async def _create_alert(
        self,
        packet: PacketData,
        prediction_result: PredictionResult,
        threat_analysis: Dict[str, Any],
        threat_results: List
    ) -> Optional[Alert]:
        """Create and persist security alert"""
        try:
            proto_str = packet.protocol.value if hasattr(packet.protocol, 'value') else str(packet.protocol).lower()
            attack_str = prediction_result.attack_type.value if hasattr(prediction_result.attack_type, 'value') else str(prediction_result.attack_type).lower()
            risk_str = prediction_result.risk_level.value if hasattr(prediction_result.risk_level, 'value') else str(prediction_result.risk_level).lower()
            
            alert = Alert(
                source_ip=packet.source_ip,
                destination_ip=packet.destination_ip,
                protocol=proto_str,
                timestamp=datetime.now(),
                attack_type=attack_str,
                risk_level=risk_str,
                confidence=prediction_result.confidence,
                description=f"{attack_str.upper()} attack detected from {packet.source_ip} to {packet.destination_ip}",
                threat_intel_data=[r.dict() if hasattr(r, 'dict') else r for r in threat_results],
                packet_data=packet.dict() if hasattr(packet, 'dict') else {},
                prediction_result=prediction_result.dict() if hasattr(prediction_result, 'dict') else {}
            )
            
            alert_id = await db_manager.insert_alert(alert)
            alert.id = str(alert_id)
            return alert
            
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            return None
    
    def get_pipeline_stats(self) -> Dict[str, Any]:
        """Get current pipeline statistics"""
        return self.pipeline_stats.copy()
    
    def reset_pipeline_stats(self) -> None:
        """Reset pipeline statistics"""
        self.pipeline_stats = {
            "packets_processed": 0,
            "ml_predictions": 0,
            "attacks_detected": 0,
            "threat_intel_checks": 0,
            "database_stores": 0,
            "alerts_generated": 0,
            "last_packet_time": None,
            "last_attack_time": None,
            "last_threat_intel_time": None,
            "performance_metrics": {
                "avg_feature_time": 0.0,
                "avg_prediction_time": 0.0,
                "avg_threat_intel_time": 0.0,
                "avg_database_time": 0.0
            }
        }
