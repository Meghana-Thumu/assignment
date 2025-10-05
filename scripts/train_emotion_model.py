#!/usr/bin/env python3
"""
Script to train emotion classification model for ManoMitra
Supports both English and Telugu datasets
"""

import os
import sys
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import joblib
import librosa
from tqdm import tqdm

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.models.emotion_classifier import EmotionClassifier
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmotionModelTrainer:
    """Trainer for emotion classification models"""
    
    def __init__(self):
        self.emotions = ["neutral", "happy", "sad", "angry", "fear", "surprise", "disgust"]
        self.classifier = EmotionClassifier()
        self.scaler = StandardScaler()
        
    def load_dataset(self, dataset_path: str, language: str = "en") -> tuple:
        """
        Load emotion dataset from directory structure
        Expected structure:
        dataset_path/
        ├── emotion1/
        │   ├── audio1.wav
        │   └── audio2.wav
        └── emotion2/
            ├── audio3.wav
            └── audio4.wav
        """
        features = []
        labels = []
        
        dataset_path = Path(dataset_path)
        
        if not dataset_path.exists():
            logger.error(f"Dataset path does not exist: {dataset_path}")
            return np.array([]), np.array([])
        
        logger.info(f"Loading {language} dataset from {dataset_path}")
        
        # Process each emotion directory
        for emotion_dir in dataset_path.iterdir():
            if not emotion_dir.is_dir():
                continue
                
            emotion = emotion_dir.name.lower()
            if emotion not in self.emotions:
                logger.warning(f"Unknown emotion: {emotion}, skipping...")
                continue
            
            logger.info(f"Processing {emotion} samples...")
            
            # Process audio files in emotion directory
            audio_files = list(emotion_dir.glob("*.wav")) + list(emotion_dir.glob("*.mp3"))
            
            for audio_file in tqdm(audio_files, desc=f"Processing {emotion}"):
                try:
                    # Load audio
                    audio, sr = librosa.load(audio_file, sr=settings.SAMPLE_RATE)
                    
                    # Extract features
                    feature_vector = self.classifier.extract_features(audio)
                    
                    features.append(feature_vector)
                    labels.append(emotion)
                    
                except Exception as e:
                    logger.warning(f"Error processing {audio_file}: {str(e)}")
                    continue
        
        logger.info(f"Loaded {len(features)} samples for {language}")
        return np.array(features), np.array(labels)
    
    def train_model(self, X_train, y_train, X_test, y_test):
        """Train emotion classification model"""
        logger.info("Training emotion classification model...")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest classifier
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        train_score = model.score(X_train_scaled, y_train)
        test_score = model.score(X_test_scaled, y_test)
        
        logger.info(f"Training accuracy: {train_score:.3f}")
        logger.info(f"Testing accuracy: {test_score:.3f}")
        
        # Predictions for detailed evaluation
        y_pred = model.predict(X_test_scaled)
        
        # Classification report
        logger.info("Classification Report:")
        logger.info("\n" + classification_report(y_test, y_pred))
        
        return model
    
    def save_model(self, model, model_path: str):
        """Save trained model and scaler"""
        model_path = Path(model_path)
        model_path.mkdir(parents=True, exist_ok=True)
        
        # Save model
        joblib.dump(model, model_path / "emotion_model.pkl")
        
        # Save scaler
        joblib.dump(self.scaler, model_path / "feature_scaler.pkl")
        
        # Save emotion labels
        joblib.dump(self.emotions, model_path / "emotion_labels.pkl")
        
        logger.info(f"Model saved to {model_path}")
    
    def create_sample_dataset(self, output_path: str):
        """Create sample dataset for testing"""
        output_path = Path(output_path)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Create sample data info
        sample_info = """# Sample Dataset for Emotion Classification

This directory should contain audio files organized by emotion:

```
dataset/
├── neutral/
│   ├── neutral_001.wav
│   └── neutral_002.wav
├── happy/
│   ├── happy_001.wav
│   └── happy_002.wav
├── sad/
│   ├── sad_001.wav
│   └── sad_002.wav
├── angry/
│   ├── angry_001.wav
│   └── angry_002.wav
├── fear/
│   ├── fear_001.wav
│   └── fear_002.wav
├── surprise/
│   ├── surprise_001.wav
│   └── surprise_002.wav
└── disgust/
    ├── disgust_001.wav
    └── disgust_002.wav
```

## Supported Formats
- WAV (recommended)
- MP3

## Audio Requirements
- Sample rate: 16kHz (will be resampled if different)
- Duration: 1-10 seconds per sample
- Quality: Clear speech with minimal background noise

## Dataset Sources
- RAVDESS: https://zenodo.org/record/1188976
- CREMA-D: https://github.com/CheyneyComputerScience/CREMA-D
- TESS: https://tspace.library.utoronto.ca/handle/1807/24487
- Telugu datasets: Contact research institutions
"""
        
        with open(output_path / "README.md", 'w') as f:
            f.write(sample_info)
        
        # Create emotion directories
        for emotion in self.emotions:
            emotion_dir = output_path / emotion
            emotion_dir.mkdir(exist_ok=True)
            
            # Create placeholder file
            with open(emotion_dir / "place_audio_files_here.txt", 'w') as f:
                f.write(f"Place {emotion} emotion audio files in this directory\n")
        
        logger.info(f"Sample dataset structure created at {output_path}")


def main():
    """Main training function"""
    trainer = EmotionModelTrainer()
    
    # Check for datasets
    english_dataset = Path("./data/raw/english")
    telugu_dataset = Path("./data/raw/telugu")
    
    if not english_dataset.exists() and not telugu_dataset.exists():
        logger.info("No datasets found. Creating sample dataset structure...")
        trainer.create_sample_dataset("./data/raw/english")
        trainer.create_sample_dataset("./data/raw/telugu")
        logger.info("Please add your audio files to the created directories and run again.")
        return
    
    all_features = []
    all_labels = []
    
    # Load English dataset
    if english_dataset.exists():
        en_features, en_labels = trainer.load_dataset(english_dataset, "en")
        if len(en_features) > 0:
            all_features.extend(en_features)
            all_labels.extend(en_labels)
    
    # Load Telugu dataset
    if telugu_dataset.exists():
        te_features, te_labels = trainer.load_dataset(telugu_dataset, "te")
        if len(te_features) > 0:
            all_features.extend(te_features)
            all_labels.extend(te_labels)
    
    if len(all_features) == 0:
        logger.error("No valid samples found in datasets")
        return
    
    # Convert to numpy arrays
    X = np.array(all_features)
    y = np.array(all_labels)
    
    logger.info(f"Total samples: {len(X)}")
    logger.info(f"Feature dimension: {X.shape[1]}")
    logger.info(f"Emotion distribution: {np.unique(y, return_counts=True)}")
    
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train model
    model = trainer.train_model(X_train, y_train, X_test, y_test)
    
    # Save model
    trainer.save_model(model, settings.EMOTION_MODEL_PATH)
    
    logger.info("Emotion model training completed!")


if __name__ == "__main__":
    main()