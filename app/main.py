"""
ManoMitra - Multilingual Emotional Conversational Agent
Main FastAPI application entry point
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
from typing import Dict, List
import json
import asyncio

from app.core.config import settings
from app.api import stt, emotion, nlp, tts
from app.services.conversation_manager import ConversationManager
from app.services.audio_processor import AudioProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ManoMitra API",
    description="Multilingual Emotional Conversational Agent",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(stt.router, prefix="/api/stt", tags=["Speech-to-Text"])
app.include_router(emotion.router, prefix="/api/emotion", tags=["Emotion Recognition"])
app.include_router(nlp.router, prefix="/api/nlp", tags=["Natural Language Processing"])
app.include_router(tts.router, prefix="/api/tts", tags=["Text-to-Speech"])

# Static files for frontend
app.mount("/static", StaticFiles(directory="frontend/build"), name="static")

# Global services
conversation_manager = ConversationManager()
audio_processor = AudioProcessor()

# Active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to ManoMitra - Multilingual Emotional Conversational Agent",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "stt": "active",
            "emotion": "active", 
            "nlp": "active",
            "tts": "active"
        }
    }


@app.websocket("/ws/conversation")
async def websocket_conversation(websocket: WebSocket):
    """
    WebSocket endpoint for real-time conversation
    Handles the complete pipeline: STT → Emotion → NLP → TTS
    """
    await manager.connect(websocket)
    session_id = f"session_{len(manager.active_connections)}"
    
    try:
        while True:
            # Receive audio data from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data["type"] == "audio":
                # Process audio through the pipeline
                try:
                    # Step 1: Speech-to-Text
                    audio_bytes = message_data["audio"]
                    text_result = await audio_processor.process_audio_to_text(audio_bytes)
                    
                    await websocket.send_text(json.dumps({
                        "type": "stt_result",
                        "text": text_result["text"],
                        "confidence": text_result["confidence"]
                    }))
                    
                    # Step 2: Emotion Recognition
                    emotion_result = await audio_processor.detect_emotion(audio_bytes)
                    
                    await websocket.send_text(json.dumps({
                        "type": "emotion_result",
                        "emotion": emotion_result["emotion"],
                        "confidence": emotion_result["confidence"]
                    }))
                    
                    # Step 3: Generate empathetic response
                    response = await conversation_manager.generate_response(
                        text=text_result["text"],
                        emotion=emotion_result["emotion"],
                        session_id=session_id,
                        language=message_data.get("language", "en")
                    )
                    
                    await websocket.send_text(json.dumps({
                        "type": "response_generated",
                        "text": response["text"],
                        "emotion_context": response["emotion_context"]
                    }))
                    
                    # Step 4: Text-to-Speech
                    audio_response = await audio_processor.text_to_speech(
                        text=response["text"],
                        language=message_data.get("language", "en"),
                        emotion=emotion_result["emotion"]
                    )
                    
                    await websocket.send_text(json.dumps({
                        "type": "tts_result",
                        "audio": audio_response["audio_base64"],
                        "duration": audio_response["duration"]
                    }))
                    
                except Exception as e:
                    logger.error(f"Error processing audio: {str(e)}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": f"Processing error: {str(e)}"
                    }))
            
            elif message_data["type"] == "text":
                # Handle text-only input
                try:
                    response = await conversation_manager.generate_response(
                        text=message_data["text"],
                        emotion="neutral",  # Default for text input
                        session_id=session_id,
                        language=message_data.get("language", "en")
                    )
                    
                    await websocket.send_text(json.dumps({
                        "type": "text_response",
                        "text": response["text"]
                    }))
                    
                except Exception as e:
                    logger.error(f"Error processing text: {str(e)}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": f"Processing error: {str(e)}"
                    }))
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Client disconnected from session {session_id}")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level="info"
    )