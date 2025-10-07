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
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  Grid,
  Avatar,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Send,
  Psychology,
  Translate,
  Menu,
  Settings,
  History,
  Dashboard,
  Help,
  Brightness4,
  Brightness7,
  Clear,
  Download,
  Upload,
  Keyboard,
  Close,
  Pause,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';
import ConversationHistory from './components/ConversationHistory';
import WelcomeScreen from './components/WelcomeScreen';
import './App.css';

function App() {
  // Core states
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // UI states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [currentView, setCurrentView] = useState('chat');
  const [sessionStats, setSessionStats] = useState({
    totalMessages: 0,
    emotionsDetected: [],
    sessionDuration: 0
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Refs
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io('ws://localhost:8000/ws/conversation');
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      showSnackbar('Connected to ManoMitra successfully!');
      console.log('Connected to ManoMitra backend');
    });
    
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      showSnackbar('Disconnected from ManoMitra', 'error');
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

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update session stats
  useEffect(() => {
    setSessionStats(prev => ({
      ...prev,
      totalMessages: messages.filter(m => m.sender === 'user').length,
      emotionsDetected: [...new Set(messages.map(m => m.emotion))],
      sessionDuration: Math.floor((Date.now() - sessionStartTime.current) / 1000)
    }));
  }, [messages]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleBackendMessage = (message) => {
    switch (message.type) {
      case 'stt_result':
        addMessage('user', message.text, 'speech');
        break;
      case 'emotion_result':
        setCurrentEmotion(message.emotion);
        showSnackbar(`Emotion detected: ${message.emotion}`);
        break;
      case 'response_generated':
        addMessage('bot', message.text, 'text');
        break;
      case 'tts_result':
        if (audioEnabled) {
          playAudioResponse(message.audio);
        }
        setIsProcessing(false);
        break;
      case 'error':
        setError(message.message);
        showSnackbar(message.message, 'error');
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

  const sendTextMessage = () => {
    if (!textInput.trim()) return;
    
    const message = {
      type: 'text',
      text: textInput,
      language: language
    };
    
    socketRef.current.emit('message', JSON.stringify(message));
    addMessage('user', textInput, 'text');
    setTextInput('');
    setIsProcessing(true);
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentEmotion('neutral');
    sessionStartTime.current = Date.now();
    showSnackbar('Conversation cleared');
  };

  const exportConversation = () => {
    const conversationData = {
      messages,
      sessionStats,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(conversationData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `manomitra-conversation-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSnackbar('Conversation exported successfully!');
  };

  const handleStartChat = () => {
    setShowWelcome(false);
    setCurrentView('chat');
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

  // Show welcome screen first
  if (showWelcome) {
    return (
      <WelcomeScreen 
        onStartChat={handleStartChat}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        boxShadow: 3
      }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          
          <Psychology sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            ManoMitra
          </Typography>
          
          {/* Connection Status */}
          <Chip 
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
            sx={{ mr: 2 }}
          />
          
          {/* Current Emotion Badge */}
          <Tooltip title={`Current Emotion: ${currentEmotion}`}>
            <Chip
              label={`${getEmotionIcon(currentEmotion)} ${currentEmotion}`}
              sx={{ 
                bgcolor: getEmotionColor(currentEmotion) + '40',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
        {currentView === 'dashboard' ? (
          <Dashboard 
            sessionStats={sessionStats} 
            messages={messages} 
            currentEmotion={currentEmotion} 
          />
        ) : currentView === 'history' ? (
          <ConversationHistory 
            messages={messages}
            onClearHistory={clearConversation}
            onExportHistory={exportConversation}
          />
        ) : (
          <Grid container spacing={3}>
            {/* Chat Area */}
            <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Psychology sx={{ mr: 1 }} />
                    Conversation
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Switch to text mode">
                      <IconButton onClick={() => setTextMode(!textMode)} color={textMode ? 'primary' : 'default'}>
                        <Keyboard />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear conversation">
                      <IconButton onClick={clearConversation}>
                        <Clear />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export conversation">
                      <IconButton onClick={exportConversation}>
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ 
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: '#fafafa'
              }}>
                {messages.length === 0 ? (
                  <Box textAlign="center" sx={{ mt: 10 }}>
                    <Psychology sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Welcome to ManoMitra!
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Start a conversation by {textMode ? 'typing a message' : 'clicking the microphone button'} below
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {messages.map((message) => (
                      <Box
                        key={message.id}
                        className="message-container"
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Card sx={{ 
                          maxWidth: '75%',
                          bgcolor: message.sender === 'user' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : '#ffffff',
                          color: message.sender === 'user' ? 'white' : 'inherit',
                          borderRadius: 3,
                          boxShadow: 2,
                          border: message.sender === 'bot' ? `2px solid ${getEmotionColor(message.emotion)}40` : 'none'
                        }}>
                          <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Box display="flex" alignItems="center" mb={0.5}>
                              <Avatar sx={{ 
                                width: 24, 
                                height: 24, 
                                mr: 1,
                                bgcolor: message.sender === 'user' ? 'rgba(255,255,255,0.2)' : getEmotionColor(message.emotion),
                                fontSize: 12
                              }}>
                                {message.sender === 'user' ? '👤' : getEmotionIcon(message.emotion)}
                              </Avatar>
                              <Typography variant="caption" sx={{ 
                                opacity: 0.8,
                                fontWeight: 'bold'
                              }}>
                                {message.sender === 'user' ? 'You' : 'ManoMitra'}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {message.text}
                            </Typography>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {message.timestamp.toLocaleTimeString()} • {message.type}
                              </Typography>
                              {message.sender === 'bot' && (
                                <Chip 
                                  size="small" 
                                  label={message.emotion}
                                  sx={{ 
                                    bgcolor: getEmotionColor(message.emotion) + '20',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
                {textMode ? (
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type your message..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                      disabled={!isConnected || isProcessing}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={sendTextMessage}
                      disabled={!isConnected || isProcessing || !textInput.trim()}
                      sx={{ minWidth: 60 }}
                    >
                      <Send />
                    </Button>
                  </Box>
                ) : (
                  <Box textAlign="center">
                    {isProcessing && (
                      <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
                    )}
                    
                    <Fab
                      size="large"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!isConnected || isProcessing}
                      sx={{
                        background: isRecording 
                          ? 'linear-gradient(45deg, #f44336, #ff5722)'
                          : 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: isRecording 
                            ? 'linear-gradient(45deg, #d32f2f, #f44336)'
                            : 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                        },
                        ...(isRecording && { animation: 'pulse 1.5s infinite' })
                      }}
                    >
                      {isProcessing ? (
                        <CircularProgress size={28} color="inherit" />
                      ) : isRecording ? (
                        <Stop />
                      ) : (
                        <Mic />
                      )}
                    </Fab>
                    
                    <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                      {isProcessing 
                        ? 'Processing your message...' 
                        : isRecording 
                          ? 'Recording... Click to stop'
                          : 'Click to start recording'
                      }
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Language & Settings */}
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Translate sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Settings
                </Typography>
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={language}
                    label="Language"
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <MenuItem value="en">🇺🇸 English</MenuItem>
                    <MenuItem value="te">🇮🇳 తెలుగు (Telugu)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={audioEnabled}
                      onChange={(e) => setAudioEnabled(e.target.checked)}
                    />
                  }
                  label="Audio Responses"
                />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Voice Speed: {voiceSpeed}x
                  </Typography>
                  <Slider
                    value={voiceSpeed}
                    onChange={(e, value) => setVoiceSpeed(value)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    size="small"
                  />
                </Box>
              </Paper>

              {/* Session Stats */}
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Session Stats
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Messages:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {sessionStats.totalMessages}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Duration:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.floor(sessionStats.sessionDuration / 60)}m {sessionStats.sessionDuration % 60}s
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" gutterBottom>Emotions Detected:</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {sessionStats.emotionsDetected.map((emotion) => (
                        <Chip
                          key={emotion}
                          size="small"
                          label={`${getEmotionIcon(emotion)} ${emotion}`}
                          sx={{ 
                            bgcolor: getEmotionColor(emotion) + '20',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Quick Actions */}
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSettingsOpen(true)}
                    startIcon={<Settings />}
                  >
                    Advanced Settings
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setHelpOpen(true)}
                    startIcon={<Help />}
                  >
                    Help & Guide
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={exportConversation}
                    startIcon={<Download />}
                    disabled={messages.length === 0}
                  >
                    Export Chat
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
        )}
      </Container>

      {/* Navigation Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <Psychology sx={{ mr: 1 }} />
              ManoMitra
            </Typography>
            <Typography variant="caption">
              Multilingual Emotional AI
            </Typography>
          </Box>
          
          <List>
            <ListItem button onClick={() => { setCurrentView('chat'); setDrawerOpen(false); }}>
              <ListItemIcon><Psychology /></ListItemIcon>
              <ListItemText primary="Chat" />
            </ListItem>
            
            <ListItem button onClick={() => { setCurrentView('history'); setDrawerOpen(false); }}>
              <ListItemIcon><History /></ListItemIcon>
              <ListItemText primary="History" />
            </ListItem>
            
            <ListItem button onClick={() => { setCurrentView('dashboard'); setDrawerOpen(false); }}>
              <ListItemIcon><Dashboard /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            
            <Divider />
            
            <ListItem button onClick={() => { setSettingsOpen(true); setDrawerOpen(false); }}>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            
            <ListItem button onClick={() => { setHelpOpen(true); setDrawerOpen(false); }}>
              <ListItemIcon><Help /></ListItemIcon>
              <ListItemText primary="Help" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Advanced Settings
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Dark Mode"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                />
              }
              label="Enable Audio Responses"
              sx={{ mb: 2 }}
            />
            
            <Typography gutterBottom>Voice Speed</Typography>
            <Slider
              value={voiceSpeed}
              onChange={(e, value) => setVoiceSpeed(value)}
              min={0.5}
              max={2.0}
              step={0.1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />
            
            <Typography gutterBottom>Emotion Sensitivity</Typography>
            <Slider
              defaultValue={0.7}
              min={0.1}
              max={1.0}
              step={0.1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Help sx={{ mr: 1, verticalAlign: 'middle' }} />
          Help & Guide
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>How to use ManoMitra:</Typography>
          
          <Typography variant="body2" paragraph>
            <strong>1. Voice Interaction:</strong> Click the microphone button to start recording your voice. 
            ManoMitra will detect your emotion and respond empathetically.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>2. Text Interaction:</strong> Click the keyboard icon to switch to text mode and type your messages.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>3. Language Support:</strong> Switch between English and Telugu using the language selector.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>4. Emotion Recognition:</strong> The system automatically detects emotions from your voice 
            and provides contextually appropriate responses.
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Supported Emotions:</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'].map(emotion => (
              <Chip
                key={emotion}
                label={`${getEmotionIcon(emotion)} ${emotion}`}
                sx={{ bgcolor: getEmotionColor(emotion) + '20' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 1000 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default App;