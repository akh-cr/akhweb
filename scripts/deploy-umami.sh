#!/bin/bash

# deploy-umami.sh
# Automates the deployment of Umami Analytics to Netlify

set -e

echo "🚀 Starting Umami Deployment..."

# Check requirements
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Please run 'npm install -g netlify-cli' first."
    exit 1
fi

if ! netlify status &> /dev/null; then
    echo "❌ You are not logged in to Netlify. Please run 'netlify login' first."
    exit 1
fi

# 1. Clone Umami
if [ -d "umami-analytics" ]; then
    echo "📂 'umami-analytics' folder already exists. Skipping clone."
else
    echo "📦 Cloning Umami repository..."
    git clone https://github.com/umami-software/umami.git umami-analytics
fi

cd umami-analytics

# 2. Install Dependencies
echo "npm install..."
npm install

# 3. Create/Link Netlify Site
echo "🌍 Creating new Netlify site..."
# This command creates a new site. Interactive mode might be needed if not fully automated.
# We use --manual to avoid linking to the current git repo of the parent project unintentionally via UI
netlify init --manual --name "akhweb-analytics-$(date +%s)"

# 4. Configure Environment Variables
echo "🔑 Configuring Environment Variables..."
read -p "Enter your Supabase Connection String (DATABASE_URL): " DB_URL
read -p "Enter a random secret salt (HASH_SALT) [random]: " SALT
SALT=${SALT:-$(openssl rand -hex 16)}

netlify env:set DATABASE_URL "$DB_URL"
netlify env:set HASH_SALT "$SALT"

# 5. Build and Deploy
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo "✅ Deployment Complete!"
echo "Your Umami instance is live."
echo "👉 Now follow the guide to get your Website ID from the new URL."
