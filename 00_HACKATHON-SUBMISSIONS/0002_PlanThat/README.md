# PlanThat - AI-Powered Event Planning Application

## Project Information
- Name: Nathan Roland
- Teamname: Dr Banana
- Project Name: PlanThat
- Track Specification: Social Network

## Project Description

PlanThat is an innovative AI-powered social event planning platform that revolutionises how people discover, plan, and organise meetups with friends. By leveraging local AI models and real-time geospatial data, PlanThat eliminates the overwhelming decision-making process that often prevents people from organising social gatherings.

### **The Problem**
Planning social events is typically a time-consuming and frustrating experience. Users struggle with:
- **Decision paralysis**: Too many options and conflicting preferences
- **Location discovery**: Finding suitable venues that accommodate everyone's needs
- **Coordination complexity**: Managing multiple people's schedules and preferences
- **Information overload**: Researching venues, reviews, and logistics
- **Recurring themes**: Going to the same place continuously because nothing else stands out to them

### **The Solution**
PlanThat streamlines the entire event planning process through intelligent automation:

**🤖 AI-Powered Recommendations**: Our local Llama3.2:3b AI model analyzes user preferences, dietary restrictions, activity interests, and location data to generate personalised venue recommendations with detailed descriptions, pricing, and availability.

**🗺️ Interactive Geospatial Discovery**: Real-time integration with OpenStreetMap data provides comprehensive Points of Interest (POIs) including restaurants, bars, cafes, entertainment venues, and cultural attractions, all visualised on interactive maps.

**👥 Social Network Integration**: Built-in friend management system with friend requests, real-time notifications, and collaborative event planning features that make coordinating with groups seamless.

**📅 Smart Calendar Management**: Integrated event creation, invitation system, and participant management with the ability to edit, delete, and manage event details dynamically.

**🔖 Personalized Experience**: User bookmarking system, preference sliders, and activity categorization ensure recommendations become more accurate over time.

**📱 Responsive Design**: Modern, intuitive interface that works seamlessly across desktop and mobile devices, making event planning accessible anywhere.

### **Key Differentiators**
- **Privacy-First**: Local AI processing ensures user data never leaves their device
- **Real-Time Data**: Live integration with OpenStreetMap for up-to-date venue information
- **Social-Centric**: Built specifically for group coordination and social interaction
- **Intelligent Automation**: Reduces planning time from hours to minutes
- **Comprehensive Coverage**: Supports diverse event types from casual meetups to formal gatherings

PlanThat transforms the complex, often frustrating process of event planning into a delightful, efficient experience that encourages more social connections and meaningful gatherings. 

## 🚀 Features

- **AI-Powered Recommendations**: Get personalized place recommendations using Ollama AI models
- **Interactive Maps**: View locations on interactive maps with Points of Interest (POIs)
- **User Management**: User registration, authentication, and profile management
- **Friend System**: Add friends, send friend requests, and manage relationships
- **Event Planning**: Create and manage events with calendar integration
- **Bookmarks**: Save and manage favorite locations
- **Real-time Notifications**: Get notified about events, friend requests, and updates
- **Responsive Design**: Works on desktop and mobile devices

## 📹 Demo Video

Watch our demo video to see PlanThat in action:

