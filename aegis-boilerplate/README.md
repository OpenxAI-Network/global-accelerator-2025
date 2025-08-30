# Aegis Cross-Chain DeFi Boilerplate

A comprehensive, production-ready boilerplate for building cross-chain DeFi applications with advanced UX features, AI assistance, and real-time capabilities.

## 🚀 Features

### Frontend UX Enhancements
- **Interactive Onboarding Flow** - Guided tour using react-joyride
- **Unified Wallet Connection** - Multi-chain wallet support (MetaMask, Phantom, Coinbase, BTC)
- **Real-Time Loan Health Indicators** - WebSocket-powered live updates
- **Cross-Chain Portfolio View** - Aggregated portfolio across all chains
- **Push Notifications** - Real-time alerts for Telegram, Discord, and desktop
- **Contextual AI Assistance** - Gemini AI-powered help and insights
- **Accessibility & Localization** - Multi-language support and accessibility features

### Backend Services
- **WebSocket Server** - Real-time communication
- **Portfolio API** - Cross-chain position management
- **AI Service** - Gemini AI integration
- **Notification Service** - Multi-channel notifications
- **Translation Service** - Internationalization support

## 🏗️ Architecture

```
aegis-boilerplate/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # UX components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # CSS styles
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **SWR** - Data fetching and caching
- **Web3Modal** - Wallet connection
- **React Joyride** - Onboarding tours

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **WebSocket** - Real-time communication
- **Redis** - Caching and pub/sub
- **MongoDB** - Database (optional)
- **JWT** - Authentication
- **Google Gemini AI** - AI assistance

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 8+ or yarn
- Redis (for caching and WebSocket)

### Frontend Setup
```bash
cd aegis-boilerplate/frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd aegis-boilerplate/backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:4173

# WebSocket
WEBSOCKET_URL=ws://localhost:3001

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Notifications
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Database (optional)
MONGODB_URI=mongodb://localhost:27017/aegis
REDIS_URL=redis://localhost:6379
```

### Frontend Configuration

Create a `.env` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:3000`

## 📱 Component Usage

### Interactive Onboarding
```tsx
import OnboardingFlow from './components/OnboardingFlow';

<OnboardingFlow
  isVisible={true}
  onComplete={() => console.log('Onboarding complete')}
  onSkip={() => console.log('Onboarding skipped')}
/>
```

### Unified Wallet Connection
```tsx
import UnifiedWalletConnection from './components/UnifiedWalletConnection';

<UnifiedWalletConnection
  onWalletConnect={(wallet) => console.log('Wallet connected:', wallet)}
  onWalletDisconnect={() => console.log('Wallet disconnected')}
/>
```

### AI Assistance
```tsx
import ContextualAIAssistance from './components/ContextualAIAssistance';

<ContextualAIAssistance
  context={{ type: 'portfolio', data: portfolioData }}
  onAction={(action, data) => console.log('AI action:', action, data)}
/>
```

## 🔌 API Endpoints

### Portfolio
- `GET /api/portfolio/positions` - Get user positions
- `POST /api/portfolio/refresh` - Refresh portfolio data
- `GET /api/portfolio/health` - Get portfolio health

### AI Service
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/portfolio-insights` - Get portfolio insights
- `POST /api/ai/strategy-recommendations` - Get strategy recommendations

### Notifications
- `POST /api/notifications/telegram` - Send Telegram notification
- `POST /api/notifications/discord` - Send Discord notification
- `GET /api/notifications/settings` - Get notification settings

## 🌐 WebSocket Events

### Client to Server
- `subscribe_portfolio` - Subscribe to portfolio updates
- `subscribe_notifications` - Subscribe to notifications
- `refresh_positions` - Request portfolio refresh

### Server to Client
- `portfolio_update` - Portfolio data update
- `notification` - New notification
- `health_alert` - Portfolio health alert

## 🎨 Customization

### Styling
The frontend uses Tailwind CSS with custom CSS variables. Modify the styles in:
- `frontend/src/styles/globals.css`
- Component-specific CSS files

### Themes
Add custom themes by extending the Tailwind config:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'aegis-primary': '#6366f1',
        'aegis-secondary': '#8b5cf6',
      }
    }
  }
}
```

### Localization
Add new languages in the translation service:
```js
// backend/services/translations.js
const translations = {
  'fr': {
    'accessibility.title': 'Paramètres d\'accessibilité',
    // ... more translations
  }
};
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📦 Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Build
```bash
cd backend
npm run build
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Backend (Railway/Render)
1. Connect your repository
2. Set start command: `npm start`
3. Add environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.aegis.ai](https://docs.aegis.ai)
- **Discord**: [discord.gg/aegis](https://discord.gg/aegis)
- **Telegram**: [t.me/aegis_ai](https://t.me/aegis_ai)
- **Email**: support@aegis.ai

## 🙏 Acknowledgments

- **ZetaChain** - Cross-chain infrastructure
- **Google Gemini** - AI capabilities
- **OpenZeppelin** - Smart contract security
- **React Community** - Frontend framework

---

Built with ❤️ by the Aegis AI Team
