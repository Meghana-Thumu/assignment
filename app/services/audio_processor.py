"""
Audio processing service for STT, emotion recognition, and TTS
"""

import asyncio
import base64
import io
import logging
from typing import Dict, Any, Optional
import numpy as np
import librosa
import soundfile as sf
import whisper
from TTS.api import TTS

from app.core.config import settings
from app.models.emotion_classifier import EmotionClassifier

logger = logging.getLogger(__name__)


class AudioProcessor:
    """Handles all audio processing tasks"""
    
    def __init__(self):
        self.stt_model = None
        self.emotion_model = None
        self.tts_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize all audio processing models"""
        try:
            # Initialize Whisper STT model
            logger.info(f"Loading Whisper model: {settings.WHISPER_MODEL_SIZE}")
            self.stt_model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
            
            # Initialize emotion classifier
            logger.info("Loading emotion recognition model")
            self.emotion_model = EmotionClassifier(settings.EMOTION_MODEL_PATH)
            
            # Initialize TTS model
            logger.info("Loading TTS model")
            self.tts_model = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts")
            
            logger.info("All audio models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error initializing audio models: {str(e)}")
            raise
    
    async def process_audio_to_text(self, audio_data: str) -> Dict[str, Any]:
        """
        Convert audio to text using Whisper STT
        
        Args:
            audio_data: Base64 encoded audio data
            
        Returns:
            Dict containing transcribed text and confidence
        """
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Convert to numpy array
            audio_array, sr = librosa.load(
                io.BytesIO(audio_bytes), 
                sr=settings.SAMPLE_RATE
            )
            
            # Run STT in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self._transcribe_audio, 
                audio_array
            )
            
            return {
                "text": result["text"].strip(),
                "confidence": self._calculate_confidence(result),
                "language": result.get("language", "en")
            }
            
        except Exception as e:
            logger.error(f"STT processing error: {str(e)}")
            return {
                "text": "",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _transcribe_audio(self, audio_array: np.ndarray) -> Dict[str, Any]:
        """Internal method to transcribe audio"""
        return self.stt_model.transcribe(audio_array)
    
    def _calculate_confidence(self, whisper_result: Dict[str, Any]) -> float:
        """Calculate confidence score from Whisper result"""
        # Whisper doesn't provide direct confidence, so we estimate
        segments = whisper_result.get("segments", [])
        if not segments:
            return 0.5  # Default confidence
        
        # Average the probability scores if available
        confidences = []
        for segment in segments:
            if "avg_logprob" in segment:
                # Convert log probability to confidence (0-1)
                conf = np.exp(segment["avg_logprob"])
                confidences.append(conf)
        
        return np.mean(confidences) if confidences else 0.5
    
    async def detect_emotion(self, audio_data: str) -> Dict[str, Any]:
        """
        Detect emotion from audio
        
        Args:
            audio_data: Base64 encoded audio data
            
        Returns:
            Dict containing detected emotion and confidence
        """
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Convert to numpy array
            audio_array, sr = librosa.load(
                io.BytesIO(audio_bytes), 
                sr=settings.SAMPLE_RATE
            )
            
            # Run emotion detection in thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                self.emotion_model.predict,
                audio_array
            )
            
            return {
                "emotion": result["emotion"],
                "confidence": result["confidence"],
                "probabilities": result.get("probabilities", {})
            }
            
        except Exception as e:
            logger.error(f"Emotion detection error: {str(e)}")
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def text_to_speech(
        self, 
        text: str, 
        language: str = "en", 
        emotion: str = "neutral"
    ) -> Dict[str, Any]:
        """
        Convert text to speech with emotional tone
        
        Args:
            text: Text to synthesize
            language: Target language (en/te)
            emotion: Emotional tone to apply
            
        Returns:
            Dict containing audio data and metadata
        """
        try:
            # Run TTS in thread pool
            loop = asyncio.get_event_loop()
            audio_array = await loop.run_in_executor(
                None,
                self._synthesize_speech,
                text,
                language,
                emotion
            )
            
            # Convert to base64 for transmission
            buffer = io.BytesIO()
            sf.write(buffer, audio_array, settings.SAMPLE_RATE, format='WAV')
            audio_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "audio_base64": audio_base64,
                "duration": len(audio_array) / settings.SAMPLE_RATE,
                "sample_rate": settings.SAMPLE_RATE
            }
            
        except Exception as e:
            logger.error(f"TTS processing error: {str(e)}")
            return {
                "audio_base64": "",
                "duration": 0.0,
                "error": str(e)
            }
    
    def _synthesize_speech(
        self, 
        text: str, 
        language: str, 
        emotion: str
    ) -> np.ndarray:
        """Internal method to synthesize speech"""
        # Map language codes
        lang_map = {
            "en": "en",
            "te": "te"  # Telugu
        }
        
        target_lang = lang_map.get(language, "en")
        
        # Generate speech
        wav = self.tts_model.tts(
            text=text,
            language=target_lang
        )
        
        return np.array(wav)
    
    def cleanup(self):
        """Cleanup resources"""
        # Clean up models if needed
        pass