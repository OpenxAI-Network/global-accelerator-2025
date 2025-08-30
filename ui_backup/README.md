# Aegis AI Agent - User Interface

A modern, responsive web interface for the Aegis AI Agent system, providing an intuitive way to interact with AI-powered security and cross-chain management capabilities.

## 🚀 Features

### **Dashboard Overview**
- **Real-time Statistics**: Security score, portfolio value, active threats, and cross-chain status
- **AI Agent Status**: Live monitoring of Perception, Cognitive, Action, and Learning agents
- **Performance Metrics**: Real-time updates of agent performance and system health

### **Interactive Chat Interface**
- **AI Assistant**: Natural language interaction with the Aegis AI system
- **Smart Responses**: Context-aware AI responses for security, portfolio, and cross-chain queries
- **Quick Actions**: Pre-built action buttons for common operations
- **Chat History**: Persistent chat with export functionality

### **Navigation & Settings**
- **Sidebar Navigation**: Easy access to different system sections
- **Settings Modal**: Configure AI models, response speed, and notifications
- **Wallet Integration**: Connect and manage blockchain wallets
- **Responsive Design**: Mobile-friendly interface that works on all devices

## 🛠️ Setup & Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Quick Start
1. **Open the interface**:
   ```bash
   # Simply open ui/index.html in your browser
   open ui/index.html
   ```

2. **Or serve locally** (optional):
   ```bash
   # Using Python
   cd ui
   python -m http.server 8000
   # Then open http://localhost:8000
   
   # Using Node.js
   cd ui
   npx serve .
   # Then open the provided URL
   ```

## 📱 Interface Components

### **Header Section**
- **Logo & Status**: Aegis AI branding with real-time system status
- **Settings Button**: Access to configuration options
- **Wallet Connect**: Blockchain wallet integration

### **Sidebar Navigation**
- **Main Sections**: Dashboard, Security, Portfolio, Cross-Chain, Analytics
- **AI Agents**: Direct access to agent-specific views
- **Active States**: Visual feedback for current section

### **Dashboard Area**
- **Statistics Cards**: Key metrics with real-time updates
- **Agent Grid**: Individual agent status and performance
- **Visual Indicators**: Color-coded status and change indicators

### **Chat Interface**
- **Message Thread**: Conversation history with timestamps
- **Input Area**: Auto-resizing text input with send button
- **Quick Actions**: Common query shortcuts
- **Export Options**: Download chat history

### **Settings Modal**
- **AI Configuration**: Model selection and response speed
- **Notifications**: Toggle for different alert types
- **Persistent Storage**: Settings saved to browser localStorage

## 🎯 Usage Examples

### **Security Monitoring**
```
User: "How secure is my portfolio?"
AI: Provides security score, threat analysis, and recommendations
```

### **Portfolio Analysis**
```
User: "Show me my portfolio performance"
AI: Displays current value, asset distribution, and optimization tips
```

### **Risk Assessment**
```
User: "What are the current risks?"
AI: Analyzes risk factors and suggests protective measures
```

### **Cross-Chain Operations**
```
User: "What's the status of my cross-chain connections?"
AI: Shows active connections, pending transactions, and performance metrics
```

## 🔧 Configuration

### **AI Model Settings**
- **Gemini 2.5 Pro**: High-quality responses (default)
- **Gemini 2.5 Flash**: Fast responses
- **GPT-4**: Alternative AI model

### **Response Speed**
- **Fast**: Quick responses with basic analysis
- **Balanced**: Optimal speed/quality balance (default)
- **Thorough**: Comprehensive analysis with longer response time

### **Notification Preferences**
- **Security Alerts**: Real-time threat notifications
- **Portfolio Updates**: Value and performance changes
- **AI Decisions**: Automated action notifications

## 📊 Real-Time Features

### **Live Updates**
- Agent metrics update every 5 seconds
- Statistics refresh automatically
- Agent status changes in real-time

### **Interactive Elements**
- Hover effects and animations
- Loading states and progress indicators
- Toast notifications for user feedback

### **Responsive Behavior**
- Mobile-first design approach
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## 🎨 Design System

### **Color Palette**
- **Primary**: Indigo (#6366f1) for main actions
- **Success**: Green (#10b981) for positive states
- **Warning**: Amber (#f59e0b) for caution
- **Danger**: Red (#ef4444) for errors
- **Info**: Blue (#3b82f6) for information

### **Typography**
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear heading and text scales
- **Readability**: Optimized line heights and spacing

### **Animations**
- **Transitions**: Smooth hover and focus effects
- **Loading**: Spinner animations for async operations
- **Feedback**: Micro-interactions for user actions

## 🔌 Integration Points

### **Backend Integration**
The interface is designed to integrate with the Python AI agent backend:

```javascript
// Example API integration
async function getAgentStatus() {
    const response = await fetch('/api/agents/status');
    const status = await response.json();
    updateAgentDisplay(status);
}
```

### **Blockchain Integration**
- Wallet connection simulation
- Transaction status monitoring
- Cross-chain operation tracking

### **AI Service Integration**
- Chat API endpoints
- Real-time agent communication
- Threat detection alerts

## 📱 Mobile Experience

### **Responsive Breakpoints**
- **Desktop**: 1200px+ (full sidebar, multi-column layout)
- **Tablet**: 768px-1199px (collapsed sidebar, adjusted grids)
- **Mobile**: <768px (stacked layout, full-width components)

### **Touch Optimizations**
- Large touch targets (44px minimum)
- Swipe gestures for navigation
- Optimized spacing for mobile use

## 🚀 Performance Features

### **Optimizations**
- CSS custom properties for theming
- Efficient DOM manipulation
- Debounced real-time updates
- Lazy loading for heavy components

### **Browser Support**
- Modern browsers with ES6+ support
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming
- Progressive enhancement approach

## 🔒 Security Considerations

### **Client-Side Security**
- Input sanitization for chat messages
- XSS prevention in dynamic content
- Secure localStorage usage
- HTTPS enforcement for production

### **Data Privacy**
- Local storage for user preferences
- No sensitive data in client-side code
- Secure communication with backend APIs

## 🧪 Testing

### **Browser Testing**
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design validation

### **Functionality Testing**
- Chat interface functionality
- Settings persistence
- Real-time updates
- Mobile responsiveness

## 📈 Future Enhancements

### **Planned Features**
- Dark mode theme
- Advanced chart visualizations
- Multi-language support
- Voice input/output
- Advanced notification system

### **Integration Roadmap**
- Real backend API integration
- WebSocket for live updates
- Push notifications
- Offline functionality

## 🤝 Contributing

### **Development Setup**
1. Clone the repository
2. Navigate to the `ui` directory
3. Open `index.html` in your browser
4. Make changes to HTML, CSS, or JavaScript
5. Test across different devices and browsers

### **Code Standards**
- Semantic HTML structure
- BEM methodology for CSS classes
- ES6+ JavaScript with modern patterns
- Accessibility-first design approach

## 📄 License

This interface is part of the Aegis AI project and follows the same licensing terms.

## 🆘 Support

For issues or questions about the user interface:
1. Check the browser console for errors
2. Verify all files are in the correct directory structure
3. Ensure modern browser compatibility
4. Check network connectivity for external resources

---

**Note**: This is a frontend interface that simulates AI interactions. In production, it would connect to the Python AI agent backend for real functionality.
