# Pocket Penny 💰

**Your AI-powered financial education companion that makes investing simple and accessible for everyone.**

Pocket Penny is a comprehensive financial education platform built with modern web technologies, designed to demystify investing and help users make informed financial decisions through interactive tools, educational content, and personalized insights.

## 🚀 Live Demo

[Visit Pocket Penny](https://pocket-penny-web.vercel.app/)

## ✨ Features

### 🎯 Core Experience

- **Interactive Financial Calculators**: Compound interest, emergency fund, ETF comparisons
- **Round-Up Savings Simulator**: Visualize how spare change can grow into real investments
- **Finance Concepts Demystifier**: Learn investing basics through conversational AI
- **Personalized Dashboard**: Track your financial journey with custom insights

### 📊 Educational Tools

- **Market History Explorer**: Interactive historical market performance visualization
- **Risk Assessment Tools**: Understand investment risk through interactive demos
- **Fee Impact Calculator**: See how fees affect long-term returns
- **Budget-to-Invest Converter**: Find money for investing in your current spending

### 🤖 AI-Powered Features

- **Conversational Finance Assistant**: Ask questions in plain English
- **Personalized Learning Paths**: Tailored content based on your knowledge level
- **Smart Recommendations**: Context-aware financial guidance

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework for production
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations and transitions

### Backend & Infrastructure

- **Turborepo** - High-performance build system
- **pnpm** - Fast, disk space efficient package manager
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks for quality control

### Development Tools

- **Monorepo Architecture** - Shared packages and configurations
- **Hot Module Replacement** - Instant development feedback
- **Type-safe API Routes** - End-to-end type safety

## 🏗️ Project Structure

```
pocket-penny/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router (Next.js 15)
│       │   ├── finance-concepts/    # Educational content
│       │   ├── round-up-simulator/  # Savings calculator
│       │   └── api/                 # API routes
│       ├── components/         # React components
│       ├── lib/               # Utilities and helpers
│       └── hooks/             # Custom React hooks
├── packages/
│   ├── ui/                    # Shared UI components
│   ├── types/                 # TypeScript definitions
│   ├── eslint-config/         # ESLint configurations
│   └── typescript-config/     # TypeScript configurations
└── turbo.json                 # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/pocket-penny.git
cd pocket-penny
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Start development server**

```bash
pnpm dev
```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks
- `pnpm format` - Format code with Prettier

## 🎯 Key Features Deep Dive

### 📈 Round-Up Savings Simulator

Upload your transaction data (CSV) and see how rounding up purchases could grow your savings over time.

**Features:**

- CSV file upload and processing
- Automatic round-up calculations
- Growth visualization with charts
- Customizable investment scenarios

### 🎓 Finance Concepts Explorer

Interactive lessons covering essential investing concepts:

**Topics Covered:**

- Compound Interest & Time Value of Money
- Diversification & Risk Management
- ETF vs Individual Stocks
- Dollar-Cost Averaging
- Emergency Fund Planning
- Market Volatility & Long-term Investing

### 💡 AI Finance Assistant

Conversational AI that answers your finance questions in plain English.

**Capabilities:**

- Explain complex financial concepts
- Provide personalized investment guidance
- Answer specific questions about your financial situation
- Suggest next steps based on your goals

## 🔧 Development

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-database-url"

# AI Services
OPENAI_API_KEY="your-openai-api-key"

# Analytics
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
```

### Adding New Features

1. **New Calculator/Tool**
   - Create component in `apps/web/app/[feature-name]/`
   - Add route in Next.js app router
   - Include in navigation

2. **New Educational Content**
   - Add to `apps/web/app/finance-concepts/`
   - Update concept cards and dialogs
   - Add to progress tracking

3. **API Endpoints**
   - Create in `apps/web/app/api/[endpoint]/route.ts`
   - Follow RESTful conventions
   - Add TypeScript types

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e
```

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t pocket-penny .

# Run container
docker run -p 3000:3000 pocket-penny
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Next.js team** for the amazing framework
- **Turborepo** for the monorepo tooling
- **Financial education advocates** for inspiring this project

## 📞 Support

- **Documentation**: [docs.pocketpenny.dev](https://docs.pocketpenny.dev)
- **Issues**: [GitHub Issues](https://github.com/yourusername/pocket-penny/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pocket-penny/discussions)
- **Email**: <support@pocketpenny.dev>

---

**Made with ❤️ by the Pocket Penny Team**

_Empowering everyone to make informed financial decisions, one penny at a time._
