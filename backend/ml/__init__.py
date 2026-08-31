"""
ML module for SecureNet IDS
Machine learning prediction and feature engineering
"""

from .predictor import MLPredictor, ml_predictor
from .feature_engineering import FeatureEngineering, CICIDSFeatureExtractor, cicids_feature_extractor

# Aliases for backward compatibility
FixedMLPredictor = MLPredictor
fixed_ml_predictor = ml_predictor
FixedFeatureExtractor = CICIDSFeatureExtractor
fixed_feature_extractor = cicids_feature_extractor
RealTimeFeatureExtractor = CICIDSFeatureExtractor
realtime_feature_extractor = cicids_feature_extractor

__all__ = [
    'MLPredictor',
    'ml_predictor',
    'FeatureEngineering',
    'CICIDSFeatureExtractor',
    'cicids_feature_extractor',
    'FixedMLPredictor',
    'fixed_ml_predictor',
    'FixedFeatureExtractor',
    'fixed_feature_extractor',
    'RealTimeFeatureExtractor',
    'realtime_feature_extractor'
]
