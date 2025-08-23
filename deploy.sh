#!/bin/bash

echo "🚀 Starting Vercel deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod --confirm

echo "✅ Deployment completed!"