[![PlanThat Demo](https://img.youtube.com/vi/Ws9vrPQbhrQ/0.jpg)](https://youtu.be/Ws9vrPQbhrQ)

**[Click here to watch the full demo](https://youtu.be/Ws9vrPQbhrQ)**

## Tech Stack

### Backend
- **Flask**: Python web framework for API development
- **PostgreSQL**: Primary database for data persistence
- **psycopg2**: PostgreSQL adapter for Python
- **Ollama**: Local AI model server for recommendations

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet**: Interactive maps and geospatial features

### AI & APIs
- **Llama3.2:3b**: Local AI model for place recommendations
- **Overpass API**: OpenStreetMap data for Points of Interest
- **Nominatim**: Geocoding service for address-to-coordinates conversion

### Development Tools
- **Node.js**: JavaScript runtime for frontend development
- **Python 3.8+**: Backend runtime environment
- **npm**: Package manager for Node.js dependencies
- **pip**: Package manager for Python dependencies
  
## Future Goals - possible additions

- **Google Maps API**: the use of the Google Maps API for increased accuracy of results in regards to address, opening hours, popularity and if there are any results that OpenStreetMaps may have missed
- **Google Calendar Intergration**: aiming for users to import their own Google Calendars into the program, as well as export event onto their Google Calendar
- **Use of Real Time Location**: the ability for users to see how far away they are from places, thus affecting their decision
- **More live events**: concerts and nightlife intergration into the application with specific events rather than venues
- **Monetization**: Preferencing in the AI Prompt for locations, Top Picks of the week in the Your City section, users pay to access certain amount of prompts per day
- **Holiday planning feature**: able to plan out holidays and what to do on specific days

## 📁 Folder Structure

```
0002_PlanThat/
├── app.py                     # Main Flask application
├── requirements.txt           # Python dependencies
├── db_config.py              # Database configuration
├── users.py                  # User management
├── friends.py                # Friend system
├── bookmarks.py              # Bookmark functionality
├── notifications.py          # Notification system
├── regular_calendar.py       # Event management
├── invite.py                 # Invitation system
├── google_calendar.py        # Google Calendar integration
├── nextjs-app/               # Next.js frontend
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── package.json          # Node.js dependencies
│   └── ...
└── README.md                 # This file
```


## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Ollama** - [Download here](https://ollama.ai/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd global-accelerator-2025/00_HACKATHON-SUBMISSIONS/0002_PlanThat
```


### 2. Set Up PostgreSQL Database

#### Install PostgreSQL
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: Download from [PostgreSQL website](https://www.postgresql.org/download/windows/)

#### Create Database and User

```bash
# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Access PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE planthat_db;
CREATE USER nathanroland WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE planthat_db TO nathanroland;
\q
```

### 3. Set Up Python Backend

```bash
# Navigate to the project directory
cd 00_HACKATHON-SUBMISSIONS/0002_PlanThat

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```



### 4. Set Up Next.js Frontend

```bash
# Navigate to the Next.js app directory
cd nextjs-app

# Install Node.js dependencies
npm install
```

### 5. Install and Configure Ollama

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull the required AI model
ollama pull llama3.2:3b
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
# Navigate to the project root
cd 00_HACKATHON-SUBMISSIONS/0002_PlanThat

# Activate virtual environment (if not already activated)
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Start the Flask backend
python3 app.py
```

### 2. Start the Frontend Server

Open a new terminal window:

```bash
# Navigate to the Next.js app directory
cd 00_HACKATHON-SUBMISSIONS/0002_PlanThat/nextjs-app

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Access the Application

Open your web browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 🔧 Configuration

The application uses PostgreSQL with the following default configuration:
- **Database**: `planthat_db`
- **User**: `nathanroland`
- **Password**: `password`
- **Host**: `localhost`
- **Port**: `5432`

You can modify these settings in `db_config.py` if needed.

**No additional environment variables are required!** The application uses:
- **OpenStreetMap tiles** (free, no API key required)
- **Hardcoded backend URL** (`http://localhost:5001`)

### AI Model Configuration

The application uses Ollama for AI-powered recommendations. You can change the model by:

1. Pulling a different model: `ollama pull <model-name>`
2. Updating the model name in `ollama-model.txt`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- `users`: User accounts and profiles
- `friends`: Friend relationships
- `friend_requests`: Pending friend requests
- `bookmarks`: User bookmarked locations
- `notifications`: User notifications
- `regular_calendar`: Events and meetings
- `event_to_user`: Event participants
- `invitation_to_regular_calendar_event`: Event invitations

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `db_config.py`
   - Verify database and user exist

2. **Port Already in Use**
   - Change port in `app.py` (line with `app.run()`)
   - Kill existing processes using the port

3. **Ollama Model Not Found**
   - Run `ollama list` to see available models
   - Pull the required model: `ollama pull llama3.2:3b`

4. **Node.js Dependencies**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

### Logs and Debugging

- **Backend logs**: Check terminal where Flask is running
- **Frontend logs**: Check browser console (F12)
- **Database logs**: Check PostgreSQL logs

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Friend System
- `POST /friends/send_request` - Send friend request
- `GET /friends/list` - Get friends list
- `POST /friends/accept_request` - Accept friend request

### Events
- `POST /regular_calendar/add` - Create event
- `GET /regular_calendar` - Get user events
- `PUT /regular_calendar/update` - Update event

### Bookmarks
- `POST /bookmarks/add` - Add bookmark
- `GET /bookmarks/get` - Get user bookmarks
- `POST /bookmarks/remove` - Remove bookmark
