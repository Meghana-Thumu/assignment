import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import {
  Psychology,
  Mic,
  Translate,
  Mood,
  VolumeUp,
  Chat,
  TrendingUp
} from '@mui/icons-material';

const WelcomeScreen = ({ onStartChat, language, setLanguage }) => {
  const features = [
    {
      icon: <Psychology />,
      title: 'Emotion Recognition',
      description: 'Advanced AI detects emotions from your voice and responds empathetically'
    },
    {
      icon: <Translate />,
      title: 'Multilingual Support',
      description: 'Seamlessly switch between English and Telugu languages'
    },
    {
      icon: <VolumeUp />,
      title: 'Voice Interaction',
      description: 'Natural voice conversations with real-time speech processing'
    },
    {
      icon: <Chat />,
      title: 'Contextual Responses',
      description: 'AI remembers conversation context for meaningful interactions'
    }
  ];

  const emotions = [
    { name: 'Happy', icon: '😊', color: '#4CAF50' },
    { name: 'Sad', icon: '😢', color: '#2196F3' },
    { name: 'Angry', icon: '😠', color: '#F44336' },
    { name: 'Fear', icon: '😰', color: '#FF9800' },
    { name: 'Surprise', icon: '😲', color: '#9C27B0' },
    { name: 'Neutral', icon: '😐', color: '#607D8B' }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1200, width: '100%' }}>
        {/* Hero Section */}
        <Paper elevation={6} sx={{ 
          p: 6, 
          borderRadius: 4, 
          textAlign: 'center', 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <Psychology sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Welcome to ManoMitra
          </Typography>
          
          <Typography variant="h5" color="textSecondary" paragraph sx={{ mb: 4 }}>
            Your Multilingual Emotional Voice Companion
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mb: 4,
            fontSize: '1.1rem'
          }}>
            Experience the future of conversational AI with real-time emotion recognition, 
            empathetic responses, and seamless multilingual support. ManoMitra understands 
            not just what you say, but how you feel.
          </Typography>

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={onStartChat}
              startIcon={<Mic />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                }
              }}
            >
              Start Voice Chat
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={onStartChat}
              startIcon={<Chat />}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a67d8',
                  color: '#5a67d8',
                  bgcolor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              Start Text Chat
            </Button>
          </Box>

          {/* Language Selection */}
          <Box display="flex" gap={1} justifyContent="center" alignItems="center">
            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
              Choose your language:
            </Typography>
            <Chip
              label="🇺🇸 English"
              onClick={() => setLanguage('en')}
              variant={language === 'en' ? 'filled' : 'outlined'}
              color={language === 'en' ? 'primary' : 'default'}
              clickable
            />
            <Chip
              label="🇮🇳 తెలుగు"
              onClick={() => setLanguage('te')}
              variant={language === 'te' ? 'filled' : 'outlined'}
              color={language === 'te' ? 'primary' : 'default'}
              clickable
            />
          </Box>
        </Paper>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Supported Emotions */}
        <Paper elevation={4} sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="h5" textAlign="center" gutterBottom fontWeight="bold">
            Supported Emotions
          </Typography>
          <Typography variant="body2" textAlign="center" color="textSecondary" paragraph>
            ManoMitra can detect and respond to a wide range of human emotions
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" sx={{ mt: 3 }}>
            {emotions.map((emotion) => (
              <Chip
                key={emotion.name}
                label={`${emotion.icon} ${emotion.name}`}
                sx={{
                  bgcolor: emotion.color + '20',
                  border: `2px solid ${emotion.color}40`,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  py: 2,
                  px: 1,
                  '&:hover': {
                    bgcolor: emotion.color + '30',
                    transform: 'scale(1.05)'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Footer */}
        <Box textAlign="center" sx={{ mt: 4, color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Powered by Deep Learning • Real-time Processing • Privacy Focused
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;