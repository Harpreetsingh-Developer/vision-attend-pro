from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import face_recognition
import numpy as np
import json
import os
from pathlib import Path
import base64
from io import BytesIO
from PIL import Image

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to store face encodings
FACES_DIR = Path("faces")
FACES_DIR.mkdir(exist_ok=True)
ENCODINGS_FILE = FACES_DIR / "encodings.json"

# Load existing encodings
def load_encodings():
    if ENCODINGS_FILE.exists():
        with open(ENCODINGS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_encodings(encodings):
    with open(ENCODINGS_FILE, 'w') as f:
        json.dump(encodings, f, default=str)

encodings_db = load_encodings()

@app.get("/")
def root():
    return {"status": "ok", "message": "Face Recognition Service Running"}

@app.post("/register-face")
async def register_face(student_id: str, file: UploadFile = File(...)):
    """Register a student's face encoding"""
    try:
        # Read image
        contents = await file.read()
        image = face_recognition.load_image_file(BytesIO(contents))
        
        # Find face encodings
        face_encodings = face_recognition.face_encodings(image)
        
        if len(face_encodings) == 0:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        if len(face_encodings) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Please provide an image with only one face")
        
        # Store encoding
        encoding = face_encodings[0].tolist()
        encodings_db[student_id] = encoding
        save_encodings(encodings_db)
        
        return {"success": True, "message": f"Face registered for student {student_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register-face-base64")
async def register_face_base64(data: dict):
    """Register a student's face encoding from base64 image"""
    try:
        student_id = data.get("student_id")
        image_data = data.get("image")
        
        if not student_id or not image_data:
            raise HTTPException(status_code=400, detail="student_id and image are required")
        
        # Remove data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        image = face_recognition.load_image_file(BytesIO(image_bytes))
        
        # Find face encodings
        face_encodings = face_recognition.face_encodings(image)
        
        if len(face_encodings) == 0:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        if len(face_encodings) > 1:
            raise HTTPException(status_code=400, detail="Multiple faces detected. Please provide an image with only one face")
        
        # Store encoding
        encoding = face_encodings[0].tolist()
        encodings_db[student_id] = encoding
        save_encodings(encodings_db)
        
        return {"success": True, "message": f"Face registered for student {student_id}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recognize-face")
async def recognize_face(file: UploadFile = File(...), threshold: float = 0.6):
    """Recognize a face from an uploaded image"""
    try:
        # Read image
        contents = await file.read()
        image = face_recognition.load_image_file(BytesIO(contents))
        
        # Find face encodings in the image
        face_encodings = face_recognition.face_encodings(image)
        
        if len(face_encodings) == 0:
            return {
                "success": False,
                "recognized": False,
                "message": "No face detected",
                "student_id": None,
                "confidence": 0.0
            }
        
        # Compare with known faces
        unknown_encoding = face_encodings[0]
        best_match = None
        best_distance = float('inf')
        
        for student_id, known_encoding in encodings_db.items():
            distance = face_recognition.face_distance([np.array(known_encoding)], unknown_encoding)[0]
            if distance < best_distance:
                best_distance = distance
                best_match = student_id
        
        # Convert distance to confidence (lower distance = higher confidence)
        # face_distance returns 0.0 to ~0.6 for same person, higher for different
        confidence = max(0.0, min(1.0, 1.0 - (best_distance / 0.6)))
        
        if best_match and confidence >= threshold:
            return {
                "success": True,
                "recognized": True,
                "student_id": best_match,
                "confidence": round(confidence, 3),
                "distance": round(best_distance, 4)
            }
        else:
            return {
                "success": True,
                "recognized": False,
                "message": "Face not recognized",
                "student_id": None,
                "confidence": round(confidence, 3) if best_match else 0.0
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recognize-face-base64")
async def recognize_face_base64(data: dict):
    """Recognize a face from base64 encoded image"""
    try:
        image_data = data.get("image")
        threshold = data.get("threshold", 0.6)
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Remove data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        image = face_recognition.load_image_file(BytesIO(image_bytes))
        
        # Find face encodings
        face_encodings = face_recognition.face_encodings(image)
        
        if len(face_encodings) == 0:
            return {
                "success": False,
                "recognized": False,
                "message": "No face detected",
                "student_id": None,
                "confidence": 0.0
            }
        
        # Compare with known faces
        unknown_encoding = face_encodings[0]
        best_match = None
        best_distance = float('inf')
        
        for student_id, known_encoding in encodings_db.items():
            distance = face_recognition.face_distance([np.array(known_encoding)], unknown_encoding)[0]
            if distance < best_distance:
                best_distance = distance
                best_match = student_id
        
        confidence = max(0.0, min(1.0, 1.0 - (best_distance / 0.6)))
        
        if best_match and confidence >= threshold:
            return {
                "success": True,
                "recognized": True,
                "student_id": best_match,
                "confidence": round(confidence, 3),
                "distance": round(best_distance, 4)
            }
        else:
            return {
                "success": True,
                "recognized": False,
                "message": "Face not recognized",
                "student_id": None,
                "confidence": round(confidence, 3) if best_match else 0.0
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/registered-faces")
def get_registered_faces():
    """Get list of all registered student IDs"""
    return {"student_ids": list(encodings_db.keys()), "count": len(encodings_db)}

@app.delete("/delete-face/{student_id}")
def delete_face(student_id: str):
    """Delete a registered face"""
    if student_id in encodings_db:
        del encodings_db[student_id]
        save_encodings(encodings_db)
        return {"success": True, "message": f"Face deleted for student {student_id}"}
    else:
        raise HTTPException(status_code=404, detail="Student face not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
