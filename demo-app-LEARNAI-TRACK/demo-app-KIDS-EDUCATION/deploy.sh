#!/bin/bash

# Kids Learning Adventure - BASE Mini App Deployment Script
# This script automates the deployment process to Vercel and BASE mini app store

set -e

echo "🚀 Kids Learning Adventure - BASE Mini App Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "Makefile" ]; then
    echo "❌ Error: Please run this script from the demo-app-KIDS-EDUCATION directory"
    exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
make install-deps

# Check environment file
if [ ! -f "nextjs-app/.env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "📝 Please create nextjs-app/.env.local with your environment variables"
    echo "💡 You can copy from nextjs-app/env.example"
    echo ""
    echo "Required variables:"
    echo "- NEXT_PUBLIC_ONCHAINKIT_API_KEY (from Coinbase Developer Platform)"
    echo "- NEXT_PUBLIC_URL (your deployed URL)"
    echo "- FARCASTER_HEADER, FARCASTER_PAYLOAD, FARCASTER_SIGNATURE (from manifest CLI)"
    echo ""
    read -p "Press Enter to continue after setting up .env.local..."
fi

# Generate Farcaster manifest if not done
echo "🔐 Checking Farcaster manifest..."
if [ ! -f "nextjs-app/.env.local" ] || ! grep -q "FARCASTER_HEADER" nextjs-app/.env.local; then
    echo "📝 Generating Farcaster manifest..."
    echo "Please run: cd nextjs-app && npx create-onchain --manifest"
    echo "This will generate your Farcaster credentials"
    echo ""
    read -p "Press Enter after generating the manifest..."
fi

# Build the app
echo "🏗️  Building the app..."
cd nextjs-app
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Please follow the Vercel prompts:"
echo "- Choose 'Link to existing project' if you have one"
echo "- Or create a new project"
echo "- Set the output directory to 'nextjs-app'"
echo ""

vercel --prod

# Get the deployed URL
DEPLOYED_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
if [ -z "$DEPLOYED_URL" ]; then
    echo "⚠️  Could not determine deployed URL. Please check Vercel dashboard."
else
    echo "✅ App deployed to: $DEPLOYED_URL"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in Vercel dashboard"
echo "2. Verify manifest at: $DEPLOYED_URL/.well-known/farcaster.json"
echo "3. Test frame metadata at: https://farcaster.xyz/~/developers/mini-apps/embed"
echo "4. Submit to BASE mini app store: https://base.org/mini-apps"
echo ""
echo "🔗 Useful links:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Farcaster Manifest Tool: https://farcaster.xyz/~/developers/mini-apps/manifest"
echo "- BASE Mini Apps: https://docs.base.org/mini-apps"
echo ""
echo "🌟 Your Kids Learning Adventure is ready for the BASE mini app store!"
