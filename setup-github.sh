#!/bin/bash

# OpenClaw Dashboard - GitHub Setup Script
# This script helps you push the dashboard to GitHub

echo "🚀 OpenClaw Mission Control Dashboard - GitHub Setup"
echo ""
echo "Choose your setup method:"
echo ""
echo "1. GitHub CLI (if gh is installed)"
echo "2. Manual push (requires repo to be created first)"
echo "3. Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "Creating and pushing to GitHub using gh CLI..."
    gh repo create lumenthinks/openclaw-dashboard \
      --public \
      --source=. \
      --remote=origin \
      --push \
      --description="OpenClaw Mission Control Dashboard - Real-time monitoring and control"
    ;;
    
  2)
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Create a repository named: openclaw-dashboard"
    echo "3. Make it public"
    echo "4. DO NOT initialize with README"
    echo ""
    read -p "Press Enter after creating the repo on GitHub..."
    
    echo ""
    echo "Pushing to GitHub..."
    git remote remove origin 2>/dev/null
    git remote add origin git@github.com:lumenthinks/openclaw-dashboard.git
    git push -u origin main
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ Successfully pushed to GitHub!"
      echo "🔗 https://github.com/lumenthinks/openclaw-dashboard"
    else
      echo ""
      echo "❌ Push failed. You may need to set up SSH keys or use HTTPS."
      echo ""
      echo "To use HTTPS instead, run:"
      echo "git remote remove origin"
      echo "git remote add origin https://github.com/lumenthinks/openclaw-dashboard.git"
      echo "git push -u origin main"
    fi
    ;;
    
  3)
    echo "Exiting..."
    exit 0
    ;;
    
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✨ Done!"
