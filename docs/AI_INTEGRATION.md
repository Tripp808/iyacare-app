# AI Model Integration Guide

This document explains how to integrate your external AI classification model with the IyàCare application.

## Overview

The IyàCare application is designed to work with an external AI model for risk prediction and classification of vital signs. The system sends vital signs data to your AI model API and receives risk assessments in return.

## Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# AI Model Configuration
NEXT_PUBLIC_AI_MODEL_URL=https://your-ai-model.onrender.com
NEXT_PUBLIC_AI_MODEL_API_KEY=your_api_key_here
```

### Deployment Platforms

The integration is designed to work with AI models deployed on:
- Render (recommended)
- Heroku
- AWS Lambda
- Google Cloud Functions
- Custom VPS/Server

## API Specification

### Request Format

The application sends POST requests to `{AI_MODEL_URL}/predict` with the following JSON payload:

```json
{
  "systolic": 120,
  "diastolic": 80,
  "heart_rate": 75,
  "temperature": 36.5,
  "weight": 70.0,
  "blood_sugar": 100,
  "oxygen_saturation": 98,
  "respiratory_rate": 16,
  "patient_id": "patient_123"
}
```

#### Required Fields
- `systolic` (number): Systolic blood pressure in mmHg
- `diastolic` (number): Diastolic blood pressure in mmHg
- `heart_rate` (number): Heart rate in beats per minute
- `temperature` (number): Body temperature in Celsius
- `weight` (number): Weight in kilograms

#### Optional Fields
- `blood_sugar` (number): Blood glucose in mg/dL
- `oxygen_saturation` (number): Oxygen saturation percentage
- `respiratory_rate` (number): Breathing rate per minute
- `patient_id` (string): Unique patient identifier

### Response Format

Your AI model should return a JSON response in this format:

```json
{
  "risk_level": "medium",
  "confidence": 85.2,
  "factors": [
    "Slightly elevated blood pressure",
    "Heart rate within normal range",
    "Temperature normal"
  ],
  "model_version": "v2.1.0"
}
```

#### Response Fields
- `risk_level` (string): One of "low", "medium", "high", or "critical"
- `confidence` (number): Confidence score between 0-100
- `factors` (array): List of factors contributing to the risk assessment
- `model_version` (string): Version of your AI model (optional)

### Authentication

The application supports Bearer token authentication. Include your API key in the request headers:

```
Authorization: Bearer your_api_key_here
```

### Error Handling

Your API should return appropriate HTTP status codes:
- `200`: Successful prediction
- `400`: Invalid request data
- `401`: Authentication failed
- `429`: Rate limit exceeded
- `500`: Internal server error

## Integration Examples

### FastAPI Example

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import your_ml_model

app = FastAPI()

class VitalSigns(BaseModel):
    systolic: float
    diastolic: float
    heart_rate: float
    temperature: float
    weight: float
    blood_sugar: float = None
    oxygen_saturation: float = None
    respiratory_rate: float = None
    patient_id: str = None

class PredictionResponse(BaseModel):
    risk_level: str
    confidence: float
    factors: list[str]
    model_version: str = "v1.0.0"

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(vitals: VitalSigns):
    try:
        # Your ML prediction logic here
        prediction = your_ml_model.predict(vitals.dict())
        
        return PredictionResponse(
            risk_level=prediction["risk_level"],
            confidence=prediction["confidence"],
            factors=prediction["factors"],
            model_version="v1.0.0"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Flask Example

```python
from flask import Flask, request, jsonify
import your_ml_model

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict_risk():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['systolic', 'diastolic', 'heart_rate', 'temperature', 'weight']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Your ML prediction logic here
        prediction = your_ml_model.predict(data)
        
        return jsonify({
            'risk_level': prediction['risk_level'],
            'confidence': prediction['confidence'],
            'factors': prediction['factors'],
            'model_version': 'v1.0.0'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

## Testing

You can test your AI model integration using curl:

```bash
curl -X POST "https://your-ai-model.onrender.com/predict" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{
    "systolic": 140,
    "diastolic": 90,
    "heart_rate": 85,
    "temperature": 37.2,
    "weight": 65.0,
    "blood_sugar": 180,
    "oxygen_saturation": 96,
    "respiratory_rate": 20,
    "patient_id": "test_patient"
  }'
```

## Deployment Considerations

### Render Deployment

1. Connect your GitHub repository to Render
2. Set the build command: `pip install -r requirements.txt`
3. Set the start command: `python app.py` or `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables for your model configuration
5. Enable autoscaling if needed

### Security

- Always use HTTPS for production deployments
- Implement rate limiting to prevent abuse
- Validate all input data
- Log requests for monitoring and debugging
- Use environment variables for sensitive configuration

### Performance

- Consider implementing response caching for similar inputs
- Use async endpoints for better concurrency
- Monitor response times and optimize as needed
- Implement health check endpoints

## Monitoring

### Health Check Endpoint

Implement a health check endpoint for monitoring:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
```

### Logging

Log important events:
- Prediction requests and responses
- Errors and exceptions
- Performance metrics
- Model version updates

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API allows requests from your frontend domain
2. **Timeout Errors**: The application has a 10-second timeout for AI requests
3. **Authentication Errors**: Verify your API key is correctly set in environment variables
4. **Model Errors**: Check your model input format matches the expected schema

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages and API call logs in the browser console.

## Future Enhancements

Consider implementing:
- Batch prediction endpoints for multiple patients
- Model versioning and A/B testing
- Real-time model updates
- Custom risk thresholds per patient
- Historical prediction tracking
- Model performance metrics 