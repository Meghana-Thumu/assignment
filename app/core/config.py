"""
Configuration settings for ManoMitra application
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # Model Paths
    STT_MODEL_PATH: str = "./data/models/whisper-base"
    EMOTION_MODEL_PATH: str = "./data/models/emotion_classifier"
    TTS_MODEL_PATH: str = "./data/models/tts_model"
    NLP_MODEL_PATH: str = "./data/models/nlp_model"
    
    # Language Settings
    SUPPORTED_LANGUAGES: List[str] = ["en", "te"]
    DEFAULT_LANGUAGE: str = "en"
    
    # Audio Settings
    SAMPLE_RATE: int = 16000
    CHUNK_SIZE: int = 1024
    MAX_AUDIO_LENGTH: int = 30  # seconds
    
    # Model Configuration
    WHISPER_MODEL_SIZE: str = "base"  # tiny, base, small, medium, large
    EMOTION_THRESHOLD: float = 0.6
    RESPONSE_MAX_LENGTH: int = 200
    
    # Performance Settings
    MAX_CONCURRENT_REQUESTS: int = 10
    REQUEST_TIMEOUT: int = 30
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database (if needed for conversation history)
    DATABASE_URL: str = "sqlite:///./data/conversations.db"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/manomitra.log"
    
    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings()