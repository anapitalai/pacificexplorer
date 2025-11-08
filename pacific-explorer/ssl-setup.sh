#!/bin/bash

# One-click SSL setup for Pacific Explorer
# Download and run: curl -s https://raw.githubusercontent.com/anapitalai/nsdi-app/master/ssl-setup.sh | sudo bash

set -e

echo "🔒 Pacific Explorer SSL Setup"
echo "============================="

# Enable Apache modules
echo "📦 Enabling Apache modules..."
a2enmod ssl proxy proxy_http proxy_wstunnel rewrite headers

# Create SSL directories
echo "📁 Creating SSL directories..."
mkdir -p /etc/ssl/private /etc/ssl/certs

# Generate certificate
echo "🔑 Generating SSL certificate..."
openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
    -keyout /etc/ssl/private/pacific-explorer.key \
    -out /etc/ssl/certs/pacific-explorer.crt \
    -subj "/C=PG/ST=PNG/L=Port Moresby/O=Pacific Explorer/CN=170.64.195.201"

# Set permissions
chmod 600 /etc/ssl/private/pacific-explorer.key
chmod 644 /etc/ssl/certs/pacific-explorer.crt

# Install Apache config
echo "📄 Installing Apache configuration..."
cat > /etc/apache2/sites-available/pacific-explorer.conf << 'EOF'
<VirtualHost *:80>
    ServerName 170.64.195.201
    ServerAdmin admin@pacificexplorer.com

    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName 170.64.195.201
    ServerAdmin admin@pacificexplorer.com

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/pacific-explorer.crt
    SSLCertificateKeyFile /etc/ssl/private/pacific-explorer.key

    # Proxy to nginx on port 8082
    ProxyPreserveHost On
    ProxyPass / http://localhost:8082/
    ProxyPassReverse / http://localhost:8082/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:8082/$1" [P,L]

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
</VirtualHost>
EOF

# Enable site
echo "🔄 Enabling site..."
a2ensite pacific-explorer.conf
a2dissite 000-default.conf

# Test configuration
echo "🧪 Testing Apache configuration..."
if apache2ctl configtest; then
    echo "✅ Configuration valid, reloading Apache..."
    systemctl reload apache2
    echo ""
    echo "🎉 SSL Setup Complete!"
    echo "====================="
    echo "🌐 HTTPS: https://170.64.195.201"
    echo "🌐 HTTP:  http://170.64.195.201 (redirects to HTTPS)"
    echo ""
    echo "⚠️  Note: Using self-signed certificate"
    echo "   Browsers will show security warning"
    echo "   Click 'Advanced' → 'Proceed to site'"
else
    echo "❌ Configuration test failed!"
    exit 1
fi
