# PlanThat - AI-Powered Event Planning Application

## Project Information
- Name: Nathan Roland
- Team: Solo
- Project Name: PlanThat
- Track Specification: Social Network

## Project Description

PlanThat is an innovative AI-powered social event planning platform that revolutionises how people discover, plan, and organise meetups with friends. By leveraging local AI models and real-time geospatial data, PlanThat eliminates the overwhelming decision-making process that often prevents people from organising social gatherings.

### **The Problem**
Planning social events is typically a time-consuming and frustrating experience. Users struggle with:
- **Location discovery**: Finding suitable venues that accommodate everyone's needs
- **Coordination complexity**: Managing multiple people's schedules and preferences
- **Search Fatigue**: Users feel tired of constantly searching to find new locations and experiences.
- **Information overload**: Researching venues, reviews, and logistics
- **Decision paralysis**: Too many options and conflicting preferences

### **The Solution**
PlanThat streamlines the entire event planning process through intelligent automation:

**🤖 AI-Powered Recommendations**: Our local Llama3.2:3b AI model analyzes user preferences, dietary restrictions, activity interests, and location data to generate personalised venue recommendations with detailed descriptions, pricing, and availability.

**🗺️ Interactive Geospatial Discovery**: Real-time integration with OpenStreetMap data provides comprehensive Points of Interest (POIs) including restaurants, bars, cafes, entertainment venues, and cultural attractions, all visualised on interactive maps.

**👥 Social Network Integration**: Built-in friend management system with friend requests, real-time notifications, and collaborative event planning features that make coordinating with groups seamless.

**📅 Smart Calendar Management**: Integrated event creation, invitation system, and participant management with the ability to edit, delete, and manage event details dynamically.

**🔖 Personalized Experience**: User bookmarking system, preference sliders, and activity categorization ensure recommendations become more accurate over time.

**📱 Responsive Design**: Modern, intuitive interface that works seamlessly across desktop and mobile devices, making event planning accessible anywhere.

### 🚀 Features

- **AI-Powered Recommendations**: Get personalized place recommendations using Ollama AI models
- **Interactive Maps**: View locations on interactive maps with Points of Interest (POIs)
- **User Management**: User registration, authentication, and profile management
- **Friend System**: Add friends, send friend requests, and manage relationships
- **Event Planning**: Create and manage events with calendar integration
- **Bookmarks**: Save and manage favorite locations
- **Real-time Notifications**: Get notified about events, friend requests, and updates
- **Responsive Design**: Works on desktop and mobile devices


### **Key Differentiators**
- **Privacy-First**: Local AI processing ensures user data never leaves their device
- **Real-Time Data**: Live integration with OpenStreetMap for up-to-date venue information
- **Social-Centric**: Built specifically for group coordination and social interaction
- **Intelligent Automation**: Reduces planning time from hours to minutes
- **Comprehensive Coverage**: Supports diverse event types from casual meetups to formal gatherings


PlanThat transforms the complex, often frustrating process of event planning into a delightful, efficient experience that encourages more social connections and meaningful gatherings. 


## 📹 Demo Video

Watch our demo video to see PlanThat in action:

