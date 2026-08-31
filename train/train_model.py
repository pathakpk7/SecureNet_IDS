#!/usr/bin/env python3
"""
Model Training Script for SecureNet IDS

This script trains a machine learning model using the NSL-KDD dataset
or any compatible network intrusion detection dataset.
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path
import logging
from typing import Tuple, Dict, Any
import argparse

# Add backend directory to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root / "backend"))
sys.path.append(str(project_root))

from backend.predictor import MLPredictor
from backend.config import settings, PROTOCOL_MAPPING, ATTACK_TYPES
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import pickle

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ModelTrainer:
    def __init__(self, data_path: str = None):
        """
        Initialize Model Trainer
        
        Args:
            data_path: Path to the training dataset
        """
        self.data_path = data_path or "../data/NSL-KDD/KDDTrain+.txt"
        self.predictor = MLPredictor()
        self.label_encoders = {}
        self.scaler = StandardScaler()
        
    def load_nsl_kdd_dataset(self, file_path: str) -> pd.DataFrame:
        """
        Load NSL-KDD dataset
        
        Args:
            file_path: Path to the dataset file
            
        Returns:
            Loaded DataFrame
        """
        try:
            # NSL-KDD column names
            column_names = [
                'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
                'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
                'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
                'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
                'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
                'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
                'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
                'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
                'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
                'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'label', 'difficulty_level'
            ]
            
            # Load dataset
            logger.info(f"Loading dataset from {file_path}")
            df = pd.read_csv(file_path, header=None, names=column_names)
            
            logger.info(f"Dataset loaded successfully. Shape: {df.shape}")
            return df
            
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            raise
    
    def create_synthetic_dataset(self, num_samples: int = 10000) -> pd.DataFrame:
        """
        Create a synthetic dataset for demonstration purposes
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            Synthetic DataFrame
        """
        logger.info("Creating synthetic dataset for demonstration")
        
        np.random.seed(42)
        
        # Generate realistic network traffic features
        data = {
            'duration': np.random.exponential(10, num_samples),
            'protocol_type': np.random.choice(['tcp', 'udp', 'icmp'], num_samples, p=[0.8, 0.15, 0.05]),
            'service': np.random.choice(['http', 'ftp', 'smtp', 'ssh', 'dns', 'other'], num_samples),
            'flag': np.random.choice(['SF', 'REJ', 'RSTR', 'RSTO', 'S1', 'S2'], num_samples, p=[0.7, 0.1, 0.05, 0.05, 0.05, 0.05]),
            'src_bytes': np.random.lognormal(6, 2, num_samples).astype(int),
            'dst_bytes': np.random.lognormal(4, 2, num_samples).astype(int),
            'land': np.random.choice([0, 1], num_samples, p=[0.999, 0.001]),
            'wrong_fragment': np.random.choice([0, 1, 2, 3], num_samples, p=[0.95, 0.03, 0.015, 0.005]),
            'urgent': np.random.choice([0, 1, 2], num_samples, p=[0.98, 0.015, 0.005]),
            'hot': np.random.choice([0, 1, 2, 3, 4], num_samples, p=[0.9, 0.05, 0.03, 0.015, 0.005]),
            'num_failed_logins': np.random.choice([0, 1, 2, 3], num_samples, p=[0.95, 0.03, 0.015, 0.005]),
            'logged_in': np.random.choice([0, 1], num_samples, p=[0.7, 0.3]),
            'num_compromised': np.random.choice([0, 1, 2, 3, 4], num_samples, p=[0.9, 0.05, 0.03, 0.015, 0.005]),
            'root_shell': np.random.choice([0, 1], num_samples, p=[0.99, 0.01]),
            'su_attempted': np.random.choice([0, 1, 2], num_samples, p=[0.98, 0.015, 0.005]),
            'num_root': np.random.choice([0, 1, 2, 3], num_samples, p=[0.95, 0.03, 0.015, 0.005]),
            'num_file_creations': np.random.choice([0, 1, 2], num_samples, p=[0.97, 0.02, 0.01]),
            'num_shells': np.random.choice([0, 1, 2], num_samples, p=[0.98, 0.015, 0.005]),
            'num_access_files': np.random.choice([0, 1, 2, 3], num_samples, p=[0.95, 0.03, 0.015, 0.005]),
            'num_outbound_cmds': np.zeros(num_samples),  # Always 0 in NSL-KDD
            'is_host_login': np.random.choice([0, 1], num_samples, p=[0.999, 0.001]),
            'is_guest_login': np.random.choice([0, 1], num_samples, p=[0.8, 0.2]),
            'count': np.random.poisson(10, num_samples),
            'srv_count': np.random.poisson(5, num_samples),
            'serror_rate': np.random.beta(1, 10, num_samples),
            'srv_serror_rate': np.random.beta(1, 10, num_samples),
            'rerror_rate': np.random.beta(1, 20, num_samples),
            'srv_rerror_rate': np.random.beta(1, 20, num_samples),
            'same_srv_rate': np.random.beta(5, 2, num_samples),
            'diff_srv_rate': np.random.beta(2, 5, num_samples),
            'srv_diff_host_rate': np.random.beta(1, 10, num_samples),
            'dst_host_count': np.random.poisson(20, num_samples),
            'dst_host_srv_count': np.random.poisson(10, num_samples),
            'dst_host_same_srv_rate': np.random.beta(5, 2, num_samples),
            'dst_host_diff_srv_rate': np.random.beta(2, 5, num_samples),
            'dst_host_same_src_port_rate': np.random.beta(1, 10, num_samples),
            'dst_host_srv_diff_host_rate': np.random.beta(1, 15, num_samples),
            'dst_host_serror_rate': np.random.beta(1, 10, num_samples),
            'dst_host_srv_serror_rate': np.random.beta(1, 10, num_samples),
            'dst_host_rerror_rate': np.random.beta(1, 20, num_samples),
            'dst_host_srv_rerror_rate': np.random.beta(1, 20, num_samples),
        }
        
        df = pd.DataFrame(data)
        
        # Create labels with some attack patterns
        labels = ['normal'] * num_samples
        
        # Inject some attack patterns
        attack_indices = np.random.choice(num_samples, int(num_samples * 0.2), replace=False)
        for idx in attack_indices:
            # Create attack patterns based on feature values
            if df.loc[idx, 'serror_rate'] > 0.5:
                labels[idx] = 'probe'
            elif df.loc[idx, 'src_bytes'] > np.percentile(df['src_bytes'], 95):
                labels[idx] = 'dos'
            elif df.loc[idx, 'num_failed_logins'] > 0:
                labels[idx] = 'r2l'
            elif df.loc[idx, 'root_shell'] == 1:
                labels[idx] = 'u2r'
            else:
                labels[idx] = 'probe'
        
        df['label'] = labels
        df['difficulty_level'] = np.random.choice([0, 1, 2, 3, 4], num_samples)
        
        logger.info(f"Synthetic dataset created. Shape: {df.shape}")
        logger.info(f"Label distribution: {df['label'].value_counts().to_dict()}")
        
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Preprocess the dataset
        
        Args:
            df: Raw DataFrame
            
        Returns:
            Tuple of (features DataFrame, labels Series)
        """
        logger.info("Preprocessing data...")
        
        # Make a copy to avoid modifying original
        df = df.copy()
        
        # Handle missing values
        df = df.fillna(0)
        
        # Convert categorical features to numerical
        categorical_features = ['protocol_type', 'service', 'flag']
        
        for feature in categorical_features:
            if feature in df.columns:
                le = LabelEncoder()
                df[feature] = le.fit_transform(df[feature].astype(str))
                self.label_encoders[feature] = le
        
        # Separate features and labels
        if 'label' in df.columns:
            labels = df['label']
            features = df.drop(['label', 'difficulty_level'], axis=1, errors='ignore')
        else:
            # If no labels, assume all are normal
            labels = pd.Series(['normal'] * len(df))
            features = df
        
        logger.info(f"Features shape: {features.shape}")
        logger.info(f"Labels distribution: {labels.value_counts().to_dict()}")
        
        return features, labels
    
    def train_model(self, features: pd.DataFrame, labels: pd.Series) -> Dict[str, Any]:
        """
        Train the intrusion detection model
        
        Args:
            features: Feature DataFrame
            labels: Label Series
            
        Returns:
            Training results dictionary
        """
        logger.info("Training model...")
        
        # Convert labels to binary (normal vs attack)
        binary_labels = labels.apply(lambda x: 0 if x == 'normal' else 1)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, binary_labels, test_size=0.2, random_state=42, stratify=binary_labels
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest model
        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            n_jobs=-1
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        confusion_mat = confusion_matrix(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='accuracy')
        
        logger.info(f"Training completed. Accuracy: {accuracy:.4f}")
        logger.info(f"Cross-validation scores: {cv_scores}")
        logger.info(f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        return {
            'model': model,
            'scaler': self.scaler,
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': confusion_mat.tolist(),
            'cv_scores': cv_scores.tolist(),
            'feature_names': features.columns.tolist(),
            'label_encoders': self.label_encoders
        }
    
    def save_model(self, training_results: Dict[str, Any], model_path: str = None):
        """
        Save the trained model and preprocessing objects
        
        Args:
            training_results: Results from training
            model_path: Path to save the model
        """
        model_path = model_path or settings.model_path
        
        try:
            # Create directory if it doesn't exist
            Path(model_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Prepare model data
            model_data = {
                'model': training_results['model'],
                'scaler': training_results['scaler'],
                'feature_names': training_results['feature_names'],
                'label_encoders': training_results['label_encoders'],
                'model_type': 'RandomForestClassifier',
                'accuracy': training_results['accuracy'],
                'training_date': pd.Timestamp.now().isoformat()
            }
            
            # Save model
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Model saved to {model_path}")
            
            # Save additional training info
            info_path = model_path.replace('.pkl', '_info.json')
            import json
            with open(info_path, 'w') as f:
                json.dump({
                    'accuracy': training_results['accuracy'],
                    'classification_report': training_results['classification_report'],
                    'confusion_matrix': training_results['confusion_matrix'],
                    'cv_scores': training_results['cv_scores'],
                    'feature_names': training_results['feature_names']
                }, f, indent=2)
            
            logger.info(f"Training info saved to {info_path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise
    
    def evaluate_model(self, model_path: str = None) -> Dict[str, Any]:
        """
        Evaluate a saved model
        
        Args:
            model_path: Path to the saved model
            
        Returns:
            Evaluation results
        """
        model_path = model_path or settings.model_path
        
        try:
            # Load model
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            model = model_data['model']
            scaler = model_data['scaler']
            
            logger.info(f"Model loaded from {model_path}")
            
            # Get model information
            info = {
                'model_type': type(model).__name__,
                'feature_names': model_data.get('feature_names', []),
                'accuracy': model_data.get('accuracy', 'Unknown'),
                'training_date': model_data.get('training_date', 'Unknown'),
                'n_estimators': getattr(model, 'n_estimators', 'Unknown'),
                'max_depth': getattr(model, 'max_depth', 'Unknown')
            }
            
            if hasattr(model, 'feature_importances_'):
                feature_importance = dict(zip(
                    model_data.get('feature_names', []),
                    model.feature_importances_
                ))
                # Get top 10 features
                top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]
                info['top_features'] = top_features
            
            return info
            
        except Exception as e:
            logger.error(f"Error evaluating model: {e}")
            return {'error': str(e)}
    
    def run_training(self, use_synthetic: bool = False, num_samples: int = 10000):
        """
        Run the complete training pipeline
        
        Args:
            use_synthetic: Whether to use synthetic data
            num_samples: Number of samples for synthetic data
        """
        try:
            # Load data
            if use_synthetic or not os.path.exists(self.data_path):
                logger.info("Using synthetic dataset")
                df = self.create_synthetic_dataset(num_samples)
            else:
                logger.info(f"Loading dataset from {self.data_path}")
                df = self.load_nsl_kdd_dataset(self.data_path)
            
            # Preprocess data
            features, labels = self.preprocess_data(df)
            
            # Train model
            training_results = self.train_model(features, labels)
            
            # Save model
            self.save_model(training_results)
            
            # Print results
            logger.info("Training completed successfully!")
            logger.info(f"Model accuracy: {training_results['accuracy']:.4f}")
            logger.info(f"Model saved to: {settings.model_path}")
            
            return training_results
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            raise


def main():
    """Main function to run training"""
    parser = argparse.ArgumentParser(description='Train SecureNet IDS Model')
    parser.add_argument('--data-path', type=str, help='Path to training dataset')
    parser.add_argument('--synthetic', action='store_true', help='Use synthetic dataset')
    parser.add_argument('--samples', type=int, default=10000, help='Number of synthetic samples')
    parser.add_argument('--evaluate', action='store_true', help='Evaluate existing model')
    
    args = parser.parse_args()
    
    trainer = ModelTrainer(args.data_path)
    
    if args.evaluate:
        # Evaluate existing model
        results = trainer.evaluate_model()
        print("\nModel Evaluation Results:")
        for key, value in results.items():
            print(f"{key}: {value}")
    else:
        # Train new model
        results = trainer.run_training(use_synthetic=args.synthetic, num_samples=args.samples)
        
        print("\nTraining Results:")
        print(f"Accuracy: {results['accuracy']:.4f}")
        print(f"Classification Report:")
        for class_name, metrics in results['classification_report'].items():
            if isinstance(metrics, dict):
                print(f"  {class_name}:")
                for metric, value in metrics.items():
                    print(f"    {metric}: {value:.4f}")


if __name__ == "__main__":
    main()
