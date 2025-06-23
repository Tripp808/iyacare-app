import os
import logging
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import xgboost as xgb
from imblearn.over_sampling import SMOTE

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MaternalRiskPredictor:
    """
    Maternal Health Risk Prediction Model using XGBoost
    This class needs to be defined for joblib to load the complete model
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

app = FastAPI(title="Maternal Health Risk Prediction API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class PredictionRequest(BaseModel):
    age: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float  # This will be in mg/dL from frontend
    body_temp: float    # This will be in Celsius from frontend
    heart_rate: float

class PredictionResponse(BaseModel):
    predicted_risk: str
    confidence: float
    probability_distribution: dict

# Global variable to store the loaded model
predictor = None

def load_model():
    """Load your new complete XGBoost model"""
    global predictor
    try:
        # Try to load the complete model first
        model_path = os.getenv("MODEL_PATH", "maternal_health_risk_model_complete.pkl")
        if not os.path.exists(model_path):
            logger.error(f"Complete model file not found at {model_path}")
            # Fallback to old model path for backward compatibility
            model_path = "maternal_risk_xgboost.pkl"
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"No model file found")
        
        predictor = joblib.load(model_path)
        logger.info(f"Model loaded successfully from {model_path}")
        
        # Check if it's the new complete model format
        if hasattr(predictor, 'predict_risk'):
            logger.info("✅ New complete model format detected!")
            logger.info(f"Features: {predictor.features}")
            logger.info(f"Risk levels: {predictor.risk_levels}")
        else:
            logger.info("⚠️  Old model format detected - will use compatibility mode")
        
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise e

def convert_frontend_to_model_format(request: PredictionRequest):
    """
    Convert frontend data format to the model's expected format
    Frontend -> Model conversions:
    - blood_sugar: mg/dL -> mmol/L (divide by 18.0)
    - body_temp: Celsius -> Fahrenheit (C * 9/5 + 32)
    """
    # Convert blood sugar from mg/dL to mmol/L
    bs_mmol = request.blood_sugar / 18.0
    
    # Convert body temperature from Celsius to Fahrenheit  
    temp_fahrenheit = (request.body_temp * 9/5) + 32
    
    model_data = {
        'Age': request.age,
        'SystolicBP': request.systolic_bp,
        'DiastolicBP': request.diastolic_bp,
        'BS': bs_mmol,  # Now in mmol/L
        'BodyTemp': temp_fahrenheit,  # Now in Fahrenheit
        'HeartRate': request.heart_rate
    }
    
    logger.info(f"Converted data: {model_data}")
    return model_data

@app.on_event("startup")
async def startup_event():
    """Load the model when the app starts"""
    load_model()

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Maternal Health Risk Prediction API v2.0", "status": "active"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "model_loaded": predictor is not None,
        "model_type": "complete" if hasattr(predictor, 'predict_risk') else "legacy"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(request: PredictionRequest):
    """Make risk prediction using your new complete XGBoost model"""
    if predictor is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        logger.info(f"Received prediction request: age={request.age} systolic_bp={request.systolic_bp} diastolic_bp={request.diastolic_bp} blood_sugar={request.blood_sugar} body_temp={request.body_temp} heart_rate={request.heart_rate}")
        
        # Convert frontend data to model format
        model_data = convert_frontend_to_model_format(request)
        
        # Check if we have the new complete model
        if hasattr(predictor, 'predict_risk'):
            # Use the new complete model's predict_risk method
            result = predictor.predict_risk(model_data)
            
            predicted_risk_text = result['risk_level']
            confidence = result['confidence']
            prob_dist = result['probabilities']
            
            logger.info(f"New model prediction: {predicted_risk_text} with {confidence:.3f} confidence")
            logger.info(f"Probabilities: {prob_dist}")
            
        else:
            # Fallback to old model format with medical normalization
            logger.warning("Using legacy model format with medical normalization")
            
            # Prepare features array (convert dict to array in correct order)
            features = np.array([[
                model_data['Age'],
                model_data['SystolicBP'], 
                model_data['DiastolicBP'],
                model_data['BS'],
                model_data['BodyTemp'],
                model_data['HeartRate']
            ]])
            
            # Use medical normalization (from previous fix)
            features_normalized = normalize_features_medical(features)
            
            # Make prediction
            prediction = predictor.predict(features_normalized)[0]
            probabilities = predictor.predict_proba(features_normalized)[0]
            
            # Map to risk levels
            risk_mapping = {0: "low risk", 1: "mid risk", 2: "high risk"}
            predicted_risk_text = risk_mapping.get(int(prediction), "unknown risk")
            confidence = float(max(probabilities))
            
            # Create probability distribution
            class_names = ["low risk", "mid risk", "high risk"]
            prob_dist = {class_names[i]: float(probabilities[i]) for i in range(len(class_names))}
        
        return PredictionResponse(
            predicted_risk=predicted_risk_text,
            confidence=confidence,
            probability_distribution=prob_dist
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def normalize_features_medical(features):
    """
    Fallback medical normalization for legacy model compatibility
    """
    ranges = {
        'age': (15, 85),
        'systolic_bp': (80, 200),
        'diastolic_bp': (50, 120),
        'blood_sugar': (3.0, 15.0),  # mmol/L range
        'body_temp': (95, 105),      # Fahrenheit range
        'heart_rate': (40, 150)
    }
    
    normalized = []
    for i, (feature_name, (min_val, max_val)) in enumerate(ranges.items()):
        value = features[0][i]
        normalized_value = 2 * (value - min_val) / (max_val - min_val) - 1
        normalized_value = max(-1, min(1, normalized_value))
        normalized.append(normalized_value)
    
    return np.array([normalized])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 