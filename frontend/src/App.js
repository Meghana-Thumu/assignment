import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  Send,
  Psychology,
  Translate
} from '@mui/icons-material';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io('ws://localhost:8000/ws/conversation');
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to ManoMitra backend');
    });
    
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from backend');
    });
    
    // Handle different message types from backend
    socketRef.current.on('message', (data) => {
      const message = JSON.parse(data);
      handleBackendMessage(message);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleBackendMessage = (message) => {
    switch (message.type) {
      case 'stt_result':
        addMessage('user', message.text, 'speech');
        break;
      case 'emotion_result':
        setCurrentEmotion(message.emotion);
        break;
      case 'response_generated':
        addMessage('bot', message.text, 'text');
        break;
      case 'tts_result':
        playAudioResponse(message.audio);
        setIsProcessing(false);
        break;
      case 'error':
        setError(message.message);
        setIsProcessing(false);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const addMessage = (sender, text, type = 'text') => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      type,
      timestamp: new Date(),
      emotion: sender === 'user' ? currentEmotion : 'empathetic'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];
        
        const message = {
          type: 'audio',
          audio: base64Audio,
          language: language
        };
        
        socketRef.current.emit('message', JSON.stringify(message));
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      setError('Failed to process audio');
      console.error('Error sending audio:', err);
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (base64Audio) => {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    } catch (err) {
      console.error('Error processing audio response:', err);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#4CAF50',
      sad: '#2196F3',
      angry: '#F44336',
      fear: '#FF9800',
      surprise: '#9C27B0',
      disgust: '#795548',
      neutral: '#607D8B',
      empathetic: '#E91E63'
    };
    return colors[emotion] || colors.neutral;
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fear: '😰',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐',
      empathetic: '🤗'
    };
    return icons[emotion] || icons.neutral;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            <Psychology sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
            ManoMitra
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Your Multilingual Emotional Voice Companion
          </Typography>
          
          {/* Connection Status */}
          <Chip 
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Language Selection */}
        <Box mb={3}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
              startAdornment={<Translate sx={{ mr: 1 }} />}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Current Emotion Display */}
        <Card sx={{ mb: 3, bgcolor: getEmotionColor(currentEmotion) + '20' }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6">
              Current Emotion: {getEmotionIcon(currentEmotion)} {currentEmotion}
            </Typography>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Messages */}
        <Box sx={{ 
          height: 400, 
          overflowY: 'auto', 
          border: '1px solid #e0e0e0', 
          borderRadius: 2, 
          p: 2, 
          mb: 3,
          bgcolor: '#fafafa'
        }}>
          {messages.length === 0 ? (
            <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mt: 10 }}>
              Start a conversation by clicking the microphone button below
            </Typography>
          ) : (
            messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Card sx={{ 
                  maxWidth: '70%',
                  bgcolor: message.sender === 'user' ? '#e3f2fd' : '#f3e5f5',
                  borderLeft: `4px solid ${getEmotionColor(message.emotion)}`
                }}>
                  <CardContent sx={{ py: 1, px: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      {getEmotionIcon(message.emotion)} {message.text}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {message.timestamp.toLocaleTimeString()} • {message.type}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>

        {/* Controls */}
        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected || isProcessing}
            sx={{
              minWidth: 200,
              height: 60,
              borderRadius: 30,
              fontSize: 18,
              background: isRecording 
                ? 'linear-gradient(45deg, #f44336, #ff5722)'
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: isRecording 
                  ? 'linear-gradient(45deg, #d32f2f, #f44336)'
                  : 'linear-gradient(45deg, #5a67d8, #6b46c1)',
              }
            }}
            startIcon={
              isProcessing ? (
                <CircularProgress size={24} color="inherit" />
              ) : isRecording ? (
                <MicOff />
              ) : (
                <Mic />
              )
            }
          >
            {isProcessing 
              ? 'Processing...' 
              : isRecording 
                ? 'Stop Recording' 
                : 'Start Recording'
            }
          </Button>
        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={3}>
          <Typography variant="caption" color="textSecondary">
            Powered by Deep Learning • Supports English & Telugu • Real-time Emotion Recognition
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;