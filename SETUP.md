# Vision Attend Pro - Complete Setup Guide

This project now includes **real face recognition** functionality with camera integration!

## Architecture

The system consists of three components:

1. **Frontend** (React + Vite) - Port 8080
2. **Backend API** (Node.js + Express) - Port 4000
3. **Face Recognition Service** (Python + FastAPI) - Port 5000

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## Setup Instructions

### 1. Install Frontend & Backend Dependencies

```bash
cd vision-attend-pro
npm install
```

### 2. Setup Python Face Recognition Service

```bash
cd face_recognition_service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

**Note:** On Windows, if `dlib` installation fails, you may need to install Visual C++ Build Tools first, or use a pre-built wheel:

```bash
pip install dlib-binary
pip install -r requirements.txt
```

### 3. Start All Services

You need to run **three separate terminals**:

#### Terminal 1: Python Face Recognition Service
```bash
cd face_recognition_service
python main.py
```
Should see: `Application startup complete` and `Uvicorn running on http://0.0.0.0:5000`

#### Terminal 2: Node.js Backend API
```bash
cd vision-attend-pro
npm run server
```
Should see: `Vision Attend Pro backend listening on http://localhost:4000`

#### Terminal 3: Frontend Development Server
```bash
cd vision-attend-pro
npm run dev
```
Should see: `Local: http://localhost:8080/`

### 4. Access the Application

Open your browser and go to: **http://localhost:8080/**

## Default Login Credentials

- **Admin**: `admin@visioattend.com` / `Admin@123`
- **Teacher**: `teacher@visioattend.com` / `Teacher@123`

## How to Use Face Recognition

### Step 1: Register Student Faces

1. Go to **Students** page
2. Click on any student to view details
3. Go to **Profile** tab
4. Click **"Register Face"** button
5. Allow camera access when prompted
6. Position the student's face in the center of the frame
7. Click **"Capture & Register"**

### Step 2: Mark Attendance with Face Recognition

1. Go to **Mark Attendance** page
2. Click **"Start Session"**
3. Position the student in front of the camera
4. Click **"Capture & Recognise"**
5. The system will:
   - Capture the frame from the camera
   - Send it to the Python face recognition service
   - Match it against registered student faces
   - Automatically mark attendance if recognized (confidence ≥ 60%)
   - Show unknown face if not recognized

## Features

✅ **Real Face Recognition** - Uses `face_recognition` library (dlib + OpenCV)
✅ **Camera Integration** - Live camera feed with frame capture
✅ **Persistent Storage** - All data saved to `server/db.json`
✅ **Face Encodings** - Stored in `face_recognition_service/faces/encodings.json`
✅ **Session Management** - Track attendance sessions
✅ **Unknown Face Detection** - Logs unrecognized faces for review

## Troubleshooting

### Python Service Won't Start
- Make sure Python 3.8+ is installed: `python --version`
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 5000 is already in use

### Face Recognition Not Working
- Ensure Python service is running on port 5000
- Check browser console for errors
- Make sure student faces are registered first
- Verify camera permissions are granted

### Backend Connection Errors
- Ensure Node.js backend is running on port 4000
- Check that Python service is accessible at `http://localhost:5000`
- Verify CORS settings if accessing from different origin

## File Structure

```
vision-attend-pro/
├── server/
│   ├── index.js          # Node.js backend API
│   └── db.json           # Persistent data storage
├── face_recognition_service/
│   ├── main.py          # Python FastAPI service
│   ├── requirements.txt # Python dependencies
│   └── faces/
│       └── encodings.json # Face encodings storage
└── src/                  # React frontend
```

## API Endpoints

### Backend (Node.js - Port 4000)
- `POST /api/auth/login` - User login
- `GET /api/students` - Get all students
- `POST /api/students` - Add student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/attendance/mark` - Mark attendance with face recognition
- `POST /api/sessions` - Create session
- `POST /api/face-recognition/register` - Register student face
- `POST /api/face-recognition/recognize` - Recognize face

### Face Recognition Service (Python - Port 5000)
- `POST /register-face-base64` - Register face from base64
- `POST /recognize-face-base64` - Recognize face from base64
- `GET /registered-faces` - Get registered student IDs
- `DELETE /delete-face/{student_id}` - Delete registered face

## Production Deployment

For production, consider:
- Using a real database (PostgreSQL, MongoDB) instead of JSON files
- Setting up proper authentication (JWT tokens)
- Using environment variables for configuration
- Deploying Python service as a separate microservice
- Adding rate limiting and security measures
