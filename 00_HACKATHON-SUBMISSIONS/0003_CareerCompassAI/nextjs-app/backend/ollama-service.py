"""
Ollama Service for local AI integration (from LearnAI demo)
Handles local AI model interactions for flashcards, quizzes, and study assistance
"""

import aiohttp
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama3.2:1b"  # From LearnAI demo
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def health_check(self) -> bool:
        """Check if Ollama service is available"""
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/api/tags") as response:
                return response.status == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False
    
    async def generate_response(self, prompt: str, context: str = "general") -> str:
        """Generate AI response using Ollama"""
        try:
            session = await self._get_session()
            
            # Enhanced prompt based on context
            if context == "career_guidance":
                system_prompt = """You are CareerCompass AI, a professional career guidance assistant. 
                Provide helpful, accurate, and personalized career advice. Focus on:
                - Career path recommendations
                - Skill development suggestions  
                - Industry insights
                - Professional growth strategies
                Keep responses concise but comprehensive."""
                
                full_prompt = f"{system_prompt}\n\nUser: {prompt}\nAssistant:"
            else:
                full_prompt = prompt
            
            data = {
                "model": self.model,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            }
            
            async with session.post(f"{self.base_url}/api/generate", json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get("response", "").strip()
                else:
                    logger.error(f"Ollama API error: {response.status}")
                    return ""
                    
        except Exception as e:
            logger.error(f"Ollama response generation error: {e}")
            return ""
    
    async def generate_flashcards(self, notes: str) -> List[Dict[str, str]]:
        """Generate flashcards from notes (LearnAI integration)"""
        try:
            prompt = f"""Create flashcards from the following notes. Generate 5-8 flashcards in JSON format with the following structure:
{{
  "flashcards": [
    {{
      "front": "Question or term",
      "back": "Answer or definition"
    }}
  ]
}}

Focus on key concepts, definitions, and important facts. Make questions clear and answers concise.

Notes: {notes}"""
            
            session = await self._get_session()
            data = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.5,  # Lower temperature for more consistent formatting
                    "top_p": 0.8
                }
            }
            
            async with session.post(f"{self.base_url}/api/generate", json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    response_text = result.get("response", "")
                    
                    # Try to parse JSON from response
                    try:
                        # Look for JSON-like structure
                        start_idx = response_text.find('{')
                        end_idx = response_text.rfind('}') + 1
                        
                        if start_idx != -1 and end_idx > start_idx:
                            json_str = response_text[start_idx:end_idx]
                            flashcards_data = json.loads(json_str)
                            return flashcards_data.get("flashcards", [])
                    except json.JSONDecodeError:
                        logger.warning("Could not parse JSON from Ollama response")
                    
                    # Fallback: create a simple flashcard from the response
                    return [{
                        "front": "Generated from your notes",
                        "back": response_text if response_text else "No response from model"
                    }]
                else:
                    logger.error(f"Ollama flashcard generation error: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Flashcard generation error: {e}")
            return []
    
    async def generate_quiz(self, text: str) -> List[Dict[str, Any]]:
        """Generate quiz questions from text (LearnAI integration)"""
        try:
            prompt = f"""Create a quiz from the following text. Generate 5-7 multiple choice questions in JSON format:
{{
  "quiz": [
    {{
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation for the correct answer"
    }}
  ]
}}

Make questions challenging but fair, with clear explanations.

Text: {text}"""
            
            session = await self._get_session()
            data = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.6,
                    "top_p": 0.85
                }
            }
            
            async with session.post(f"{self.base_url}/api/generate", json=data) as response:
                if response.status == 200:
                    result = await response.json()
                    response_text = result.get("response", "")
                    
                    # Try to parse JSON from response
                    try:
                        start_idx = response_text.find('{')
                        end_idx = response_text.rfind('}') + 1
                        
                        if start_idx != -1 and end_idx > start_idx:
                            json_str = response_text[start_idx:end_idx]
                            quiz_data = json.loads(json_str)
                            return quiz_data.get("quiz", [])
                    except json.JSONDecodeError:
                        logger.warning("Could not parse JSON from Ollama quiz response")
                    
                    # Fallback: create a simple question
                    return [{
                        "question": "What is the main topic discussed in the text?",
                        "options": ["Topic A", "Topic B", "Topic C", "Topic D"],
                        "correct": 0,
                        "explanation": "Based on the provided text."
                    }]
                else:
                    logger.error(f"Ollama quiz generation error: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Quiz generation error: {e}")
            return []
    
    async def generate_study_help(self, question: str) -> str:
        """Generate study help response (LearnAI integration)"""
        try:
            system_prompt = """You are a helpful study buddy. Provide clear, educational explanations 
            that help students understand concepts better. Break down complex topics into simple terms, 
            provide examples, and encourage learning."""
            
            full_prompt = f"{system_prompt}\n\nStudent Question: {question}\n\nStudy Buddy Response:"
            
            response = await self.generate_response(full_prompt, context="study_help")
            return response if response else "I'm having trouble understanding your question. Could you please rephrase it?"
            
        except Exception as e:
            logger.error(f"Study help generation error: {e}")
            return "I'm currently unable to help with that question. Please try again later."
    
    async def analyze_career_skills(self, skills: List[str], interests: List[str]) -> Dict[str, Any]:
        """Analyze career skills and provide recommendations"""
        try:
            skills_str = ", ".join(skills)
            interests_str = ", ".join(interests)
            
            prompt = f"""As a career counselor, analyze these skills and interests to provide career recommendations:

Skills: {skills_str}
Interests: {interests_str}

Please provide:
1. Top 3 career matches with brief explanations
2. Skills that should be developed further
3. Potential career paths to explore
4. Industry trends to be aware of

Format the response clearly with numbered points."""
            
            response = await self.generate_response(prompt, context="career_guidance")
            
            # Parse response into structured format
            return {
                "analysis": response,
                "timestamp": datetime.utcnow().isoformat(),
                "confidence": 0.8,  # Default confidence score
                "recommendations": self._extract_recommendations(response)
            }
            
        except Exception as e:
            logger.error(f"Career skills analysis error: {e}")
            return {
                "analysis": "Unable to analyze at this time",
                "timestamp": datetime.utcnow().isoformat(),
                "confidence": 0.0,
                "recommendations": []
            }
    
    def _extract_recommendations(self, response: str) -> List[str]:
        """Extract key recommendations from AI response"""
        try:
            lines = response.split('\n')
            recommendations = []
            
            for line in lines:
                line = line.strip()
                if line and (line.startswith('•') or line.startswith('-') or 
                           line.startswith('1.') or line.startswith('2.') or line.startswith('3.')):
                    # Clean up the recommendation
                    clean_rec = line.lstrip('•-123. ').strip()
                    if clean_rec:
                        recommendations.append(clean_rec)
            
            return recommendations[:5]  # Limit to top 5 recommendations
            
        except Exception as e:
            logger.error(f"Error extracting recommendations: {e}")
            return []
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()
            self.session = None