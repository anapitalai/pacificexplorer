#!/bin/bash

# 🚀 Automated Deployment Script for Pacific Explorer
# Deploys to remote server: 170.64.195.201

set -e

# Configuration
SERVER="root@170.64.195.201"
PROJECT_PATH="/home/alois/Documents/cassini_hackathon"
REMOTE_PATH="/opt/pacific-explorer"
ARCHIVE_NAME="pacific-explorer.tar.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════╗"
echo "║  🚀 Pacific Explorer Deployment                ║"
echo "║  Target: $SERVER                  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Step 1: Check prerequisites
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "${YELLOW}⚠️  No SSH key found. You may be prompted for password.${NC}"
fi

# Test SSH connection
echo "Testing SSH connection to $SERVER..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  SSH connection test failed. You may need to enter password.${NC}"
else
    echo -e "${GREEN}✅ SSH connection verified${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 2: Packaging application...${NC}"
echo ""

# Navigate to project directory
cd $PROJECT_PATH

# Check if .env.production exists
if [ ! -f pacific-explorer/.env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found!${NC}"
    echo -e "${YELLOW}   Creating from .env...${NC}"
    cp pacific-explorer/.env pacific-explorer/.env.production
    echo -e "${RED}❌ Please update .env.production before deploying!${NC}"
    echo -e "${YELLOW}   Edit: nano pacific-explorer/.env.production${NC}"
    read -p "Press Enter when ready to continue..."
fi

# Create archive
echo "Creating tarball (excluding node_modules, .next, .git)..."
tar -czf $ARCHIVE_NAME \
  --exclude='pacific-explorer/node_modules' \
  --exclude='pacific-explorer/.next' \
  --exclude='pacific-explorer/.git' \
  --exclude='pacific-explorer/.env.local' \
  pacific-explorer/

# Check archive size
ARCHIVE_SIZE=$(ls -lh $ARCHIVE_NAME | awk '{print $5}')
echo -e "${GREEN}✅ Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📤 Step 3: Transferring to server...${NC}"
echo ""

# Transfer to server with retries and rsync fallback
upload_with_retry() {
    local attempts=0
    local max_attempts=3
    local backoff=2

    echo "Uploading to $SERVER:/opt/..."

    while [ $attempts -lt $max_attempts ]; do
        if scp -C "$ARCHIVE_NAME" "$SERVER:/opt/"; then
            echo -e "${GREEN}✅ Upload successful${NC}"
            return 0
        fi

        attempts=$((attempts + 1))
        echo -e "${YELLOW}⚠️  Upload attempt $attempts failed. Retrying in ${backoff}s...${NC}"
        sleep $backoff
        backoff=$((backoff * 2))
    done

    echo -e "${YELLOW}⚠️  SCP failed after $max_attempts attempts. Trying rsync fallback...${NC}"

    if command -v rsync >/dev/null 2>&1; then
        if rsync -avz --progress -e "ssh -o ConnectTimeout=10" "$ARCHIVE_NAME" "$SERVER:/opt/"; then
            echo -e "${GREEN}✅ Upload via rsync successful${NC}"
            return 0
        else
            echo -e "${RED}❌ Rsync upload failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  rsync not found locally. Please install rsync or transfer the archive manually:${NC}"
        echo "  scp $ARCHIVE_NAME $SERVER:/opt/"
        return 1
    fi
}

if ! upload_with_retry; then
    echo -e "${RED}❌ Upload failed after retries and fallback attempts${NC}"
    exit 1
fi

# Clean up local archive
rm $ARCHIVE_NAME
echo "Cleaned up local archive"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔧 Step 4: Deploying on server...${NC}"
echo ""

# Deploy on server
ssh $SERVER << 'ENDSSH'
set -e

# Colors for remote
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📂 Extracting archive...${NC}"
cd /opt

# Backup existing deployment
if [ -d "pacific-explorer" ]; then
    echo "Backing up existing deployment..."
    BACKUP_NAME="pacific-explorer-backup-$(date +%Y%m%d-%H%M%S)"
    mv pacific-explorer $BACKUP_NAME
    echo -e "${GREEN}✅ Backup created: $BACKUP_NAME${NC}"
fi

# Extract new deployment
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer

echo ""
echo -e "${YELLOW}🔍 Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker is installed${NC}"
fi

echo ""
echo -e "${YELLOW}🐳 Starting deployment...${NC}"

# Make deploy script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh

echo ""
echo -e "${GREEN}✅ Server deployment complete!${NC}"

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Deployment Successful!                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🌐 Application URL:${NC}"
    echo "   http://170.64.195.201"
    echo ""
    echo -e "${GREEN}📊 Useful commands:${NC}"
    echo "   SSH to server:    ssh $SERVER"
    echo "   View logs:        ssh $SERVER 'cd /opt/pacific-explorer && docker-compose logs -f app'"
    echo "   Check status:     ssh $SERVER 'cd /opt/pacific-explorer && docker-compose ps'"
    echo "   Restart:          ssh $SERVER 'cd /opt/pacific-explorer && docker-compose restart'"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Check the error messages above."
    echo ""
    echo "To debug on server:"
    echo "  ssh $SERVER"
    echo "  cd /opt/pacific-explorer"
    echo "  docker-compose logs app"
    exit 1
fi
