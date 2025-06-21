#!/bin/bash

# Install dependencies if not already installed
pip install -r requirements.txt

# Start the FastAPI application with uvicorn
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} 