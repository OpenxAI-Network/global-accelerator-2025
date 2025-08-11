# Vibe Rooms

## Overview

Vibe Rooms is an AI-powered ambient sound and scene composer.  
Users can switch between different environments (mountain, forest, café, etc.) using voice commands, and the system automatically mixes background audio tracks to match the mood.  
The adaptive composer adjusts over time to keep focus sessions engaging and avoid repetitive loops.

**Chosen Track:** AI / Robotics

---

## Features

- **Voice Control:** Change scenes, add/remove sounds, or adjust volumes with natural commands.
- **Adaptive Scene Composer:** Automatically adjusts sound mix during focus sessions.
- **Sound Library:** Preloaded environmental and effect sounds.
- **Privacy-First:** No personal data is stored.

---

## Setup & Run Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or yarn
- An [OpenAI API key](https://platform.openai.com/account/api-keys)

---

### Local Deployment

1. Clone the repository

   ```bash
   git clone https://github.com/YOUR_USERNAME/global-accelerator-2025.git
   cd global-accelerator-2025/00_HACKATHON-SUBMISSIONS/0123_Vibe-Rooms
   ```

2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
   Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   requirements.txt should include:
   ```
   fastapi
   pydantic
   python-dotenv
   openai
   uvicorn
   ```
3. Create a .env file in the backend folder:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
5. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
   **Main dependencies** include:
   - next
   - react
   - react-dom
   - axios
   - tailwindcss
   - (optional) react-icons if icons are used
     Start the frontend:
   ```bash
   npm run dev
   ```

## Running the Project:

Make sure both backend and frontend are running at the same time in separate terminals.
Open http://localhost:3000 in your browser to use Vibe Rooms.

## Demo Video

[youtu.be/EBglA4j3FNo](https://youtu.be/EBglA4j3FNo)

## Team

Solo Developer: Gokhan Ceylan
GitHub: ElfWebTeam
