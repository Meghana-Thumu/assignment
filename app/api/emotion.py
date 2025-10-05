"""
Emotion Recognition API endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import logging

from app.services.audio_processor import AudioProcessor

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize audio processor
audio_processor = AudioProcessor()


@router.post("/detect")
async def detect_emotion(
    audio_file: UploadFile = File(...)
) -> Dict[str, Any]:
    """
    Detect emotion from audio file
    
    Args:
        audio_file: Audio file containing speech
        
    Returns:
        Detected emotion with confidence and probabilities
    """
    try:
        # Read audio file
        audio_content = await audio_file.read()
        
        # Convert to base64 for processing
        import base64
        audio_base64 = base64.b64encode(audio_content).decode()
        
        # Process emotion detection
        result = await audio_processor.detect_emotion(audio_base64)
        
        return {
            "success": True,
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "probabilities": result.get("probabilities", {}),
            "filename": audio_file.filename
        }
        
    except Exception as e:
        logger.error(f"Emotion detection API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Emotion detection failed: {str(e)}")


@router.get("/emotions")
async def get_supported_emotions() -> Dict[str, Any]:
    """Get list of supported emotions"""
    return {
        "emotions": [
            {"name": "neutral", "description": "Calm, balanced emotional state"},
            {"name": "happy", "description": "Joyful, positive emotional state"},
            {"name": "sad", "description": "Sorrowful, melancholic emotional state"},
            {"name": "angry", "description": "Frustrated, irritated emotional state"},
            {"name": "fear", "description": "Anxious, worried emotional state"},
            {"name": "surprise", "description": "Astonished, unexpected reaction"},
            {"name": "disgust", "description": "Repulsed, aversive reaction"}
        ]
    }