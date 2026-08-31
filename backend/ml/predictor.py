import pickle
import numpy as np
import pandas as pd
from typing import List, Tuple, Optional, Dict, Any, Union
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import logging
from pathlib import Path

from core.config import settings
from schemas import MLFeatures, PredictionResult, AttackType, RiskLevel, ThreatIntelResult

logger = logging.getLogger(__name__)


class MLPredictor:
    def __init__(self, model_path: str = None):
        """
        Initialize ML Predictor
        
        Args:
            model_path: Optional path to the trained model file
        """
        self.model_path = model_path or settings.model_path
        self.model = None
        self.scaler = None
        self.feature_names = self._get_feature_names()
        self.logger = logging.getLogger(__name__)
        self.threshold = getattr(settings, 'confidence_threshold', 0.65)
        
        # Load model if available
        self.load_model()
    
    def _get_feature_names(self) -> List[str]:
        """Get expected feature names for CICIDS2017 model"""
        return [
            'Flow Duration',
            'Total Fwd Packets', 
            'Total Backward Packets',
            'Fwd Packets Length Total',
            'Bwd Packets Length Total'
        ]
    
    def load_model(self) -> bool:
        """
        Load trained CICIDS2017 model and scaler from multiple candidate paths.
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        candidate_model_files = [
            Path(self.model_path) if self.model_path else None,
            Path("model/cicids_model.pkl"),
            Path("../model/cicids_model.pkl"),
            Path(__file__).parent / "models" / "cicids_model.pkl",
            Path(__file__).resolve().parent.parent.parent / "model" / "cicids_model.pkl",
            Path("model/model.pkl"),
            Path("../model/model.pkl"),
            Path(__file__).parent / "models" / "model.pkl",
            Path(__file__).resolve().parent.parent.parent / "model" / "model.pkl"
        ]
        
        candidate_scaler_files = [
            Path("model/cicids_scaler.pkl"),
            Path("../model/cicids_scaler.pkl"),
            Path(__file__).parent / "models" / "cicids_scaler.pkl",
            Path(__file__).resolve().parent.parent.parent / "model" / "cicids_scaler.pkl"
        ]
        
        # Try loading separate model and scaler or consolidated bundle
        for m_path in candidate_model_files:
            if m_path and m_path.exists():
                try:
                    with open(m_path, 'rb') as f:
                        loaded_data = pickle.load(f)
                    
                    if isinstance(loaded_data, dict) and 'model' in loaded_data:
                        self.model = loaded_data['model']
                        self.scaler = loaded_data.get('scaler')
                        if 'feature_names' in loaded_data:
                            self.feature_names = loaded_data['feature_names']
                        self.logger.info(f"Loaded consolidated model from {m_path}")
                        return True
                    else:
                        self.model = loaded_data
                        for s_path in candidate_scaler_files:
                            if s_path.exists():
                                with open(s_path, 'rb') as sf:
                                    self.scaler = pickle.load(sf)
                                self.logger.info(f"Loaded scaler from {s_path}")
                                break
                        self.logger.info(f"Loaded model from {m_path}")
                        return True
                except Exception as e:
                    self.logger.warning(f"Failed to load model from {m_path}: {e}")
        
        self.logger.warning("No saved model found in candidate paths.")
        return False
    
    def prepare_features(self, features: Union[MLFeatures, Dict[str, Any], np.ndarray]) -> np.ndarray:
        """Convert features to scaled numpy array for prediction"""
        try:
            if isinstance(features, dict):
                df = pd.DataFrame([features])
                for col in self.feature_names:
                    if col not in df.columns:
                        df[col] = 0.0
                df = df[self.feature_names]
                if self.scaler:
                    return self.scaler.transform(df)
                return df.values
            elif isinstance(features, MLFeatures):
                if len(self.feature_names) == 5:
                    cicids_list = [
                        features.duration,
                        float(features.count),
                        float(features.srv_count),
                        float(features.src_bytes),
                        float(features.dst_bytes)
                    ]
                    arr = np.array(cicids_list).reshape(1, -1)
                    if self.scaler:
                        arr = self.scaler.transform(arr)
                    return arr
                
                arr = np.zeros((1, len(self.feature_names)))
                return arr
            elif isinstance(features, np.ndarray):
                arr = features.reshape(1, -1) if len(features.shape) == 1 else features
                if self.scaler and arr.shape[1] == len(self.feature_names):
                    return self.scaler.transform(arr)
                return arr
            else:
                return np.zeros((1, len(self.feature_names)))
        except Exception as e:
            self.logger.error(f"Error preparing features: {e}")
            return np.zeros((1, len(self.feature_names)))
    
    def predict(self, features: Union[MLFeatures, Dict[str, Any]]) -> Tuple[int, float]:
        """Make prediction on features (0 for normal, 1 for attack)"""
        try:
            if self.model is None:
                self.load_model()
                if self.model is None:
                    return 0, 0.0
            
            feature_array = self.prepare_features(features)
            
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(feature_array)[0]
                # Index 1 is attack probability
                attack_prob = probabilities[1] if len(probabilities) > 1 else 0.0
                prediction = 1 if attack_prob >= self.threshold else 0
                confidence = attack_prob if prediction == 1 else probabilities[0]
            else:
                prediction = self.model.predict(feature_array)[0]
                confidence = 0.90
            
            return int(prediction), float(confidence)
        except Exception as e:
            self.logger.error(f"Error making prediction: {e}")
            return 0, 0.0
    
    def predict_with_details_cicids(self, features_dict: Dict[str, float]) -> Dict[str, Any]:
        """Make detailed prediction using CICIDS2017 flow features dictionary."""
        try:
            if self.model is None:
                self.load_model()
                if self.model is None:
                    return {
                        'prediction': 0,
                        'confidence': 0.0,
                        'attack_type': 'normal',
                        'error': 'No model loaded'
                    }
            
            features_df = pd.DataFrame([features_dict])
            for col in self.feature_names:
                if col not in features_df.columns:
                    features_df[col] = 0.0
            features_df = features_df[self.feature_names]
            
            if self.scaler:
                features_array = self.scaler.transform(features_df)
            else:
                features_array = features_df.values
            
            attack_prob = 0.0
            normal_prob = 1.0
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(features_array)[0]
                if len(probabilities) > 1:
                    normal_prob = probabilities[0]
                    attack_prob = probabilities[1]
                else:
                    attack_prob = float(self.model.predict(features_array)[0])
                
                prediction = 1 if attack_prob >= self.threshold else 0
                confidence = float(attack_prob if prediction == 1 else normal_prob)
            else:
                prediction = int(self.model.predict(features_array)[0])
                confidence = 0.90
            
            if prediction == 0:
                attack_type = 'normal'
            else:
                attack_type = self._determine_attack_type_from_features(features_dict)
            
            return {
                'prediction': int(prediction),
                'confidence': float(confidence),
                'attack_type': attack_type,
                'attack_probability': float(attack_prob),
                'normal_probability': float(normal_prob),
                'features': features_dict
            }
        except Exception as e:
            self.logger.error(f"Error making CICIDS prediction: {e}")
            return {
                'prediction': 0,
                'confidence': 0.0,
                'attack_type': 'normal',
                'error': str(e)
            }
    
    def _determine_attack_type_from_features(self, features: Dict[str, float]) -> str:
        """Accurately determine specific attack category based on flow dynamics."""
        try:
            fwd_pkts = float(features.get('Total Fwd Packets', 0))
            bwd_pkts = float(features.get('Total Backward Packets', 0))
            fwd_bytes = float(features.get('Fwd Packets Length Total', 0))
            bwd_bytes = float(features.get('Bwd Packets Length Total', 0))
            flow_duration = max(0.0001, float(features.get('Flow Duration', 0)))
            
            pkt_rate = fwd_pkts / flow_duration
            
            # 1. Data Exfiltration: massive outbound payload with high byte ratio
            if fwd_bytes >= 200000 and (bwd_bytes <= 20000 or (fwd_bytes / max(1.0, bwd_bytes)) >= 10.0):
                return 'exfiltration'
            
            # 2. DoS / DDoS Flood: high packet rate or rapid flood burst
            if pkt_rate >= 150.0 or (fwd_pkts >= 250 and flow_duration <= 5.0):
                return 'dos'
                
            # 3. Port / Vulnerability Scan: rapid probe packets with minimal/zero response
            if fwd_pkts >= 5 and bwd_pkts <= 1 and flow_duration <= 0.5:
                return 'scan'
                
            # 4. Brute Force: repeated small auth transactions
            if fwd_pkts >= 20 and fwd_bytes <= 40000:
                return 'bruteforce'
                
            return 'scan' if fwd_pkts < 100 else 'dos'
        except Exception:
            return 'scan'
    
    def create_prediction_result(self, features: Any, 
                                 threat_intel_results: List[ThreatIntelResult] = None) -> PredictionResult:
        """Create a complete prediction result with calibrated risk assessment"""
        try:
            if isinstance(features, dict):
                details = self.predict_with_details_cicids(features)
            else:
                details = self.predict_with_details_cicids(getattr(features, '__dict__', {}))
            
            is_attack = (details.get('prediction', 0) == 1)
            confidence = float(details.get('confidence', 0.0))
            attack_type_str = str(details.get('attack_type', 'normal')).lower()
            
            attack_type_map = {
                'normal': AttackType.NORMAL,
                'dos': AttackType.DOS,
                'probe': AttackType.PROBE,
                'u2r': AttackType.U2R,
                'r2l': AttackType.R2L,
                'scan': AttackType.SCAN,
                'exfiltration': AttackType.EXFILTRATION,
                'bruteforce': AttackType.BRUTEFORCE
            }
            attack_type = attack_type_map.get(attack_type_str, AttackType.SCAN if is_attack else AttackType.NORMAL)
            
            risk_level = self._calculate_risk_level(is_attack, confidence, threat_intel_results or [])
            
            return PredictionResult(
                is_attack=is_attack,
                attack_type=attack_type,
                confidence=confidence,
                risk_level=risk_level,
                features=features,
                threat_intel_results=threat_intel_results or []
            )
        except Exception as e:
            self.logger.error(f"Error creating prediction result: {e}")
            return PredictionResult(
                is_attack=False,
                attack_type=AttackType.NORMAL,
                confidence=0.0,
                risk_level=RiskLevel.LOW,
                features=features,
                threat_intel_results=[]
            )
    
    def _calculate_risk_level(self, is_attack: bool, confidence: float, 
                              threat_intel_results: List[ThreatIntelResult]) -> RiskLevel:
        """Calculate overall risk level based on ML prediction and threat intelligence"""
        if not is_attack:
            return RiskLevel.LOW
        if confidence >= 0.90:
            return RiskLevel.CRITICAL
        elif confidence >= 0.75:
            return RiskLevel.HIGH
        elif confidence >= 0.50:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if self.model is None:
            self.load_model()
        if self.model is None:
            return {'error': 'No model loaded'}
        
        info = {
            'model_type': type(self.model).__name__,
            'feature_names': self.feature_names,
            'model_path': str(self.model_path),
            'has_scaler': self.scaler is not None,
            'threshold': self.threshold
        }
        if hasattr(self.model, 'n_estimators'):
            info['n_estimators'] = self.model.n_estimators
        if hasattr(self.model, 'feature_importances_'):
            info['feature_importance'] = dict(zip(self.feature_names, [float(x) for x in self.model.feature_importances_]))
        return info


# Global predictor instance
ml_predictor = MLPredictor()
