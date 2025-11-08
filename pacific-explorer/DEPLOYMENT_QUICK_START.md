# 🚀 Quick Deployment Guide

## Available Deployment Scripts

### 1. **Main Deployment Script** 
**Location**: `scripts/deploy.sh`

This script automates the entire deployment process:
- ✅ Builds Docker image
- ✅ Sets up SSL certificates
- ✅ Starts all services
- ✅ Runs database migrations
- ✅ Checks application health

**Usage**:
```bash
cd /home/alois/Documents/cassini_hackathon/pacific-explorer
./scripts/deploy.sh
```

---

### 2. **Deploy to Remote Server (170.64.195.201)**
**Documentation**: `documentation/DEPLOY_TO_SERVER.md`

**Quick Steps**:

#### Step 1: Package the application
```bash
cd /home/alois/Documents/cassini_hackathon
tar -czf pacific-explorer.tar.gz \
  --exclude='pacific-explorer/node_modules' \
  --exclude='pacific-explorer/.next' \
  --exclude='pacific-explorer/.git' \
  pacific-explorer/
```

#### Step 2: Transfer to server
```bash
scp pacific-explorer.tar.gz root@170.64.195.201:/opt/
```

#### Step 3: SSH to server and deploy
```bash
ssh root@170.64.195.201

# Extract
cd /opt
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer

# Deploy
./scripts/deploy.sh
```

---

### 3. **Docker Deployment (Local or Server)**
**Documentation**: `documentation/DOCKER_DEPLOYMENT.md`

#### Quick Start:
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `.env.production` file exists with correct values
- [ ] Database credentials configured
- [ ] Email settings configured (if using email features)
- [ ] Domain name pointed to server (if using SSL)
- [ ] Ports 80 and 443 open on server
- [ ] SSH access to remote server

---

## 📦 Files You Need to Deploy

### Required Files:
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `.env.production`
- ✅ `package.json`
- ✅ `prisma/schema.prisma`
- ✅ `scripts/deploy.sh`
- ✅ All source code (`app/`, `components/`, `lib/`)

### Excluded (will be built on server):
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `.git/`

---

## 🚀 Automated Deployment Script

I can create an automated deployment script that handles everything:

```bash
#!/bin/bash
# One-command deployment to remote server

SERVER="root@170.64.195.201"
PROJECT_PATH="/home/alois/Documents/cassini_hackathon"
REMOTE_PATH="/opt/pacific-explorer"

echo "🚀 Starting deployment to $SERVER..."

# Step 1: Package
echo "📦 Packaging application..."
cd $PROJECT_PATH
tar -czf pacific-explorer.tar.gz \
  --exclude='pacific-explorer/node_modules' \
  --exclude='pacific-explorer/.next' \
  --exclude='pacific-explorer/.git' \
  pacific-explorer/

# Step 2: Transfer
echo "📤 Transferring to server..."
scp pacific-explorer.tar.gz $SERVER:/opt/

# Step 3: Deploy on server
echo "🔧 Deploying on server..."
ssh $SERVER << 'ENDSSH'
cd /opt
rm -rf pacific-explorer
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer
./scripts/deploy.sh
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Visit: https://your-domain.com"
```

---

## 🔍 Check Deployment Status

### On Local Machine:
```bash
# Check if server is responding
curl -I http://170.64.195.201

# Check SSL (if configured)
curl -I https://your-domain.com
```

### On Remote Server:
```bash
ssh root@170.64.195.201

# Check running containers
docker ps

# View app logs
docker logs pacific-explorer-app

# Check application health
curl http://localhost:3005/api/health
```

---

## 🐛 Troubleshooting

### Issue: Can't connect to server
```bash
# Test SSH connection
ssh -v root@170.64.195.201

# Check if server is accessible
ping 170.64.195.201
```

### Issue: Docker container not starting
```bash
# SSH to server
ssh root@170.64.195.201

# Check logs
docker-compose logs app

# Restart containers
docker-compose restart
```

### Issue: Database connection error
```bash
# Verify database is accessible
ssh root@170.64.195.201
docker-compose exec app npx prisma db push
```

---

## 📚 Related Documentation

- **[DEPLOY_TO_SERVER.md](./DEPLOY_TO_SERVER.md)** - Detailed deployment guide
- **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Docker-specific instructions
- **[DOCKER_README.md](./DOCKER_README.md)** - Docker setup

---

## 🔐 Environment Variables for Production

Ensure your `.env.production` has:

```env
# Application
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-here

# Database
DATABASE_URL="postgresql://user:password@170.64.167.7:30432/pacific-explorer"

# Email (optional)
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="Pacific Explorer <noreply@your-domain.com>"
```

---

## ⚡ Quick Commands Reference

```bash
# Package and deploy
./scripts/quick-deploy.sh

# Deploy only (assuming already on server)
./scripts/deploy.sh

# Build Docker image locally
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# SSH to server
ssh root@170.64.195.201

# Transfer files
scp file.tar.gz root@170.64.195.201:/opt/
```

---

**Need help?** Check the detailed documentation in `documentation/DEPLOY_TO_SERVER.md`
