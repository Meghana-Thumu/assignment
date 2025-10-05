"""
Emotion classification model for speech emotion recognition
Supports both English and Telugu languages
"""

import logging
import numpy as np
import librosa
import torch
import torch.nn as nn
from typing import Dict, Any, List, Optional
from pathlib import Path
import joblib

logger = logging.getLogger(__name__)


class EmotionClassifier:
    """
    Multi-class emotion classifier for speech audio
    Supports: happy, sad, angry, fear, surprise, disgust, neutral
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.emotions = [
            "neutral", "happy", "sad", "angry", 
            "fear", "surprise", "disgust"
        ]
        self.model = None
        self.scaler = None
        self.sample_rate = 16000
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
        else:
            logger.warning("No pre-trained model found. Using rule-based classifier.")
            self.model = None
    
    def extract_features(self, audio: np.ndarray) -> np.ndarray:
        """
        Extract audio features for emotion classification
        
        Args:
            audio: Audio signal as numpy array
            
        Returns:
            Feature vector
        """
        features = []
        
        try:
            # MFCC features (13 coefficients)
            mfccs = librosa.feature.mfcc(
                y=audio, sr=self.sample_rate, n_mfcc=13
            )
            features.extend([
                np.mean(mfccs, axis=1),
                np.std(mfccs, axis=1),
                np.max(mfccs, axis=1),
                np.min(mfccs, axis=1)
            ])
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(
                y=audio, sr=self.sample_rate
            )
            features.append([
                np.mean(spectral_centroids),
                np.std(spectral_centroids)
            ])
            
            # Spectral rolloff
            spectral_rolloff = librosa.feature.spectral_rolloff(
                y=audio, sr=self.sample_rate
            )
            features.append([
                np.mean(spectral_rolloff),
                np.std(spectral_rolloff)
            ])
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(audio)
            features.append([
                np.mean(zcr),
                np.std(zcr)
            ])
            
            # Chroma features
            chroma = librosa.feature.chroma_stft(y=audio, sr=self.sample_rate)
            features.extend([
                np.mean(chroma, axis=1),
                np.std(chroma, axis=1)
            ])
            
            # Tempo
            tempo, _ = librosa.beat.beat_track(y=audio, sr=self.sample_rate)
            features.append([tempo])
            
            # Flatten all features
            feature_vector = np.concatenate([
                np.array(f).flatten() for f in features
            ])
            
            return feature_vector
            
        except Exception as e:
            logger.error(f"Feature extraction error: {str(e)}")
            # Return zero vector if extraction fails
            return np.zeros(100)  # Default feature size
    
    def predict(self, audio: np.ndarray) -> Dict[str, Any]:
        """
        Predict emotion from audio
        
        Args:
            audio: Audio signal as numpy array
            
        Returns:
            Dictionary with emotion prediction and confidence
        """
        try:
            # Extract features
            features = self.extract_features(audio)
            
            if self.model is not None:
                # Use trained model
                return self._predict_with_model(features)
            else:
                # Use rule-based approach
                return self._predict_rule_based(audio, features)
                
        except Exception as e:
            logger.error(f"Emotion prediction error: {str(e)}")
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "probabilities": {emotion: 0.0 for emotion in self.emotions},
                "error": str(e)
            }
    
    def _predict_with_model(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict using trained ML model"""
        try:
            # Normalize features if scaler is available
            if self.scaler:
                features = self.scaler.transform(features.reshape(1, -1))
            else:
                features = features.reshape(1, -1)
            
            # Get prediction
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(features)[0]
                predicted_idx = np.argmax(probabilities)
            else:
                # For neural networks
                with torch.no_grad():
                    features_tensor = torch.FloatTensor(features)
                    outputs = self.model(features_tensor)
                    probabilities = torch.softmax(outputs, dim=1).numpy()[0]
                    predicted_idx = np.argmax(probabilities)
            
            emotion = self.emotions[predicted_idx]
            confidence = probabilities[predicted_idx]
            
            prob_dict = {
                self.emotions[i]: float(probabilities[i]) 
                for i in range(len(self.emotions))
            }
            
            return {
                "emotion": emotion,
                "confidence": float(confidence),
                "probabilities": prob_dict
            }
            
        except Exception as e:
            logger.error(f"Model prediction error: {str(e)}")
            return self._predict_rule_based(None, features)
    
    def _predict_rule_based(
        self, 
        audio: Optional[np.ndarray], 
        features: np.ndarray
    ) -> Dict[str, Any]:
        """
        Rule-based emotion prediction using audio characteristics
        This is a fallback when no trained model is available
        """
        try:
            # Simple heuristic-based emotion detection
            # This is a placeholder - in practice, you'd want more sophisticated rules
            
            if audio is not None:
                # Energy-based features
                energy = np.sum(audio ** 2) / len(audio)
                
                # Pitch variation
                pitches, magnitudes = librosa.piptrack(y=audio, sr=self.sample_rate)
                pitch_values = pitches[magnitudes > np.percentile(magnitudes, 85)]
                pitch_variation = np.std(pitch_values) if len(pitch_values) > 0 else 0
                
                # Speaking rate (approximate)
                zcr = librosa.feature.zero_crossing_rate(audio)
                speaking_rate = np.mean(zcr)
                
                # Simple rules
                if energy > 0.01 and pitch_variation > 50:
                    emotion = "happy" if speaking_rate > 0.1 else "angry"
                    confidence = 0.7
                elif energy < 0.005:
                    emotion = "sad"
                    confidence = 0.6
                elif pitch_variation > 100:
                    emotion = "surprise"
                    confidence = 0.65
                else:
                    emotion = "neutral"
                    confidence = 0.5
            else:
                # Fallback to neutral if no audio
                emotion = "neutral"
                confidence = 0.5
            
            # Create probability distribution
            probabilities = {e: 0.1 for e in self.emotions}
            probabilities[emotion] = confidence
            
            # Normalize probabilities
            total = sum(probabilities.values())
            probabilities = {k: v/total for k, v in probabilities.items()}
            
            return {
                "emotion": emotion,
                "confidence": confidence,
                "probabilities": probabilities
            }
            
        except Exception as e:
            logger.error(f"Rule-based prediction error: {str(e)}")
            return {
                "emotion": "neutral",
                "confidence": 0.0,
                "probabilities": {emotion: 1.0/len(self.emotions) 
                               for emotion in self.emotions}
            }
    
    def load_model(self, model_path: str):
        """Load pre-trained emotion classification model"""
        try:
            model_path = Path(model_path)
            
            # Try to load scikit-learn model
            if (model_path / "emotion_model.pkl").exists():
                self.model = joblib.load(model_path / "emotion_model.pkl")
                logger.info("Loaded scikit-learn emotion model")
                
                # Load scaler if available
                scaler_path = model_path / "feature_scaler.pkl"
                if scaler_path.exists():
                    self.scaler = joblib.load(scaler_path)
                    logger.info("Loaded feature scaler")
            
            # Try to load PyTorch model
            elif (model_path / "emotion_model.pth").exists():
                # Load PyTorch model (you'd need to define the architecture)
                # self.model = torch.load(model_path / "emotion_model.pth")
                # self.model.eval()
                logger.warning("PyTorch model loading not implemented yet")
                
            else:
                logger.warning(f"No valid model found in {model_path}")
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.model = None
    
    def save_model(self, model_path: str):
        """Save trained model"""
        try:
            model_path = Path(model_path)
            model_path.mkdir(parents=True, exist_ok=True)
            
            if self.model is not None:
                # Save scikit-learn model
                if hasattr(self.model, 'fit'):
                    joblib.dump(self.model, model_path / "emotion_model.pkl")
                    
                    if self.scaler:
                        joblib.dump(self.scaler, model_path / "feature_scaler.pkl")
                    
                    logger.info(f"Model saved to {model_path}")
                
                # Save PyTorch model
                elif hasattr(self.model, 'state_dict'):
                    torch.save(self.model.state_dict(), model_path / "emotion_model.pth")
                    logger.info(f"PyTorch model saved to {model_path}")
                    
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")


class EmotionCNN(nn.Module):
    """
    Convolutional Neural Network for emotion classification
    Can be used as an alternative to traditional ML models
    """
    
    def __init__(self, input_size: int, num_classes: int = 7):
        super(EmotionCNN, self).__init__()
        
        self.conv1 = nn.Conv1d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
        
        self.pool = nn.MaxPool1d(2)
        self.dropout = nn.Dropout(0.3)
        
        # Calculate the size after convolutions and pooling
        conv_output_size = input_size // 8 * 128  # Rough estimation
        
        self.fc1 = nn.Linear(conv_output_size, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, num_classes)
        
        self.relu = nn.ReLU()
        
    def forward(self, x):
        # Reshape for conv1d: (batch_size, channels, sequence_length)
        x = x.unsqueeze(1)
        
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = self.pool(self.relu(self.conv3(x)))
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        x = self.dropout(self.relu(self.fc1(x)))
        x = self.dropout(self.relu(self.fc2(x)))
        x = self.fc3(x)
        
        return x