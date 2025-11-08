# 🐳 Pacific Explorer - Docker Deployment

## ✅ All Docker Files Created!

Your Pacific Explorer is now ready for production deployment with Docker and Let's Encrypt SSL.

---

## 📦 What's Been Created

### **Docker Files:**
- ✅ `Dockerfile` - Multi-stage optimized build
- ✅ `docker-compose.yml` - Orchestrates app, nginx, certbot
- ✅ `.dockerignore` - Excludes unnecessary files
- ✅ `.env.production.example` - Production environment template

### **Nginx Configuration:**
- ✅ `nginx/nginx.conf` - Main nginx config
- ✅ `nginx/conf.d/pacific-explorer.conf` - Site config with SSL

### **Deployment Scripts:**
- ✅ `scripts/init-letsencrypt.sh` - SSL certificate setup
- ✅ `scripts/deploy.sh` - Complete deployment automation

### **Health Check:**
- ✅ `app/api/health/route.ts` - Application health endpoint

### **Documentation:**
- ✅ `DOCKER_DEPLOYMENT.md` - Complete deployment guide

---

## 🚀 Quick Start (3 Commands)

### **1. Prepare Environment**

```bash
cd /home/alois/Documents/cassini_hackathon/pacific-explorer

# Create production config
cp .env.production.example .env.production

# Generate secret and update
openssl rand -base64 32
nano .env.production  # Paste the secret
```

### **2. Package & Transfer**

```bash
# Create archive
cd /home/alois/Documents/cassini_hackathon
tar -czf pacific-explorer.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  pacific-explorer/

# Copy to server (170.64.195.201)
scp pacific-explorer.tar.gz root@170.64.195.201:/opt/
```

### **3. Deploy on Server**

```bash
# SSH to server
ssh root@170.64.195.201

# Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# Extract and deploy
cd /opt
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer
chmod +x scripts/*.sh
./scripts/deploy.sh
```

**That's it!** Your app will be running at https://170.64.195.201

---

## 📋 Detailed Steps

### **Step 1: Configure Environment**

Edit `.env.production`:
```env
DATABASE_URL="postgresql://postgres:admin123@170.64.167.7:30432/pacific-explorer"
NEXTAUTH_URL="https://170.64.195.201"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET_HERE"
EMAIL_SERVER_HOST="mail.napitalai.com.pg"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="aln@napitalai.com.pg"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="Pacific Explorer <aln@napitalai.com.pg>"
```

### **Step 2: Test Locally (Optional)**

```bash
cd /home/alois/Documents/cassini_hackathon/pacific-explorer

# Build and run locally
docker-compose build
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test
curl http://localhost/api/health

# Stop
docker-compose down
```

### **Step 3: Deploy to Server**

See commands above in "Quick Start #3"

---

## 🔒 SSL Certificate

### **For IP Address (170.64.195.201)**

The script automatically creates a **self-signed certificate**.

- ✅ HTTPS will work
- ⚠️ Browser will show security warning (normal for self-signed)
- ✅ Click "Advanced" → "Proceed" to access

### **For Domain Name**

If you have a domain:

1. Point DNS A record to 170.64.195.201
2. Update `scripts/init-letsencrypt.sh`:
   ```bash
   DOMAIN="your-domain.com"
   ```
3. Deploy - Let's Encrypt will provide trusted certificate!

---

## 📊 Management

### **View Status**
```bash
ssh root@170.64.195.201
cd /opt/pacific-explorer
docker-compose ps
```

### **View Logs**
```bash
docker-compose logs -f app
docker-compose logs -f nginx
```

### **Restart**
```bash
docker-compose restart app
docker-compose restart nginx
```

### **Update Application**
```bash
# On local machine: create new archive
# On server:
cd /opt/pacific-explorer
docker-compose down
cd /opt
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer
docker-compose up -d --build
```

### **Database Operations**
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
docker-compose exec app npx prisma studio
```

---

## ✅ Verification

After deployment, check:

```bash
# 1. Containers running
docker-compose ps
# Should show: pacific-explorer, nginx, certbot all "Up"

# 2. Health check
curl -k https://170.64.195.201/api/health
# Should return: {"status":"healthy",...}

# 3. Visit in browser
https://170.64.195.201
# Should show Pacific Explorer homepage
```

---

## 🎯 Access Points

- **Homepage:** https://170.64.195.201
- **Explore Map:** https://170.64.195.201/explore
- **Destinations:** https://170.64.195.201/destinations/1
- **Health:** https://170.64.195.201/api/health
- **Sign In:** https://170.64.195.201/auth/signin

---

## 🐛 Troubleshooting

### **Can't connect to server**
```bash
# Test SSH
ssh root@170.64.195.201

# Check firewall
ssh root@170.64.195.201 "ufw status"
```

### **Containers won't start**
```bash
# View logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### **SSL issues**
```bash
# Reinitialize SSL
rm -rf certbot/conf/live
./scripts/init-letsencrypt.sh
```

### **Database connection**
```bash
# Test connection
docker-compose exec app npx prisma db push
```

---

## 📚 Documentation

- **Complete Guide:** `DOCKER_DEPLOYMENT.md`
- **Interactive Map:** `INTERACTIVE_MAP_GUIDE.md`
- **Satellite Features:** `ADVANCED_SATELLITE_FEATURES.md`
- **Quick Start:** `QUICK_START.md`

---

## 🎊 Features Included

✅ **Docker Containerization** - Portable deployment  
✅ **Let's Encrypt SSL** - Free HTTPS certificates  
✅ **Nginx Reverse Proxy** - Production-grade web server  
✅ **Auto-renewal** - SSL certs renew automatically  
✅ **Health Checks** - Monitor application status  
✅ **Security Headers** - HSTS, XSS protection, etc.  
✅ **Rate Limiting** - Protect against abuse  
✅ **Gzip Compression** - Fast page loads  
✅ **Static Caching** - Optimized asset delivery  

---

## 🏆 Ready for Production!

Your Pacific Explorer is now:
- 🐳 Fully Dockerized
- 🔒 SSL/HTTPS enabled
- 🚀 Production-ready
- 📊 Easy to manage
- 🔄 Easy to update
- 💪 Scalable

**Perfect for your Cassini Hackathon demo!** 🎉

---

**Need help?** See `DOCKER_DEPLOYMENT.md` for detailed troubleshooting.
