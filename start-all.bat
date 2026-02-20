@echo off
echo Starting Vision Attend Pro - All Services
echo.

echo [1/3] Starting Python Face Recognition Service...
start "Face Recognition Service" cmd /k "cd face_recognition_service && python main.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend API...
start "Backend API" cmd /k "npm run server"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Development Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo All services are starting...
echo.
echo Frontend: http://localhost:8080
echo Backend API: http://localhost:4000
echo Face Recognition Service: http://localhost:5000
echo.
echo Press any key to exit this window (services will continue running)...
pause >nul
