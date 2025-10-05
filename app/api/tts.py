"""
Text-to-Speech API endpoints
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any
import logging
import io
import base64

from app.services.audio_processor import AudioProcessor

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize audio processor
audio_processor = AudioProcessor()


class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    emotion: str = "neutral"
    voice_speed: float = 1.0


@router.post("/synthesize")
async def synthesize_speech(request: TTSRequest) -> Dict[str, Any]:
    """
    Convert text to speech with emotional tone
    
    Args:
        request: TTS request with text, language, and emotion
        
    Returns:
        Audio data as base64 encoded string
    """
    try:
        result = await audio_processor.text_to_speech(
            text=request.text,
            language=request.language,
            emotion=request.emotion
        )
        
        return {
            "success": True,
            "audio_base64": result["audio_base64"],
            "duration": result["duration"],
            "sample_rate": result.get("sample_rate", 16000),
            "text": request.text,
            "language": request.language,
            "emotion": request.emotion
        }
        
    except Exception as e:
        logger.error(f"TTS API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")


@router.post("/synthesize_stream")
async def synthesize_speech_stream(request: TTSRequest):
    """
    Convert text to speech and return as audio stream
    
    Args:
        request: TTS request with text, language, and emotion
        
    Returns:
        Audio stream (WAV format)
    """
    try:
        result = await audio_processor.text_to_speech(
            text=request.text,
            language=request.language,
            emotion=request.emotion
        )
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(result["audio_base64"])
        
        # Create audio stream
        audio_stream = io.BytesIO(audio_bytes)
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav",
                "Content-Length": str(len(audio_bytes))
            }
        )
        
    except Exception as e:
        logger.error(f"TTS streaming API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Speech synthesis streaming failed: {str(e)}")


@router.get("/voices")
async def get_available_voices() -> Dict[str, Any]:
    """Get list of available TTS voices"""
    return {
        "voices": {
            "en": [
                {"id": "en_us_female", "name": "English (US) - Female", "gender": "female"},
                {"id": "en_us_male", "name": "English (US) - Male", "gender": "male"}
            ],
            "te": [
                {"id": "te_female", "name": "Telugu - Female", "gender": "female"},
                {"id": "te_male", "name": "Telugu - Male", "gender": "male"}
            ]
        }
    }


@router.get("/supported_languages")
async def get_supported_languages() -> Dict[str, Any]:
    """Get list of supported languages for TTS"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"}
        ]
    }