# 🏝️ Stranded Island Adventure

An AI-powered choose-your-own-adventure game where you wake up stranded on a mysterious tropical island with no memory of how you got there. Make choices, survive, and discover the truth about what happened to you.

## 🎮 Game Overview

**Stranded Island Adventure** is an interactive storytelling experience that combines the classic choose-your-own-adventure format with modern AI technology. The game guides players through a compelling narrative from beginning to end, with their choices directly influencing the story's progression and ultimate outcome.

### Story Setting
- **Location**: A lush tropical island surrounded by a beautiful coral reef
- **Environment**: Dense jungle, sandy beaches, and abundant marine life
- **Weather**: Tropical climate with warm breezes and occasional storms
- **Atmosphere**: Mysterious, thrilling, with moments of humor

### Story Milestones
1. **Wake Up**: Player awakens confused and stranded on the island
2. **Survival**: Search for clues while trying to survive
3. **Discovery**: Find evidence of another person/survivor
4. **Encounter**: Meet another person (interaction determines ending)
5. **Resolution**: Multiple possible endings based on choices and relationships

## ✨ Features

- **AI-Powered Storytelling**: Dynamic narrative generation using Ollama
- **Interactive Choices**: 2-4 meaningful options at each story step
- **State Management**: Track inventory, health, location, and relationships
- **Visual Feedback**: Beautiful island-themed UI with animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Story progresses based on player decisions
- **Milestone Tracking**: Visual indicators for story progress
- **Inventory System**: Collect and manage items throughout your journey

## 🛠️ Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **AI Engine**: Ollama with llama3.2:1b model
- **Styling**: Tailwind CSS with custom island-themed design system
- **State Management**: React hooks with local state persistence
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: Version 18.17 or higher
2. **Ollama**: Must be installed and running locally
3. **Required Model**: `llama3.2:1b` (or update the model in the code)

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd nextjs-app
   ```

2. **Install dependencies** (using legacy peer deps to resolve React conflicts):
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Verify Ollama is running**:
   ```bash
   ollama list
   ```
   
   If the required model isn't available, download it:
   ```bash
   ollama pull llama3.2:1b
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

### Troubleshooting

#### Common Issues

- **Dependency Conflicts**: Use `npm install --legacy-peer-deps` to resolve React version conflicts
- **Ollama Connection**: Ensure Ollama is running with `ollama serve`
- **Model Not Found**: Download the required model with `ollama pull llama3.2:1b`
- **Port Conflicts**: Change the port in `package.json` if 3000 is occupied

#### Error Handling

The app includes comprehensive error handling:
- **API Failures**: Graceful fallback responses when Ollama is unavailable
- **JSON Parsing**: Robust parsing with try-catch blocks
- **Network Issues**: User-friendly error messages for connection problems

## 🎯 Game Mechanics

### Choice System
- **Numbered Options**: Each choice is clearly numbered (1, 2, 3, 4)
- **Distinct Outcomes**: Choices range from safe to risky to morally ambiguous
- **Consequence Tracking**: Decisions affect inventory, health, and relationships

### State Management
- **Session Persistence**: Game state maintained throughout the session
- **Dynamic Updates**: Story elements update based on AI responses
- **Milestone Tracking**: Visual progress indicators for story completion

### AI Integration
- **System Prompts**: Comprehensive game master instructions for consistent storytelling
- **Context Awareness**: AI receives current game state for coherent responses
- **Fallback System**: Graceful degradation when AI services are unavailable

## 🎨 UI/UX Features

### Visual Design
- **Island Theme**: Tropical color palette with ocean blues and jungle greens
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Layout**: Adaptive design for all screen sizes
- **Visual Hierarchy**: Clear distinction between story content and game elements

### User Experience
- **Intuitive Navigation**: Simple, clear interface design
- **Real-time Feedback**: Loading states and progress indicators
- **Accessibility**: High contrast and readable typography
- **Mobile Optimization**: Touch-friendly controls and responsive layout

## 🔧 Customization

### Modifying the Story
- **System Prompt**: Edit the AI instructions in `app/api/chat/route.ts`
- **Story Milestones**: Adjust the required story beats in the system prompt
- **Choice Generation**: Modify the AI response format and choice structure

### Styling Changes
- **Color Scheme**: Update the custom colors in `tailwind.config.js`
- **Animations**: Modify CSS keyframes in `app/globals.css`
- **Layout**: Adjust the grid system and component spacing

### AI Model
- **Model Selection**: Change the Ollama model in `app/api/chat/route.ts`
- **Prompt Engineering**: Refine the system prompt for different storytelling styles
- **Response Format**: Customize the AI output structure and formatting

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
- No external API keys required (uses local Ollama)
- Ensure Ollama is accessible in your deployment environment

### Docker Support
- Can be containerized with Ollama running as a separate service
- Consider using Ollama Cloud for production deployments

## 🤝 Contributing

This project was created for the Global Accelerator 2025 Hackathon. Feel free to:
- Report bugs and issues
- Suggest new features and improvements
- Fork and modify for your own projects
- Share your experiences and feedback

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Ollama Team**: For providing the local AI inference platform
- **Next.js Team**: For the excellent React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Global Accelerator 2025**: For hosting this hackathon

---

**Ready to start your adventure?** 🏝️✨

Begin your journey on the mysterious island and discover what secrets await you in the depths of the jungle and beneath the waves of the coral reef.
