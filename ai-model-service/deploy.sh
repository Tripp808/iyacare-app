#!/bin/bash

# IyaCare AI Model Deployment Script
echo "🚀 Deploying IyaCare AI Risk Prediction Service..."

# Set variables
IMAGE_NAME="iyacare-ai-service"
CONTAINER_NAME="iyacare-ai-container"
PORT=8000
MODEL_PATH="./models"

# Create models directory if it doesn't exist
mkdir -p models

# Stop and remove existing container if running
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Run container
echo "🏃 Starting AI service container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:8000 \
  -v $(pwd)/models:/app/models \
  -e MODEL_PATH=/app/models/risk_prediction_model.pkl \
  --restart unless-stopped \
  $IMAGE_NAME

# Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Health check
echo "🔍 Performing health check..."
if curl -f http://localhost:$PORT/health; then
  echo "✅ AI Service deployed successfully!"
  echo "🌐 Service available at: http://localhost:$PORT"
  echo "📚 API Documentation: http://localhost:$PORT/docs"
else
  echo "❌ Health check failed. Check logs:"
  docker logs $CONTAINER_NAME
  exit 1
fi

echo "🎉 Deployment completed!" 