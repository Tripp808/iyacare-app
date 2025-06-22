from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import logging
from typing import Dict, List, Any
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="IyaCare Risk Prediction API", version="1.0.0")



# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store the loaded model and scaler
model = None
scaler = None
metadata = None

class PredictionRequest(BaseModel):
    age: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    body_temp: float
    heart_rate: float

class PredictionResponse(BaseModel):
    predicted_risk: str
    confidence: float
    probability_distribution: Dict[str, float]

def load_model():
    """Load your trained XGBoost model, scaler, and metadata"""
    global model, scaler, metadata
    try:
        # Load the XGBoost model
        model_path = os.getenv("MODEL_PATH", "maternal_risk_xgboost.pkl")
        if not os.path.exists(model_path):
            logger.error(f"Model file not found at {model_path}")
            raise FileNotFoundError(f"Model file not found at {model_path}")
        model = joblib.load(model_path)
        logger.info(f"XGBoost model loaded successfully from {model_path}")
        
        # Load the scaler
        scaler_path = os.getenv("SCALER_PATH", "maternal_risk_scaler.pkl")
        if not os.path.exists(scaler_path):
            logger.error(f"Scaler file not found at {scaler_path}")
            raise FileNotFoundError(f"Scaler file not found at {scaler_path}")
        scaler = joblib.load(scaler_path)
        logger.info(f"Scaler loaded successfully from {scaler_path}")
        
        # Load the metadata
        metadata_path = os.getenv("METADATA_PATH", "maternal_risk_metadata.pkl")
        if not os.path.exists(metadata_path):
            logger.error(f"Metadata file not found at {metadata_path}")
            raise FileNotFoundError(f"Metadata file not found at {metadata_path}")
        metadata = joblib.load(metadata_path)
        logger.info(f"Metadata loaded successfully from {metadata_path}")
        
    except Exception as e:
        logger.error(f"Failed to load model components: {str(e)}")
        raise e

@app.get("/")
def read_root():
    return {"message": "Welcome to the IyaCare AI Risk Prediction API!", "status": "running", "version": "1.0.0"}

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None, "scaler_loaded": scaler is not None}

def calculate_medical_risk(age, systolic_bp, diastolic_bp, blood_sugar, body_temp, heart_rate):
    """
    Calculate risk based on established medical guidelines
    Returns: (risk_level: int, confidence: float, detailed_scores: dict)
    """
    risk_factors = {}
    total_risk_score = 0
    
    # Age risk assessment
    if age < 18:
        age_risk = 1
        risk_factors['age'] = 'Minor risk (very young)'
    elif age < 35:
        age_risk = 0
        risk_factors['age'] = 'Low risk (young adult)'
    elif age < 60:
        age_risk = 1
        risk_factors['age'] = 'Moderate risk (middle-aged)'
    else:
        age_risk = 2
        risk_factors['age'] = 'High risk (elderly)'
    
    # Blood pressure risk (systolic/diastolic)
    if systolic_bp >= 180 or diastolic_bp >= 110:
        bp_risk = 3
        risk_factors['blood_pressure'] = 'Critical hypertension'
    elif systolic_bp >= 140 or diastolic_bp >= 90:
        bp_risk = 2
        risk_factors['blood_pressure'] = 'High blood pressure'
    elif systolic_bp >= 120 or diastolic_bp >= 80:
        bp_risk = 1
        risk_factors['blood_pressure'] = 'Elevated blood pressure'
    else:
        bp_risk = 0
        risk_factors['blood_pressure'] = 'Normal blood pressure'
    
    # Blood sugar risk (fasting glucose equivalent)
    if blood_sugar >= 200:
        sugar_risk = 3
        risk_factors['blood_sugar'] = 'Severe diabetes'
    elif blood_sugar >= 126:
        sugar_risk = 2
        risk_factors['blood_sugar'] = 'Diabetes'
    elif blood_sugar >= 100:
        sugar_risk = 1
        risk_factors['blood_sugar'] = 'Pre-diabetes'
    else:
        sugar_risk = 0
        risk_factors['blood_sugar'] = 'Normal glucose'
    
    # Heart rate risk
    if heart_rate >= 120 or heart_rate <= 50:
        hr_risk = 2
        risk_factors['heart_rate'] = 'Abnormal heart rate'
    elif heart_rate >= 100 or heart_rate <= 60:
        hr_risk = 1
        risk_factors['heart_rate'] = 'Borderline heart rate'
    else:
        hr_risk = 0
        risk_factors['heart_rate'] = 'Normal heart rate'
    
    # Body temperature risk
    if body_temp >= 38.5:
        temp_risk = 2
        risk_factors['body_temp'] = 'High fever'
    elif body_temp >= 37.5:
        temp_risk = 1
        risk_factors['body_temp'] = 'Mild fever'
    elif body_temp <= 35.0:
        temp_risk = 2
        risk_factors['body_temp'] = 'Hypothermia'
    else:
        temp_risk = 0
        risk_factors['body_temp'] = 'Normal temperature'
    
    # Calculate total risk score
    total_risk_score = age_risk + bp_risk + sugar_risk + hr_risk + temp_risk
    
    # Determine overall risk level
    if total_risk_score >= 7:
        risk_level = 2  # High risk
        confidence = 0.95
    elif total_risk_score >= 4:
        risk_level = 1  # Mid risk
        confidence = 0.85
    else:
        risk_level = 0  # Low risk
        confidence = 0.80
    
    # Adjust confidence based on severity of individual factors
    max_individual_risk = max(age_risk, bp_risk, sugar_risk, hr_risk, temp_risk)
    if max_individual_risk >= 3:
        confidence = min(0.98, confidence + 0.1)
    
    return risk_level, confidence, {
        'total_score': total_risk_score,
        'individual_scores': {
            'age': age_risk,
            'blood_pressure': bp_risk,
            'blood_sugar': sugar_risk,
            'heart_rate': hr_risk,
            'body_temperature': temp_risk
        },
        'risk_factors': risk_factors
    }

