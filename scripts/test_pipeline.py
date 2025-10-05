#!/usr/bin/env python3
"""
Test script for ManoMitra pipeline
Tests STT → Emotion Recognition → NLP → TTS pipeline
"""

import asyncio
import sys
import logging
from pathlib import Path
import base64
import wave
import numpy as np

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.audio_processor import AudioProcessor
from app.services.conversation_manager import ConversationManager
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PipelineTester:
    """Test the complete ManoMitra pipeline"""
    
    def __init__(self):
        self.audio_processor = AudioProcessor()
        self.conversation_manager = ConversationManager()
    
    def create_test_audio(self, text: str = "Hello, how are you today?", duration: int = 3) -> bytes:
        """Create a simple test audio signal"""
        # Generate a simple sine wave as test audio
        sample_rate = settings.SAMPLE_RATE
        samples = duration * sample_rate
        
        # Create a simple tone (this is just for testing)
        t = np.linspace(0, duration, samples)
        frequency = 440  # A4 note
        audio = np.sin(2 * np.pi * frequency * t) * 0.3
        
        # Convert to 16-bit PCM
        audio_int16 = (audio * 32767).astype(np.int16)
        
        # Create WAV file in memory
        import io
        buffer = io.BytesIO()
        
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_int16.tobytes())
        
        return buffer.getvalue()
    
    async def test_stt(self) -> dict:
        """Test Speech-to-Text functionality"""
        logger.info("Testing Speech-to-Text...")
        
        try:
            # Create test audio
            test_audio = self.create_test_audio("This is a test message")
            audio_base64 = base64.b64encode(test_audio).decode()
            
            # Test STT
            result = await self.audio_processor.process_audio_to_text(audio_base64)
            
            logger.info(f"STT Result: {result}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"STT test failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def test_emotion_recognition(self) -> dict:
        """Test Emotion Recognition functionality"""
        logger.info("Testing Emotion Recognition...")
        
        try:
            # Create test audio
            test_audio = self.create_test_audio("I am very happy today!")
            audio_base64 = base64.b64encode(test_audio).decode()
            
            # Test emotion recognition
            result = await self.audio_processor.detect_emotion(audio_base64)
            
            logger.info(f"Emotion Result: {result}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"Emotion recognition test failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def test_nlp_response(self) -> dict:
        """Test NLP Response Generation"""
        logger.info("Testing NLP Response Generation...")
        
        try:
            # Test response generation
            result = await self.conversation_manager.generate_response(
                text="I am feeling very sad today",
                emotion="sad",
                session_id="test_session_001",
                language="en"
            )
            
            logger.info(f"NLP Result: {result}")
            return {"success": True, "result": result}
            
        except Exception as e:
            logger.error(f"NLP test failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def test_tts(self) -> dict:
        """Test Text-to-Speech functionality"""
        logger.info("Testing Text-to-Speech...")
        
        try:
            # Test TTS
            result = await self.audio_processor.text_to_speech(
                text="Hello, I understand you are feeling sad. I am here to help you.",
                language="en",
                emotion="empathetic"
            )
            
            logger.info(f"TTS Result: Audio generated with duration {result.get('duration', 0)} seconds")
            return {"success": True, "result": {"duration": result.get("duration", 0)}}
            
        except Exception as e:
            logger.error(f"TTS test failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def test_complete_pipeline(self) -> dict:
        """Test the complete pipeline end-to-end"""
        logger.info("Testing Complete Pipeline...")
        
        try:
            session_id = "test_pipeline_session"
            
            # Step 1: Create test audio
            test_audio = self.create_test_audio("I am feeling anxious about my exam tomorrow")
            audio_base64 = base64.b64encode(test_audio).decode()
            
            # Step 2: STT
            logger.info("Pipeline Step 1: Speech-to-Text")
            stt_result = await self.audio_processor.process_audio_to_text(audio_base64)
            
            # Step 3: Emotion Recognition
            logger.info("Pipeline Step 2: Emotion Recognition")
            emotion_result = await self.audio_processor.detect_emotion(audio_base64)
            
            # Step 4: Generate Response
            logger.info("Pipeline Step 3: Response Generation")
            response_result = await self.conversation_manager.generate_response(
                text=stt_result.get("text", "test input"),
                emotion=emotion_result.get("emotion", "neutral"),
                session_id=session_id,
                language="en"
            )
            
            # Step 5: TTS
            logger.info("Pipeline Step 4: Text-to-Speech")
            tts_result = await self.audio_processor.text_to_speech(
                text=response_result.get("text", "I understand how you feel."),
                language="en",
                emotion=emotion_result.get("emotion", "neutral")
            )
            
            pipeline_result = {
                "stt": stt_result,
                "emotion": emotion_result,
                "response": response_result,
                "tts": {"duration": tts_result.get("duration", 0)}
            }
            
            logger.info("Complete pipeline test successful!")
            return {"success": True, "result": pipeline_result}
            
        except Exception as e:
            logger.error(f"Complete pipeline test failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def test_multilingual(self) -> dict:
        """Test multilingual capabilities"""
        logger.info("Testing Multilingual Capabilities...")
        
        try:
            results = {}
            
            # Test English
            en_result = await self.conversation_manager.generate_response(
                text="I am very happy today!",
                emotion="happy",
                session_id="multilingual_test_en",
                language="en"
            )
            results["english"] = en_result
            
            # Test Telugu
            te_result = await self.conversation_manager.generate_response(
                text="నేను ఈరోజు చాలా సంతోషంగా ఉన్నాను!",
                emotion="happy",
                session_id="multilingual_test_te",
                language="te"
            )
            results["telugu"] = te_result
            
            logger.info("Multilingual test successful!")
            return {"success": True, "result": results}
            
        except Exception as e:
            logger.error(f"Multilingual test failed: {str(e)}")
            return {"success": False, "error": str(e)}


async def run_all_tests():
    """Run all pipeline tests"""
    tester = PipelineTester()
    
    tests = [
        ("Speech-to-Text", tester.test_stt),
        ("Emotion Recognition", tester.test_emotion_recognition),
        ("NLP Response Generation", tester.test_nlp_response),
        ("Text-to-Speech", tester.test_tts),
        ("Multilingual Support", tester.test_multilingual),
        ("Complete Pipeline", tester.test_complete_pipeline)
    ]
    
    results = {}
    passed = 0
    total = len(tests)
    
    logger.info(f"Running {total} tests...")
    logger.info("=" * 50)
    
    for test_name, test_func in tests:
        logger.info(f"\nRunning: {test_name}")
        logger.info("-" * 30)
        
        try:
            result = await test_func()
            results[test_name] = result
            
            if result["success"]:
                logger.info(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                logger.error(f"❌ {test_name}: FAILED - {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"❌ {test_name}: ERROR - {str(e)}")
            results[test_name] = {"success": False, "error": str(e)}
    
    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("TEST SUMMARY")
    logger.info("=" * 50)
    logger.info(f"Passed: {passed}/{total}")
    logger.info(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        logger.info("🎉 All tests passed! ManoMitra pipeline is ready.")
    else:
        logger.warning(f"⚠️  {total-passed} test(s) failed. Check the logs above.")
    
    return results


def main():
    """Main test function"""
    logger.info("ManoMitra Pipeline Test Suite")
    logger.info("=" * 50)
    
    # Run tests
    results = asyncio.run(run_all_tests())
    
    # Save results
    import json
    results_file = Path("./test_results.json")
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    logger.info(f"\nDetailed results saved to: {results_file}")


if __name__ == "__main__":
    main()