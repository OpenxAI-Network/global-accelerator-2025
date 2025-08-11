# 🪙 Pocket Penny - AI-Powered Personal Finance Assistant

**Track**: FinTech  
**Project Number**: 0012  
**Team**: Pocket Penny  
**GitHub**: <https://github.com/sanjaysah101/pocket-penny>

## 🎯 Project Overview

Pocket Penny is an AI-powered personal finance assistant that helps users manage their money smarter. Built with Next.js and integrated with AI capabilities, it provides intelligent budgeting, expense tracking, and financial insights.

## ✨ Key Features

- **Smart Budgeting**: AI-driven budget recommendations based on spending patterns
- **Expense Tracking**: Real-time expense categorization and analysis
- **Financial Insights**: Personalized financial advice and predictions
- **Goal Setting**: Track savings goals with AI-powered progress suggestions
- **Multi-currency Support**: Handle transactions in multiple currencies
- **Secure & Private**: Local-first approach with optional cloud sync

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **AI Integration**: Ollama for local AI processing
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Ollama installed locally
- Git

### Installation

```bash
# Navigate to project directory
cd 00_HACKATHON-SUBMISSIONS/0012_pocket_penny/

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start Ollama (if using AI features)
ollama serve

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📊 Demo Video

[Link to your demo video - Add your YouTube/Vimeo link here]

## 🏆 Hackathon Enhancements

For this hackathon submission, we've enhanced Pocket Penny with:

- AI-powered financial insights using Ollama
- Real-time expense categorization
- Predictive budgeting recommendations
- Enhanced UI/UX with modern design patterns
- Performance optimizations for better user experience

## 🤝 Contributing

This project was originally developed as a standalone application. All commit history has been preserved from the original repository.

## 📄 License

MIT License - see LICENSE file for details

## 📞 Contact

- **Email**: [sanjay8797421521@gmail.com]
- **Discord**: [@sanjaysah]
- **GitHub Issues**: <https://github.com/sanjaysah101/pocket-penny/issues>
