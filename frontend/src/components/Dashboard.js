import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  AccessTime,
  EmojiEmotions,
  Chat,
  Language
} from '@mui/icons-material';

const Dashboard = ({ sessionStats, messages, currentEmotion }) => {
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

  const emotionStats = messages.reduce((acc, msg) => {
    if (msg.sender === 'user' && msg.emotion) {
      acc[msg.emotion] = (acc[msg.emotion] || 0) + 1;
    }
    return acc;
  }, {});

  const totalEmotions = Object.values(emotionStats).reduce((a, b) => a + b, 0);

  const recentMessages = messages.slice(-5);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Psychology sx={{ mr: 2, fontSize: 40 }} />
        ManoMitra Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Chat sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {sessionStats.totalMessages}
              </Typography>
              <Typography variant="body2">
                Total Messages
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTime sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {Math.floor(sessionStats.sessionDuration / 60)}m
              </Typography>
              <Typography variant="body2">
                Session Duration
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEmotions sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {sessionStats.emotionsDetected.length}
              </Typography>
              <Typography variant="body2">
                Emotions Detected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Language sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                2
              </Typography>
              <Typography variant="body2">
                Languages Supported
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Emotion */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Current Emotional State
            </Typography>
            <Box textAlign="center" sx={{ py: 4 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                bgcolor: getEmotionColor(currentEmotion),
                fontSize: 40
              }}>
                {getEmotionIcon(currentEmotion)}
              </Avatar>
              <Typography variant="h4" gutterBottom sx={{ textTransform: 'capitalize' }}>
                {currentEmotion}
              </Typography>
              <Chip 
                label="Current State"
                sx={{ 
                  bgcolor: getEmotionColor(currentEmotion) + '20',
                  color: getEmotionColor(currentEmotion),
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Emotion Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Emotion Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(emotionStats).map(([emotion, count]) => {
                const percentage = totalEmotions > 0 ? (count / totalEmotions) * 100 : 0;
                return (
                  <Box key={emotion} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        {getEmotionIcon(emotion)} {emotion}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={percentage}
                      sx={{ 
                        height: 8,
                        borderRadius: 4,
                        bgcolor: getEmotionColor(emotion) + '20',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getEmotionColor(emotion)
                        }
                      }}
                    />
                  </Box>
                );
              })}
              {totalEmotions === 0 && (
                <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                  No emotions detected yet. Start a conversation to see your emotional patterns.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {recentMessages.length > 0 ? (
              <List>
                {recentMessages.map((message, index) => (
                  <ListItem key={message.id} divider={index < recentMessages.length - 1}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: message.sender === 'user' ? getEmotionColor(message.emotion) : '#f0f0f0',
                        fontSize: 16
                      }}>
                        {message.sender === 'user' ? getEmotionIcon(message.emotion) : '🤖'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {message.sender === 'user' ? 'You' : 'ManoMitra'}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={message.emotion}
                            sx={{ 
                              bgcolor: getEmotionColor(message.emotion) + '20',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {message.text.length > 100 ? message.text.substring(0, 100) + '...' : message.text}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {message.timestamp.toLocaleString()} • {message.type}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                No recent activity. Start a conversation to see your history here.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Session Insights */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {sessionStats.emotionsDetected.includes('happy') ? 'Positive' : 'Neutral'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Overall Mood Trend
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Psychology sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {sessionStats.totalMessages > 5 ? 'Active' : 'Getting Started'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Engagement Level
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <EmojiEmotions sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {sessionStats.emotionsDetected.length > 3 ? 'Varied' : 'Stable'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Emotional Range
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;