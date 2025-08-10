# 🚀 Deploy SkillForge-XAI to Vercel

## Prerequisites
- GitHub account
- Vercel account (free)
- Your project pushed to GitHub

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SkillForge-XAI production ready"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/SkillForge-XAI.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your SkillForge-XAI repository
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   - **Install Command**: `npm install --legacy-peer-deps`

## Step 3: Environment Variables

In Vercel dashboard, add these environment variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

## Step 4: Update Supabase Settings

1. Go to your Supabase dashboard
2. Navigate to **Authentication > URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-vercel-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-vercel-app.vercel.app/auth/callback`
     - `https://your-vercel-app.vercel.app/auth/confirm`
     - `https://your-vercel-app.vercel.app/dashboard`

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Your app will be live at `https://your-app-name.vercel.app`

## Step 6: Test Authentication

1. Visit your deployed app
2. Try signing up with a new email
3. Check email for confirmation link
4. Click link - should redirect to `/auth/confirm` page
5. Should redirect to dashboard after confirmation

## Troubleshooting

**Build Errors:**
- Make sure `npm install --legacy-peer-deps` is set as install command
- Check all environment variables are set correctly

**Auth Issues:**
- Verify Supabase redirect URLs include your Vercel domain
- Check that email confirmation is enabled in Supabase
- Ensure all auth routes exist: `/auth/callback`, `/auth/confirm`

**API Errors:**
- Verify OpenAI API key is valid and has GPT-4 access
- Check Supabase service role key permissions

## Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update Supabase redirect URLs with your custom domain
4. Update environment variables with custom domain

Your SkillForge-XAI platform is now live and production-ready! 🎉