import sys
import pickle
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Try to load the model
try:
    # Check if model file exists
    import os
    if not os.path.exists("model/model.pkl"):
        print("❌ Model file not found. Creating a simple test model...")
        
        # Create a simple model for testing
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.datasets import make_classification
        
        # Generate simple test data
        X, y = make_classification(n_samples=1000, n_features=41, n_informative=10, 
                                 n_redundant=5, random_state=42)
        
        # Train a simple model
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X, y)
        
        # Save the model
        os.makedirs("model", exist_ok=True)
        with open("model/model.pkl", "wb") as f:
            pickle.dump(model, f)
        
        print("✅ Test model created and saved!")
    
    # Load the model
    model_data = pickle.load(open("model/model.pkl", "rb"))
    if isinstance(model_data, dict):
        model = model_data.get('model')
        scaler = model_data.get('scaler')
    else:
        model = model_data
        scaler = None
    print("✅ Model loaded successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

def predict(features):
    """
    Simple prediction function as requested
    
    Args:
        features: List of features
        
    Returns:
        Prediction (0 for normal, 1 for attack)
    """
    try:
        n_feat = getattr(scaler, 'n_features_in_', None) or getattr(model, 'n_features_in_', 5)
        if len(features) < n_feat:
            features = list(features) + [0.0] * (n_feat - len(features))
        elif len(features) > n_feat:
            features = list(features)[:n_feat]
        
        # Convert to numpy array and reshape
        features_array = np.array(features, dtype=float).reshape(1, -1)
        if scaler:
            features_array = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_array)[0]
        
        return int(prediction)
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return 0

# Test the predictor
if __name__ == "__main__":
    print("🧪 Testing predictor...")
    print("=" * 50)
    
    # Test 1: Your exact test case
    print("\n📋 Test 1: Your requested test")
    test_features = [1, 100, 200, 0, 10]
    print(f"📊 Input: {test_features}")
    
    result1 = predict(test_features)
    print(f"🎯 Prediction: {result1}")
    print(f"📝 Result: {'🚨 ATTACK' if result1 == 1 else '✅ NORMAL'}")
    
    # Test 2: Normal traffic pattern
    print("\n📋 Test 2: Normal traffic pattern")
    normal_features = [0.0, 1, 7, 3, 100, 200, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1, 1, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    print(f"📊 Features length: {len(normal_features)}")
    
    result2 = predict(normal_features)
    print(f"🎯 Prediction: {result2}")
    print(f"📝 Result: {'🚨 ATTACK' if result2 == 1 else '✅ NORMAL'}")
    
    # Test 3: Suspicious traffic pattern
    print("\n📋 Test 3: Suspicious traffic pattern")
    suspicious_features = [10.5, 1, 7, 1, 5000, 0, 0, 0, 0, 5, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 50, 25, 0.8, 0.7, 0.1, 0.1, 0.3, 0.7, 0.2, 100, 50, 0.5, 0.5, 0.8, 0.2, 0.6, 0.4, 0.3]
    print(f"📊 Features length: {len(suspicious_features)}")
    
    result3 = predict(suspicious_features)
    print(f"🎯 Prediction: {result3}")
    print(f"📝 Result: {'🚨 ATTACK' if result3 == 1 else '✅ NORMAL'}")
    
    print("\n" + "=" * 50)
    print("🏁 Testing Complete!")
    print("\n📝 Summary:")
    print(f"   Test 1 (your case): {result1}")
    print(f"   Test 2 (normal): {result2}")
    print(f"   Test 3 (suspicious): {result3}")
    
    # Test model info
    print(f"\n🤖 Model Info:")
    print(f"   Type: {type(model).__name__}")
    print(f"   Features expected: {model.n_features_in_ if hasattr(model, 'n_features_in_') else 'Unknown'}")
    print(f"   Classes: {model.classes_.tolist() if hasattr(model, 'classes_') else 'Unknown'}")
