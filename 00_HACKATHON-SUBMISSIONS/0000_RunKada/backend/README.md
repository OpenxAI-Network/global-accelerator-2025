# RunKada Backend

A Node.js/Express backend for the RunKada group running web app with Strava OAuth integration and Supabase database.

## Features

- 🔐 **Strava OAuth Authentication** - Connect with existing Strava accounts or create new ones
- 🏃‍♂️ **Activity Tracking** - Sync and store running activities from Strava
- 👥 **Clan System** - Create and join running groups
- 📊 **Leaderboards** - Track performance and compete with others
- 🔒 **Secure API** - JWT authentication and rate limiting
- 📈 **Real-time Data** - Live activity sync and statistics

## Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Strava OAuth 2.0 + JWT
- **Security**: Helmet, CORS, Rate Limiting
- **API**: RESTful API design

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Strava API credentials

### 2. Installation

```bash
cd backend
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Strava OAuth Configuration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3001/api/auth/strava/callback

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `database/schema.sql`
4. This will create all necessary tables, indexes, and policies

### 5. Strava API Setup

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set the Authorization Callback Domain to your domain
4. Copy the Client ID and Client Secret to your `.env` file

### 6. Run the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `GET /api/auth/strava/url` - Get Strava authorization URL
- `POST /api/auth/strava/callback` - Handle Strava OAuth callback
- `POST /api/auth/strava/refresh` - Refresh Strava access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get user leaderboard
- `GET /api/users/clan` - Get user's clan information

### Activities
- `GET /api/activities` - Get user's activities from Strava
- `GET /api/activities/stats` - Get user's activity statistics
- `GET /api/activities/recent` - Get recent activities (cached)

### Clans
- `GET /api/clans` - Get all clans
- `GET /api/clans/:id` - Get specific clan details
- `POST /api/clans` - Create a new clan
- `POST /api/clans/:id/join` - Join a clan
- `POST /api/clans/:id/leave` - Leave a clan

## Database Schema

### Tables
- **users** - User profiles and Strava data
- **strava_tokens** - OAuth tokens for Strava API
- **activities** - Running activities from Strava
- **clans** - Running groups/clans
- **clan_members** - Clan membership relationships

### Key Features
- Row Level Security (RLS) enabled
- Automatic timestamp updates
- Optimized indexes for performance
- Comprehensive activity data storage

## Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configured for specific frontend origin
- **Helmet Security** - Security headers and protection
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Request body validation
- **SQL Injection Protection** - Parameterized queries

## Development

### Project Structure
```
backend/
├── config/
│   ├── supabase.js      # Supabase configuration
│   └── strava.js        # Strava API configuration
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── activities.js    # Activity routes
│   └── clans.js         # Clan routes
├── database/
│   └── schema.sql       # Database schema
├── server.js            # Main server file
└── package.json
```

### Adding New Features

1. Create new route files in `routes/`
2. Add middleware in `middleware/` if needed
3. Update database schema if required
4. Add proper error handling and validation
5. Update this README with new endpoints

## Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure JWT and session secrets
- Configure proper CORS origins
- Set up SSL/HTTPS
- Use environment-specific Supabase projects

### Health Check
The server provides a health check endpoint at `/health` for monitoring.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` in environment variables
2. **Database Connection**: Verify Supabase credentials and URL
3. **Strava API Errors**: Check client ID/secret and redirect URI
4. **JWT Errors**: Ensure `JWT_SECRET` is set and consistent

### Logs
Check the console output for detailed error messages and stack traces.

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test thoroughly

## License

MIT License - see LICENSE file for details.
