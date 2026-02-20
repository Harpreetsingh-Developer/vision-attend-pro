# Face Recognition Service

Python-based face recognition service using FastAPI and the `face_recognition` library.

## Setup

1. Install Python dependencies:
```bash
cd face_recognition_service
pip install -r requirements.txt
```

**Note:** On Windows, you may need to install `dlib` separately first:
```bash
pip install dlib
pip install -r requirements.txt
```

2. Start the service:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 5000
```

The service will run on `http://localhost:5000`

## API Endpoints

- `POST /register-face` - Register a student's face (requires `student_id` and image file)
- `POST /recognize-face-base64` - Recognize a face from base64 image data
- `GET /registered-faces` - Get list of all registered student IDs
- `DELETE /delete-face/{student_id}` - Delete a registered face

## Face Encodings Storage

Face encodings are stored in `faces/encodings.json` and persist across restarts.
