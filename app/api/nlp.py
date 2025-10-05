"""
Natural Language Processing API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

from app.services.conversation_manager import ConversationManager

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize conversation manager
conversation_manager = ConversationManager()


class ResponseRequest(BaseModel):
    text: str
    emotion: str = "neutral"
    session_id: str
    language: str = "en"
    context: Optional[Dict[str, Any]] = None


class ConversationSummaryRequest(BaseModel):
    session_id: str


@router.post("/generate_response")
async def generate_response(request: ResponseRequest) -> Dict[str, Any]:
    """
    Generate empathetic response based on input text and emotion
    
    Args:
        request: Request containing text, emotion, session info
        
    Returns:
        Generated empathetic response
    """
    try:
        result = await conversation_manager.generate_response(
            text=request.text,
            emotion=request.emotion,
            session_id=request.session_id,
            language=request.language
        )
        
        return {
            "success": True,
            "response": result["text"],
            "emotion_context": result["emotion_context"],
            "conversation_length": result.get("conversation_length", 0),
            "context_used": result.get("context_used", 0)
        }
        
    except Exception as e:
        logger.error(f"NLP API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Response generation failed: {str(e)}")


@router.post("/conversation_summary")
async def get_conversation_summary(request: ConversationSummaryRequest) -> Dict[str, Any]:
    """
    Get summary of conversation session
    
    Args:
        request: Request containing session ID
        
    Returns:
        Conversation summary with statistics
    """
    try:
        summary = conversation_manager.get_conversation_summary(request.session_id)
        
        return {
            "success": True,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Conversation summary API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")


@router.delete("/clear_session/{session_id}")
async def clear_conversation_session(session_id: str) -> Dict[str, Any]:
    """
    Clear conversation history for a session
    
    Args:
        session_id: Session ID to clear
        
    Returns:
        Success confirmation
    """
    try:
        conversation_manager.clear_session(session_id)
        
        return {
            "success": True,
            "message": f"Session {session_id} cleared successfully"
        }
        
    except Exception as e:
        logger.error(f"Session clear API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Session clear failed: {str(e)}")


@router.get("/supported_languages")
async def get_supported_languages() -> Dict[str, Any]:
    """Get list of supported languages for NLP"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"}
        ]
    }