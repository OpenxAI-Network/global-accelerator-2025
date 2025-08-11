# 💪 Fitness Buddy
AI-powered fitness form analysis using computer vision and Google Gemini

## Track
Vision

## Team Members
- Nelson - [@chinesepowered]

## 🎥 Demo Video (REQUIRED)
[YouTube Link Here - 3 minutes max]

## Technologies Used
- Next.js 15
- TypeScript
- Tailwind CSS
- Google Gemini 2.5 Flash
- React 19
- MediaRecorder API
- FileReader API

## Setup & Run Instructions
1. Clone this repository
2. Navigate to project folder: `cd 0001_fitness_buddy`
3. Install dependencies: `pnpm install`
4. Get Google AI API key from https://ai.google.dev/
5. Add API key to `.env.local`: `GOOGLE_API_KEY=your_key_here`
6. Start development server: `pnpm run dev`
7. Open http://localhost:3000 in your browser

## Project Description
Fitness Buddy is an AI-powered fitness form analysis tool that helps users perfect their workout technique. Users can either upload pre-recorded workout videos or record themselves live using their webcam. The app then processes the video through Google's Gemini 2.5 Flash model to provide detailed analysis including:

- Exercise identification and form assessment
- Specific corrections for improper technique
- Safety warnings for potentially dangerous movements
- Positive reinforcement for good form
- Actionable advice for improvement

The app features a clean, modern UI with real-time video preview, loading states, and comprehensive error handling. It's designed to make professional-level fitness coaching accessible to everyone.

## Innovation & Impact
Fitness Buddy democratizes access to professional fitness coaching by leveraging cutting-edge AI vision capabilities. Traditional personal training is expensive and not accessible to everyone, but this app provides:

**Innovation:**
- Real-time computer vision analysis of exercise form
- Multimodal AI that understands both visual movement patterns and exercise context
- Seamless integration of webcam recording with cloud-based AI processing
- User-friendly interface that makes advanced AI accessible to non-technical users

**Real-world Impact:**
- **Injury Prevention**: Helps users avoid common workout injuries caused by poor form
- **Accessibility**: Makes fitness coaching available 24/7 from anywhere
- **Cost-Effective**: Reduces the need for expensive personal training sessions
- **Educational**: Teaches users proper form techniques they can apply long-term
- **Scalable**: Can serve unlimited users simultaneously without human trainers

## Future Plans
**Short-term Enhancements:**
- Exercise-specific analysis (squats, deadlifts, push-ups, etc.)
- Progress tracking and workout history
- Personalized improvement recommendations
- Integration with wearable devices for heart rate/rep counting
- Social features for sharing progress and competing with friends

**Scaling Opportunities:**
- **Mobile App**: Native iOS/Android apps with offline analysis capabilities
- **Gym Integration**: Partner with fitness centers to provide in-gym analysis stations
- **Subscription Model**: Premium features like detailed biomechanical analysis and custom workout plans
- **Trainer Platform**: Tools for professional trainers to analyze multiple clients
- **Corporate Wellness**: Enterprise solutions for company fitness programs
- **Physical Therapy**: Specialized analysis for rehabilitation exercises

**Technical Scaling:**
- Real-time analysis with WebRTC streaming
- Multi-camera angle analysis for comprehensive form assessment
- Custom-trained models for sport-specific movements
- Integration with popular fitness apps and platforms