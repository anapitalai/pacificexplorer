#!/bin/bash

# 🚀 Pacific Explorer - Manual Deployment Guide
# For deploying to 170.64.195.201 when SSH keys aren't set up

set -e

# Configuration
SERVER="170.64.195.201"
PROJECT_PATH="/home/alois/Documents/cassini_hackathon"
ARCHIVE_NAME="pacific-explorer.tar.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════╗"
echo "║  🚀 Pacific Explorer - Manual Deployment      ║"
echo "║  Target: $SERVER                  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

echo -e "${YELLOW}📝 This script will create a deployment package.${NC}"
echo -e "${YELLOW}   You'll need to manually transfer and deploy it.${NC}"
echo ""

# Step 1: Package application
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 1: Packaging application...${NC}"
echo ""

cd $PROJECT_PATH

# Check .env.production
if [ ! -f pacific-explorer/.env.production ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo -e "${YELLOW}   Creating from .env...${NC}"
    cp pacific-explorer/.env pacific-explorer/.env.production
    echo -e "${YELLOW}⚠️  Please review .env.production before deploying!${NC}"
fi

# Create archive
echo "Creating deployment package..."
tar -czf $ARCHIVE_NAME \
  --exclude='pacific-explorer/node_modules' \
  --exclude='pacific-explorer/.next' \
  --exclude='pacific-explorer/.git' \
  --exclude='pacific-explorer/.env.local' \
  pacific-explorer/

ARCHIVE_SIZE=$(ls -lh $ARCHIVE_NAME | awk '{print $5}')
echo -e "${GREEN}✅ Package created: $ARCHIVE_NAME ($ARCHIVE_SIZE)${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 Next Steps (Manual)${NC}"
echo ""

echo "1️⃣  Transfer the package to your server:"
echo "   ${YELLOW}scp $ARCHIVE_NAME root@$SERVER:/opt/${NC}"
echo ""

echo "2️⃣  SSH into your server:"
echo "   ${YELLOW}ssh root@$SERVER${NC}"
echo ""

echo "3️⃣  Extract and deploy on the server:"
cat << 'EOF'
   cd /opt
   
   # Backup existing deployment (if any)
   if [ -d "pacific-explorer" ]; then
       mv pacific-explorer pacific-explorer-backup-$(date +%Y%m%d-%H%M%S)
   fi
   
   # Extract
   tar -xzf pacific-explorer.tar.gz
   cd pacific-explorer
   
   # Make deploy script executable
   chmod +x scripts/deploy.sh
   
   # Deploy
   ./scripts/deploy.sh
EOF

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔑 SSH Key Setup (Recommended)${NC}"
echo ""
echo "To avoid entering passwords repeatedly, set up SSH keys:"
echo ""
echo "1. Generate SSH key (if you don't have one):"
echo "   ${YELLOW}ssh-keygen -t ed25519 -C 'your_email@example.com'${NC}"
echo ""
echo "2. Copy public key to server:"
echo "   ${YELLOW}ssh-copy-id root@$SERVER${NC}"
echo ""
echo "3. Test connection:"
echo "   ${YELLOW}ssh root@$SERVER${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Package ready: $ARCHIVE_NAME${NC}"
echo ""
echo "Copy the commands above to deploy to your server!"
echo ""
