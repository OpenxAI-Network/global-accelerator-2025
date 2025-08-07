"""
FastAPI Backend for CareerCompass AI
Main application entry point with routes and services
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

from app.routes import career, voice, ai, auth
from app.services.ollama_service import OllamaService
from app.services.openai_service import OpenAIService
from app.services.elevenlabs_service import ElevenLabsService
from app.services.career_analyzer import CareerAnalyzer
from app.core.database import init_db
from app.core.exceptions import APIException
from config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_connections[user_id] = websocket
        logger.info(f"WebSocket connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
        logger.info(f"WebSocket disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            await websocket.send_text(message)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.active_connections.remove(connection)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting CareerCompass AI Backend...")
    
    # Initialize database
    await init_db()
    
    # Initialize AI services
    app.state.ollama_service = OllamaService()
    app.state.openai_service = OpenAIService(api_key=settings.OPENAI_API_KEY)
    app.state.elevenlabs_service = ElevenLabsService(api_key=settings.ELEVENLABS_API_KEY)
    app.state.career_analyzer = CareerAnalyzer()
    
    logger.info("All services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down CareerCompass AI Backend...")

# Create FastAPI app
app = FastAPI(
    title="CareerCompass AI Backend",
    description="AI-powered career guidance platform with voice interaction",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(career.router, prefix="/api/career", tags=["career"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "CareerCompass AI Backend is running!", "version": "1.0.0"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "ollama": await check_ollama_health(),
            "openai": await check_openai_health(),
            "elevenlabs": await check_elevenlabs_health()
        }
    }

async def check_ollama_health():
    try:
        if hasattr(app.state, 'ollama_service'):
            response = await app.state.ollama_service.health_check()
            return "healthy" if response else "unhealthy"
        return "not_initialized"
    except Exception as e:
        logger.error(f"Ollama health check failed: {e}")
        return "unhealthy"

async def check_openai_health():
    try:
        if hasattr(app.state, 'openai_service'):
            response = await app.state.openai_service.health_check()
            return "healthy" if response else "unhealthy"
        return "not_initialized"
    except Exception as e:
        logger.error(f"OpenAI health check failed: {e}")
        return "unhealthy"

async def check_elevenlabs_health():
    try:
        if hasattr(app.state, 'elevenlabs_service'):
            response = await app.state.elevenlabs_service.health_check()
            return "healthy" if response else "unhealthy"
        return "not_initialized"
    except Exception as e:
        logger.error(f"ElevenLabs health check failed: {e}")
        return "unhealthy"

# WebSocket endpoint for real-time communication
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            content = message_data.get("data")
            
            if message_type == "voice_data":
                # Process voice data
                await handle_voice_message(websocket, user_id, content)
            elif message_type == "chat_message":
                # Process text message
                await handle_chat_message(websocket, user_id, content)
            elif message_type == "career_analysis":
                # Process career analysis request
                await handle_career_analysis(websocket, user_id, content)
            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Unknown message type"
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"User {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Internal server error"
        }))
        manager.disconnect(websocket, user_id)

async def handle_voice_message(websocket: WebSocket, user_id: str, voice_data: Dict):
    """Handle voice message processing"""
    try:
        # Extract audio data
        audio_data = voice_data.get("audioData")
        if not audio_data:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "No audio data provided"
            }))
            return
        
        # Transcribe using Whisper
        if hasattr(app.state, 'openai_service'):
            transcript = await app.state.openai_service.transcribe_audio(audio_data)
            
            # Send transcript back
            await websocket.send_text(json.dumps({
                "type": "transcription",
                "data": {
                    "transcript": transcript,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }))
            
            # Generate AI response
            ai_response = await generate_ai_response(transcript, user_id)
            
            # Convert to speech using ElevenLabs
            if hasattr(app.state, 'elevenlabs_service'):
                audio_response = await app.state.elevenlabs_service.text_to_speech(ai_response)
                
                await websocket.send_text(json.dumps({
                    "type": "ai_response",
                    "data": {
                        "text": ai_response,
                        "audio": audio_response,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                }))
        
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Failed to process voice message"
        }))

async def handle_chat_message(websocket: WebSocket, user_id: str, message: str):
    """Handle text chat message"""
    try:
        # Generate AI response
        ai_response = await generate_ai_response(message, user_id)
        
        await websocket.send_text(json.dumps({
            "type": "ai_response",
            "data": {
                "text": ai_response,
                "timestamp": datetime.utcnow().isoformat()
            }
        }))
        
    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Failed to process chat message"
        }))

async def handle_career_analysis(websocket: WebSocket, user_id: str, profile_data: Dict):
    """Handle career analysis request"""
    try:
        # Analyze career fit using AI
        if hasattr(app.state, 'career_analyzer'):
            analysis = await app.state.career_analyzer.analyze_career_fit(profile_data)
            
            await websocket.send_text(json.dumps({
                "type": "career_analysis",
                "data": analysis
            }))
        
    except Exception as e:
        logger.error(f"Career analysis error: {e}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Failed to analyze career profile"
        }))

async def generate_ai_response(message: str, user_id: str) -> str:
    """Generate AI response using available services"""
    try:
        # Try Ollama first (local AI from LearnAI integration)
        if hasattr(app.state, 'ollama_service'):
            try:
                response = await app.state.ollama_service.generate_response(
                    message, 
                    context="career_guidance"
                )
                if response:
                    return response
            except Exception as e:
                logger.warning(f"Ollama service failed, falling back to OpenAI: {e}")
        
        # Fallback to OpenAI
        if hasattr(app.state, 'openai_service'):
            response = await app.state.openai_service.generate_response(
                message,
                system_prompt="You are CareerCompass AI, a helpful career guidance assistant. Provide personalized advice about career paths, skills, and professional development."
            )
            return response
        
        return "I'm currently unable to process your request. Please try again later."
        
    except Exception as e:
        logger.error(f"AI response generation error: {e}")
        return "I'm experiencing technical difficulties. Please try again."

# Flashcard generation endpoint (from LearnAI integration)
@app.post("/api/flashcards")
async def generate_flashcards(request_data: Dict[str, Any]):
    """Generate flashcards from notes using AI"""
    try:
        notes = request_data.get("notes")
        if not notes:
            raise HTTPException(status_code=400, detail="Notes are required")
        
        # Use Ollama for flashcard generation (LearnAI pattern)
        if hasattr(app.state, 'ollama_service'):
            flashcards = await app.state.ollama_service.generate_flashcards(notes)
            return {"flashcards": flashcards}
        
        raise HTTPException(status_code=503, detail="AI service unavailable")
        
    except Exception as e:
        logger.error(f"Flashcard generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")

# Quiz generation endpoint (from LearnAI integration)
@app.post("/api/quiz")
async def generate_quiz(request_data: Dict[str, Any]):
    """Generate quiz from text using AI"""
    try:
        text = request_data.get("text")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Use Ollama for quiz generation (LearnAI pattern)
        if hasattr(app.state, 'ollama_service'):
            quiz = await app.state.ollama_service.generate_quiz(text)
            return {"quiz": quiz}
        
        raise HTTPException(status_code=503, detail="AI service unavailable")
        
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")

# Study buddy endpoint (from LearnAI integration)
@app.post("/api/study-buddy")
async def study_buddy(request_data: Dict[str, Any]):
    """AI study buddy for answering questions"""
    try:
        question = request_data.get("question")
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        # Use AI to answer study questions
        answer = await generate_ai_response(
            f"As a study buddy, help me understand: {question}",
            user_id="study_buddy"
        )
        
        return {"answer": answer}
        
    except Exception as e:
        logger.error(f"Study buddy error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get study help")

# Exception handlers
@app.exception_handler(APIException)
async def api_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "code": exc.error_code}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )