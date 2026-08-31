#!/usr/bin/env python3
"""
SecureNet IDS - Fixed ML Predictor Module
Fixed CICIDS2017 ML prediction with proper feature handling and confidence calculation.
"""

import pickle
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
import joblib

from .config import settings

logger = logging.getLogger(__name__)

class FixedMLPredictor:
    """Fixed ML predictor with proper CICIDS2017 model handling."""
    
    def __init__(self):
        """Initialize the fixed ML predictor."""
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_loaded = False
        self.prediction_count = 0
        self.attack_count = 0
        self.confidence_threshold = 0.7
        
        logger.info("🤖 Fixed ML Predictor initialized")
    
    def load_model(self) -> bool:
        """
        Load CICIDS2017 model, scaler, and feature names.
        
        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            # Load model
            model_path = Path("model/cicids_model.pkl")
            if not model_path.exists():
                logger.error(f"Model file not found: {model_path}")
                return False
            
            # Try different loading methods
            try:
                self.model = joblib.load(model_path)
                logger.info("✅ Model loaded with joblib")
            except:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("✅ Model loaded with pickle")
            
            # Load scaler
            scaler_path = Path("model/cicids_scaler.pkl")
            if scaler_path.exists():
                try:
                    self.scaler = joblib.load(scaler_path)
                except:
                    with open(scaler_path, 'rb') as f:
                        self.scaler = pickle.load(f)
                logger.info("✅ Scaler loaded successfully")
            else:
                logger.warning("Scaler file not found - features will not be scaled")
            
            # Load feature names
            features_path = Path("model/cicids_features.pkl")
            if features_path.exists():
                with open(features_path, 'rb') as f:
                    self.feature_names = pickle.load(f)
                logger.info(f"✅ Feature names loaded: {len(self.feature_names)} features")
            else:
                logger.warning("Feature names file not found")
                self.feature_names = None
            
            # Validate model
            if not self._validate_model():
                logger.error("Model validation failed")
                return False
            
            self.model_loaded = True
            logger.info("✅ CICIDS2017 model loaded and validated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return False
    
    def _validate_model(self) -> bool:
        """Validate loaded model and components."""
        try:
            if self.model is None:
                logger.error("Model is None")
                return False
            
            # Check if model has predict method
            if not hasattr(self.model, 'predict'):
                logger.error("Model does not have predict method")
                return False
            
            # Check if model has predict_proba method
            if not hasattr(self.model, 'predict_proba'):
                logger.warning("Model does not have predict_proba method")
            
            # Validate feature names
            if self.feature_names is None:
                logger.warning("Feature names not available")
            elif len(self.feature_names) == 0:
                logger.error("Feature names list is empty")
                return False
            
            # Test with dummy data
            try:
                if self.feature_names:
                    dummy_data = pd.DataFrame([[0.0] * len(self.feature_names)], columns=self.feature_names)
                    
                    # Apply scaler if available
                    if self.scaler:
                        dummy_data = self.scaler.transform(dummy_data)
                        if hasattr(dummy_data, 'toarray'):
                            dummy_data = dummy_data.toarray()
                    
                    prediction = self.model.predict(dummy_data)
                    logger.debug(f"Test prediction successful: {prediction[0]}")
                else:
                    logger.warning("Cannot test model without feature names")
                
            except Exception as e:
                logger.warning(f"Model test failed: {str(e)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Model validation error: {str(e)}")
            return False
    
    def predict_with_details_cicids(self, features_dict: Dict[str, float]) -> Optional[Dict[str, Any]]:
        """
        Make prediction with CICIDS2017 features and detailed output.
        
        Args:
            features_dict: Dictionary of CICIDS2017 features
            
        Returns:
            Dictionary with prediction details or None if failed
        """
        try:
            if not self.model_loaded:
                logger.error("Model not loaded")
                return None
            
            if not features_dict:
                logger.error("No features provided")
                return None
            
            # Convert to DataFrame with proper column names
            features_df = self._prepare_features_for_prediction(features_dict)
            
            if features_df is None:
                logger.error("Failed to prepare features")
                return None
            
            # Make prediction
            start_time = datetime.now()
            
            # Get prediction
            prediction = self.model.predict(features_df)[0]
            
            # Get prediction probabilities if available
            confidence = 0.0
            if hasattr(self.model, 'predict_proba'):
                try:
                    probabilities = self.model.predict_proba(features_df)[0]
                    if len(probabilities) >= 2:
                        confidence = max(probabilities)
                    elif len(probabilities) == 1:
                        confidence = probabilities[0] if prediction == 1 else 1.0 - probabilities[0]
                except Exception as e:
                    logger.warning(f"Failed to get prediction probabilities: {str(e)}")
                    confidence = 0.5  # Default confidence
            else:
                # Use decision function if available
                if hasattr(self.model, 'decision_function'):
                    try:
                        decision_score = self.model.decision_function(features_df)[0]
                        confidence = abs(decision_score) / (abs(decision_score) + 1.0)
                    except Exception as e:
                        logger.warning(f"Failed to get decision scores: {str(e)}")
                        confidence = 0.5
                else:
                    confidence = 0.5  # Default confidence
            
            prediction_time = (datetime.now() - start_time).total_seconds()
            
            # Update statistics
            self.prediction_count += 1
            if prediction == 1:
                self.attack_count += 1
            
            # Determine attack type based on prediction and confidence
            attack_type = self._determine_attack_type(prediction, confidence, features_dict)
            
            # Determine risk level
            risk_level = self._determine_risk_level(prediction, confidence)
            
            result = {
                'prediction': int(prediction),
                'confidence': float(confidence),
                'attack_type': attack_type,
                'risk_level': risk_level,
                'prediction_time': prediction_time,
                'model_type': 'CICIDS2017',
                'features_used': list(features_dict.keys()),
                'feature_count': len(features_dict),
                'threshold_met': confidence >= self.confidence_threshold,
                'statistics': {
                    'total_predictions': self.prediction_count,
                    'attack_predictions': self.attack_count,
                    'attack_rate': self.attack_count / self.prediction_count if self.prediction_count > 0 else 0.0
                }
            }
            
            logger.debug(f"Prediction result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return None
    
    def _prepare_features_for_prediction(self, features_dict: Dict[str, float]) -> Optional[pd.DataFrame]:
        """Prepare features for ML prediction."""
        try:
            # Create DataFrame with features
            features_df = pd.DataFrame([features_dict])
            
            # Ensure all required features are present
            if self.feature_names:
                for feature in self.feature_names:
                    if feature not in features_df.columns:
                        features_df[feature] = 0.0
                
                # Reorder columns to match model training
                features_df = features_df[self.feature_names]
            
            # Apply scaler if available
            if self.scaler:
                try:
                    features_scaled = self.scaler.transform(features_df)
                    features_df = pd.DataFrame(features_scaled, columns=features_df.columns)
                    logger.debug("Features scaled successfully")
                except Exception as e:
                    logger.warning(f"Failed to scale features: {str(e)}")
            
            # Ensure numeric type
            features_df = features_df.astype(float)
            
            logger.debug(f"Features prepared: shape={features_df.shape}, columns={list(features_df.columns)}")
            return features_df
            
        except Exception as e:
            logger.error(f"Failed to prepare features: {str(e)}")
            return None
    
    def _determine_attack_type(self, prediction: int, confidence: float, features: Dict[str, float]) -> str:
        """Determine attack type based on prediction and features."""
        if prediction == 0:
            return "normal"
        
        # Analyze features to determine attack type
        try:
            total_fwd_packets = features.get('Total Fwd Packets', 0)
            total_bwd_packets = features.get('Total Backward Packets', 0)
            fwd_bytes_total = features.get('Fwd Packets Length Total', 0)
            bwd_bytes_total = features.get('Bwd Packets Length Total', 0)
            flow_duration = features.get('Flow Duration', 0)
            
            total_packets = total_fwd_packets + total_bwd_packets
            total_bytes = fwd_bytes_total + bwd_bytes_total
            
            # Determine attack type based on traffic patterns
            if total_packets > 100 and flow_duration < 10:
                return "dos"  # High packet rate in short time
            elif total_fwd_packets > 50 and total_bwd_packets < 10:
                return "probe"  # Mostly one-way traffic
            elif total_bytes > 100000 and flow_duration < 5:
                return "ddos"  # High volume traffic
            elif total_fwd_packets < 5 and total_bwd_packets > 20:
                return "r2l"  # Remote to local
            else:
                return "unknown"
                
        except Exception as e:
            logger.warning(f"Error determining attack type: {str(e)}")
            return "unknown"
    
    def _determine_risk_level(self, prediction: int, confidence: float) -> str:
        """Determine risk level based on prediction and confidence."""
        if prediction == 0:
            return "LOW"
        
        if confidence >= 0.9:
            return "CRITICAL"
        elif confidence >= 0.8:
            return "HIGH"
        elif confidence >= 0.7:
            return "MEDIUM"
        else:
            return "LOW"
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information."""
        return {
            'model_loaded': self.model_loaded,
            'model_type': 'CICIDS2017',
            'feature_count': len(self.feature_names) if self.feature_names else 0,
            'feature_names': self.feature_names,
            'scaler_available': self.scaler is not None,
            'confidence_threshold': self.confidence_threshold,
            'statistics': {
                'total_predictions': self.prediction_count,
                'attack_predictions': self.attack_count,
                'attack_rate': self.attack_count / self.prediction_count if self.prediction_count > 0 else 0.0
            }
        }
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded."""
        return self.model_loaded
    
    def reset_statistics(self):
        """Reset prediction statistics."""
        self.prediction_count = 0
        self.attack_count = 0
        logger.info("🔄 Prediction statistics reset")

# Global fixed ML predictor instance
fixed_ml_predictor = FixedMLPredictor()
