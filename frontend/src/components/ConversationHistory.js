import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Delete,
  Psychology,
  Person,
  AccessTime,
  EmojiEmotions
} from '@mui/icons-material';

const ConversationHistory = ({ messages, onExport, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = emotionFilter === 'all' || message.emotion === emotionFilter;
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    
    return matchesSearch && matchesEmotion && matchesType;
  });

  const uniqueEmotions = [...new Set(messages.map(m => m.emotion))];

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setDetailsOpen(true);
  };

  const exportFilteredMessages = () => {
    const exportData = {
      messages: filteredMessages,
      filters: { searchTerm, emotionFilter, typeFilter },
      exportDate: new Date().toISOString(),
      totalMessages: filteredMessages.length
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `manomitra-filtered-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Psychology sx={{ mr: 2, fontSize: 40 }} />
        Conversation History
      </Typography>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
          Search & Filter
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Emotion</InputLabel>
            <Select
              value={emotionFilter}
              label="Emotion"
              onChange={(e) => setEmotionFilter(e.target.value)}
            >
              <MenuItem value="all">All Emotions</MenuItem>
              {uniqueEmotions.map(emotion => (
                <MenuItem key={emotion} value={emotion}>
                  {getEmotionIcon(emotion)} {emotion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="speech">🎤 Speech</MenuItem>
              <MenuItem value="text">💬 Text</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportFilteredMessages}
            disabled={filteredMessages.length === 0}
          >
            Export Filtered
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onClear}
            disabled={messages.length === 0}
          >
            Clear All
          </Button>
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Showing {filteredMessages.length} of {messages.length} messages
        </Typography>
      </Paper>

      {/* Messages List */}
      <Paper elevation={3} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
        {filteredMessages.length === 0 ? (
          <Box textAlign="center" sx={{ py: 8 }}>
            <Psychology sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {messages.length === 0 ? 'No conversation history yet' : 'No messages match your filters'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {messages.length === 0 
                ? 'Start a conversation to see your history here'
                : 'Try adjusting your search terms or filters'
              }
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredMessages.map((message, index) => (
              <React.Fragment key={message.id}>
                <ListItem 
                  button 
                  onClick={() => handleMessageClick(message)}
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40,
                      bgcolor: message.sender === 'user' 
                        ? getEmotionColor(message.emotion) 
                        : '#f0f0f0',
                      fontSize: 18
                    }}>
                      {message.sender === 'user' ? (
                        <Person />
                      ) : (
                        getEmotionIcon(message.emotion)
                      )}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {message.sender === 'user' ? 'You' : 'ManoMitra'}
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          label={`${getEmotionIcon(message.emotion)} ${message.emotion}`}
                          sx={{ 
                            bgcolor: getEmotionColor(message.emotion) + '20',
                            fontSize: '0.7rem'
                          }}
                        />
                        
                        <Chip 
                          size="small" 
                          label={message.type === 'speech' ? '🎤' : '💬'}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {message.text.length > 150 
                            ? message.text.substring(0, 150) + '...' 
                            : message.text
                          }
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            {message.timestamp.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                
                {index < filteredMessages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Message Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ 
                  bgcolor: selectedMessage.sender === 'user' 
                    ? getEmotionColor(selectedMessage.emotion) 
                    : '#f0f0f0'
                }}>
                  {selectedMessage.sender === 'user' ? (
                    <Person />
                  ) : (
                    getEmotionIcon(selectedMessage.emotion)
                  )}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedMessage.sender === 'user' ? 'Your Message' : 'ManoMitra Response'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedMessage.timestamp.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  {selectedMessage.text}
                </Typography>
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip 
                    label={`Emotion: ${selectedMessage.emotion}`}
                    sx={{ 
                      bgcolor: getEmotionColor(selectedMessage.emotion) + '20',
                      color: getEmotionColor(selectedMessage.emotion)
                    }}
                    icon={<EmojiEmotions />}
                  />
                  
                  <Chip 
                    label={`Type: ${selectedMessage.type}`}
                    variant="outlined"
                  />
                  
                  <Chip 
                    label={`Sender: ${selectedMessage.sender}`}
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              {selectedMessage.sender === 'bot' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Response Context
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This response was generated based on the detected emotion "{selectedMessage.emotion}" 
                    and the conversational context at the time.
                  </Typography>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ConversationHistory;