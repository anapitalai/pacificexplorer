#!/bin/bash

# Automated Deployment Pipeline for Pacific Explorer
# This script runs on the local machine and handles the full deployment process

set -e

# Configuration
SERVER="root@170.64.195.201"
REMOTE_PATH="/opt/pacific-explorer"
LOCAL_PATH="/home/alois/Documents/cassini_hackathon/pacific-explorer"
BRANCH="master"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Pacific Explorer - Automated Deployment Pipeline${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}📋 Step 1: Pre-deployment checks...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Not in Pacific Explorer directory${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Copying from .env...${NC}"
    cp .env .env.production
    echo -e "${RED}❌ Please update .env.production with production values!${NC}"
    read -p "Press Enter when ready to continue..."
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# Step 2: Build and package
echo -e "${YELLOW}📦 Step 2: Building application...${NC}"

# Build the application
npm run build

# Create deployment package
echo "Creating deployment archive..."
cd ..
ARCHIVE_NAME="pacific-explorer-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$ARCHIVE_NAME" --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='.env.local' --exclude='*.log' "pacific-explorer"
mv "$ARCHIVE_NAME" "pacific-explorer/"
cd "pacific-explorer"

echo -e "${GREEN}✅ Build completed: $ARCHIVE_NAME${NC}"

# Step 3: Deploy to server
echo -e "${YELLOW}🚀 Step 3: Deploying to server...${NC}"

# Test SSH connection
echo "Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER "echo 'SSH OK'" 2>/dev/null; then
    echo -e "${RED}❌ SSH connection failed${NC}"
    echo -e "${YELLOW}💡 Try: ./scripts/setup-ssh-and-deploy.sh${NC}"
    exit 1
fi

# Upload package
echo "Uploading to server..."
scp "$ARCHIVE_NAME" "$SERVER:/opt/"

# Deploy on server
ssh $SERVER << EOF
set -e

echo "📂 Extracting deployment..."
cd /opt

# Backup current deployment
if [ -d "pacific-explorer" ]; then
    BACKUP_NAME="pacific-explorer-backup-\$(date +%Y%m%d-%H%M%S)"
    mv pacific-explorer "\$BACKUP_NAME"
    echo "📦 Backup created: \$BACKUP_NAME"
fi

# Extract new deployment
tar -xzf $ARCHIVE_NAME
cd pacific-explorer

echo "🐳 Starting services..."
docker compose down || true
docker compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 30

echo "🩺 Running health checks..."
if curl -f http://localhost:8082/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 Application: http://170.64.195.201"
    echo "📊 Health: http://170.64.195.201:8082/api/health"
else
    echo "❌ Health check failed!"
    exit 1
fi
EOF

# Cleanup
rm "$ARCHIVE_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ DEPLOYMENT SUCCESSFUL!                              ║${NC}"
    echo -e "${GREEN}║  🌐 https://170.64.195.201                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Useful commands:${NC}"
    echo "  SSH to server: ssh $SERVER"
    echo "  View logs: ssh $SERVER 'cd /opt/pacific-explorer && docker compose logs -f'"
    echo "  Restart: ssh $SERVER 'cd /opt/pacific-explorer && docker compose restart'"
else
    echo ""
    echo -e "${RED}❌ DEPLOYMENT FAILED!${NC}"
    echo "Check the error messages above."
fi
