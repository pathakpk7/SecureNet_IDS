import sys
import pickle
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Load the model
try:
    model_data = pickle.load(open("model/model.pkl", "rb"))
    if isinstance(model_data, dict):
        model = model_data.get('model')
        scaler = model_data.get('scaler')
    else:
        model = model_data
        scaler = None
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print("❌ Model file not found. Please train the model first:")
    print("python train_model.py --synthetic --samples 1000")
    exit(1)
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

def predict(features):
    """
    Simple prediction function
    
    Args:
        features: List of features (must match training features)
        
    Returns:
        Prediction (0 for normal, 1 for attack)
    """
    try:
        n_feat = getattr(scaler, 'n_features_in_', None) or getattr(model, 'n_features_in_', 5)
        if len(features) < n_feat:
            features = list(features) + [0.0] * (n_feat - len(features))
        elif len(features) > n_feat:
            features = list(features)[:n_feat]
        
        # Convert to numpy array and reshape for prediction
        features_array = np.array(features, dtype=float).reshape(1, -1)
        if scaler:
            features_array = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_array)[0]
        
        return int(prediction)
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return 0

if __name__ == "__main__":
    # Test with dummy features (must match training features)
    print("🧪 Testing predictor...")
    
    # Your test case - simple features
    features = [1, 100, 200, 0, 10]
    
    print(f"📊 Input features: {features}")
    print(f"📊 Features length: {len(features)}")
    
    result = predict(features)
    
    if result == 1:
        print(f"🚨 Prediction: {result} (ATTACK DETECTED)")
    else:
        print(f"✅ Prediction: {result} (NORMAL TRAFFIC)")
    
    # Test with full feature set
    print("\n🔍 Testing with full feature set...")
    full_features = [0.0, 1, 7, 3, 100, 200, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1, 1, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    
    print(f"📊 Full features length: {len(full_features)}")
    result2 = predict(full_features)
    
    if result2 == 1:
        print(f"🚨 Full features prediction: {result2} (ATTACK DETECTED)")
    else:
        print(f"✅ Full features prediction: {result2} (NORMAL TRAFFIC)")
