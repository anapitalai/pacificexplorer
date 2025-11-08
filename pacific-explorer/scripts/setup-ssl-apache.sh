#!/bin/bash

# Setup SSL and Apache proxy for Pacific Explorer
# Run this script on the server to configure HTTPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔒 Setting up SSL and Apache proxy for Pacific Explorer${NC}"

# Enable required Apache modules
echo -e "${YELLOW}📦 Enabling Apache modules...${NC}"
a2enmod ssl
a2enmod proxy
a2enmod proxy_http
a2enmod proxy_wstunnel
a2enmod rewrite
a2enmod headers

# Create self-signed SSL certificate
echo -e "${YELLOW}🔑 Creating self-signed SSL certificate...${NC}"
mkdir -p /etc/ssl/private /etc/ssl/certs

openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
    -keyout /etc/ssl/private/pacific-explorer.key \
    -out /etc/ssl/certs/pacific-explorer.crt \
    -subj "/C=PG/ST=PNG/L=Port Moresby/O=Pacific Explorer/CN=170.64.195.201"

chmod 600 /etc/ssl/private/pacific-explorer.key
chmod 644 /etc/ssl/certs/pacific-explorer.crt

echo -e "${GREEN}✅ SSL certificate created${NC}"

# Copy Apache configuration
echo -e "${YELLOW}📄 Installing Apache configuration...${NC}"
cp /opt/pacific-explorer/apache-config/pacificexplorer.napitalai.com.pg.conf /etc/apache2/sites-available/

# Enable the site
a2ensite pacificexplorer.napitalai.com.pg.conf

# Disable default site
a2dissite 000-default.conf

# Test configuration
echo -e "${YELLOW}🧪 Testing Apache configuration...${NC}"
apache2ctl configtest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Apache configuration is valid${NC}"

    # Reload Apache
    echo -e "${YELLOW}🔄 Reloading Apache...${NC}"
    systemctl reload apache2

    echo ""
    echo -e "${GREEN}✅ SSL setup completed!${NC}"
    echo -e "${GREEN}🌐 Your site is now available at:${NC}"
    echo -e "${GREEN}   HTTPS: https://170.64.195.201${NC}"
    echo -e "${GREEN}   HTTP:  http://170.64.195.201 (redirects to HTTPS)${NC}"
    echo ""
    echo -e "${YELLOW}📝 Note: Using self-signed certificate${NC}"
    echo -e "${YELLOW}   Browsers will show a security warning${NC}"
    echo -e "${YELLOW}   Click 'Advanced' and 'Proceed to site' to continue${NC}"

else
    echo -e "${RED}❌ Apache configuration test failed${NC}"
    apache2ctl configtest
    exit 1
fi
