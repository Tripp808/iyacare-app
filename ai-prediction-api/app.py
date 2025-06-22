import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="IYAcare AI Prediction API", version="1.0.0")

class PredictionRequest(BaseModel):
    age: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    body_temp: float
    heart_rate: float

class PredictionResponse(BaseModel):
    predicted_risk: str  # Changed from risk_level to match frontend expectation
    confidence: float
    probability_distribution: dict  # Added to match expected format

# AI Risk Prediction API for IyaCare
# Updated: 2024-12-19 - Force fresh deployment

# Improved rule-based prediction model for better balance
def predict_health_risk(data: PredictionRequest) -> PredictionResponse:
    """
    Rule-based health risk prediction with more balanced results
    """
    try:
        # Initialize risk factors
        risk_score = 0
        
        # Age factor (0-30 points)
        if data.age >= 75:
            risk_score += 30
        elif data.age >= 65:
            risk_score += 20
        elif data.age >= 50:
            risk_score += 10
        elif data.age >= 35:
            risk_score += 5
        
        # Blood pressure factor (0-25 points)
        if data.systolic_bp >= 180 or data.diastolic_bp >= 110:
            risk_score += 25
        elif data.systolic_bp >= 160 or data.diastolic_bp >= 100:
            risk_score += 20
        elif data.systolic_bp >= 140 or data.diastolic_bp >= 90:
            risk_score += 15
        elif data.systolic_bp >= 130 or data.diastolic_bp >= 80:
            risk_score += 8
        elif data.systolic_bp <= 90 or data.diastolic_bp <= 60:
            risk_score += 10  # Hypotension
        
        # Blood sugar factor (0-20 points) - assuming mg/dL values
        if data.blood_sugar >= 250:
            risk_score += 20
        elif data.blood_sugar >= 180:
            risk_score += 15
        elif data.blood_sugar >= 140:
            risk_score += 10
        elif data.blood_sugar >= 100:
            risk_score += 5
        elif data.blood_sugar <= 70:
            risk_score += 8  # Hypoglycemia
        
        # Heart rate factor (0-15 points)
        if data.heart_rate >= 120:
            risk_score += 15
        elif data.heart_rate >= 100:
            risk_score += 10
        elif data.heart_rate <= 50:
            risk_score += 12
        elif data.heart_rate <= 60:
            risk_score += 5
        
        # Body temperature factor (0-10 points) - assuming Celsius
        if data.body_temp >= 39.0:  # High fever
            risk_score += 10
        elif data.body_temp >= 37.5:  # Fever
            risk_score += 6
        elif data.body_temp <= 35.0:  # Hypothermia
            risk_score += 8
        elif data.body_temp <= 36.0:
            risk_score += 3
        
        # Determine risk level and probabilities based on score
        # Total possible score: 100 points
        
        if risk_score <= 15:
            # Low risk scenario
            risk_level = "low risk"
            base_confidence = 0.70 + (15 - risk_score) * 0.015
            low_prob = base_confidence
            mid_prob = (1 - base_confidence) * 0.7
            high_prob = (1 - base_confidence) * 0.3
            
        elif risk_score <= 40:
            # Medium risk scenario
            risk_level = "mid risk"
            base_confidence = 0.60 + (risk_score - 15) * 0.008
            mid_prob = base_confidence
            low_prob = (1 - base_confidence) * 0.6
            high_prob = (1 - base_confidence) * 0.4
            
        else:
            # High risk scenario
            risk_level = "high risk"
            base_confidence = 0.65 + min(0.25, (risk_score - 40) * 0.005)
            high_prob = base_confidence
            mid_prob = (1 - base_confidence) * 0.6
            low_prob = (1 - base_confidence) * 0.4
        
        # Normalize probabilities to ensure they sum to 1
        total_prob = low_prob + mid_prob + high_prob
        low_prob /= total_prob
        mid_prob /= total_prob
        high_prob /= total_prob
        
        # Determine final confidence based on the predicted class
        if risk_level == "low risk":
            confidence = low_prob
        elif risk_level == "mid risk":
            confidence = mid_prob
        else:
            confidence = high_prob
        
        logger.info(f"Prediction: {risk_level} with {confidence:.3f} confidence, Score: {risk_score}")
        logger.info(f"Probabilities - Low: {low_prob:.3f}, Mid: {mid_prob:.3f}, High: {high_prob:.3f}")
        
        return PredictionResponse(
            predicted_risk=risk_level,
            confidence=round(confidence, 4),
            probability_distribution={
                "low risk": round(low_prob, 4),
                "mid risk": round(mid_prob, 4),
                "high risk": round(high_prob, 4)
            }
        )
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to the IyaCare AI Risk Prediction API!", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Welcome to the IyaCare AI Risk Prediction API!", "version": "1.0.0"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict health risk based on patient vital signs
    """
    try:
        logger.info(f"Received prediction request: {request}")
        
        # Validate input ranges
        if not (0 <= request.age <= 120):
            raise HTTPException(status_code=400, detail="Age must be between 0 and 120")
        if not (50 <= request.systolic_bp <= 300):
            raise HTTPException(status_code=400, detail="Systolic BP must be between 50 and 300")
        if not (30 <= request.diastolic_bp <= 200):
            raise HTTPException(status_code=400, detail="Diastolic BP must be between 30 and 200")
        if not (50.0 <= request.blood_sugar <= 500.0):
            raise HTTPException(status_code=400, detail="Blood sugar must be between 50 and 500 mg/dL")
        if not (30.0 <= request.body_temp <= 45.0):
            raise HTTPException(status_code=400, detail="Body temperature must be between 30 and 45°C")
        if not (20 <= request.heart_rate <= 250):
            raise HTTPException(status_code=400, detail="Heart rate must be between 20 and 250 bpm")
        
        prediction = predict_health_risk(request)
        logger.info(f"Prediction result: {prediction.predicted_risk}")
        
        return prediction
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 