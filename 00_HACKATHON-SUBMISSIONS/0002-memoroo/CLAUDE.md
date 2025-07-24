# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Memoroo** is an AI-powered learning assistant built for the OpenxAI Global Accelerator 2025 Hackathon (LearnAI track). It transforms text into interactive educational materials with three core features:
- **Flashcard Maker**: Generates interactive flashcards from study notes
- **Quiz Generator**: Creates multiple-choice quizzes with explanations  
- **Study Buddy**: AI-powered Q&A assistant for interactive learning

## Development Commands

All development happens in the `nextjs-app/` directory:

```bash
cd nextjs-app

# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI Integration**: Ollama with `llama3.2:1b` model (local)
- **API**: Next.js API routes with REST endpoints
- **Styling**: Tailwind CSS with custom gradient backgrounds

### Project Structure

```
nextjs-app/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── flashcards/route.ts # Flashcard generation
│   │   ├── quiz/route.ts       # Quiz generation  
│   │   └── study-buddy/route.ts # Chat-based Q&A
│   ├── globals.css             # Global styles + flashcard animations
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main SPA with tabbed interface
├── package.json                # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

### Key Components

**Main Interface (`app/page.tsx`)**:
- Single-page application with three tabs
- State management for flashcards, quiz, and chat
- Handles all user interactions and API calls

**API Routes**:
- All routes use Ollama running on `localhost:11434`
- Model: `llama3.2:1b` (specified in `ollama-model.txt`)
- JSON response parsing with fallback handling
- Error handling for AI service unavailability

### AI Integration Pattern

Each API route follows this pattern:
1. Accept user input (notes, text, questions)
2. Craft specific prompts for educational content generation
3. Call Ollama API with `llama3.2:1b` model
4. Parse JSON responses with robust error handling
5. Return structured data to frontend

### Styling Approach

- Gradient background: `from-purple-400 via-pink-500 to-red-500`
- Glass morphism: `bg-white/10 backdrop-blur-sm`
- Interactive elements with hover states and transitions
- Custom CSS for flashcard flip animations in `globals.css`

## Development Notes

### Running the App
1. **Ollama Setup**: Ensure Ollama is running with `llama3.2:1b` model installed:
   ```bash
   ollama pull llama3.2:1b
   ollama serve
   ```

2. **Development Server**: Run `npm run dev` from `nextjs-app/` directory

### Key Features Implementation
- **Flashcards**: Click-to-flip interaction with navigation controls
- **Quiz**: Multiple choice with immediate feedback and explanations  
- **Study Buddy**: Chat-style interface with conversation history

### Error Handling
- All API routes include try-catch blocks
- Graceful degradation when Ollama is unavailable
- JSON parsing fallbacks for malformed AI responses

## Hackathon Context

- **Track**: LearnAI - AI-powered educational tools
- **Submission Folder**: `0002-memoroo`
- **Team**: Ben (API & DevOps), Reece (Backend/AI), Emmanuel (Frontend/UX)
- **Compliance**: Uses required Ollama integration with Next.js 14 + TypeScript + Tailwind

## Future Enhancements (From PROJECT_OVERVIEW.md)
- Real-time multiplayer quiz rooms
- Spaced repetition scheduling
- LMS/LTI integration
- Voice playback mode
- Advanced analytics dashboard

You are an expert AI developer helping create a sentiment analysis chat application for the OpenxAI Global Accelerator 2025 Hackathon.

**TASK**: Create a new sentiment analysis chat app based on the TEXTSTREAM-TRACK template

**STEPS**:
1. **Research the repository structure**:
   - Examine all demo-app folders in the root directory
   - Study the TEXTSTREAM-TRACK/demo-app-BASIC-CHAT-APP structure
   - Check the current submissions in 00_HACKATHON-SUBMISSIONS to determine the next project number

2. **Create project folder**:
   - Create a new folder in 00_HACKATHON-SUBMISSIONS with format: 000X_Project-Name
   - Increment the project number from the highest existing number
   - Use a descriptive name like "sentiment-analyzer" or "mood-chat"

3. **Build the sentiment analysis app**:
   - Copy the TEXTSTREAM-TRACK/demo-app-BASIC-CHAT-APP structure as your base
   - Modify the chat interface to include:
     * Text input area for user messages
     * AI response area with streaming responses
     * **Sentiment indicator** showing conversation mood (peaceful, neutral, angry, excited, etc.)
     * Visual mood indicators (emojis, colors, progress bars)
   - Update the API route to analyze sentiment using Ollama
   - Enhance the UI with Tailwind CSS for a modern, polished look

4. **Technical requirements**:
   - Use Next.js 15 with TypeScript
   - Integrate with Ollama for AI responses
   - Implement real-time sentiment analysis
   - Add visual feedback for conversation mood
   - Ensure responsive design with Tailwind CSS
   - Include proper error handling and loading states

5. **UI/UX enhancements**:
   - Add mood-based color themes
   - Include animated sentiment indicators
   - Create intuitive conversation flow
   - Add helpful placeholder text and instructions

**CRITICAL FIXES TO IMPLEMENT**:
- **Dependency Management**: Use `npm install --legacy-peer-deps` to resolve React version conflicts
- **JSON Parsing Safety**: Implement robust JSON parsing with try-catch blocks for AI responses
- **Fallback Sentiment Analysis**: Create keyword-based fallback when AI sentiment analysis fails
- **Error Handling**: Add comprehensive error handling for API failures and malformed responses
- **Package.json Conflicts**: Ensure React and React-DOM versions are explicitly specified
- **Multiple Lockfiles**: Remove duplicate package-lock.json files to prevent conflicts
- **Ollama Model Verification**: Check if required model is available before starting the app

**TROUBLESHOOTING CHECKLIST**:
- [ ] Verify Ollama is running and model is downloaded (`ollama list`)
- [ ] Test API endpoint with curl before running the app
- [ ] Check for dependency conflicts and resolve with --legacy-peer-deps
- [ ] Ensure proper error handling in sentiment analysis
- [ ] Validate JSON parsing with try-catch blocks
- [ ] Test fallback sentiment analysis when AI fails

**DELIVERABLE**: A fully functional sentiment analysis chat app that can detect and display the emotional tone of conversations in real-time with robust error handling and fallback systems.
