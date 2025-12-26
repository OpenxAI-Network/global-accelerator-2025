# 🏃‍♂️ RunKada - Group Running Web App

[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

RunKada is a modern group running web application that connects runners through clans, tracks activities via Strava integration, and creates a competitive yet supportive running community. Built for the 2025 OpenxAI Hack Node Hackathon.

## ✨ Features

### 🔐 Authentication
- **Strava OAuth Integration** - Seamlessly connect with your Strava account
- Automatic activity syncing from Strava
- Secure user authentication and session management

### 👥 Clan System
- Create or join running clans
- Clan leaderboards and rankings
- Weekly clan challenges
- Clan badges and customization
- Member management (Leader, Co-Leader, Elder, Member roles)

### 📊 Activity Tracking
- Automatic run tracking via Strava
- Personal dashboard with stats
- Activity history and analytics
- Distance, pace, and time tracking

### 🏆 Rankings & Leaderboards
- Global individual rankings
- Clan-based rankings
- Monthly distance tracking
- Performance metrics

### 👤 User Profiles
- Customizable profile with photo upload
- Personal running goals
- Bio and runner information
- Country and province selection
- Running statistics display

### ⚙️ Settings & Customization
- Notification preferences (push, email, weekly reports)
- Privacy controls (public/private profile)
- Unit preferences (metric/imperial)
- Multi-language support
- Account management

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **Motion** - Animation library

### Styling
- Custom Tailwind configuration
- Tailwind Animate for animations
- Custom fonts (Poppins, Teko, Porter Sans Block)
- Responsive design with mobile-first approach

### Deployment
- **Vercel** - Deployment platform
- Optimized production builds
- SPA routing configuration

## 📁 Project Structure

```
RunKada/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Squares.jsx     # Animated background grid
│   │   └── RotatingText.jsx # Text animation component
│   ├── screens/            # Page components
│   │   ├── About/          # About page
│   │   ├── Clan/           # Clan discovery page
│   │   ├── ClanDashboard/  # Clan management dashboard
│   │   ├── Dashboard/      # User dashboard
│   │   ├── Homepage/       # Landing page
│   │   ├── Login/          # Authentication page
│   │   ├── Profile/        # User profile page
│   │   ├── Rank/           # Rankings/leaderboard page
│   │   └── Settings/       # User settings page
│   ├── lib/                # Utility functions
│   └── index.jsx           # App entry point
├── public/                 # Static assets
├── index.html             # HTML template
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Strava Developer Account** (for OAuth integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RunKada
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_STRAVA_CLIENT_ID=your_strava_client_id
   VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret
   VITE_API_BASE_URL=your_backend_api_url
   ```

   To get Strava credentials:
   - Go to [Strava API Settings](https://www.strava.com/settings/api)
   - Create a new application
   - Copy your Client ID and Client Secret

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🔨 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

Or simply push to your connected GitHub repository and Vercel will auto-deploy.

## 🎨 Design System

### Color Palette
- **Primary Brown**: `#56504a` - Main text and borders
- **Accent Yellow**: `#fcd96b` - Highlights and CTAs
- **Accent Orange**: `#fc4c02` - Strava and action buttons
- **Background**: `#ffffff` / `#f5f5f5`
- **Beige Accent**: `#f7e2c6`

### Typography
- **Headings**: Porter Sans Block (custom font)
- **Body**: Poppins
- **Display**: Teko

### Components
- Border radius: 12-30px for modern, friendly feel
- Border width: 2-4px for bold, defined UI
- Shadows: Custom shadow effects for depth
- Animations: Smooth transitions and hover effects

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_STRAVA_CLIENT_ID` | Strava OAuth Client ID | Yes |
| `VITE_STRAVA_CLIENT_SECRET` | Strava OAuth Client Secret | Yes |
| `VITE_API_BASE_URL` | Backend API base URL | Yes |

## 🐛 Known Issues & TODO

### High Priority
- [ ] Implement backend API integration
- [ ] Complete Strava OAuth flow with callback handler
- [ ] Replace mock data with real API calls
- [ ] Implement logout functionality
- [ ] Add profile photo upload to cloud storage

### Medium Priority
- [ ] Add form validation
- [ ] Implement loading states
- [ ] Add error boundaries
- [ ] Persist settings to backend
- [ ] Implement clan creation/join functionality

### Low Priority
- [ ] Add unit tests
- [ ] Improve accessibility (ARIA labels)
- [ ] Add PWA support
- [ ] Implement dark mode
- [ ] Add activity maps

See the complete TODO list in the project documentation.

## 🤝 Contributing

This project was created for the 2025 OpenxAI Hack Node Hackathon. 

If you'd like to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Team

Created for the 2025 OpenxAI Hack Node Hackathon by the RunKada team.

## 📄 License

This project is part of the 2025 OpenxAI Hack Node Hackathon submission.

## 🙏 Acknowledgments

- **Strava API** - For activity tracking integration
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For rapid UI development
- **Vite** - For blazing fast development experience
- **OpenxAI** - For organizing the Hack Node Hackathon

## 📧 Support

For support or questions, please open an issue in the repository.

---
 
**Made with ❤️ for runners, by runners**
