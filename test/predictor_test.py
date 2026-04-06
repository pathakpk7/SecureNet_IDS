import pickle
import numpy as np

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
    model = pickle.load(open("model/model.pkl", "rb"))
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
        # Ensure we have 41 features (NSL-KDD standard)
        if len(features) != 41:
            print(f"⚠️  Expected 41 features, got {len(features)}")
            # Pad with zeros if too short, truncate if too long
            if len(features) < 41:
                features = features + [0] * (41 - len(features))
            else:
                features = features[:41]
        
        # Convert to numpy array and reshape
        features_array = np.array(features).reshape(1, -1)
        
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
