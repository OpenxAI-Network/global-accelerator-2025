# 🏝️ Stranded Island Adventure

An AI-powered choose-your-own-adventure game where players wake up stranded on a mysterious tropical island and must navigate through a thrilling story using natural language interactions.

## 🎮 Game Overview

**Stranded Island Adventure** is an immersive text-based adventure game that combines the classic choose-your-own-adventure format with modern AI technology. Players find themselves stranded on a tropical island and must make decisions that shape their survival story through natural language interactions.

### Key Features

- **AI-Powered Storytelling**: Dynamic narrative generation using Ollama's Llama 3.2 model
- **Natural Language Interface**: Players can "do" or "say" anything using free-form text
- **Structured Story Progression**: 5-milestone story arc with guaranteed completion
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **Real-time Interaction**: Instant AI responses to player actions
- **Memory Management**: Complete story reset functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Ollama installed and running
- Llama 3.2:1b model downloaded

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 00_HACKATHON-SUBMISSIONS/0002_Stranded-Island
   ```

2. **Install dependencies**
   ```bash
   cd nextjs-app
   npm install --legacy-peer-deps
   ```

3. **Set up Ollama**
   ```bash
   # Install Ollama (if not already installed)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull the required model
   ollama pull llama3.2:1b
   
   # Start Ollama server
   ollama serve
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Play

### Getting Started

1. **Launch the Game**: Open the application in your browser
2. **Swipe to Play**: Swipe across the screen or move your mouse to start
3. **Choose Your Action**: Select "Do" or "Say" to interact with the world
4. **Type Your Action**: Enter what you want to do or say in natural language
5. **Progress Through the Story**: Make choices that advance through 5 story milestones

### Game Mechanics

#### Action Types
- **Do**: Physical actions (e.g., "explore the jungle", "climb the tree", "build a shelter")
- **Say**: Verbal interactions (e.g., "call out for help", "introduce yourself", "ask questions")

#### Story Structure
The game follows a structured 5-milestone progression:

1. **Wake Up** - Player awakens stranded and confused
2. **Survival & Search** - Player searches for resources and clues
3. **Evidence Discovery** - Player finds evidence of another person
4. **Encounter** - Player meets and interacts with another survivor
5. **Ending** - Final resolution based on all previous choices

#### AI Interaction
- Each response is limited to 80 words for concise storytelling
- AI responds naturally to your specific actions
- Story progresses through exactly 2 prompts per milestone
- Complete story completion guaranteed within 10 interactions

## 🛠️ Technical Architecture

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks (useState, useEffect, useRef)
- **UI Components**: Custom chat interface with Do/Say selector

### Backend
- **API**: Next.js API routes
- **AI Engine**: Ollama with Llama 3.2:1b model
- **State Management**: Server-side story state tracking
- **Memory System**: AI memory management with reset functionality

### Key Files

```
nextjs-app/
├── app/
│   ├── api/chat/route.ts          # AI interaction logic
│   ├── globals.css                # Global styles and animations
│   └── page.tsx                   # Main page component
├── components/
│   └── chat.tsx                   # Chat interface and game logic
└── package.json                   # Dependencies and scripts
```

## 🎨 UI/UX Features

### Design Elements
- **Gradient Background**: Tropical blue-to-green gradient
- **Dark Navy Text**: High contrast for excellent readability
- **Transparent Elements**: Glass-morphism design for modern feel
- **Smooth Animations**: 2-second fade transitions
- **Responsive Layout**: Works on desktop and mobile devices

### Interface Components
- **Do/Say Selector**: Toggle between action types
- **Chat Bubbles**: AI messages on left, player choices on right
- **Auto-scroll**: Automatically shows new content
- **Selection Highlighting**: Visual feedback for player choices
- **Reset Functionality**: Complete game state reset

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Project Structure

```
00_HACKATHON-SUBMISSIONS/0002_Stranded-Island/
├── nextjs-app/                    # Main application
│   ├── app/                       # Next.js app directory
│   ├── components/                # React components
│   ├── lib/                       # Utility functions
│   └── scripts/                   # Build and setup scripts
├── README.md                      # This file
├── PROJECT_SUMMARY.md             # Project overview
├── TROUBLESHOOTING.md             # Common issues and solutions
└── start.sh                       # Quick start script
```

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Ollama**: Local AI inference engine
- **Llama 3.2:1b**: Lightweight language model

## 🐛 Troubleshooting

### Common Issues

1. **Ollama Connection Error**
   ```bash
   # Ensure Ollama is running
   ollama serve
   
   # Check if model is available
   ollama list
   ```

2. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

### Performance Optimization

- **Model Size**: Uses lightweight Llama 3.2:1b for fast responses
- **Response Caching**: AI responses are optimized for speed
- **State Management**: Efficient React state updates
- **Build Optimization**: Next.js production builds are optimized

## 🎯 Game Design Philosophy

### Story Structure
- **Guided Freedom**: Players have freedom within structured milestones
- **Natural Language**: No predefined choices - players express themselves naturally
- **Guaranteed Completion**: Every game reaches a satisfying conclusion
- **Replayability**: Different choices lead to different story paths

### AI Integration
- **Context Awareness**: AI remembers previous actions and story state
- **Natural Responses**: AI responds organically to player actions
- **Story Pacing**: Controlled progression through structured milestones
- **Memory Management**: Complete reset functionality for fresh starts

## 📱 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design works on all mobile devices

## 🤝 Contributing

This project was created for the Global Accelerator 2025 Hackathon. For contributions or improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama Team**: For the excellent local AI inference platform
- **Meta**: For the Llama 3.2 language model
- **Next.js Team**: For the powerful React framework
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

For issues or questions:
- Check the TROUBLESHOOTING.md file
- Review the project documentation
- Open an issue in the repository

---

**Enjoy your adventure on the mysterious island! 🏝️**