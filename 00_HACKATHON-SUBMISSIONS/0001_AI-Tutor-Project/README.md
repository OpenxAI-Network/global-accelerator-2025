# LearnAI — AI-Powered Learning Companion 
AI tutor, practice generator, auto-grader, and progress dashboard built with Next.js + Flask. Uses Google Generative AI (Gemini) and/or local Ollama models, with deterministic fallbacks so the app keeps working even without an LLM.

# Track 
LearnAI 
Mounir L'bachir - [@github-Mounirho22] 

# Team Members
N/A (solo builder)

## 🎥 Demo Video (REQUIRED)
Link : https://www.youtube.com/watch?v=c1IVAiGMOug

## Features
- AI Tutor Chat (Gemini/Ollama; non-streamed by default)
- Practice Generator (1–50 questions) with unique IDs
- Smart Grading (rubric-based JSON)
- Progress Dashboard (API-backed stats)
- Dark mode, shadcn/ui components, and lucide-react icons

## Tech Stack
- Frontend: Next.js (App Router), TailwindCSS, shadcn/ui, lucide-react
- Backend: Flask, Flask-CORS
- LLM Providers: Google Generative AI (Gemini), Ollama (local), plus local fallback logic

## Prerequisites
- Next.js 15.1.3
- Python 3.9+
- pip
- Optional:
  - Google API key (for Gemini)
  - Ollama installed (for local LLMs, e.g., llama3.2:1b)

## Installation

1) Frontend
- Install deps:
  - npm install

2) Backend
- Install deps:
  - pip install flask flask-cors requests google-generativeai

3) Configure environment
- Choose provider(s) via environment variables (see below)

## Environment Variables

You can run with Gemini, Ollama, or both (Gemini preferred, Ollama fallback). Set these before starting the backend.


Quick examples
- macOS/Linux:
  - export USE_GEMINI=true
  - export GOOGLE_API_KEY=***********-vBxRM-n3_MPXlDBdbBM
  - export GOOGLE_MODEL=gemini-1.5-flash
  - export USE_OLLAMA=false
  - export OLLAMA_MODEL=llama3.2:1b
  - export OLLAMA_HOST=http://127.0.0.1:11434
- Windows PowerShell:
  - $env:USE_GEMINI="true"
  - $env:GOOGLE_API_KEY=""
  - $env:GOOGLE_MODEL="gemini-1.5-flash"(can get free one on google studio website)
  - $env:USE_OLLAMA="false"
  - $env:OLLAMA_MODEL="llama3.2:1b"
  - $env:OLLAMA_HOST="http://127.0.0.1:11434"

## Running

1) Start backend (Flask)
- python app.py
- Health check: http://localhost:5000/health

2) Start frontend (Next.js)
- Make sure next.config.js has an API proxy:
  - rewrites: /api/:path* → http://localhost:5000/:path*
- Start dev server:
  - npm run dev
- Proxied health:
  - http://localhost:3000/api/health (should mirror backend JSON)

## Scripts

- npm run dev — start Next.js dev server
- python app.py — start Flask backend

## API Endpoints

Base: http://localhost:5000 (Next proxies /api/* → Flask)

- GET /health — service and provider info
- GET /dashboard — dashboard stats, subjects, recent activity
- GET /practice/subjects — available practice subjects
- POST /practice/generate — generate practice questions
  - JSON: { subject, difficulty, num_questions }
- POST /grading/grade — grade a submission
  - JSON: { submission, rubric? }
- POST /tutor/chat — chat reply (stream=false default)
  - JSON: { message, history?, stream? }

## Project Structure (key parts)

```
.
├── app.py                         # Flask backend (all endpoints)
├── next.config.js                 # Next → Flask API proxy
├── app/                           # Next.js App Router
│   ├── dashboard/page.tsx         # Progress Dashboard (fetches /api/dashboard)
│   ├── grading/page.tsx           # Grading (POST /api/grading/grade)
│   ├── practice/page.tsx          # Practice (POST /api/practice/generate)
│   └── tutor/page.tsx             # Tutor Chat (POST /api/tutor/chat)
├── components/
│   ├── hero.tsx
│   ├── navigation.tsx             # "Get Started" → /tutor
│   └── ui/
│       ├── progress.tsx           # Progress bar (ensure .tsx, not .txt)
│       ├── button.tsx, card.tsx, badge.tsx, ...
├── lib/utils.ts
└── hooks/use-toast.ts
```

## Usage Tips
- Practice: choose subject, difficulty, and number of questions (1–50).
- Grading: paste your essay/answer and optional rubric.
- Tutor: chat normally; history is passed to the backend for context.

## Troubleshooting

- /api calls return HTML/404
  - next.config.js must be named exactly; restart Next
  - http://localhost:3000/api/health should mirror http://localhost:5000/health

- Practice only returns a few questions
  - Use the “Number of Questions” input; backend supports 1–50 via batching

- React “duplicate key” warning
  - Already addressed by unique IDs in backend and normalization in Practice UI

- Dashboard empty or progress not rendering
  - Ensure components/ui/progress.tsx exists (not .txt) and named/exported properly
  - Check Network for /api/dashboard (should be 200 JSON)

- Gemini/Ollama errors
  - Check /health provider fields
  - Gemini: valid GOOGLE_API_KEY/GOOGLE_MODEL
  - Ollama: run ollama serve and pull the model (e.g., ollama pull llama3.2:1b)

## Future Plan
Add silent moments for mental breaks and focus (pomodoro) or calmness sounds like rainning
Include one-minute mini challenges or tasks
Offer AI workflow examples with step-by-step narration
Use warm and supportive tone in script delivery
Provide multiple learning formats (video, transcript, flashcard deckmore languages)
 
## Security
- Never commit API keys. Use environment variables (or a .env file with a loader if you add one).

## Acknowledgements
- Google Generative AI (Gemini)
- Ollama
- shadcn/ui, lucide-react, TailwindCSS

Happy building! If you want a minimal docker-compose for both services, I can add it.