[![PlanThat Demo](https://img.youtube.com/vi/Ws9vrPQbhrQ/0.jpg)](https://youtu.be/Ws9vrPQbhrQ)

**[Click here to watch the full demo](https://youtu.be/Ws9vrPQbhrQ)**

## Challenges Faced

While the application development was successful, there were still various challenges involved in the implementation of certain features.

1.  **Map Markings using Public Keys**
    Using OpenStreetMaps, based off wikipedia, and Overpass API, I was able to overcome the challenge of needing a private key/token to access map data.

2.  **AI Prompting**
    Using llama 3.2:3b, I was able to obtain accurate AI results that suited the users needs, where as I found with other AI models, the searches were too slow or incorrect.

3.  **Calendar Integration**
    With google calendar, I would have had to authenticate my application to pull and push calendar events from an external website, which involved creating a token and specialised email address. However I was able to create a postgres database implementation of a calendar instead.

4.  **Postgres Database**
    In order to solve any issues with local databases, I connected the application to a postgres database, enabling for total user access to the database.


## User Potential and Adoption

The user potential for the PlanThat app is endless, especially in a time where users are eager to explore their options and more likely to consume.

93% of all online experiences start with a search engine, highlighting the demand for a search-like application for experiences. An 85% usage of the web to discover events, with a further 78% of those people purchasing within 24 hours demonstrates how individuals are eager to go out of their way to search for, and spend on activities/events that suit their needs. In conjunction, searches for group activities spiked by 72% in the previous 12 months, demonstrating how the event/activity industry is still growing.

PlanThat's utilisation of AI to streamline the organisation, booking, and searching processes means it can position itself to both attract and retain users, giving the application a significantly high growth potential.

- **93%** Of all online experiences start with a search engine result (attendstar)
- **85%** Of event-goers use the web to discover events, with 78% resulting in purchases within 24 hours (attendstar)
- **72%** Searches for "group activities" spiked by 72% in 12 months (Peach2020)

## Future Feature Implementations

- **Google Maps API**: The use of the Google maps API would increase accuracy of results in regards to address, opening hours, and allow for reviews and popular times to be displayed for each location.
- **Calendar Intergration**: Users can integrate their own calendar into the application, so they can see how the events they planned lines up with their own schedules.
- **Use of Real Time Location**: The ability for users to see how far away they are from places, thus affecting their decision
- **Use of Tik Tok/Reviews**: When obtaining the results of the place, the AI can obtain either Tik Tok or other review content for the activity/location, allowing for users o make an informed judgement.
- **Live Events/Activities**: The use of having live activities, such as weekly events (farmers markets, music parties, classes), or even one off events for nightlife such as concerts would increase user options.
- **Holiday planning feature**: able to plan out holidays and what to do on specific days

## Methods of Monetization

PlanThat employs several strategies to monetize the application and ensure its sustainability:

### 1. Business Recommendations
One of the primary monetization methods is through business recommendations. This includes:
-   **"Top Picks" Tab**: Businesses can pay to have their location prominently featured in a "top picks" tab, increasing their visibility and attracting more potential customers.
-   **Targeted AI Recommendations**: Businesses can also pay to influence the AI's recommendation algorithm. This means the AI will show a preference towards suggesting their business (though it doesn't guarantee an exclusive suggestion). Alternatively, when a business appears in search results, it can secure preferential placement (e.g., positions 1 or 2) compared to its regular ranking (e.g., positions 3, 4, or 5).

### 2. User Payment Plans
Monetization through users is achieved via a free and paid tier of memberships. These tiers are differentiated in the following ways:
-   **Different Locations**: Free users are limited to searching within their local area/state, while paid users have the flexibility to search for any location.
-   **Amount of AI Recommendations**: Free users receive a set daily limit on AI requests/recommendations, whereas paid users enjoy unlimited access.
-   **Amount of Events**: Free users can only schedule a limited number of events at a time, while paid users have the freedom to schedule an unlimited number of events.

### 3. Business Deals
A widely adopted method in advertising, this involves leveraging promotional deals:
-   **Discount Offers**: The application offers discounts to users for various activities.
-   **Percentage Fee**: In return for facilitating these discounts, the application receives a small percentage fee for every successful transaction.
-   **Real-world Application**: This approach is evident in the launch of new restaurants/stores and in the nightlife sector, where applications like "Bondi lines" generate monetary gains through deals with different nightclubs, showcasing the effectiveness of this monetization strategy.

## Why does this application win?

PlanThat is a one of a kind application. By harnessing AI to streamline the entire event and activity planning process, it goes beyond all other competitors. It is positioned to not only be a strong chance for winning this competition, but also capture early adoption and sustained long term growth, evolving into a fully developed platform for public release.

### Innovation
It is the first application of its kind to utilise both geospatial discovery and AI to discover new locations and to streamline activity coordination with other individuals.

### User Experience
Responsive designs, real time notifications, and interactive maps provide a comfortable user experience, where they are in control at all times and not overloaded with information.

### User Adoption
By leveraging AI to simplify planning, discovery, and booking, PlanThat positions itself to both attract and retain users, and since it resides in a strong market demand with limited players, it has a significantly high growth potential.

### Impact
This application not only provides a plethora of options available to suit the user's needs, it also allows for easier communication, saving valuable user time.

### Decentralised Vision
With the transition of a postgres database into a more decentralised storage system provided by OpenxAI, in conjunction of an AI model that is also on a decentralised storage system, it encourages a decentralised vision.


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

