#!/usr/bin/env python3
"""
SecureNet IDS - NSL-KDD Intrusion Detection Model
Trains a lightweight RandomForest model using realistic features
that can be extracted from real-time packet capture.
"""

import pandas as pd
import pickle
import os
import sys
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

class NSLKDDTrainer:
    """Train NSL-KDD intrusion detection model with realistic features."""
    
    def __init__(self):
        """Initialize the trainer."""
        # NSL-KDD column names (43 columns)
        self.columns = [
            'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
            'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
            'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
            'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
            'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
            'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
            'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count',
            'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
            'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate',
            'dst_host_rerror_rate', 'dst_host_srv_rerror_rate', 'label', 'difficulty'
        ]
        
        # Realistic features that can be extracted from packet capture
        self.selected_features = ['protocol_type', 'src_bytes', 'dst_bytes', 'flag', 'duration']
        
        # Initialize encoders
        self.protocol_encoder = LabelEncoder()
        self.flag_encoder = LabelEncoder()
        
        # Model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Create model directory
        os.makedirs('../model', exist_ok=True)
    
    def load_dataset(self, train_path: str, test_path: str) -> tuple:
        """
        Load NSL-KDD train and test datasets.
        
        Args:
            train_path: Path to training dataset
            test_path: Path to test dataset
            
        Returns:
            Tuple of (train_df, test_df)
        """
        logger.info("Loading NSL-KDD datasets...")
        
        try:
            # Load datasets
            train_df = pd.read_csv(train_path, header=None, names=self.columns)
            test_df = pd.read_csv(test_path, header=None, names=self.columns)
            
            logger.info(f"Training set shape: {train_df.shape}")
            logger.info(f"Test set shape: {test_df.shape}")
            
            return train_df, test_df
            
        except Exception as e:
            logger.error(f"Error loading datasets: {str(e)}")
            raise
    
    def preprocess_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert labels to binary classification (0=Normal, 1=Attack).
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with binary labels
        """
        logger.info("Preprocessing labels...")
        
        # Convert to binary: normal=0, attack=1
        df['label'] = df['label'].apply(lambda x: 0 if x == 'normal' else 1)
        
        # Show label distribution
        label_counts = df['label'].value_counts()
        logger.info(f"Label distribution: {dict(label_counts)}")
        
        return df
    
    def encode_categorical_features(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> tuple:
        """
        Encode categorical features using LabelEncoder.
        
        Args:
            train_df: Training DataFrame
            test_df: Test DataFrame
            
        Returns:
            Tuple of encoded (train_df, test_df)
        """
        logger.info("Encoding categorical features...")
        
        # Fit encoders on training data
        self.protocol_encoder.fit(train_df['protocol_type'])
        self.flag_encoder.fit(train_df['flag'])
        
        # Transform training data
        train_df['protocol_type'] = self.protocol_encoder.transform(train_df['protocol_type'])
        train_df['flag'] = self.flag_encoder.transform(train_df['flag'])
        
        # Transform test data
        test_df['protocol_type'] = self.protocol_encoder.transform(test_df['protocol_type'])
        test_df['flag'] = self.flag_encoder.transform(test_df['flag'])
        
        logger.info("Categorical features encoded successfully")
        
        return train_df, test_df
    
    def prepare_features(self, df: pd.DataFrame) -> tuple:
        """
        Prepare features and target variables.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (X, y)
        """
        # Select only the realistic features
        X = df[self.selected_features].copy()
        y = df['label'].copy()
        
        return X, y
    
    def train_model(self, X_train, y_train):
        """
        Train the RandomForest model.
        
        Args:
            X_train: Training features
            y_train: Training labels
        """
        logger.info("Training RandomForest model...")
        
        self.model.fit(X_train, y_train)
        
        logger.info("Model training completed")
    
    def evaluate_model(self, X_test, y_test):
        """
        Evaluate the trained model.
        
        Args:
            X_test: Test features
            y_test: Test labels
            
        Returns:
            Accuracy score
        """
        logger.info("Evaluating model...")
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        
        # Calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Model Accuracy: {accuracy:.4f}")
        
        # Print detailed classification report
        logger.info("\nClassification Report:")
        logger.info("\n" + classification_report(y_test, y_pred, target_names=['Normal', 'Attack']))
        
        return accuracy
    
    def save_model(self):
        """Save the trained model and encoders."""
        logger.info("Saving model and encoders...")
        
        # Save model
        model_path = '../model/model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        # Save encoders
        protocol_encoder_path = '../model/protocol_encoder.pkl'
        with open(protocol_encoder_path, 'wb') as f:
            pickle.dump(self.protocol_encoder, f)
        
        flag_encoder_path = '../model/flag_encoder.pkl'
        with open(flag_encoder_path, 'wb') as f:
            pickle.dump(self.flag_encoder, f)
        
        # Save feature list for consistency
        features_path = '../model/features.pkl'
        with open(features_path, 'wb') as f:
            pickle.dump(self.selected_features, f)
        
        logger.info(f"Model saved to: {model_path}")
        logger.info(f"Protocol encoder saved to: {protocol_encoder_path}")
        logger.info(f"Flag encoder saved to: {flag_encoder_path}")
        logger.info(f"Features saved to: {features_path}")
    
    def train(self, train_path: str, test_path: str):
        """
        Complete training pipeline.
        
        Args:
            train_path: Path to training dataset
            test_path: Path to test dataset
        """
        logger.info("🚀 Starting NSL-KDD Model Training Pipeline")
        logger.info("=" * 50)
        
        # Step 1: Load datasets
        train_df, test_df = self.load_dataset(train_path, test_path)
        
        # Step 2: Preprocess labels
        train_df = self.preprocess_labels(train_df)
        test_df = self.preprocess_labels(test_df)
        
        # Step 3: Encode categorical features
        train_df, test_df = self.encode_categorical_features(train_df, test_df)
        
        # Step 4: Prepare features
        X_train, y_train = self.prepare_features(train_df)
        X_test, y_test = self.prepare_features(test_df)
        
        logger.info(f"Training features shape: {X_train.shape}")
        logger.info(f"Test features shape: {X_test.shape}")
        logger.info(f"Selected features: {self.selected_features}")
        
        # Step 5: Train model
        self.train_model(X_train, y_train)
        
        # Step 6: Evaluate model
        accuracy = self.evaluate_model(X_test, y_test)
        
        # Step 7: Save model
        self.save_model()
        
        logger.info("=" * 50)
        logger.info(f"✅ Training completed successfully!")
        logger.info(f"📊 Final Accuracy: {accuracy:.4f}")
        logger.info(f"💾 Model saved and ready for real-time detection")

def main():
    """Main function to train the NSL-KDD model."""
    
    # Dataset paths
    train_path = "../data/nsl-kdd/KDDTrain+.txt"
    test_path = "../data/nsl-kdd/KDDTest+.txt"
    
    # Check if datasets exist
    if not os.path.exists(train_path):
        logger.error(f"Training dataset not found: {train_path}")
        return 1
    
    if not os.path.exists(test_path):
        logger.error(f"Test dataset not found: {test_path}")
        return 1
    
    # Initialize trainer
    trainer = NSLKDDTrainer()
    
    # Train model
    try:
        trainer.train(train_path, test_path)
        return 0
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
