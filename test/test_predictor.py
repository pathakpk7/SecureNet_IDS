#!/usr/bin/env python3
"""
Simple test for the predictor functionality
"""

import sys
import os
import pickle
import numpy as np
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent / "backend"))
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

def create_simple_predictor():
    """Create a simple predictor function as requested"""
    
    # Check if model exists
    model_path = Path("../model/model.pkl")
    if not model_path.exists():
        print("❌ Model file not found at:", model_path)
        print("Please train the model first:")
        print("python train/train_model.py --synthetic --samples 1000")
        return None
    
    try:
        # Load model
        print("📂 Loading model from:", model_path)
        with open(model_path, "rb") as f:
            model_data = pickle.load(f)
        
        # Handle different model formats
        if isinstance(model_data, dict):
            model = model_data.get('model')
            scaler = model_data.get('scaler')
        else:
            model = model_data
            scaler = None
        
        if model is None:
            print("❌ No model found in the loaded file")
            return None
        
        print("✅ Model loaded successfully!")
        print(f"📊 Model type: {type(model).__name__}")
        
        def predict(features):
            """
            Simple prediction function
            
            Args:
                features: List of features (must match training features)
                
            Returns:
                Prediction (0 for normal, 1 for attack)
            """
            try:
                # Convert to numpy array and reshape
                features_array = np.array(features).reshape(1, -1)
                
                # Apply scaling if scaler is available
                if scaler:
                    features_array = scaler.transform(features_array)
                
                # Make prediction
                prediction = model.predict(features_array)[0]
                
                return int(prediction)
                
            except Exception as e:
                print(f"❌ Prediction error: {e}")
                return 0
        
        return predict, model, scaler
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None


def test_predictor():
    """Test the predictor with dummy features"""
    
    print("🧪 Testing SecureNet IDS Predictor")
    print("=" * 50)
    
    # Create predictor
    result = create_simple_predictor()
    if result is None:
        return
    
    predict_func, model, scaler = result
    
    # Test with different feature sets
    test_cases = [
        {
            "name": "Normal Traffic",
            "features": [0.0, 1, 7, 3, 100, 200, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1, 1, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        },
        {
            "name": "Suspicious Traffic",
            "features": [10.5, 1, 7, 1, 5000, 0, 0, 0, 0, 5, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 50, 25, 0.8, 0.7, 0.1, 0.1, 0.3, 0.7, 0.2, 100, 50, 0.5, 0.5, 0.8, 0.2, 0.6, 0.4, 0.3]
        },
        {
            "name": "Your Simple Test",
            "features": [1, 100, 200, 0, 10] + [0] * 38  # Pad with zeros to match 41 features
        }
    ]
    
    print("\n🔍 Running Predictions:")
    print("-" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        try:
            features = test_case["features"]
            name = test_case["name"]
            
            print(f"\n📋 Test {i}: {name}")
            print(f"📊 Features length: {len(features)}")
            print(f"📊 Features: {features[:10]}...")  # Show first 10 features
            
            # Make prediction
            prediction = predict_func(features)
            
            # Interpret result
            result_text = "🚨 ATTACK" if prediction == 1 else "✅ NORMAL"
            confidence = "N/A"
            
            # Try to get confidence if available
            if hasattr(model, 'predict_proba'):
                try:
                    features_array = np.array(features).reshape(1, -1)
                    if scaler:
                        features_array = scaler.transform(features_array)
                    probabilities = model.predict_proba(features_array)[0]
                    confidence = f"{max(probabilities):.2f}"
                except:
                    pass
            
            print(f"🎯 Prediction: {prediction} ({result_text})")
            print(f"📈 Confidence: {confidence}")
            
        except Exception as e:
            print(f"❌ Test {i} failed: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Testing Complete!")


def main():
    """Main test function"""
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("❌ Please run this test from the SecureNet IDS root directory")
        print("📁 Current directory should contain the 'backend' folder")
        return
    
    test_predictor()


if __name__ == "__main__":
    main()
