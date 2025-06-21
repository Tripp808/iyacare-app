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

# Global variable to store the loaded model
model = None

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
    """Load your trained XGBoost model"""
    global model
    try:
        # Using your actual model filename
        model_path = os.getenv("MODEL_PATH", "maternal_risk_xgboost.pkl")
        
        if not os.path.exists(model_path):
            logger.error(f"Model file not found at {model_path}")
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        model = joblib.load(model_path)
        logger.info(f"XGBoost model loaded successfully from {model_path}")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise e

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(request: PredictionRequest):
    """Make risk prediction using your trained XGBoost model"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Prepare input features for XGBoost
        features = np.array([[
            request.age,
            request.systolic_bp,
            request.diastolic_bp,
            request.blood_sugar,
            request.body_temp,
            request.heart_rate
        ]])
        
        # Make prediction using YOUR XGBoost model
        prediction = model.predict(features)[0]
        
        # Get probabilities if your model supports it
        try:
            probabilities = model.predict_proba(features)[0]
            confidence = float(max(probabilities))
            
            # Update these class names to match your model's actual output
            # Common maternal risk classifications
            class_names = ["low risk", "mid risk", "high risk"]
            prob_dist = {class_names[i]: float(probabilities[i]) for i in range(len(class_names))}
            
        except AttributeError:
            # If your model doesn't have predict_proba, use a default confidence
            confidence = 0.8
            prob_dist = {str(prediction): 1.0}
        
        return PredictionResponse(
            predicted_risk=str(prediction),
            confidence=confidence,
            probability_distribution=prob_dist
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 