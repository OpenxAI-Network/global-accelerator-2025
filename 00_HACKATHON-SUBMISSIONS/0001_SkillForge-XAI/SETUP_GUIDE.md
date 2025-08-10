# 🚀 SkillForge-XAI Complete Setup Guide

## 📋 Prerequisites Checklist

- ✅ Node.js 18.0+ installed
- ✅ npm or yarn package manager
- ✅ VS Code or preferred IDE
- ✅ Git for version control
- ⏳ OpenAI API account
- ⏳ Supabase account

## 🔧 Step-by-Step Setup

### 1. Environment Variables Configuration

Your `.env.local` file has been created. You need to fill in the following values:

#### 🤖 OpenAI Configuration
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Replace `your_openai_api_key_here` with your actual API key

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
OPENAI_MODEL=gpt-4
```

#### 🗄️ Supabase Configuration
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### 🔐 Application Security
Generate a secure secret for NextAuth:

```bash
# Run this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Replace `your_nextauth_secret_here` with the generated value.

### 2. Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the entire content from `database/schema.sql`
4. Click "Run" to execute the SQL

This will create:
- Users table with authentication integration
- Learning entries table for storing user progress
- Badges table for achievements
- Row Level Security policies for data protection

### 3. Verify Installation

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application running.

## 🎯 Quick Test Checklist

- [ ] Application loads without errors
- [ ] Can navigate to login/signup pages
- [ ] Database connection works (check browser console)
- [ ] OpenAI integration ready (test in dashboard)

## 🚨 Common Issues & Solutions

### Dependency Conflicts
If you encounter React version conflicts:
```bash
npm install --legacy-peer-deps
```

### Supabase Connection Issues
- Verify your Supabase URL and keys
- Check if your project is paused (free tier limitation)
- Ensure RLS policies are properly set

### OpenAI API Issues
- Verify your API key is valid
- Check your OpenAI account has sufficient credits
- Ensure you're using the correct model (gpt-4 or gpt-3.5-turbo)

## 🔄 Next Steps

1. **Test the AI Features**: Try the tutoring system in the dashboard
2. **Customize Styling**: Modify Tailwind classes in components
3. **Add More Features**: Extend the AI capabilities
4. **Deploy**: Use Vercel for production deployment

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database schema is properly applied
4. Test API endpoints individually

Happy coding! 🎉