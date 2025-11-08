# 🐳 Docker Deployment Guide - Pacific Explorer

Complete guide to deploy Pacific Explorer with Docker and Let's Encrypt SSL.

## 📋 Prerequisites

- Server with Docker and Docker Compose installed
- Domain name or public IP address (170.64.195.201)
- Ports 80 and 443 open on firewall
- SSH access to server

---

## 🚀 Quick Deployment (5 Steps)

### **Step 1: Prepare Your Local Machine**

```bash
cd /home/alois/Documents/cassini_hackathon/pacific-explorer

# Create production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

Update these critical values:
```env
NEXTAUTH_URL="https://170.64.195.201"
NEXTAUTH_SECRET="run-this: openssl rand -base64 32"
```

### **Step 2: Package the Application**

```bash
cd /home/alois/Documents/cassini_hackathon

# Create deployment archive
tar -czf pacific-explorer.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  pacific-explorer/

# Verify archive
ls -lh pacific-explorer.tar.gz
```

### **Step 3: Transfer to Server**

```bash
# Copy to server
scp pacific-explorer.tar.gz root@170.64.195.201:/opt/

# SSH into server
ssh root@170.64.195.201
```

### **Step 4: Setup on Server**

```bash
# On the server (170.64.195.201)

# Install Docker if not already installed
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Extract application
cd /opt
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer

