# CareerCompass AI 🚀

> **Futuristic AI-powered career assistant platform that feels alive** — blending elegant motion design, modern typography, and immersive voice + text interactions to help students explore personalized career paths.

- **AI Career Matching** - Personalized job recommendations based on skills and interests
- **Interactive Roadmaps** - Step-by-step learning paths with timeline visualization
## Youtube Demo Link
https://youtu.be/WEv5hQUWI9U

---
### 📚 **LearnAI Integration**
- **Flashcard Maker** - AI-generated study cards from career notes
- **Quiz Generator** - Interactive assessments for skill validation  
- **Study Buddy** - AI assistant for career-related questions
- **Ollama Integration** - Local AI model support (llama3.2:1b)

### 🎨 **Futuristic UI/UX**
- **Glassmorphic Design** - Modern semi-transparent card layouts
- **Particle Animations** - GSAP-powered dynamic backgrounds
- **Voice Visualization** - Real-time audio level indicators
- **Responsive Design** - Mobile-first approach with smooth animations

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 15** - App Router with Server Actions
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom animations
- **Framer Motion** - Smooth page transitions and micro-interactions
- **GSAP** - Advanced particle system animations
- **Web Speech API** - Voice recognition and synthesis

### **Backend**
- **FastAPI** - High-performance async Python framework
- **OpenAI GPT-4** - Advanced career guidance and chat
- **Whisper** - Speech-to-text transcription
- **ElevenLabs** - Text-to-speech voice synthesis
- **Ollama** - Local AI for privacy-focused flashcards/quizzes
- **PostgreSQL** - Relational database with SQLAlchemy ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- PostgreSQL database
- Ollama installed locally

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/careercompass-ai.git
cd careercompass-ai
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:3000
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2:1b

# Start FastAPI
uvicorn main:app --reload  # Starts on http://localhost:8000
```

### 4. Environment Variables
Create `.env` files in both directories:

**Backend (.env)**
```bash
OLLAMA_BASE_URL=http://localhost:11434
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
careercompass-ai/
├── frontend/                   # Next.js 15 TypeScript App
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.tsx       # Landing page with animations
│   │   │   ├── profile/       # Multi-step profile builder
│   │   │   ├── career-suggestions/ # Career grid with filtering
│   │   │   ├── roadmap/       # Interactive learning timeline
│   │   │   └── api/           # API routes
│   │   ├── components/
│   │   │   ├── features/      # Core feature components
│   │   │   │   ├── VoiceRecorder.tsx
│   │   │   │   ├── FlashcardMaker.tsx
│   │   │   │   ├── QuizGenerator.tsx
│   │   │   │   └── CareerCard.tsx
│   │   │   └── ui/            # Reusable UI components
│   │   ├── types/             # TypeScript definitions
│   │   └── lib/               # Utilities and API clients
│   └── package.json
│
└── backend/                   # FastAPI Python Server
    ├── app/
    │   ├── services/          # AI service integrations
    │       ├── ollama_service.py    # Local AI (LearnAI)
    │ 
    ├── main.py                # FastAPI application
    └── requirements.txt
```

## 🔗 API Endpoints

### **Career Guidance**
- `POST /api/generate-career-path` - Generate personalized career recommendations
- `GET /api/roadmap/{id}` - Get detailed learning roadmap

### **LearnAI Features**
- `POST /api/flashcards` - Generate flashcards from notes
- `POST /api/quiz` - Create practice quizzes
- `POST /api/study-buddy` - AI-powered Q&A assistance

### **User Management**
- `POST /api/feedback` - Submit user feedback

## 🎮 Usage Examples

### Voice Interaction
```typescript
// Voice recording with real-time transcription
const handleVoiceInput = () => {
  const recorder = new VoiceRecorder({
    onTranscript: (text) => {
      // Send to AI for processing
      generateCareerSuggestions(text);
    }
  });
};
```

### Flashcard Generation
```typescript
// Generate flashcards from study notes
const createFlashcards = await fetch('/api/flashcards', {
  method: 'POST',
  body: JSON.stringify({
    topic: 'Machine Learning Fundamentals',
    content: userNotes
  })
});
```

## 🎨 Design System

### Color Palette
- **Cyber Blue**: `#00f5ff` - Primary interactions
- **Electric Purple**: `#8b5cf6` - Secondary elements
- **Neon Pink**: `#ff0080` - Highlights and accents
- **Matrix Green**: `#39ff14` - Success states

### Components
- **Glassmorphic Cards** - Semi-transparent with backdrop blur
- **Animated Buttons** - Hover effects with scale and glow
- **Voice Indicators** - Real-time audio level visualization
- **Particle Background** - Dynamic tech-themed animations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use conventional commits
- Write tests for new features
- Maintain responsive design principles

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 and Whisper integration
- **Ollama** - Local AI model support
- **LearnAI Demo** - Flashcard and quiz generation inspiration
- **Framer Motion** - Smooth animations
- **Tailwind CSS** - Utility-first styling

***

**Built with ❤️ for the future of career guidance**

*For questions or support, please open an issue or contact the maintainers.*