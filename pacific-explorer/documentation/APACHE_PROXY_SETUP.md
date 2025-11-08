# Apache Reverse Proxy Setup for Pacific Explorer

Since Apache is already running on ports 80/443, we can use it as a reverse proxy to your Dockerized app and let Apache handle Let's Encrypt SSL.

## Prerequisites

- Apache already installed and running on 170.64.195.201
- Docker app running on ports 8080/8443

---

## Step 1: Enable Apache Modules

```bash
# On the server
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## Step 2: Create Apache VirtualHost Configuration

Create `/etc/apache2/sites-available/pacificexplorer.napitalai.com.pg.conf`:

```apache
<VirtualHost *:80>
    ServerName pacificexplorer.napitalai.com.pg
    ServerAdmin aln@napitalai.com.pg

    # Redirect all HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]

    ErrorLog ${APACHE_LOG_DIR}/pacificexplorer-error.log
    CustomLog ${APACHE_LOG_DIR}/pacificexplorer-access.log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName pacificexplorer.napitalai.com.pg
    ServerAdmin aln@napitalai.com.pg

    # SSL will be configured by Certbot
    # SSLEngine on
    # SSLCertificateFile /etc/letsencrypt/live/pacificexplorer.napitalai.com.pg/fullchain.pem
    # SSLCertificateKeyFile /etc/letsencrypt/live/pacificexplorer.napitalai.com.pg/privkey.pem

    # Proxy to Docker app on port 8080
    ProxyPreserveHost On
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/

    # WebSocket support (if needed)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:8080/$1" [P,L]

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer-when-downgrade"

    ErrorLog ${APACHE_LOG_DIR}/pacificexplorer-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/pacificexplorer-ssl-access.log combined
</VirtualHost>
```

---

## Step 3: Enable the Site

```bash
# Enable the site
sudo a2ensite pacificexplorer.napitalai.com.pg.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Step 4: Install Certbot for Apache

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-apache -y
```

---

## Step 5: Get Let's Encrypt Certificate

```bash
# Run Certbot (it will automatically configure Apache SSL)
sudo certbot --apache -d pacificexplorer.napitalai.com.pg --email aln@napitalai.com.pg --agree-tos --non-interactive

# Certbot will:
# 1. Verify domain ownership via HTTP-01 challenge on port 80
# 2. Obtain SSL certificate
# 3. Automatically configure Apache with SSL
# 4. Set up auto-renewal
```

---

## Step 6: Update Your App's Environment

Update `.env.production` on the server:

```bash
# No port number needed now - Apache handles it
NEXTAUTH_URL="https://pacificexplorer.napitalai.com.pg"
```

Restart Docker containers:
```bash
cd /opt/pacific-explorer
docker compose restart app
```

---

## Step 7: Verify

Visit: **https://pacificexplorer.napitalai.com.pg**

You should see:
- ✅ Valid Let's Encrypt certificate
- ✅ Green padlock in browser
- ✅ Your Pacific Explorer app

---

## Auto-Renewal

Certbot sets up automatic renewal. Test it:

```bash
# Dry run renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

## Summary

With this setup:
- ✅ Apache runs on ports 80/443 (handles SSL)
- ✅ Docker app runs on ports 8080/8443 (internal)
- ✅ Apache proxies requests to Docker app
- ✅ Valid Let's Encrypt certificate
- ✅ Auto-renewal works
- ✅ No port conflicts
