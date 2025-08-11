# 🎓 AI Study Squad - Multi-Agent Personalized Learning System

**Track:** LearnAI  
**Team:** Solo Developer  
**Hackathon:** OpenxAI Global Accelerator 2025 - Australian Hack Node

## 🚀 Project Overview

AI Study Squad is an innovative multi-agent AI learning platform that revolutionizes personalized education. Unlike traditional single-chatbot tutors, our system employs **5 specialized AI agents** that collaborate in real-time to create a comprehensive learning experience tailored to each student's needs.

### 🌟 Key Innovation

This project leverages the **2025 trend of multi-agent AI systems** - where multiple specialized AI agents work together to solve complex problems. Each agent has a specific expertise, creating a "squad" of AI tutors that provide:
- Knowledge assessment
- Custom content creation
- Interactive quizzing
- Progress tracking
- Friendly study support

## 🎯 Problem Statement

Traditional online learning platforms offer one-size-fits-all content that doesn't adapt to individual learning styles, pace, or knowledge gaps. Students often struggle with:
- Understanding their current knowledge level
- Finding appropriately challenging content
- Staying motivated without personalized feedback
- Tracking their learning progress effectively

## 💡 Solution

AI Study Squad creates a **personalized AI teaching team** for every student. Our multi-agent architecture ensures:
- **Accurate Assessment**: The Knowledge Assessor evaluates understanding
- **Tailored Content**: The Content Creator generates level-appropriate materials
- **Active Learning**: The Quiz Master creates interactive assessments
- **Data-Driven Insights**: The Progress Tracker analyzes learning patterns
- **24/7 Support**: The Study Buddy provides instant help and encouragement

## 🏗️ Architecture

### Multi-Agent System

```
┌─────────────────────────────────────────────────────────┐
│                   AgentOrchestrator                      │
│  (Coordinates all agents and manages learning sessions)  │
└─────────────┬───────────────────────────────────────────┘
              │
    ┌─────────┴─────────┬──────────┬──────────┬──────────┐
    ▼                   ▼          ▼          ▼          ▼
┌─────────┐      ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│Knowledge│      │ Content  │ │  Quiz   │ │Progress│ │  Study   │
│Assessor │      │ Creator  │ │ Master  │ │Tracker │ │  Buddy   │
└─────────┘      └──────────┘ └─────────┘ └────────┘ └──────────┘
    🎯                📚          🎲         📊         🤖
```

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Animation**: Framer Motion for smooth UI transitions
- **AI Integration**: Ollama for local LLM execution
- **Markdown**: React-Markdown with GFM support
- **State Management**: React Hooks with session persistence

## 🤖 AI Agents Explained

### 1. Knowledge Assessor (🎯)
- Evaluates student's current understanding
- Identifies knowledge gaps and weak areas
- Determines appropriate learning level
- Provides confidence scores

### 2. Content Creator (📚)
- Generates personalized learning materials
- Adapts complexity to student level
- Creates examples and analogies
- Structures lessons for optimal learning

### 3. Quiz Master (🎲)
- Creates dynamic quiz questions
- Offers multiple question formats
- Provides detailed answer explanations
- Adapts difficulty based on performance

### 4. Progress Tracker (📊)
- Analyzes learning patterns
- Tracks improvement over time
- Identifies strengths and weaknesses
- Suggests learning path adjustments

### 5. Study Buddy (🤖)
- Answers questions conversationally
- Provides encouragement and motivation
- Offers study tips and strategies
- Makes learning fun and engaging

## 🎨 Features

### Core Functionality
- ✅ Real-time multi-agent collaboration
- ✅ Personalized learning sessions
- ✅ Interactive chat interface
- ✅ Knowledge assessment system
- ✅ Dynamic content generation
- ✅ Quiz generation and evaluation
- ✅ Progress tracking and analytics
- ✅ Session persistence and recovery

### Production Features
- ✅ Error boundaries and graceful error handling
- ✅ Retry logic with exponential backoff
- ✅ Input validation and sanitization
- ✅ Loading states and animations
- ✅ Responsive design for all devices
- ✅ Session storage and management
- ✅ Analytics tracking preparation
- ✅ Performance optimizations

