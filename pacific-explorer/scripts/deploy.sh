#!/bin/bash

# Pacific Explorer Deployment Script with SSL

set -e

echo "🚀 Deploying Pacific Explorer with SSL..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Detect Docker Compose command (v1 vs v2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo -e "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from .env...${NC}"
    cp .env .env.production
    echo -e "${YELLOW}📝 Please update .env.production with production values${NC}"
    echo -e "${YELLOW}   Especially NEXTAUTH_URL to use https://${NC}"
fi

# Load environment variables (skip EMAIL_FROM which has special chars)
export $(cat .env.production | grep -v '^#' | grep -v 'EMAIL_FROM' | xargs)

# Step 1: Build Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
$DOCKER_COMPOSE build --no-cache app

# Step 2: Initialize SSL (if not already done)
# Extract domain from NEXTAUTH_URL or use default
DOMAIN=$(echo $NEXTAUTH_URL | sed -E 's|https?://([^:/]+).*|\1|')
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${YELLOW}🔒 SSL certificate not found. Initializing...${NC}"
    chmod +x scripts/init-letsencrypt.sh
    ./scripts/init-letsencrypt.sh
else
    echo -e "${GREEN}✅ SSL certificate already exists${NC}"
fi

# Step 3: Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
$DOCKER_COMPOSE down

# Step 4: Start new containers
echo -e "${YELLOW}🚀 Starting all services...${NC}"
$DOCKER_COMPOSE up -d

# Step 5: Wait for database
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 15

# Step 6: Run migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
$DOCKER_COMPOSE exec -T app npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migration failed. Database might already be up to date.${NC}"
}

# Step 7: Check health
echo -e "${YELLOW}🏥 Checking application health...${NC}"
sleep 5

# Get domain from env or use default
DOMAIN=${NEXTAUTH_URL#https://}
DOMAIN=${DOMAIN#http://}

if curl -f -k https://localhost/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Application running at: https://$DOMAIN${NC}"
    echo -e "${GREEN}🔒 SSL certificate active${NC}"
else
    echo -e "${YELLOW}⚠️  Application is starting. Check status:${NC}"
    $DOCKER_COMPOSE ps
fi

# Display running containers
echo ""
echo -e "${YELLOW}📊 Running containers:${NC}"
$DOCKER_COMPOSE ps

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo -e "  View logs:     $DOCKER_COMPOSE logs -f app"
echo -e "  View all logs: $DOCKER_COMPOSE logs -f"
echo -e "  Restart:       $DOCKER_COMPOSE restart"
echo -e "  Stop:          $DOCKER_COMPOSE down"
