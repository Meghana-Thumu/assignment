#!/usr/bin/env python3
"""
Script to download and setup pre-trained models for ManoMitra
"""

import os
import sys
import logging
from pathlib import Path
import requests
from tqdm import tqdm
import whisper

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def download_file(url: str, destination: Path, description: str = ""):
    """Download file with progress bar"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        
        with open(destination, 'wb') as file, tqdm(
            desc=description,
            total=total_size,
            unit='B',
            unit_scale=True,
            unit_divisor=1024,
        ) as pbar:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    file.write(chunk)
                    pbar.update(len(chunk))
        
        logger.info(f"Downloaded {description} to {destination}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to download {description}: {str(e)}")
        return False


def setup_directories():
    """Create necessary directories"""
    directories = [
        Path(settings.STT_MODEL_PATH).parent,
        Path(settings.EMOTION_MODEL_PATH).parent,
        Path(settings.TTS_MODEL_PATH).parent,
        Path(settings.NLP_MODEL_PATH).parent,
        Path("./data/raw"),
        Path("./data/processed"),
        Path("./logs")
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {directory}")


def download_whisper_model():
    """Download Whisper STT model"""
    try:
        logger.info(f"Downloading Whisper model: {settings.WHISPER_MODEL_SIZE}")
        model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
        logger.info("Whisper model downloaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to download Whisper model: {str(e)}")
        return False


def download_sample_datasets():
    """Download sample datasets for training/testing"""
    # This would download sample datasets
    # For now, we'll create placeholder files
    
    datasets_info = {
        "english_emotions.txt": "Sample English emotion dataset info",
        "telugu_emotions.txt": "Sample Telugu emotion dataset info",
        "dataset_info.md": """# Dataset Information

## English Datasets
- MELD (Multimodal EmotionLines Dataset)
- CREMA-D (Crowdsourced Emotional Multimodal Actors Dataset)
- RAVDESS (Ryerson Audio-Visual Database of Emotional Speech and Song)
- TESS (Toronto Emotional Speech Set)
- IEMOCAP (Interactive Emotional Dyadic Motion Capture)

## Telugu Datasets
- IITKGP-SESC (Telugu Speech Emotion)
- Kaggle Telugu Emotion Speech Dataset

## Usage
Place your dataset files in the appropriate subdirectories:
- `data/raw/english/` for English datasets
- `data/raw/telugu/` for Telugu datasets
"""
    }
    
    raw_data_dir = Path("./data/raw")
    for filename, content in datasets_info.items():
        file_path = raw_data_dir / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        logger.info(f"Created dataset info file: {file_path}")


def create_model_placeholders():
    """Create placeholder model files"""
    model_info = {
        settings.EMOTION_MODEL_PATH: "Emotion classification model placeholder",
        settings.TTS_MODEL_PATH: "TTS model placeholder",
        settings.NLP_MODEL_PATH: "NLP model placeholder"
    }
    
    for model_path, description in model_info.items():
        model_dir = Path(model_path)
        model_dir.mkdir(parents=True, exist_ok=True)
        
        info_file = model_dir / "model_info.txt"
        with open(info_file, 'w') as f:
            f.write(f"{description}\n")
            f.write(f"Created: {Path(__file__).name}\n")
            f.write("Replace this with actual trained model files.\n")
        
        logger.info(f"Created model placeholder: {model_dir}")


def main():
    """Main function to download all models"""
    logger.info("Starting ManoMitra model setup...")
    
    # Setup directories
    setup_directories()
    
    # Download Whisper model
    if not download_whisper_model():
        logger.error("Failed to download Whisper model")
        return False
    
    # Download sample datasets info
    download_sample_datasets()
    
    # Create model placeholders
    create_model_placeholders()
    
    logger.info("Model setup completed successfully!")
    logger.info("Next steps:")
    logger.info("1. Train emotion classification models using your datasets")
    logger.info("2. Fine-tune TTS models for Telugu language")
    logger.info("3. Configure NLP models for empathetic responses")
    logger.info("4. Test the complete pipeline")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)