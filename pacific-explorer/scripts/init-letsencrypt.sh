#!/bin/bash

# Initialize Let's Encrypt SSL for Pacific Explorer
# This script must be run ONCE before deploying with SSL

set -e

# CONFIGURATION - UPDATE THESE!
DOMAIN="pacificexplorer.napitalai.com.pg"  # Your domain
EMAIL="aln@napitalai.com.pg"
STAGING=0  # Set to 1 for testing, 0 for production

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

echo -e "${YELLOW}🔒 Initializing Let's Encrypt SSL for Pacific Explorer${NC}"
echo -e "${YELLOW}Domain/IP: $DOMAIN${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
echo ""

# Create required directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/conf.d

# Ensure host directories have sane ownership/permissions so containers can use them
echo -e "${YELLOW}🔧 Setting permissions on certbot directories...${NC}"
chown -R root:root certbot || true
chmod -R 755 certbot || true

# Download recommended TLS parameters
echo -e "${YELLOW}📥 Downloading TLS parameters...${NC}"
if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
fi

if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem
fi

# Create dummy certificate
echo -e "${YELLOW}🔑 Creating dummy certificate for initial nginx startup...${NC}"
CERT_PATH="certbot/conf/live/$DOMAIN"
mkdir -p "$CERT_PATH"

if [ ! -f "$CERT_PATH/fullchain.pem" ]; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_PATH/privkey.pem" \
        -out "$CERT_PATH/fullchain.pem" \
        -subj "/CN=$DOMAIN"
    echo -e "${GREEN}✅ Dummy certificate created${NC}"
fi

# Start nginx with dummy certificate
echo -e "${YELLOW}🚀 Starting nginx with dummy certificate...${NC}"
$DOCKER_COMPOSE up -d nginx

# Wait for nginx to be ready
echo -e "${YELLOW}⏳ Waiting for nginx to start...${NC}"
sleep 10

# Check if nginx is running
if ! $DOCKER_COMPOSE ps nginx | grep -q "Up"; then
    echo -e "${RED}❌ Nginx failed to start. Check logs:${NC}"
    $DOCKER_COMPOSE logs nginx
    exit 1
fi

# Delete dummy certificate
echo -e "${YELLOW}🗑️  Removing dummy certificate (use certbot container so mounts are writable)...${NC}"
# Run removal inside the certbot container (it has the writable mount to /etc/letsencrypt).
# Avoid running rm inside the nginx container because nginx mounts /etc/letsencrypt as read-only.
$DOCKER_COMPOSE exec --user root -T certbot bash -lc "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf || true"

# Request Let's Encrypt certificate
echo -e "${YELLOW}📜 Requesting Let's Encrypt certificate...${NC}"

# For IP addresses, we'll use a self-signed certificate instead
# Let's Encrypt requires a domain name
if [[ $DOMAIN =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${YELLOW}⚠️  IP address detected. Creating self-signed certificate...${NC}"
    echo -e "${YELLOW}   For production, use a domain name for Let's Encrypt SSL.${NC}"
    
    mkdir -p "$CERT_PATH"
    openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
        -keyout "$CERT_PATH/privkey.pem" \
        -out "$CERT_PATH/fullchain.pem" \
        -subj "/C=PG/ST=PNG/L=Port Moresby/O=Pacific Explorer/CN=$DOMAIN"
    
    echo -e "${GREEN}✅ Self-signed certificate created (valid for 365 days)${NC}"
else
    # Staging or production?
    if [ $STAGING -eq 1 ]; then
        STAGING_ARG="--staging"
        echo -e "${YELLOW}⚠️  Using STAGING environment (test mode)${NC}"
    else
        STAGING_ARG=""
        echo -e "${GREEN}✅ Using PRODUCTION environment${NC}"
    fi

    # Request certificate from Let's Encrypt
    $DOCKER_COMPOSE run --rm certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        $STAGING_ARG \
        --cert-name pacific-explorer \
        -d $DOMAIN

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Certificate request failed!${NC}"
        echo -e "${YELLOW}Falling back to self-signed certificate...${NC}"
        openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
            -keyout "$CERT_PATH/privkey.pem" \
            -out "$CERT_PATH/fullchain.pem" \
            -subj "/C=PG/ST=PNG/L=Port Moresby/O=Pacific Explorer/CN=$DOMAIN"
    fi
fi

# Reload nginx
echo -e "${YELLOW}🔄 Reloading nginx with new certificate...${NC}"
$DOCKER_COMPOSE exec nginx nginx -s reload

echo ""
echo -e "${GREEN}✅ SSL setup completed!${NC}"
echo -e "${GREEN}🌐 Your site will be available at:${NC}"
echo -e "${GREEN}   https://$DOMAIN${NC}"
echo ""

if [[ $DOMAIN =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${YELLOW}📝 Note: Self-signed certificate is being used.${NC}"
    echo -e "${YELLOW}   Browsers will show a security warning.${NC}"
    echo -e "${YELLOW}   For production, use a domain name with Let's Encrypt.${NC}"
else
    echo -e "${YELLOW}📝 Certificate will auto-renew every 12 hours${NC}"
    echo -e "${YELLOW}📊 Check renewal: $DOCKER_COMPOSE logs certbot${NC}"
fi
