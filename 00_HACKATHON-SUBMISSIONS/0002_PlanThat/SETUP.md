# 🚀 PlanThat Setup Guide

## Architecture Overview

This setup connects a **Next.js frontend** with a **Python Flask backend**:

```
Frontend: Next.js (localhost:3000)
Backend: Flask (localhost:5001)
Database: SQLite (planthat.db)
AI: Ollama (localhost:11434)
```

## 🛠 Quick Setup

### 1. Start the Python Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```
✅ Backend running on: http://localhost:5001

### 2. Start Ollama (AI Service)
```bash
# Start Ollama server
ollama serve

# Pull a model (in another terminal)
ollama pull llama2
```
✅ Ollama running on: http://localhost:11434

### 3. Start the Next.js Frontend
```bash
# Navigate to Next.js app
cd nextjs-app

# Install dependencies
npm install

# Start development server
npm run dev
```
✅ Frontend running on: http://localhost:3000

## 🎯 Features Available

### Next.js Frontend (http://localhost:3000)
- **Social Tools**: Caption Generator, Mood Checker, Hashtag Suggestor
- **AI Chat**: Full chat interface with Python backend
- **Navigation**: Switch between social tools and chat

### Python Backend (http://localhost:5001)
- **Chat API**: `/api/chat` for messaging
- **Database**: SQLite with chat history
- **Ollama Integration**: Direct AI model connection
- **Health Check**: `/api/health` endpoint

## 🔄 How It Works

### API Flow
1. **User types message** in Next.js chat interface
2. **Next.js API route** (`/api/chat`) forwards to Python backend
3. **Python backend** processes with Ollama AI
4. **Response** flows back through Next.js to user

### Database
- **SQLite**: `planthat.db` stores all chats and messages
- **Automatic**: Database created on first run
- **Persistent**: Chat history saved between sessions

## 🧪 Testing

### Test Python Backend
```bash
# Health check
curl http://localhost:5001/api/health

# Send a chat message
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### Test Next.js Frontend
1. Visit http://localhost:3000
2. Click "AI Chat" in navigation
3. Type a message and press Enter
4. See AI response from Python backend

## 🔧 Configuration

### Python Backend Settings
- **Port**: 5001 (change in `app.py`)
- **Model**: llama2 (change in `app.py`)
- **Database**: SQLite (planthat.db)

### Google Calendar Setup
1. **Create credentials directory**: `credentials/` (already created)
2. **Add your credentials**: Place `credentials.json` in the `credentials/` directory
3. **Follow setup guide**: See `credentials/README.md` for detailed instructions
4. **First authentication**: The app will guide you through OAuth setup on first use

**Note**: Google Calendar features require proper credential setup. See `credentials/README.md` for complete instructions.

### Next.js Settings
- **Port**: 3000 (default)
- **API Proxy**: Forwards to Python backend
- **CORS**: Handled by Python backend

## 🚨 Troubleshooting

### Python Backend Issues
- **Port 5000 in use**: Changed to 5001
- **Ollama not responding**: Check `ollama serve` is running
- **Database errors**: Delete `planthat.db` to reset

### Next.js Issues
- **API errors**: Check Python backend is running on port 5001
- **CORS errors**: Backend has CORS enabled
- **Module errors**: Run `npm install` in nextjs-app

### Ollama Issues
- **Model not found**: Run `ollama pull llama2`
- **Connection refused**: Start with `ollama serve`
- **Slow responses**: Try smaller models like `llama2:7b`

## 📊 Monitoring

### Check Services
```bash
# Python backend
curl http://localhost:5001/api/health

# Ollama
curl http://localhost:11434/api/tags

# Next.js (should return HTML)
curl http://localhost:3000
```

### Logs
- **Python**: Check terminal running `python app.py`
- **Next.js**: Check terminal running `npm run dev`
- **Ollama**: Check terminal running `ollama serve`

## 🎉 Success!

When everything is working:
- ✅ Python backend responds to health checks
- ✅ Ollama serves AI models
- ✅ Next.js shows chat interface
- ✅ Messages flow from frontend → backend → AI → response
- ✅ Chat history persists in database

You now have a fully connected AI chat application with a modern frontend and powerful Python backend! 