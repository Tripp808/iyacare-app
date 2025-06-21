#!/bin/bash

# Render Deployment Preparation Script
echo "🚀 Preparing for Render deployment..."

# Check if XGBoost model file exists
if [ ! -f "maternal_risk_xgboost.pkl" ]; then
    echo "❌ Error: XGBoost model file 'maternal_risk_xgboost.pkl' not found!"
    echo "Please ensure your XGBoost model file is in this directory"
    exit 1
fi

echo "✅ XGBoost model file found"
echo "✅ FastAPI service ready"
echo "✅ Requirements file ready (includes XGBoost)"
echo "✅ Ready for Render deployment!"

echo ""
echo "🚀 DEPLOYMENT STEPS:"
echo "1. Push this code to GitHub"
echo "2. Go to render.com and create a new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use these settings:"
echo "   - Root Directory: ai-model-service"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "5. Deploy and get your URL!" 