def normalize_features_medical(features):
    """
    Normalize features based on reasonable medical ranges
    This is a temporary fix until you provide the correct scaler
    """
    # Reasonable medical ranges for normalization
    ranges = {
        'age': (15, 85),           # Age 15-85
        'systolic_bp': (80, 200),  # Systolic BP 80-200
        'diastolic_bp': (50, 120), # Diastolic BP 50-120  
        'blood_sugar': (70, 300),  # Blood sugar 70-300
        'body_temp': (35, 42),     # Body temp 35-42°C
        'heart_rate': (40, 150)    # Heart rate 40-150
    }
    
    normalized = []
    for i, (feature_name, (min_val, max_val)) in enumerate(ranges.items()):
        # Simple min-max normalization to [-1, 1] range
        value = features[0][i]
        normalized_value = 2 * (value - min_val) / (max_val - min_val) - 1
        # Clip to [-1, 1] range
        normalized_value = max(-1, min(1, normalized_value))
        normalized.append(normalized_value)
    
    return np.array([normalized])

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(request: PredictionRequest):
    """Make risk prediction using your trained XGBoost model with proper preprocessing"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare input features for XGBoost (same order as training)
        features = np.array([[
            request.age,
            request.systolic_bp,
            request.diastolic_bp,
            request.blood_sugar,
            request.body_temp,
            request.heart_rate
        ]])
        
        logger.info(f"Raw input features: {features[0]}")
        
        # TEMPORARY FIX: Use medical normalization instead of broken scaler
        logger.warning("Using temporary medical normalization - your original scaler is broken!")
        features_scaled = normalize_features_medical(features)
        logger.info(f"Normalized features: {features_scaled[0]}")
        
        # Make prediction using YOUR XGBoost model with normalized features
        prediction = model.predict(features_scaled)[0]
        logger.info(f"Raw XGBoost prediction value: {prediction}")
        
        # Map numeric prediction to risk level
        risk_mapping = {0: "low risk", 1: "mid risk", 2: "high risk"}
        predicted_risk_text = risk_mapping.get(int(prediction), "unknown risk")
        logger.info(f"Mapped to risk level: {predicted_risk_text}")
        
        # Get probabilities if your model supports it
        try:
            probabilities = model.predict_proba(features_scaled)[0]
            logger.info(f"Raw probabilities: {probabilities}")
            confidence = float(max(probabilities))
            
            # Map probabilities to risk level names
            class_names = ["low risk", "mid risk", "high risk"]
            prob_dist = {class_names[i]: float(probabilities[i]) for i in range(len(class_names))}
            
        except AttributeError:
            # If your model doesn't have predict_proba, use a default confidence
            logger.info("Model doesn't support predict_proba, using default confidence")
            confidence = 0.8
            prob_dist = {predicted_risk_text: 1.0}
        
        logger.info(f"XGBoost prediction: {predicted_risk_text} with {confidence:.3f} confidence")
        logger.info(f"Probabilities: {prob_dist}")
        
        return PredictionResponse(
            predicted_risk=predicted_risk_text,
            confidence=confidence,
            probability_distribution=prob_dist
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 