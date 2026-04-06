#!/usr/bin/env python3
"""
SecureNet IDS - CICIDS2017 Advanced Intrusion Detection Model
Trains a RandomForest model using real-world network traffic data.
Optimized for real-time intrusion detection with minimal features.
"""

import pandas as pd
import pickle
import os
import sys
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import logging
import seaborn as sns
import matplotlib.pyplot as plt

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CICIDSTrainer:
    """Train CICIDS2017 intrusion detection model with optimized features."""
    
    def __init__(self):
        """Initialize the trainer."""
        # CICIDS2017 relevant features for real-time detection
        self.selected_features = [
            'Flow Duration',
            'Total Fwd Packets', 
            'Total Backward Packets',
            'Fwd Packets Length Total',
            'Bwd Packets Length Total'
        ]
        
        # Model and preprocessing
        self.model = RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42)
        self.scaler = StandardScaler()
        
        # Create model directory
        os.makedirs('../model', exist_ok=True)
        
        # Initialize results storage
        self.results = {}
    
    def load_dataset(self, dataset_path: str) -> pd.DataFrame:
        """
        Load CICIDS2017 dataset efficiently.
        
        Args:
            dataset_path: Path to the combined CSV dataset
            
        Returns:
            Loaded DataFrame
        """
        logger.info("Loading CICIDS2017 dataset...")
        
        try:
            # Load dataset with optimized memory usage
            df = pd.read_csv(dataset_path, low_memory=False)
            
            logger.info(f"Dataset loaded successfully!")
            logger.info(f"Shape: {df.shape}")
            logger.info(f"Columns: {list(df.columns)}")
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            raise
    
    def create_binary_labels(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert multi-class labels to binary classification.
        
        Args:
            df: Input DataFrame with 'Label' column
            
        Returns:
            DataFrame with binary 'label' column
        """
        logger.info("Creating binary labels...")
        
        if 'Label' not in df.columns:
            logger.error("'Label' column not found in dataset!")
            raise ValueError("Label column missing")
        
        # Convert to binary: Benign=0, all attacks=1
        df['label'] = df['Label'].apply(lambda x: 0 if x == 'Benign' else 1)
        
        # Show label distribution
        label_counts = df['label'].value_counts()
        total_samples = len(df)
        
        logger.info("Binary label distribution:")
        for label, count in label_counts.items():
            label_name = 'Normal' if label == 0 else 'Attack'
            percentage = (count / total_samples) * 100
            logger.info(f"  {label_name} (label={label}): {count:,} samples ({percentage:.2f}%)")
        
        return df
    
    def validate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Validate and handle missing features.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with validated features
        """
        logger.info("Validating selected features...")
        
        # Check if all selected features exist
        missing_features = [feat for feat in self.selected_features if feat not in df.columns]
        
        if missing_features:
            logger.error(f"Missing features: {missing_features}")
            logger.info("Available features:")
            for i, col in enumerate(df.columns):
                logger.info(f"  {i+1:2d}. {col}")
            raise ValueError(f"Missing required features: {missing_features}")
        
        # Select features and label
        df_subset = df[self.selected_features + ['label']].copy()
        
        # Check for missing values
        missing_values = df_subset.isnull().sum()
        if missing_values.any():
            logger.warning("Missing values found:")
            for feat, count in missing_values.items():
                if count > 0:
                    logger.warning(f"  {feat}: {count} missing values")
            
            # Fill missing values with median for numeric features
            for feat in self.selected_features:
                if df_subset[feat].isnull().any():
                    median_val = df_subset[feat].median()
                    df_subset[feat].fillna(median_val, inplace=True)
                    logger.info(f"Filled missing values in {feat} with median: {median_val}")
        
        # Ensure all features are numeric
        for feat in self.selected_features:
            if not pd.api.types.is_numeric_dtype(df_subset[feat]):
                logger.warning(f"Converting {feat} to numeric...")
                df_subset[feat] = pd.to_numeric(df_subset[feat], errors='coerce')
                df_subset[feat].fillna(0, inplace=True)
        
        logger.info("Feature validation completed successfully")
        
        return df_subset
    
    def preprocess_data(self, df: pd.DataFrame) -> tuple:
        """
        Preprocess data for training.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (X, y) preprocessed features and labels
        """
        logger.info("Preprocessing data...")
        
        # Extract features and labels
        X = df[self.selected_features].copy()
        y = df['label'].copy()
        
        # Scale features for better performance
        logger.info("Scaling features...")
        X_scaled = self.scaler.fit_transform(X)
        X_scaled = pd.DataFrame(X_scaled, columns=self.selected_features)
        
        logger.info(f"Preprocessed features shape: {X_scaled.shape}")
        logger.info(f"Features: {list(X_scaled.columns)}")
        
        return X_scaled, y
    
    def split_data(self, X, y) -> tuple:
        """
        Split data into training and testing sets.
        
        Args:
            X: Features
            y: Labels
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        logger.info("Splitting data into train/test sets...")
        
        # Split with stratification to maintain class balance
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        logger.info(f"Training set: {X_train.shape[0]:,} samples")
        logger.info(f"Test set: {X_test.shape[0]:,} samples")
        
        # Show class distribution in splits
        train_dist = y_train.value_counts()
        test_dist = y_test.value_counts()
        
        logger.info("Training set distribution:")
        for label, count in train_dist.items():
            label_name = 'Normal' if label == 0 else 'Attack'
            logger.info(f"  {label_name}: {count:,} samples")
        
        logger.info("Test set distribution:")
        for label, count in test_dist.items():
            label_name = 'Normal' if label == 0 else 'Attack'
            logger.info(f"  {label_name}: {count:,} samples")
        
        return X_train, X_test, y_train, y_test
    
    def train_model(self, X_train, y_train):
        """
        Train the RandomForest model.
        
        Args:
            X_train: Training features
            y_train: Training labels
        """
        logger.info("Training RandomForest model...")
        logger.info(f"Model parameters: n_estimators=100, n_jobs=-1")
        
        # Train model
        self.model.fit(X_train, y_train)
        
        logger.info("Model training completed successfully!")
        
        # Feature importance
        feature_importance = self.model.feature_importances_
        logger.info("Feature importance:")
        for feat, importance in zip(self.selected_features, feature_importance):
            logger.info(f"  {feat}: {importance:.4f}")
    
    def evaluate_model(self, X_test, y_test):
        """
        Evaluate the trained model.
        
        Args:
            X_test: Test features
            y_test: Test labels
            
        Returns:
            Dictionary with evaluation metrics
        """
        logger.info("Evaluating model performance...")
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        
        # Store results
        self.results = {
            'accuracy': accuracy,
            'confusion_matrix': cm,
            'classification_report': classification_report(y_test, y_pred, target_names=['Normal', 'Attack']),
            'y_true': y_test,
            'y_pred': y_pred,
            'y_pred_proba': y_pred_proba
        }
        
        # Print results
        logger.info(f"📊 Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        
        logger.info("\n🔍 Confusion Matrix:")
        logger.info(f"True Normal:  {cm[0,0]:6d} | False Attack: {cm[0,1]:6d}")
        logger.info(f"False Normal: {cm[1,0]:6d} | True Attack:  {cm[1,1]:6d}")
        
        logger.info("\n📋 Detailed Classification Report:")
        logger.info("\n" + self.results['classification_report'])
        
        # Calculate additional metrics
        tn, fp, fn, tp = cm.ravel()
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        logger.info(f"\n🎯 Key Metrics:")
        logger.info(f"  Precision: {precision:.4f} ({precision*100:.2f}%)")
        logger.info(f"  Recall:    {recall:.4f} ({recall*100:.2f}%)")
        logger.info(f"  F1-Score:  {f1_score:.4f} ({f1_score*100:.2f}%)")
        
        return self.results
    
    def save_model(self):
        """Save the trained model and preprocessing objects."""
        logger.info("Saving model and preprocessing objects...")
        
        # Save model
        model_path = '../model/cicids_model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        # Save scaler
        scaler_path = '../model/cicids_scaler.pkl'
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        # Save feature list
        features_path = '../model/cicids_features.pkl'
        with open(features_path, 'wb') as f:
            pickle.dump(self.selected_features, f)
        
        logger.info(f"✅ Model saved to: {model_path}")
        logger.info(f"✅ Scaler saved to: {scaler_path}")
        logger.info(f"✅ Features saved to: {features_path}")
    
    def train(self, dataset_path: str):
        """
        Complete training pipeline for CICIDS2017 model.
        
        Args:
            dataset_path: Path to the combined CICIDS dataset
        """
        logger.info("🚀 Starting CICIDS2017 Advanced Intrusion Detection Model Training")
        logger.info("=" * 80)
        
        # Step 1: Load dataset
        df = self.load_dataset(dataset_path)
        
        # Step 2: Create binary labels
        df = self.create_binary_labels(df)
        
        # Step 3: Validate and select features
        df = self.validate_features(df)
        
        # Step 4: Preprocess data
        X, y = self.preprocess_data(df)
        
        # Step 5: Split data
        X_train, X_test, y_train, y_test = self.split_data(X, y)
        
        # Step 6: Train model
        self.train_model(X_train, y_train)
        
        # Step 7: Evaluate model
        results = self.evaluate_model(X_test, y_test)
        
        # Step 8: Save model
        self.save_model()
        
        logger.info("=" * 80)
        logger.info("🎉 CICIDS2017 Model Training Completed Successfully!")
        logger.info(f"📊 Final Accuracy: {results['accuracy']:.4f} ({results['accuracy']*100:.2f}%)")
        logger.info("💾 Model saved and ready for real-time intrusion detection!")
        
        return results

def main():
    """Main function to train the CICIDS2017 model."""
    
    # Dataset path
    dataset_path = "../data/cicids/combined.csv"
    
    # Check if dataset exists
    if not os.path.exists(dataset_path):
        logger.error(f"❌ Dataset not found: {dataset_path}")
        logger.info("Please ensure the CICIDS dataset is available at the specified path.")
        return 1
    
    # Initialize trainer
    trainer = CICIDSTrainer()
    
    # Train model
    try:
        results = trainer.train(dataset_path)
        return 0
    except Exception as e:
        logger.error(f"❌ Training failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(main())
