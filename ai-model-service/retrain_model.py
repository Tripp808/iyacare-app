#!/usr/bin/env python3
"""
Script to retrain and save the maternal health risk model with correct module structure
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import xgboost as xgb
from imblearn.over_sampling import SMOTE

# Import our custom class
from maternal_risk_predictor import MaternalRiskPredictor

def create_synthetic_data():
    """Create synthetic maternal health data for training"""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic data
    data = {
        'Age': np.random.normal(28, 8, n_samples).clip(15, 50),
        'SystolicBP': np.random.normal(120, 20, n_samples).clip(80, 200),
        'DiastolicBP': np.random.normal(80, 15, n_samples).clip(50, 120),
        'BS': np.random.normal(8, 3, n_samples).clip(3, 15),  # mmol/L
        'BodyTemp': np.random.normal(98.6, 2, n_samples).clip(95, 105),  # Fahrenheit
        'HeartRate': np.random.normal(75, 15, n_samples).clip(40, 150)
    }
    
    df = pd.DataFrame(data)
    
    # Create risk levels based on clinical rules
    risk_levels = []
    for _, row in df.iterrows():
        risk_score = 0
        
        # Age factors
        if row['Age'] < 18 or row['Age'] > 35:
            risk_score += 1
        
        # Blood pressure factors
        if row['SystolicBP'] >= 140 or row['DiastolicBP'] >= 90:
            risk_score += 2
        elif row['SystolicBP'] < 90 or row['DiastolicBP'] < 60:
            risk_score += 1
        
        # Blood sugar factors
        if row['BS'] >= 11:  # High glucose
            risk_score += 2
        elif row['BS'] < 4:  # Low glucose
            risk_score += 1
        
        # Temperature factors
        if row['BodyTemp'] >= 100.4 or row['BodyTemp'] < 96:
            risk_score += 1
        
        # Heart rate factors
        if row['HeartRate'] > 100 or row['HeartRate'] < 60:
            risk_score += 1
        
        # Determine risk level
        if risk_score >= 4:
            risk_levels.append('high risk')
        elif risk_score >= 2:
            risk_levels.append('mid risk')
        else:
            risk_levels.append('low risk')
    
    df['RiskLevel'] = risk_levels
    return df

def train_model():
    """Train the maternal health risk prediction model"""
    print("🔄 Creating synthetic training data...")
    df = create_synthetic_data()
    
    print(f"📊 Dataset shape: {df.shape}")
    print(f"📊 Risk level distribution:")
    print(df['RiskLevel'].value_counts())
    
    # Prepare features and target
    features = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']
    X = df[features]
    y = df['RiskLevel']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("🔄 Training model...")
    
    # Create and configure the predictor
    predictor = MaternalRiskPredictor()
    
    # Scale the features
    X_train_scaled = predictor.scaler.fit_transform(X_train)
    X_test_scaled = predictor.scaler.transform(X_test)
    
    # Encode target variables
    y_train_encoded = [predictor.target_encoding[label] for label in y_train]
    y_test_encoded = [predictor.target_encoding[label] for label in y_test]
    
    # Apply SMOTE for class balancing
    X_train_balanced, y_train_balanced = predictor.smote.fit_resample(X_train_scaled, y_train_encoded)
    
    # Train XGBoost model
    predictor.model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='mlogloss'
    )
    
    predictor.model.fit(X_train_balanced, y_train_balanced)
    predictor.is_fitted = True
    
    # Evaluate the model
    y_pred = predictor.model.predict(X_test_scaled)
    y_pred_labels = [predictor.reverse_encoding[pred] for pred in y_pred]
    
    print("📊 Model Performance:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred_labels):.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_labels))
    
    # Test the predict_risk method
    print("\n🧪 Testing predict_risk method:")
    test_patient = {
        'Age': 25,
        'SystolicBP': 110,
        'DiastolicBP': 70,
        'BS': 5,
        'BodyTemp': 98.6,
        'HeartRate': 70
    }
    
    result = predictor.predict_risk(test_patient)
    print(f"Test prediction: {result}")
    
    return predictor

def save_model(predictor):
    """Save the trained model"""
    model_path = "maternal_health_risk_model_complete.pkl"
    
    print(f"💾 Saving model to {model_path}...")
    joblib.dump(predictor, model_path)
    
    # Verify the model can be loaded
    print("🔄 Verifying model loading...")
    loaded_predictor = joblib.load(model_path)
    
    # Test the loaded model
    test_patient = {
        'Age': 30,
        'SystolicBP': 130,
        'DiastolicBP': 85,
        'BS': 6,
        'BodyTemp': 99.0,
        'HeartRate': 80
    }
    
    result = loaded_predictor.predict_risk(test_patient)
    print(f"✅ Loaded model test: {result}")
    
    print(f"✅ Model successfully saved to {model_path}")
    return model_path

if __name__ == "__main__":
    print("🚀 Starting model training...")
    
    # Train the model
    predictor = train_model()
    
    # Save the model
    model_path = save_model(predictor)
    
    print(f"🎉 Training complete! Model saved to {model_path}")
    print("📁 You can now use this model file for deployment.") 