# Breava One-Command Startup Script (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting Breava Cancer Diagnostic System " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start Python Flask ML Service (Port 8008)
Write-Host "[1/3] Starting ML Microservice on port 8008..." -ForegroundColor Yellow
$mlProcess = Start-Process -FilePath "python" -ArgumentList "ml_service/app.py" -PassThru -NoNewWindow

# 2. Start Express API Backend (Port 5000)
Write-Host "[2/3] Starting Express API Server on port 5000..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server/server.js" -PassThru -NoNewWindow

# 3. Start React Frontend (Port 3000)
Write-Host "[3/3] Launching React Client on port 3000..." -ForegroundColor Green
Set-Location client
npm start