# Make scripts executable
chmod +x scripts/*.sh

# Review and update configuration if needed
nano .env.production
```

### **Step 5: Deploy with SSL**

```bash
# Deploy everything (builds app, sets up SSL, starts services)
./scripts/deploy.sh

# Or step by step:
# 1. Initialize SSL first
./scripts/init-letsencrypt.sh

# 2. Then deploy
docker-compose up -d --build

# 3. Run migrations
docker-compose exec app npx prisma migrate deploy
```

---

## ✅ Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Should show:
# pacific-explorer        running
# pacific-explorer-nginx  running  
# pacific-explorer-certbot running

# View logs
docker-compose logs -f app

# Test the application
curl -k https://170.64.195.201/api/health

# Visit in browser
https://170.64.195.201
```

---

## 🔒 SSL Certificate Details

### **For IP Address (170.64.195.201)**

Since Let's Encrypt requires a domain name, the script will create a **self-signed certificate** for IP addresses.

**Browser Warning:** You'll see a security warning. This is normal for self-signed certificates.

To bypass in browser:
- Chrome: Type "thisisunsafe"
- Firefox: Click "Advanced" → "Accept Risk"

### **For Domain Name**

If you have a domain, update these files:

```bash
# Update init-letsencrypt.sh
nano scripts/init-letsencrypt.sh
# Change: DOMAIN="your-domain.com"

# Update nginx config
nano nginx/conf.d/pacific-explorer.conf
# Change: server_name _;
# To:     server_name your-domain.com www.your-domain.com;

# Deploy
./scripts/deploy.sh
```

Let's Encrypt will provide a **trusted certificate** automatically!

---

## 📊 Management Commands

### **View Logs**

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f certbot

# Last 100 lines
docker-compose logs --tail=100 app
```

### **Restart Services**

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart nginx

# Rebuild and restart
docker-compose up -d --build app
```

### **Stop/Start**

```bash
# Stop all services
docker-compose down

# Start all services
docker-compose up -d

# Stop and remove volumes (⚠️ deletes logs)
docker-compose down -v
```

### **Database Operations**

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed

# Open Prisma Studio
docker-compose exec app npx prisma studio
# Access at: http://170.64.195.201:5555
```

### **Update Application**

```bash
# After code changes on local machine:
cd /home/alois/Documents/cassini_hackathon
tar -czf pacific-explorer.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  pacific-explorer/

scp pacific-explorer.tar.gz root@170.64.195.201:/opt/

# On server:
ssh root@170.64.195.201
cd /opt/pacific-explorer
docker-compose down
cd /opt
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
```

---

## 🔧 Troubleshooting

### **Container Won't Start**

```bash
# Check logs
docker-compose logs app

# Check if port is in use
netstat -tulpn | grep 443

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### **Database Connection Issues**

```bash
# Test database connection
docker-compose exec app npx prisma db push

# Check DATABASE_URL
docker-compose exec app env | grep DATABASE_URL
```

### **SSL Certificate Issues**

```bash
# Recreate certificates
rm -rf certbot/conf/live
./scripts/init-letsencrypt.sh

# Check certificate
docker-compose exec nginx ls -la /etc/letsencrypt/live/pacific-explorer/

# View certificate details
openssl s_client -connect 170.64.195.201:443 -showcerts
```

### **Nginx Configuration Errors**

```bash
# Test nginx config
docker-compose exec nginx nginx -t

# View nginx logs
docker-compose logs nginx

# Restart nginx
docker-compose restart nginx
```

### **Out of Disk Space**

```bash
# Clean up Docker
docker system prune -a

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 🔐 Security Best Practices

### **1. Firewall Configuration**

```bash
# On server
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

### **2. Strong Secrets**

```bash
# Generate strong NEXTAUTH_SECRET
openssl rand -base64 32

# Update in .env.production
```

### **3. Regular Updates**

```bash
# Update Docker images
docker-compose pull

# Update system
apt update && apt upgrade -y
```

### **4. Backup Database**

```bash
# Create backup script
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U postgres pacific-explorer > "/opt/backups/db_$TIMESTAMP.sql"
echo "Backup created: db_$TIMESTAMP.sql"
EOF

chmod +x /opt/backup-db.sh

# Add to crontab (daily at 2am)
crontab -e
0 2 * * * /opt/backup-db.sh
```

---

## 📈 Monitoring

### **Container Stats**

```bash
# Real-time stats
docker stats

# Specific container
docker stats pacific-explorer
```

### **Health Checks**

```bash
# Application health
curl https://170.64.195.201/api/health

# Docker health
docker inspect pacific-explorer | grep -A 10 Health
```

### **Log Monitoring**

```bash
# Follow logs
docker-compose logs -f --tail=50

# Search logs
docker-compose logs | grep -i error
docker-compose logs | grep -i warning
```

---

## 🌐 Accessing the Application

- **HTTPS:** https://170.64.195.201
- **Explore:** https://170.64.195.201/explore
- **Destinations:** https://170.64.195.201/destinations/1
- **Health Check:** https://170.64.195.201/api/health
- **Sign In:** https://170.64.195.201/auth/signin

---

## 📁 File Structure

```
pacific-explorer/
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # Service orchestration
├── .dockerignore              # Exclude files from build
├── .env.production            # Production environment
├── nginx/
│   ├── nginx.conf             # Main nginx config
│   └── conf.d/
│       └── pacific-explorer.conf  # Site config
├── certbot/
│   ├── conf/                  # SSL certificates
│   └── www/                   # ACME challenges
└── scripts/
    ├── init-letsencrypt.sh    # SSL initialization
    └── deploy.sh              # Deployment script
```

---

## 🎯 Production Checklist

- [ ] Docker and Docker Compose installed
- [ ] Application transferred to server
- [ ] .env.production configured
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXTAUTH_URL set to https://
- [ ] Firewall ports 80, 443 open
- [ ] SSL certificates initialized
- [ ] All containers running
- [ ] Database migrations applied
- [ ] Health check passing
- [ ] HTTPS accessible in browser
- [ ] Backup script configured

---

## 💡 Tips

1. **Use a domain name** for trusted SSL certificates
2. **Monitor logs** regularly for errors
3. **Backup database** daily
4. **Update containers** monthly
5. **Test deployment** on staging first
6. **Document changes** in git
7. **Monitor resources** with `docker stats`

---

## 🆘 Getting Help

```bash
# View all running processes
docker-compose ps

# Get into container shell
docker-compose exec app sh

# View environment variables
docker-compose exec app env

# Check container logs
docker-compose logs app --tail=100

# Test database connection
docker-compose exec app npx prisma db push
```

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ `docker-compose ps` shows all containers "Up"
2. ✅ `curl https://170.64.195.201/api/health` returns 200
3. ✅ Browser can access https://170.64.195.201
4. ✅ Interactive map loads on /explore
5. ✅ Satellite viewer works on /destinations/1
6. ✅ SSL certificate is active (🔒 in browser)

---

**Your Pacific Explorer is now running in production with Docker and SSL!** 🎉🐳🔒
