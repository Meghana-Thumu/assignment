"""
Speech-to-Text API endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import logging

from app.services.audio_processor import AudioProcessor

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize audio processor
audio_processor = AudioProcessor()


@router.post("/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    language: str = "auto"
) -> Dict[str, Any]:
    """
    Transcribe audio file to text
    
    Args:
        audio_file: Audio file (WAV, MP3, etc.)
        language: Target language (auto, en, te)
        
    Returns:
        Transcription result with confidence score
    """
    try:
        # Read audio file
        audio_content = await audio_file.read()
        
        # Convert to base64 for processing
        import base64
        audio_base64 = base64.b64encode(audio_content).decode()
        
        # Process STT
        result = await audio_processor.process_audio_to_text(audio_base64)
        
        return {
            "success": True,
            "transcription": result["text"],
            "confidence": result["confidence"],
            "detected_language": result.get("language", "unknown"),
            "filename": audio_file.filename
        }
        
    except Exception as e:
        logger.error(f"STT API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.get("/supported_languages")
async def get_supported_languages() -> Dict[str, Any]:
    """Get list of supported languages for STT"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "te", "name": "Telugu"},
            {"code": "auto", "name": "Auto-detect"}
        ]
    }