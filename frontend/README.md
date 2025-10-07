# ManoMitra Frontend - Enhanced UI

A modern, responsive React.js frontend for the ManoMitra multilingual emotional conversational agent.

## 🎨 UI Features

### 🌟 **Welcome Screen**
- Beautiful gradient background with glass morphism effects
- Interactive language selection (English/Telugu)
- Feature showcase with hover animations
- Emotion support overview
- Call-to-action buttons for voice and text chat

### 💬 **Chat Interface**
- **Modern Chat UI**: Bubble-style messages with emotion indicators
- **Real-time Voice Recording**: Animated FAB with pulse effects during recording
- **Text Mode Toggle**: Switch between voice and text input seamlessly
- **Progress Indicators**: Visual feedback during processing
- **Auto-scroll**: Messages automatically scroll to bottom
- **Message Metadata**: Timestamps, message types, and emotion tags

### 📊 **Dashboard View**
- **Key Metrics Cards**: Total messages, session duration, emotions detected
- **Emotion Distribution**: Visual breakdown with progress bars
- **Recent Messages**: Quick overview of conversation history
- **Emotion Timeline**: Chronological emotion tracking with chips
- **Real-time Stats**: Live updates as conversation progresses

### 📚 **Conversation History**
- **Session Grouping**: Messages organized by date
- **Search & Filter**: Find specific messages or filter by emotion
- **Message Details**: Expandable view with full metadata
- **Export Functionality**: Download conversation history as JSON
- **Bulk Actions**: Clear history, export all conversations

### ⚙️ **Settings & Configuration**
- **Language Selection**: Easy switching between English and Telugu
- **Audio Controls**: Toggle audio responses, adjust voice speed
- **Advanced Settings**: Dark mode, emotion sensitivity tuning
- **Accessibility**: Reduced motion support, keyboard navigation

### 🎯 **Navigation & Layout**
- **App Bar**: Connection status, current emotion indicator
- **Side Navigation**: Drawer with quick access to all features
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Grid Layout**: Flexible layout that adapts to screen size

## 🎨 Design System

### **Color Palette**
- **Primary**: Linear gradient (#667eea → #764ba2)
- **Emotions**: Color-coded system for each emotion type
- **Backgrounds**: Glass morphism with backdrop blur effects
- **Text**: High contrast for accessibility

### **Typography**
- **Headings**: Bold, gradient text effects
- **Body**: Clean, readable font stack
- **Captions**: Subtle, informative secondary text

### **Animations**
- **Pulse Effect**: Recording indicator animation
- **Slide In**: Message appearance animation
- **Hover Effects**: Interactive element feedback
- **Glow Effects**: Emotion indicator highlighting
- **Fade Transitions**: Smooth state changes

## 📱 Responsive Features

### **Mobile (< 768px)**
- Stacked layout for better mobile experience
- Touch-optimized controls and buttons
- Simplified navigation with drawer menu
- Optimized message bubbles for small screens

### **Tablet (768px - 1024px)**
- Balanced two-column layout
- Sidebar panels stack on smaller tablets
- Touch-friendly interaction areas

### **Desktop (> 1024px)**
- Full three-column layout with sidebar
- Hover effects and detailed tooltips
- Keyboard shortcuts support
- Multi-panel view for power users

## ♿ Accessibility Features

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: WCAG AA compliant color ratios
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Clear focus indicators
- **Screen Reader**: Semantic HTML structure

## 🔧 Technical Implementation

### **State Management**
- React Hooks for local state
- Context for global settings
- Real-time WebSocket integration
- Persistent settings in localStorage

### **Performance Optimizations**
- Component lazy loading
- Message virtualization for large conversations
- Debounced search functionality
- Optimized re-renders with React.memo

### **Error Handling**
- Graceful WebSocket disconnection handling
- User-friendly error messages
- Retry mechanisms for failed operations
- Fallback UI states

## 🚀 Getting Started

### **Installation**
```bash
cd frontend
npm install
```

### **Development**
```bash
npm start
```

### **Build for Production**
```bash
npm run build
```

### **Environment Variables**
Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

## 📦 Dependencies

### **Core Libraries**
- **React 18**: Latest React with concurrent features
- **Material-UI 5**: Modern React component library
- **Socket.io Client**: Real-time WebSocket communication
- **Emotion/React**: CSS-in-JS styling solution

### **Additional Features**
- **@mui/x-charts**: Data visualization components
- **Recharts**: Advanced charting library
- **Axios**: HTTP client for API calls

## 🎯 User Experience Flow

1. **Welcome Screen**: First-time user onboarding
2. **Language Selection**: Choose preferred language
3. **Chat Interface**: Main conversation area
4. **Real-time Interaction**: Voice or text input
5. **Emotion Feedback**: Visual emotion indicators
6. **Dashboard Analytics**: Conversation insights
7. **History Management**: Past conversation review

## 🔮 Future Enhancements

- **Dark Mode**: Complete dark theme implementation
- **Voice Cloning**: Custom voice selection
- **Multi-session**: Parallel conversation support
- **Export Formats**: PDF, CSV export options
- **Advanced Analytics**: Emotion trends, insights
- **Customization**: Personalized UI themes
- **Offline Mode**: Basic functionality without connection

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types for new components
3. Include accessibility attributes for new UI elements
4. Test responsive design across different screen sizes
5. Update documentation for new features

## 📄 License

This frontend is part of the ManoMitra project and follows the same MIT license.