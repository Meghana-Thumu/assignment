"""
Conversation management service for contextual and empathetic responses
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


class ConversationManager:
    """Manages conversation context and generates empathetic responses"""
    
    def __init__(self):
        self.conversation_history: Dict[str, List[Dict]] = {}
        self.emotion_responses = self._load_emotion_responses()
        self.context_window = 5  # Number of previous exchanges to consider
    
    def _load_emotion_responses(self) -> Dict[str, Dict[str, List[str]]]:
        """Load predefined empathetic response templates"""
        return {
            "happy": {
                "en": [
                    "That's wonderful to hear! I'm so glad you're feeling happy.",
                    "Your joy is contagious! What's making you feel so positive?",
                    "It's beautiful to see you in such good spirits!"
                ],
                "te": [
                    "అది వినడానికి చాలా బాగుంది! మీరు సంతోషంగా ఉన్నందుకు నేను చాలా సంతోషిస్తున్నాను.",
                    "మీ ఆనందం అంటుకుంటుంది! మిమ్మల్ని ఇంత పాజిటివ్‌గా అనిపించేది ఏమిటి?",
                    "మిమ్మల్ని ఇంత మంచి స్పిరిట్స్‌లో చూడటం అందంగా ఉంది!"
                ]
            },
            "sad": {
                "en": [
                    "I can hear the sadness in your voice. I'm here to listen and support you.",
                    "It's okay to feel sad sometimes. Would you like to talk about what's bothering you?",
                    "I understand you're going through a difficult time. You don't have to face this alone."
                ],
                "te": [
                    "మీ స్వరంలో దుఃఖం వినిపిస్తోంది. నేను వినడానికి మరియు మిమ్మల్ని సపోర్ట్ చేయడానికి ఇక్కడ ఉన్నాను.",
                    "కొన్నిసార్లు దుఃఖంగా అనిపించడం సాధారణమే. మిమ్మల్ని బాధపెట్టేది గురించి మాట్లాడాలనుకుంటున్నారా?",
                    "మీరు కష్టకాలం గడుపుతున్నారని నేను అర్థం చేసుకున్నాను. మీరు దీన్ని ఒంటరిగా ఎదుర్కోవాల్సిన అవసరం లేదు."
                ]
            },
            "angry": {
                "en": [
                    "I can sense your frustration. Take a deep breath, and let's work through this together.",
                    "It sounds like something really upset you. I'm here to help you process these feelings.",
                    "Your anger is valid. Sometimes we need to express these emotions to move forward."
                ],
                "te": [
                    "మీ కోపం నేను గ్రహించగలుగుతున్నాను. లోతుగా శ్వాస తీసుకోండి, మరియు దీన్ని కలిసి పరిష్కరిస్తాం.",
                    "ఏదో మిమ్మల్ని చాలా కలవరపెట్టినట్లు అనిపిస్తోంది. ఈ భావనలను ప్రాసెస్ చేయడంలో మీకు సహాయపడటానికి నేను ఇక్కడ ఉన్నాను.",
                    "మీ కోపం సరైనది. కొన్నిసార్లు ముందుకు వెళ్లడానికి మనం ఈ భావోద్వేగాలను వ్యక్తం చేయాల్సి ఉంటుంది."
                ]
            },
            "fear": {
                "en": [
                    "I understand you're feeling scared or anxious. You're safe here, and we can talk through your concerns.",
                    "Fear is a natural response. Let's explore what's causing these feelings together.",
                    "It's brave of you to share your fears. I'm here to provide comfort and support."
                ],
                "te": [
                    "మీరు భయంగా లేదా ఆందోళనగా అనిపిస్తున్నట్లు నేను అర్థం చేసుకున్నాను. మీరు ఇక్కడ సురక్షితంగా ఉన్నారు, మరియు మేము మీ ఆందోళనల గురించి మాట్లాడవచ్చు.",
                    "భయం సహజ ప్రతిస్పందన. ఈ భావనలకు కారణమేమిటో కలిసి అన్వేషిద్దాం.",
                    "మీ భయాలను పంచుకోవడం ధైర్యసాహసాలు. నేను ఓదార్పు మరియు మద్దతు అందించడానికి ఇక్కడ ఉన్నాను."
                ]
            },
            "neutral": {
                "en": [
                    "I'm here to chat with you. How are you feeling today?",
                    "Thank you for sharing that with me. What would you like to talk about?",
                    "I'm listening. Please tell me more about what's on your mind."
                ],
                "te": [
                    "నేను మీతో చాట్ చేయడానికి ఇక్కడ ఉన్నాను. ఈరోజు మీరు ఎలా అనిపిస్తున్నారు?",
                    "దాన్ని నాతో పంచుకున్నందుకు ధన్యవాదాలు. మీరు దేని గురించి మాట్లాడాలనుకుంటున్నారు?",
                    "నేను వింటున్నాను. మీ మనసులో ఉన్న దాని గురించి మరింత చెప్పండి."
                ]
            },
            "surprise": {
                "en": [
                    "That sounds unexpected! I'd love to hear more about what surprised you.",
                    "Wow, that must have been quite a moment! Tell me more about it.",
                    "Surprises can be exciting or overwhelming. How are you processing this?"
                ],
                "te": [
                    "అది ఊహించనిది అనిపిస్తోంది! మిమ్మల్ని ఆశ్చర్యపరిచిన దాని గురించి మరింత వినాలనుకుంటున్నాను.",
                    "వావ్, అది చాలా గొప్ప క్షణం అయి ఉండాలి! దాని గురించి మరింత చెప్పండి.",
                    "ఆశ్చర్యాలు ఉత్తేజకరమైనవి లేదా అధికంగా అనిపించవచ్చు. మీరు దీన్ని ఎలా ప్రాసెస్ చేస్తున్నారు?"
                ]
            },
            "disgust": {
                "en": [
                    "I can sense your discomfort with this situation. Your feelings are completely valid.",
                    "That sounds really unpleasant. I'm sorry you had to experience that.",
                    "It's natural to feel disgusted by certain things. Let's talk about how to move forward."
                ],
                "te": [
                    "ఈ పరిస్థితితో మీ అసౌకర్యం నేను గ్రహించగలుగుతున్నాను. మీ భావనలు పూర్తిగా సరైనవి.",
                    "అది నిజంగా అసహ్యకరంగా అనిపిస్తోంది. మీరు దాన్ని అనుభవించినందుకు నన్ను క్షమించండి.",
                    "కొన్ని విషయాలతో అసహ్యం అనిపించడం సహజం. ముందుకు ఎలా వెళ్లాలో మాట్లాడుకుందాం."
                ]
            }
        }
    
    async def generate_response(
        self,
        text: str,
        emotion: str,
        session_id: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generate contextual and empathetic response
        
        Args:
            text: User's input text
            emotion: Detected emotion
            session_id: Conversation session ID
            language: Response language
            
        Returns:
            Dict containing response text and context
        """
        try:
            # Add to conversation history
            self._add_to_history(session_id, {
                "timestamp": datetime.now().isoformat(),
                "user_text": text,
                "emotion": emotion,
                "language": language
            })
            
            # Get conversation context
            context = self._get_conversation_context(session_id)
            
            # Generate empathetic response
            response_text = await self._generate_empathetic_response(
                text, emotion, language, context
            )
            
            # Add response to history
            self._add_to_history(session_id, {
                "timestamp": datetime.now().isoformat(),
                "bot_response": response_text,
                "emotion_context": emotion
            })
            
            return {
                "text": response_text,
                "emotion_context": emotion,
                "conversation_length": len(self.conversation_history.get(session_id, [])),
                "context_used": len(context)
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "text": self._get_fallback_response(language),
                "emotion_context": "neutral",
                "error": str(e)
            }
    
    def _add_to_history(self, session_id: str, entry: Dict[str, Any]):
        """Add entry to conversation history"""
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        self.conversation_history[session_id].append(entry)
        
        # Limit history size to prevent memory issues
        max_history = 50
        if len(self.conversation_history[session_id]) > max_history:
            self.conversation_history[session_id] = \
                self.conversation_history[session_id][-max_history:]
    
    def _get_conversation_context(self, session_id: str) -> List[Dict[str, Any]]:
        """Get recent conversation context"""
        history = self.conversation_history.get(session_id, [])
        return history[-self.context_window:] if history else []
    
    async def _generate_empathetic_response(
        self,
        text: str,
        emotion: str,
        language: str,
        context: List[Dict[str, Any]]
    ) -> str:
        """Generate empathetic response based on emotion and context"""
        
        # Get base empathetic response
        base_responses = self.emotion_responses.get(emotion, {}).get(language, [])
        if not base_responses:
            base_responses = self.emotion_responses["neutral"][language]
        
        # Select response based on context
        import random
        base_response = random.choice(base_responses)
        
        # Enhance response with context if available
        if context:
            enhanced_response = await self._enhance_with_context(
                base_response, text, context, language
            )
            return enhanced_response
        
        return base_response
    
    async def _enhance_with_context(
        self,
        base_response: str,
        current_text: str,
        context: List[Dict[str, Any]],
        language: str
    ) -> str:
        """Enhance response with conversation context"""
        
        # Simple context enhancement - can be improved with more sophisticated NLP
        context_phrases = {
            "en": {
                "continuation": "Building on what we discussed earlier, ",
                "acknowledgment": "I remember you mentioned that before. ",
                "support": "As we've been talking, I can see that "
            },
            "te": {
                "continuation": "మేము ఇంతకు ముందు చర్చించిన దాని ఆధారంగా, ",
                "acknowledgment": "మీరు ఇంతకు ముందు దాని గురించి చెప్పారని నాకు గుర్తుంది. ",
                "support": "మేము మాట్లాడుతున్నప్పుడు, నేను చూడగలుగుతున్నాను "
            }
        }
        
        # Check if there's relevant context
        recent_emotions = [entry.get("emotion") for entry in context[-3:] 
                          if "emotion" in entry]
        
        if len(set(recent_emotions)) > 1:  # Emotion has changed
            if language in context_phrases:
                prefix = context_phrases[language]["support"]
                return f"{prefix}{base_response.lower()}"
        
        return base_response
    
    def _get_fallback_response(self, language: str) -> str:
        """Get fallback response when processing fails"""
        fallbacks = {
            "en": "I'm here to listen and support you. Could you please try again?",
            "te": "నేను వినడానికి మరియు మిమ్మల్ని సపోర్ట్ చేయడానికి ఇక్కడ ఉన్నాను. దయచేసి మళ్లీ ప్రయత్నించగలరా?"
        }
        return fallbacks.get(language, fallbacks["en"])
    
    def get_conversation_summary(self, session_id: str) -> Dict[str, Any]:
        """Get summary of conversation session"""
        history = self.conversation_history.get(session_id, [])
        
        if not history:
            return {"message": "No conversation history found"}
        
        emotions_detected = [entry.get("emotion") for entry in history 
                           if "emotion" in entry]
        
        return {
            "session_id": session_id,
            "total_exchanges": len([e for e in history if "user_text" in e]),
            "emotions_detected": list(set(emotions_detected)),
            "session_start": history[0].get("timestamp") if history else None,
            "session_end": history[-1].get("timestamp") if history else None,
            "languages_used": list(set([e.get("language") for e in history 
                                      if "language" in e]))
        }
    
    def clear_session(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]