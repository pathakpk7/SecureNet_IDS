import pickle
import numpy as np

# Load the model
try:
    model = pickle.load(open("model/model.pkl", "rb"))
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
        # Ensure features have the correct length (41 features for NSL-KDD)
        if len(features) != 41:
            print(f"⚠️  Warning: Expected 41 features, got {len(features)}")
            # Pad or truncate as needed
            if len(features) < 41:
                features = features + [0] * (41 - len(features))
            else:
                features = features[:41]
        
        # Convert to numpy array and reshape for prediction
        features_array = np.array(features).reshape(1, -1)
        
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