### User Experience
- ✅ Live agent status indicators
- ✅ Quick action buttons
- ✅ Session statistics dashboard
- ✅ Agent activity monitoring
- ✅ Smooth animations and transitions
- ✅ Markdown rendering for rich content
- ✅ Code syntax highlighting support

## 📸 Screenshots

### Start Screen
- Topic selection with validation
- Optional knowledge assessment
- Agent introduction cards

### Learning Session
- Multi-column layout with chat and controls
- Real-time agent status bar
- Quick actions sidebar
- Session statistics panel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Ollama installed and running locally
- llama3.2:1b model downloaded

### Installation

1. **Clone the repository**
```bash
cd 00_HACKATHON-SUBMISSIONS/0001_AI-Study-Squad/nextjs-app
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Install and start Ollama**
```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the required model
ollama pull llama3.2:1b

# Start Ollama server
ollama serve
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

1. **Start a Learning Session**
   - Enter a topic you want to learn about
   - Optionally provide your current knowledge for assessment
   - Click "Start Learning Session"

2. **Interact with AI Agents**
   - Watch as multiple agents collaborate to help you learn
   - Ask questions using the chat interface
   - Use quick action buttons for common requests

3. **Track Your Progress**
   - Monitor agent activity in real-time
   - View session statistics
   - See your message history and duration

4. **End Session**
   - Click "End Session" when finished
   - Your progress is automatically saved locally

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env.local` file:
```env
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11434
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
NEXT_PUBLIC_MAX_RETRIES=3
```

### Model Configuration
The system uses `llama3.2:1b` by default. To use a different model:
1. Pull the desired model: `ollama pull <model-name>`
2. Update the model name in `/lib/agents.ts`

## 📊 Performance & Scalability

- **Efficient Agent Management**: Agents are activated only when needed
- **Session Caching**: Reduces redundant API calls
- **Debounced Input**: Prevents excessive requests
- **Local Storage**: Persists sessions client-side
- **Cleanup Routines**: Automatic old session removal

## 🔐 Security Features

- Input sanitization to prevent XSS attacks
- Request validation on all API endpoints
- Session isolation between users
- No sensitive data stored client-side
- Error messages don't expose system details

## 🎯 Future Enhancements

- [ ] Voice interaction support
- [ ] PDF/document upload for learning
- [ ] Collaborative learning sessions
- [ ] Export learning reports
- [ ] Mobile app version
- [ ] Integration with educational APIs
- [ ] Blockchain-based achievement certificates
- [ ] AR/VR learning experiences

## 🏆 Why This Wins

1. **Innovation**: First-of-its-kind multi-agent learning system
2. **Trending Tech**: Leverages 2025's hottest AI trend
3. **Real Impact**: Solves genuine educational challenges
4. **Production Ready**: Complete with error handling and optimization
5. **Scalable Architecture**: Can easily add more specialized agents
6. **User Experience**: Polished, intuitive, and engaging interface

## 👨‍💻 Development

### Project Structure
```
0001_AI-Study-Squad/
├── nextjs-app/
│   ├── app/
│   │   ├── api/           # API routes for agents
│   │   ├── page.tsx       # Main application
│   │   └── layout.tsx     # Root layout
│   ├── lib/
│   │   ├── agents.ts      # Multi-agent system
│   │   └── utils.ts       # Utility functions
│   ├── components/        # React components
│   └── package.json       # Dependencies
└── README.md
```

### Testing
```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

MIT License - Feel free to use this project for educational purposes.

## 🙏 Acknowledgments

- OpenxAI Global Accelerator Program
- Australian Hack Node organizers
- Ollama for local LLM support
- The open-source community

## 📞 Contact

For questions or collaboration:
- GitHub: [Project Repository](https://github.com/OpenxAI-Network/global-accelerator-2025)
- Discord: Join the OpenxAI community

---

**Built with ❤️ for the OpenxAI Global Accelerator 2025 Hackathon**

*Revolutionizing education through collaborative AI agents*