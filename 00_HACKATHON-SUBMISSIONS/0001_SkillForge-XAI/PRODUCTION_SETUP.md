# 🚀 SkillForge-XAI Production Setup Guide

## 📋 Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **OpenAI API Key** - [Get API Key](https://platform.openai.com/api-keys)
3. **Supabase Account** - [Create Account](https://supabase.com)

## 🛠️ Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Copy `.env.local` and update with your credentials:

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Automatic Setup (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/production-schema.sql`
4. Run the script
5. Copy and paste the contents of `database/seed-data.sql`
6. Run the seed script

#### Option B: Manual Setup
1. Create tables using the schema in `database/production-schema.sql`
2. Insert sample data using `database/seed-data.sql`
3. Enable Row Level Security (RLS) for all tables
4. Set up authentication policies

### 4. Launch Application
```bash
npm run dev
```

Visit `http://localhost:3000` to see your production-ready AI learning platform!

## 🎯 Features Included

### ✅ Production-Ready Features
- **Real OpenAI Integration** - GPT-4 powered AI tutoring
- **Comprehensive Database** - Full course management system
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Chat** - AI conversations with message history
- **Course Management** - Complete CRUD operations for courses
- **Progress Tracking** - User enrollment and lesson progress
- **Achievement System** - Gamification with badges and points
- **Analytics Dashboard** - Learning insights and statistics
- **Search & Filtering** - Advanced course discovery
- **User Authentication** - Supabase Auth integration

### 🔧 Technical Stack
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4, Whisper, TTS
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## 📊 Database Schema

### Core Tables
- `users` - User profiles and preferences
- `categories` - Course categories
- `courses` - Course information and metadata
- `lessons` - Individual lesson content
- `quizzes` - Assessment and quiz data
- `quiz_questions` - Quiz question bank
- `enrollments` - User course enrollments
- `lesson_progress` - Individual lesson tracking
- `quiz_attempts` - Quiz attempt history
- `achievements` - Achievement definitions
- `user_achievements` - User earned achievements
- `ai_chat_sessions` - AI conversation sessions
- `ai_chat_messages` - Individual chat messages
- `learning_analytics` - Learning progress analytics

### Sample Data Included
- 8+ realistic courses across multiple categories
- 10+ achievements with different rarities
- Comprehensive lesson content with markdown support
- Quiz questions with multiple choice and explanations
- Category system with icons and colors

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
```env
OPENAI_API_KEY=your_production_openai_key
OPENAI_MODEL=gpt-4
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
```

## 🔍 API Endpoints

### Available APIs
- `GET /api/courses` - Fetch courses with filtering
- `GET /api/categories` - Get all categories
- `GET /api/achievements` - List all achievements
- `POST /api/ai/tutor` - AI chat conversations
- `POST /api/ai/quiz` - Generate AI quizzes
- `POST /api/ai/voice` - Voice learning features

### Example API Usage
```javascript
// Fetch courses
const response = await fetch('/api/courses?category=Programming&limit=10');
const { data: courses } = await response.json();

// AI Chat
const chatResponse = await fetch('/api/ai/tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain machine learning',
    userId: 'user-id',
    context: 'learning'
  })
});
```

## 🎨 Customization

### Theme Customization
- Edit `tailwind.config.js` for color schemes
- Modify `src/contexts/ThemeContext.tsx` for theme logic
- Update `src/app/globals.css` for custom styles

### Adding New Features
1. Create new API routes in `src/app/api/`
2. Add database functions in `src/lib/database.ts`
3. Update types in `src/types/index.ts`
4. Build UI components in `src/components/`

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Errors**
- Verify API key is correct and has GPT-4 access
- Check API usage limits and billing
- Ensure environment variables are set

**Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies are enabled
- Ensure tables are created with correct schema

**Build Errors**
- Use `--legacy-peer-deps` flag for npm install
- Clear `.next` folder and rebuild
- Check TypeScript errors in components

### Performance Optimization
- Enable Supabase connection pooling
- Implement API response caching
- Optimize images and assets
- Use Next.js Image component

## 📈 Monitoring & Analytics

### Built-in Analytics
- User learning progress tracking
- Course completion rates
- AI chat usage statistics
- Achievement earning patterns

### External Monitoring (Optional)
- Vercel Analytics for performance
- Sentry for error tracking
- PostHog for user analytics
- OpenAI usage monitoring

## 🔒 Security Best Practices

### Implemented Security
- Row Level Security (RLS) on all tables
- Server-side API key management
- Input validation and sanitization
- CORS protection
- Rate limiting ready

### Additional Recommendations
- Enable Supabase Auth MFA
- Set up API rate limiting
- Implement content security policy
- Regular security audits

## 📞 Support

### Getting Help
- Check GitHub Issues for common problems
- Review Supabase documentation
- OpenAI API documentation
- Next.js deployment guides

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

## 🏆 OpenxAI Global Accelerator 2025

This project is built for the **OpenxAI Global Accelerator 2025** hackathon in the **LearnAI** track. It demonstrates:

- Advanced AI integration with OpenAI GPT-4
- Production-ready architecture and code quality
- Comprehensive feature set for AI-powered education
- Scalable database design and API structure
- Modern web development best practices

**Ready to revolutionize education with AI? Let's build the future of learning! 🚀**