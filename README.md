# ManoMitra - Multilingual Emotional Conversational Agent

A deep learning-based conversational voice companion for emotional support with multilingual capabilities (English + Telugu).

## 🌟 Features

- **Real-time Speech Processing**: STT → Emotion Recognition → Empathetic Response → TTS
- **Multilingual Support**: English and Telugu language processing
- **Emotion-Aware Responses**: Context-aware empathetic conversation
- **Low-latency Pipeline**: Optimized for real-time interaction
- **Web-based Interface**: Modern, accessible user interface

## 🏗️ Architecture

```
Audio Input → STT → Emotion Recognition → NLP Context → Response Generation → TTS → Audio Output
     ↓           ↓           ↓              ↓              ↓               ↓
  WebRTC    Whisper    CNN/Transformer   mBERT/XLM-R    GPT/Custom    Coqui-TTS
```

## 📊 Datasets Used

### Telugu Datasets
- IITKGP-SESC (Telugu Speech Emotion)
- Kaggle Telugu Emotion Speech Dataset

### English Datasets
- MELD (Multimodal EmotionLines Dataset)
- CREMA-D (Crowdsourced Emotional Multimodal Actors Dataset)
- RAVDESS (Ryerson Audio-Visual Database of Emotional Speech and Song)
- TESS (Toronto Emotional Speech Set)
- IEMOCAP (Interactive Emotional Dyadic Motion Capture)

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+ (for frontend)
- CUDA-capable GPU (recommended)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd manomitra
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Download pre-trained models**
```bash
python scripts/download_models.py
```

5. **Start the application**
```bash
# Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
manomitra/
├── app/
│   ├── api/                 # FastAPI routes
│   ├── core/               # Core configuration
│   ├── models/             # ML model definitions
│   ├── services/           # Business logic services
│   └── main.py            # FastAPI application
├── data/
│   ├── raw/               # Raw datasets
│   ├── processed/         # Processed datasets
│   └── models/            # Trained model files
├── frontend/              # React.js frontend
├── notebooks/             # Jupyter notebooks for experimentation
├── scripts/               # Utility scripts
├── tests/                 # Test files
└── requirements.txt       # Python dependencies
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Model Paths
STT_MODEL_PATH=./data/models/whisper-base
EMOTION_MODEL_PATH=./data/models/emotion_classifier
TTS_MODEL_PATH=./data/models/tts_model

# Language Settings
SUPPORTED_LANGUAGES=en,te
DEFAULT_LANGUAGE=en

# Audio Settings
SAMPLE_RATE=16000
CHUNK_SIZE=1024
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/test_stt.py
pytest tests/test_emotion.py
pytest tests/test_tts.py
```

## 📈 Performance Metrics

- **Latency Target**: < 2 seconds end-to-end
- **Emotion Recognition Accuracy**: > 85% (English), > 75% (Telugu)
- **STT Word Error Rate**: < 10% (English), < 15% (Telugu)
- **TTS Naturalness Score**: > 4.0/5.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Telugu language datasets from IITKGP-SESC
- English emotion datasets from various research institutions
- Open-source ML frameworks and libraries

## 📞 Contact

For questions and support, please open an issue or contact the development team.