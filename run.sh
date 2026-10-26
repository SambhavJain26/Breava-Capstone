#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Starting Breava Cancer Diagnostic System "
echo "=========================================="

# 1. Start Python Flask ML Service
echo "[1/3] Starting ML Microservice on port 8008..."
python3 ml_service/app.py &
ML_PID=$!

# 2. Start Express API Backend
echo "[2/3] Starting Express API Server on port 5000..."
node server/server.js &
SERVER_PID=$!

# Function to clean up background processes on exit
cleanup() {
    echo "Stopping background services..."
    kill $ML_PID $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

# 3. Start React Frontend
echo "[3/3] Launching React Client on port 3000..."
cd client
npm start
