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
    risk_level: str
    confidence: float
    details: dict

# Simple rule-based prediction model for better balance
def predict_health_risk(data: PredictionRequest) -> PredictionResponse:
    """
    Rule-based health risk prediction with more balanced results
    """
    try:
        # Initialize risk factors
        risk_factors = []
        risk_score = 0
        
        # Age factor (0-40 points)
        if data.age >= 65:
            risk_score += 40
            risk_factors.append("Advanced age (65+)")
        elif data.age >= 50:
            risk_score += 25
            risk_factors.append("Middle age (50-64)")
        elif data.age >= 35:
            risk_score += 10
            risk_factors.append("Mature age (35-49)")
        
        # Blood pressure factor (0-30 points)
        if data.systolic_bp >= 180 or data.diastolic_bp >= 110:
            risk_score += 30
            risk_factors.append("Severe hypertension")
        elif data.systolic_bp >= 160 or data.diastolic_bp >= 100:
            risk_score += 25
            risk_factors.append("Stage 2 hypertension")
        elif data.systolic_bp >= 140 or data.diastolic_bp >= 90:
            risk_score += 15
            risk_factors.append("Stage 1 hypertension")
        elif data.systolic_bp >= 130 or data.diastolic_bp >= 80:
            risk_score += 5
            risk_factors.append("Elevated blood pressure")
        
        # Blood sugar factor (0-25 points)
        if data.blood_sugar >= 11.1:  # mmol/L
            risk_score += 25
            risk_factors.append("Severe diabetes")
        elif data.blood_sugar >= 7.0:
            risk_score += 15
            risk_factors.append("Diabetes")
        elif data.blood_sugar >= 6.1:
            risk_score += 10
            risk_factors.append("Impaired glucose")
        elif data.blood_sugar >= 5.6:
            risk_score += 5
            risk_factors.append("Prediabetes")
        
        # Heart rate factor (0-15 points)
        if data.heart_rate >= 100:
            risk_score += 15
            risk_factors.append("Tachycardia")
        elif data.heart_rate <= 50:
            risk_score += 10
            risk_factors.append("Bradycardia")
        elif data.heart_rate >= 90:
            risk_score += 5
            risk_factors.append("Elevated heart rate")
        
        # Body temperature factor (0-10 points)
        if data.body_temp >= 101.0:  # Fahrenheit
            risk_score += 10
            risk_factors.append("Fever")
        elif data.body_temp >= 99.5:
            risk_score += 5
            risk_factors.append("Low-grade fever")
        elif data.body_temp <= 96.0:
            risk_score += 8
            risk_factors.append("Hypothermia")
        
        # Determine risk level based on score
        if risk_score >= 70:
            risk_level = "High"
            confidence = min(0.95, 0.7 + (risk_score - 70) * 0.005)
        elif risk_score >= 40:
            risk_level = "Medium"
            confidence = min(0.85, 0.6 + (risk_score - 40) * 0.008)
        else:
            risk_level = "Low"
            confidence = min(0.80, 0.5 + (40 - risk_score) * 0.005)
        
        # If no risk factors found, it's definitely low risk
        if not risk_factors:
            risk_factors.append("No significant risk factors detected")
            confidence = max(confidence, 0.75)
        
        logger.info(f"Prediction: {risk_level} risk with {confidence:.2f} confidence, Score: {risk_score}")
        
        return PredictionResponse(
            risk_level=risk_level,
            confidence=round(confidence, 2),
            details={
                "risk_score": risk_score,
                "risk_factors": risk_factors,
                "vital_signs": {
                    "age": data.age,
                    "systolic_bp": data.systolic_bp,
                    "diastolic_bp": data.diastolic_bp,
                    "blood_sugar": data.blood_sugar,
                    "body_temp": data.body_temp,
                    "heart_rate": data.heart_rate
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "IYAcare AI Prediction API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AI Prediction API is operational"}

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
        if not (2.0 <= request.blood_sugar <= 40.0):
            raise HTTPException(status_code=400, detail="Blood sugar must be between 2.0 and 40.0 mmol/L")
        if not (90.0 <= request.body_temp <= 115.0):
            raise HTTPException(status_code=400, detail="Body temperature must be between 90 and 115°F")
        if not (20 <= request.heart_rate <= 250):
            raise HTTPException(status_code=400, detail="Heart rate must be between 20 and 250 bpm")
        
        prediction = predict_health_risk(request)
        logger.info(f"Prediction result: {prediction.risk_level} risk")
        
        return prediction
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 