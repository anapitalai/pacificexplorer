#!/bin/bash

# Apache Reverse Proxy Setup Script for Pacific Explorer
# This script configures Apache to proxy to the Dockerized app and sets up Let's Encrypt SSL

set -e

echo "🌐 Setting up Apache Reverse Proxy for Pacific Explorer..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Enable required Apache modules
echo -e "${YELLOW}📦 Enabling Apache modules...${NC}"
a2enmod proxy || true
a2enmod proxy_http || true
a2enmod ssl || true
a2enmod headers || true
a2enmod rewrite || true

# Step 2: Copy Apache configuration
echo -e "${YELLOW}📝 Installing Apache configuration...${NC}"
cp apache-config/pacificexplorer.napitalai.com.pg.conf /etc/apache2/sites-available/

# Step 3: Enable the site
echo -e "${YELLOW}✅ Enabling site...${NC}"
a2ensite pacificexplorer.napitalai.com.pg.conf

# Step 4: Test Apache configuration
echo -e "${YELLOW}🔍 Testing Apache configuration...${NC}"
if apache2ctl configtest; then
    echo -e "${GREEN}✅ Apache configuration is valid${NC}"
else
    echo -e "${RED}❌ Apache configuration has errors${NC}"
    exit 1
fi

# Step 5: Reload Apache
echo -e "${YELLOW}🔄 Reloading Apache...${NC}"
systemctl reload apache2

# Step 6: Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    apt update
    apt install certbot python3-certbot-apache -y
else
    echo -e "${GREEN}✅ Certbot already installed${NC}"
fi

# Step 7: Get Let's Encrypt certificate
echo -e "${YELLOW}🔒 Obtaining Let's Encrypt SSL certificate...${NC}"
echo -e "${YELLOW}   Domain: pacificexplorer.napitalai.com.pg${NC}"
echo -e "${YELLOW}   Email: aln@napitalai.com.pg${NC}"

certbot --apache \
    -d pacificexplorer.napitalai.com.pg \
    --email aln@napitalai.com.pg \
    --agree-tos \
    --non-interactive \
    --redirect

# Step 8: Verify SSL certificate
if [ -f "/etc/letsencrypt/live/pacificexplorer.napitalai.com.pg/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"
    
    # Show certificate info
    echo -e "${YELLOW}📜 Certificate information:${NC}"
    certbot certificates -d pacificexplorer.napitalai.com.pg
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    exit 1
fi

# Step 9: Test auto-renewal
echo -e "${YELLOW}🔄 Testing certificate auto-renewal...${NC}"
certbot renew --dry-run

echo ""
echo -e "${GREEN}🎉 Apache reverse proxy setup complete!${NC}"
echo ""
echo -e "${GREEN}Your Pacific Explorer is now accessible at:${NC}"
echo -e "${GREEN}👉 https://pacificexplorer.napitalai.com.pg${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Make sure your Docker app is running on port 8080"
echo -e "  2. Visit https://pacificexplorer.napitalai.com.pg"
echo -e "  3. You should see a valid SSL certificate (green padlock)"
echo ""
echo -e "${YELLOW}Certificate auto-renewal:${NC}"
echo -e "  Certbot will automatically renew certificates before they expire"
echo -e "  Check renewal timer: systemctl status certbot.timer"
echo ""
