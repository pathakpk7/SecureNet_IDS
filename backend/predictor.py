import pickle
import numpy as np
from typing import List, Tuple, Optional, Dict, Any
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pandas as pd
import logging
from pathlib import Path

from .config import settings, ATTACK_TYPES
from .schemas import MLFeatures, PredictionResult, AttackType, RiskLevel, ThreatIntelResult


class MLPredictor:
    def __init__(self, model_path: str = None):
        """
        Initialize ML Predictor
        
        Args:
            model_path: Path to the trained model file
        """
        self.model_path = model_path or settings.model_path
        self.model = None
        self.scaler = None
        self.feature_names = self._get_feature_names()
        self.logger = logging.getLogger(__name__)
        
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
        Load trained CICIDS2017 model from separate files
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        try:
            # Load model
            model_path = "model/cicids_model.pkl"
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load scaler
            scaler_path = "model/cicids_scaler.pkl"
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            self.logger.info("CICIDS2017 model loaded successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error loading model: {e}")
            return False
    
    def save_model(self, model: RandomForestClassifier, scaler: StandardScaler = None) -> bool:
        """
        Save trained model to file
        
        Args:
            model: Trained RandomForest model
            scaler: Optional fitted scaler
            
        Returns:
            bool: True if saved successfully, False otherwise
        """
        try:
            # Create directory if it doesn't exist
            model_file = Path(self.model_path)
            model_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Save model and scaler
            model_data = {
                'model': model,
                'scaler': scaler,
                'feature_names': self.feature_names,
                'model_type': 'RandomForestClassifier'
            }
            
            with open(model_file, 'wb') as f:
                pickle.dump(model_data, f)
            
            self.model = model
            self.scaler = scaler
            self.logger.info(f"Model saved to {self.model_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving model: {e}")
            return False
    
    def prepare_features(self, features: MLFeatures) -> np.ndarray:
        """
        Convert MLFeatures to numpy array for prediction
        
        Args:
            features: MLFeatures object
            
        Returns:
            numpy array ready for prediction
        """
        try:
            # Convert features to list
            feature_list = [
                features.duration, features.protocol_type, features.service, features.flag,
                features.src_bytes, features.dst_bytes, features.land, features.wrong_fragment,
                features.urgent, features.hot, features.num_failed_logins, features.logged_in,
                features.num_compromised, features.root_shell, features.su_attempted,
                features.num_root, features.num_file_creations, features.num_shells,
                features.num_access_files, features.num_outbound_cmds, features.is_host_login,
                features.is_guest_login, features.count, features.srv_count, features.serror_rate,
                features.srv_serror_rate, features.rerror_rate, features.srv_rerror_rate,
                features.same_srv_rate, features.diff_srv_rate, features.srv_diff_host_rate,
                features.dst_host_count, features.dst_host_srv_count, features.dst_host_same_srv_rate,
                features.dst_host_diff_srv_rate, features.dst_host_same_src_port_rate,
                features.dst_host_srv_diff_host_rate, features.dst_host_serror_rate,
                features.dst_host_srv_serror_rate, features.dst_host_rerror_rate,
                features.dst_host_srv_rerror_rate
            ]
            
            # Convert to numpy array
            feature_array = np.array(feature_list).reshape(1, -1)
            
            # Apply scaling if scaler is available
            if self.scaler:
                feature_array = self.scaler.transform(feature_array)
            
            return feature_array
            
        except Exception as e:
            self.logger.error(f"Error preparing features: {e}")
            return np.zeros((1, len(self.feature_names)))
    
    def predict(self, features: MLFeatures) -> Tuple[int, float]:
        """
        Make prediction on features
        
        Args:
            features: MLFeatures object
            
        Returns:
            Tuple of (prediction, confidence_score)
            prediction: 0 for normal, 1 for attack
            confidence_score: Confidence in prediction (0-1)
        """
        try:
            if self.model is None:
                self.logger.error("No model loaded for prediction")
                return 0, 0.0
            
            # Prepare features
            feature_array = self.prepare_features(features)
            
            # Make prediction
            prediction = self.model.predict(feature_array)[0]
            
            # Get confidence score
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(feature_array)[0]
                confidence = max(probabilities)
            else:
                confidence = 0.5  # Default confidence for models without probability
            
            return int(prediction), float(confidence)
            
        except Exception as e:
            self.logger.error(f"Error making prediction: {e}")
            return 0, 0.0
    
    def predict_with_details(self, features: MLFeatures) -> Dict[str, Any]:
        """
        Make detailed prediction with additional information
        
        Args:
            features: MLFeatures object
            
        Returns:
            Dictionary with detailed prediction results
        """
        try:
            if self.model is None:
                return {
                    'prediction': 0,
                    'confidence': 0.0,
                    'attack_type': 'normal',
                    'error': 'No model loaded'
                }
            
            # Prepare features
            feature_array = self.prepare_features(features)
            
            # Make prediction
            prediction = self.model.predict(feature_array)[0]
            
            # Get probabilities
            probabilities = None
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(feature_array)[0]
                confidence = max(probabilities)
            else:
                confidence = 0.5
            
            # Get feature importance if available
            feature_importance = None
            if hasattr(self.model, 'feature_importances_'):
                feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
            
            # Determine attack type (simplified)
            if prediction == 0:
                attack_type = 'normal'
            else:
                # Simplified attack type determination based on features
                attack_type = self._determine_attack_type(features)
            
            return {
                'prediction': int(prediction),
                'confidence': float(confidence),
                'attack_type': attack_type,
                'probabilities': probabilities.tolist() if probabilities is not None else None,
                'feature_importance': feature_importance
            }
            
        except Exception as e:
            self.logger.error(f"Error making detailed prediction: {e}")
            return {
                'prediction': 0,
                'confidence': 0.0,
                'attack_type': 'normal',
                'error': str(e)
            }
    
    def _determine_attack_type(self, features: MLFeatures) -> str:
        """
        Determine attack type based on features (simplified logic)
        
        Args:
            features: MLFeatures object
            
        Returns:
            Attack type string
        """
        # Simplified heuristics for attack type determination
        if features.serror_rate > 0.5 or features.srv_serror_rate > 0.5:
            return 'probe'
        elif features.src_bytes > 10000 or features.count > 100:
            return 'dos'
        elif features.num_failed_logins > 0 or features.num_compromised > 0:
            return 'r2l'
        elif features.root_shell > 0 or features.su_attempted > 0:
            return 'u2r'
        else:
            return 'probe'  # Default attack type
    
    def create_prediction_result(self, features: MLFeatures, 
                               threat_intel_results: List[ThreatIntelResult] = None) -> PredictionResult:
        """
        Create a complete prediction result with risk assessment
        
        Args:
            features: MLFeatures object
            threat_intel_results: Optional threat intelligence results
            
        Returns:
            PredictionResult object
        """
        try:
            # Get ML prediction
            prediction_details = self.predict_with_details(features)
            is_attack = prediction_details['prediction'] == 1
            confidence = prediction_details['confidence']
            
            # Determine attack type
            attack_type_str = prediction_details['attack_type']
            attack_type = AttackType(attack_type_str)
            
            # Calculate risk level
            risk_level = self._calculate_risk_level(
                is_attack, confidence, threat_intel_results or []
            )
            
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
            # Return default result
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
        """
        Calculate overall risk level based on ML prediction and threat intelligence
        
        Args:
            is_attack: Whether ML model predicts attack
            confidence: ML prediction confidence
            threat_intel_results: Threat intelligence results
            
        Returns:
            RiskLevel enum value
        """
        try:
            # Base risk from ML prediction
            if not is_attack:
                ml_risk = RiskLevel.LOW
            elif confidence >= 0.8:
                ml_risk = RiskLevel.HIGH
            elif confidence >= 0.6:
                ml_risk = RiskLevel.MEDIUM
            else:
                ml_risk = RiskLevel.LOW
            
            # Check threat intelligence results
            malicious_count = sum(1 for result in threat_intel_results if result.is_malicious)
            total_count = len(threat_intel_results)
            
            if total_count == 0:
                # No threat intel data, use ML risk
                return ml_risk
            
            # Calculate threat intel risk
            malicious_ratio = malicious_count / total_count
            if malicious_ratio >= 0.7:
                intel_risk = RiskLevel.CRITICAL
            elif malicious_ratio >= 0.5:
                intel_risk = RiskLevel.HIGH
            elif malicious_ratio >= 0.3:
                intel_risk = RiskLevel.MEDIUM
            else:
                intel_risk = RiskLevel.LOW
            
            # Combine risks using weighted average
            ml_score = {RiskLevel.LOW: 1, RiskLevel.MEDIUM: 2, RiskLevel.HIGH: 3, RiskLevel.CRITICAL: 4}[ml_risk]
            intel_score = {RiskLevel.LOW: 1, RiskLevel.MEDIUM: 2, RiskLevel.HIGH: 3, RiskLevel.CRITICAL: 4}[intel_risk]
            
            combined_score = (ml_score * settings.ml_weight + intel_score * settings.threat_intel_weight)
            
            # Convert back to risk level
            if combined_score >= 3.5:
                return RiskLevel.CRITICAL
            elif combined_score >= 2.5:
                return RiskLevel.HIGH
            elif combined_score >= 1.5:
                return RiskLevel.MEDIUM
            else:
                return RiskLevel.LOW
                
        except Exception as e:
            self.logger.error(f"Error calculating risk level: {e}")
            return RiskLevel.LOW
    
    def train_model(self, X: np.ndarray, y: np.ndarray, 
                   test_size: float = 0.2, random_state: int = 42) -> Dict[str, Any]:
        """
        Train a new RandomForest model
        
        Args:
            X: Feature matrix
            y: Target labels
            test_size: Proportion of data for testing
            random_state: Random seed for reproducibility
            
        Returns:
            Dictionary with training results
        """
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )
            
            # Create and fit scaler
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            model = RandomForestClassifier(
                n_estimators=100,
                random_state=random_state,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2
            )
            
            model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(y_test, y_pred, output_dict=True)
            confusion_mat = confusion_matrix(y_test, y_pred)
            
            # Save model
            self.save_model(model, scaler)
            
            return {
                'accuracy': accuracy,
                'classification_report': report,
                'confusion_matrix': confusion_mat.tolist(),
                'model': model,
                'scaler': scaler,
                'feature_importance': dict(zip(self.feature_names, model.feature_importances_))
            }
            
        except Exception as e:
            self.logger.error(f"Error training model: {e}")
            return {'error': str(e)}
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model
        
        Returns:
            Dictionary with model information
        """
        try:
            if self.model is None:
                return {'error': 'No model loaded'}
            
            info = {
                'model_type': type(self.model).__name__,
                'feature_names': self.feature_names,
                'model_path': self.model_path,
                'has_scaler': self.scaler is not None
            }
            
            # Add model-specific information
            if hasattr(self.model, 'n_estimators'):
                info['n_estimators'] = self.model.n_estimators
            if hasattr(self.model, 'max_depth'):
                info['max_depth'] = self.model.max_depth
            if hasattr(self.model, 'feature_importances_'):
                info['feature_importance'] = dict(zip(self.feature_names, self.model.feature_importances_))
            
            return info
            
        except Exception as e:
            self.logger.error(f"Error getting model info: {e}")
            return {'error': str(e)}

    def predict_with_details_cicids(self, features_dict: Dict[str, float]) -> Dict[str, Any]:
        """
        Make detailed prediction using CICIDS2017 features.
        
        Args:
            features_dict: Dictionary with CICIDS2017 features
            
        Returns:
            Dictionary with detailed prediction results
        """
        try:
            if self.model is None:
                return {
                    'prediction': 0,
                    'confidence': 0.0,
                    'attack_type': 'normal',
                    'error': 'No model loaded'
                }
            
            # Convert features dict to DataFrame in correct order
            import pandas as pd
            features_df = pd.DataFrame([features_dict])
            
            # Ensure correct column order
            features_df = features_df[self.feature_names]
            
            # Apply scaling if available
            if self.scaler:
                features_array = self.scaler.transform(features_df)
            else:
                features_array = features_df.values
            
            # Make prediction
            prediction = self.model.predict(features_array)[0]
            
            # Get probabilities
            probabilities = None
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(features_array)[0]
                confidence = max(probabilities)
            else:
                confidence = 0.5
            
            # Get feature importance if available
            feature_importance = None
            if hasattr(self.model, 'feature_importances_'):
                feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
            
            # Determine attack type based on features
            if prediction == 0:
                attack_type = 'normal'
            else:
                attack_type = self._determine_attack_type_from_features(features_dict)
            
            return {
                'prediction': int(prediction),
                'confidence': float(confidence),
                'attack_type': attack_type,
                'probabilities': probabilities.tolist() if probabilities is not None else None,
                'feature_importance': feature_importance,
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
        """
        Determine attack type based on CICIDS features.
        
        Args:
            features: CICIDS feature dictionary
            
        Returns:
            Attack type string
        """
        try:
            fwd_packets = features.get('Total Fwd Packets', 0)
            bwd_packets = features.get('Total Backward Packets', 0)
            fwd_bytes = features.get('Fwd Packets Length Total', 0)
            bwd_bytes = features.get('Bwd Packets Length Total', 0)
            flow_duration = features.get('Flow Duration', 0)
            
            total_packets = fwd_packets + bwd_packets
            total_bytes = fwd_bytes + bwd_bytes
            
            # Simple heuristics for attack classification
            if total_packets > 1000 or flow_duration < 0.1:
                return 'dos'  # High packet rate or very short flows
            elif bwd_packets > fwd_packets * 2:
                return 'probe'  # More response than request packets
            elif total_bytes > 1000000:  # Large data transfer
                return 'exfiltration'
            elif fwd_packets == 1 and bwd_packets == 0 and flow_duration < 1:
                return 'scan'  # Single packet, short duration
            else:
                return 'unknown'  # Default for other patterns
                
        except Exception as e:
            self.logger.error(f"Error determining attack type: {e}")
            return 'unknown'

# Global predictor instance
ml_predictor = MLPredictor()
