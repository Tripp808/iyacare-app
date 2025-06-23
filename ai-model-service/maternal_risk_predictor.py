import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import xgboost as xgb

class MaternalRiskPredictor:
    """
    Maternal Health Risk Prediction Model using XGBoost
    This class needs to be in a separate module for proper pickle loading
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.smote = SMOTE(random_state=42)
        self.features = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']
        self.feature_descriptions = {
            'Age': 'Maternal Age (years)',
            'SystolicBP': 'Systolic Blood Pressure (mmHg)',
            'DiastolicBP': 'Diastolic Blood Pressure (mmHg)',
            'BS': 'Blood Glucose Level (mmol/L)',
            'BodyTemp': 'Body Temperature (°F)',
            'HeartRate': 'Resting Heart Rate (bpm)'
        }
        self.risk_levels = ['low risk', 'mid risk', 'high risk']
        self.target_encoding = {'low risk': 0, 'mid risk': 1, 'high risk': 2}
        self.reverse_encoding = {0: 'low risk', 1: 'mid risk', 2: 'high risk'}
        self.training_history = {}
        self.is_fitted = False
    
    def predict_risk(self, patient_data):
        """
        Predict maternal health risk for a single patient
        """
        if not self.is_fitted:
            raise ValueError("Model has not been fitted yet. Please train the model first.")
        
        # Convert to DataFrame if it's a dictionary
        if isinstance(patient_data, dict):
            df = pd.DataFrame([patient_data])
        else:
            df = patient_data.copy()
        
        # Ensure all required features are present
        missing_features = set(self.features) - set(df.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        # Select and reorder features
        X = df[self.features]
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        # Get risk level
        risk_level = self.reverse_encoding[prediction]
        
        # Get confidence (max probability)
        confidence = float(max(probabilities))
        
        # Create probability distribution
        prob_dist = {
            self.risk_levels[i]: float(probabilities[i]) 
            for i in range(len(self.risk_levels))
        }
        
        return {
            'risk_level': risk_level,
            'confidence': confidence,
            'probabilities': prob_dist
        }
    
    def predict(self, X):
        """Predict method for compatibility"""
        if not self.is_fitted:
            raise ValueError("Model has not been fitted yet.")
        
        if isinstance(X, pd.DataFrame):
            X_scaled = self.scaler.transform(X[self.features])
        else:
            X_scaled = self.scaler.transform(X)
        
        predictions = self.model.predict(X_scaled)
        return [self.reverse_encoding[pred] for pred in predictions]
    
    def predict_proba(self, X):
        """Predict probabilities method for compatibility"""
        if not self.is_fitted:
            raise ValueError("Model has not been fitted yet.")
        
        if isinstance(X, pd.DataFrame):
            X_scaled = self.scaler.transform(X[self.features])
        else:
            X_scaled = self.scaler.transform(X)
        
        return self.model.predict_proba(X_scaled) 