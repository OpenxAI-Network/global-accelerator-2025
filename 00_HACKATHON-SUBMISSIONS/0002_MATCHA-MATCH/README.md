# 🍵 MatchaMatch - AI-Powered Matcha Café Finder

## 🏆 OpenxAI Global AI Accelerator 2025 Hackathon Submission

**Track**: Social Network + Textstream (Sentiment Analysis)  
**Team**: Fizzafatima , Hiba Wajeeh, Jeyasri , Romy Dobbie
**University**: The University of Sydney
**Project**: MatchaMatch - Connecting people with their perfect matcha experience through AI and sentiment analysis

# Youtube link:
https://youtu.be/p_Va9aGfPpY

## 🎯 Project Overview

MatchaMatch is an intelligent application that helps users find their perfect matcha café match using natural language queries, AI-powered recommendations, and sentiment analysis. Instead of traditional search filters, users can describe their mood, preferences, and needs in natural language, and our AI will find the perfect café for them.

### ✨ Key Features

- **🤖 AI-Powered Search**: Natural language queries instead of rigid filters
- **💚 Sentiment Analysis**: Understands user mood and preferences
- **🗺️ Google Maps Integration**: Real-time location-based recommendations
- **💬 Intelligent Chat Interface**: Conversational AI recommendations
- **🎯 Personalized Matching**: Learns from user preferences and interactions
- **❤️ Favorites System**: Heart and save your favorite matcha spots
- **⭐ Reviews & Ratings**: Share your experiences and read others' reviews
- **📱 Modern Web App**: Beautiful, responsive interface built with React + Django

### 🧠 AI Integration

- **Ollama Integration**: Local AI processing for privacy and speed
- **Sentiment Analysis**: Detects user mood and adjusts recommendations
- **Natural Language Processing**: Understands complex user requests
- **Intelligent Matching**: AI-powered café recommendations

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** installed on your system
- **Node.js 18+** and npm for frontend
- **Ollama** installed and running locally

### One-Command Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd 0002_MATCHA-MATCH

# 2. Set up Python environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Set up frontend dependencies
npm install

# 4. Start the backend server
python manage.py runserver

# 5. In a new terminal, start the frontend
npm run dev
```

### 🎯 What Happens Next

1. **Backend starts** at `http://localhost:8000`
2. **Frontend starts** at `http://localhost:3000`
3. **Open your browser** and start finding your perfect matcha match!

## 🏗️ Architecture

### Backend (Django)
- **Django 4.2** with REST API
- **SQLite database** for development (easy to migrate to PostgreSQL)
- **Google Maps API** integration for location services
- **Ollama integration** for AI features
- **Sentiment analysis** for user mood detection

### Frontend (React + Vite)
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for modern styling
- **Google Maps** integration
- **Real-time chat interface**

### AI Features
- **Local Ollama processing** for privacy
- **Sentiment analysis** of user queries
- **Natural language understanding** for café preferences
- **Intelligent matching** algorithms

## 🎨 User Experience Flow

1. **User opens app** → Sees map + chat interface
2. **Types natural language query** → "I want a peaceful café for studying"
3. **AI analyzes intent** → Extracts: quiet, study-friendly, any location
4. **AI searches database** → Finds matching cafés
5. **AI generates response** → Friendly, personalized recommendation
6. **Map highlights locations** → Shows cafés with AI insights
7. **Sentiment tracking** → Records user preferences for future matches

## 🔧 Technical Implementation

### Dependencies

All Python dependencies are managed in `requirements.txt`:
- **Django 4.2.23** - Web framework
- **Django REST Framework 3.16.1** - API development
- **Google Maps API** - Location services
- **python-dotenv** - Environment configuration
- **Pillow** - Image processing
- **Requests** - HTTP client

### Environment Variables

Create a `.env` file in the root directory:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
SECRET_KEY=your_django_secret_key_here
DEBUG=True
```

### Database

- **Development**: SQLite (included)
- **Production**: PostgreSQL (easy migration)

## 🎯 Hackathon Requirements Met

### ✅ Sentiment Analysis
- **User mood detection** from natural language queries
- **Emotional context** for café recommendations
- **Sentiment-aware AI responses**

### ✅ AI Integration
- **Ollama local AI processing**
- **Natural language understanding**
- **Intelligent recommendation system**

### ✅ Real-World Application
- **Solves actual user problems**
- **Google Maps integration**
- **Professional architecture**

### ✅ Technical Excellence
- **Full-stack development** (Django + React)
- **API-first design**
- **Modern development practices**

### ✅ Social Features (NEW!)
- **❤️ Favorites System** - Heart and save favorite matcha spots
- **⭐ Reviews & Ratings** - Community-driven feedback system
- **👥 User Interactions** - Social engagement through place recommendations

## 🚀 Future Enhancements

- **Machine learning** for better recommendations
- **Social features** for café reviews and ratings
- **Mobile app** development
- **Advanced sentiment analysis** with conversation memory
- **Integration with café POS systems**

## 📱 Demo Video

**🎥 Demo Video**: [Add your YouTube link here showing the app in action]

**📋 What to demonstrate in your video:**
1. **App Overview** - Show the main interface and explain the concept
2. **Favorites Feature** - Demonstrate hearting places and viewing favorites page
3. **Reviews System** - Show adding reviews and viewing them
4. **AI Chat** - Demonstrate the conversational interface
5. **Real-time Features** - Show the app working with live data
6. **Why It Should Win** - Explain the innovation and real-world impact

## 🏆 Why This Should Win

1. **Real Problem Solved**: Finding the right café is a genuine user pain point
2. **AI Innovation**: Combines sentiment analysis with location services
3. **Professional Quality**: Production-ready code with proper architecture
4. **User Experience**: Intuitive, conversational interface
5. **Technical Excellence**: Full-stack development with modern tools
6. **Scalability**: Easy to extend and improve

## 🤝 Contributing

This is a hackathon submission for the OpenxAI Global AI Accelerator 2025. The project demonstrates:

- **AI integration** with Ollama
- **Sentiment analysis** for user experience
- **Real-world application** development
- **Professional software engineering** practices

## 🚨 Troubleshooting

### Common Issues & Solutions

**❌ "Module not found" errors**
```bash
# Make sure you're in the virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**❌ "npm install" fails**
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

**❌ Backend won't start**
```bash
# Check if port 8000 is in use
lsof -i :8000  # On Windows: netstat -ano | findstr :8000
# Kill the process or use a different port
python manage.py runserver 8001
```

**❌ Frontend won't start**
```bash
# Check if port 3000/8081 is in use
lsof -i :3000  # On Windows: netstat -ano | findstr :3000
# The app will automatically find an available port
```

## 📞 Support

For questions about this submission, contact: thefizzafatima@gmail.com

---

**Built with ❤️ for the OpenxAI Global AI Accelerator 2025**

*Connecting people with their perfect matcha experience through the power of AI*
