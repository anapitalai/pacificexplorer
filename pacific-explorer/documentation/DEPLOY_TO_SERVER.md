# 🚀 Deploy Pacific Explorer to 170.64.195.201

## Quick Deployment Guide

Follow these steps to deploy your Dockerized app to your remote server.

---

## 📋 Prerequisites

### On Your Local Machine:
- ✅ SSH access to 170.64.195.201
- ✅ Pacific Explorer project ready

### On Remote Server (170.64.195.201):
- Docker installed
- Docker Compose installed
- Ports 80 and 443 open

---

## 🎯 Step-by-Step Deployment

### **Step 1: Prepare Environment File**

```bash
cd /home/alois/Documents/cassini_hackathon/pacific-explorer

# Copy the example env file
cp .env.production.example .env.production

# Generate a secure secret
openssl rand -base64 32

# Edit the file and paste the secret
nano .env.production
```

Update these values in `.env.production`:
```env
NEXTAUTH_SECRET="paste-your-generated-secret-here"
EMAIL_SERVER_PASSWORD="your-actual-email-password"
```

---

### **Step 2: Package the Application**

```bash
cd /home/alois/Documents/cassini_hackathon

# Create a tarball (excludes node_modules and .next)
tar -czf pacific-explorer.tar.gz \
  --exclude='pacific-explorer/node_modules' \
  --exclude='pacific-explorer/.next' \
  --exclude='pacific-explorer/.git' \
  pacific-explorer/

# Verify the archive
ls -lh pacific-explorer.tar.gz
```

---

### **Step 3: Transfer to Server**

```bash
# Copy to server
scp pacific-explorer.tar.gz root@170.64.195.201:/opt/

# Verify upload
ssh root@170.64.195.201 "ls -lh /opt/pacific-explorer.tar.gz"
```

---

### **Step 4: SSH to Server**

```bash
ssh root@170.64.195.201
```

---

### **Step 5: Install Docker (if not installed)**

```bash
# Check if Docker is installed
docker --version

# If not installed, run:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose plugin
apt update
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

---

### **Step 6: Extract and Setup**

```bash
# Navigate to /opt
cd /opt

# Extract the archive
tar -xzf pacific-explorer.tar.gz

# Navigate to project
cd pacific-explorer

# Make scripts executable
chmod +x scripts/*.sh

# Verify files
ls -la
```

---

### **Step 7: Configure DNS (Important!)**

Before running the deployment, ensure your DNS is configured:

```bash
# Test DNS resolution
dig pacificexplorer.napitalai.com.pg

# Should show:
# pacificexplorer.napitalai.com.pg. IN A 170.64.195.201
```

**If DNS is not configured:**
- Go to your DNS provider
- Add an A record: `pacificexplorer.napitalai.com.pg` → `170.64.195.201`
- Wait 5-10 minutes for propagation

---

### **Step 8: Run Deployment Script**

```bash
cd /opt/pacific-explorer

# Run the automated deployment
./scripts/deploy.sh
```

The script will:
1. ✅ Build Docker images
2. ✅ Initialize Let's Encrypt SSL certificates
3. ✅ Start all services (app, nginx, certbot)
4. ✅ Run database migrations
5. ✅ Verify health

---

### **Step 9: Verify Deployment**

```bash
# Check containers are running
docker compose ps

# Should show:
# NAME                    STATUS
# pacific-explorer        Up (healthy)
# nginx                   Up
# certbot                 Up

# Test health endpoint
curl -k https://localhost/api/health

# View logs
docker compose logs -f app
```

---

### **Step 10: Access Your App**

Open in browser:
- **Homepage:** https://pacificexplorer.napitalai.com.pg
- **Explore Map:** https://pacificexplorer.napitalai.com.pg/explore
- **Health Check:** https://pacificexplorer.napitalai.com.pg/api/health

---

## 🔧 Alternative: Manual Deployment

If you prefer to do it step-by-step manually:

```bash
# On server (170.64.195.201)
cd /opt/pacific-explorer

# 1. Build the Docker image
docker compose build

# 2. Initialize SSL certificates
./scripts/init-letsencrypt.sh

# 3. Start services
docker compose up -d

# 4. Run database migrations
docker compose exec app npx prisma migrate deploy

# 5. Seed database (optional)
docker compose exec app npx prisma db seed

# 6. Check status
docker compose ps
```

---

## 📊 Management Commands

### **View Logs**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f nginx
```

### **Restart Services**
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
```

### **Stop/Start**
```bash
# Stop all
docker compose down

# Start all
docker compose up -d
```

### **Update Application**
```bash
# On local machine: package new version
cd /home/alois/Documents/cassini_hackathon
tar -czf pacific-explorer.tar.gz --exclude='node_modules' --exclude='.next' pacific-explorer/
scp pacific-explorer.tar.gz root@170.64.195.201:/opt/

# On server: deploy update
ssh root@170.64.195.201
cd /opt/pacific-explorer
docker compose down
cd /opt
tar -xzf pacific-explorer.tar.gz
cd pacific-explorer
docker compose up -d --build
```

---

## 🐛 Troubleshooting

### **Can't SSH to server**
```bash
# Test connection
ping 170.64.195.201

# Try with verbose SSH
ssh -v root@170.64.195.201
```

### **Containers won't start**
```bash
# View detailed logs
docker compose logs

# Check disk space
df -h

# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### **SSL Certificate Issues**
```bash
# Check if DNS is working
dig pacificexplorer.napitalai.com.pg

# Re-initialize SSL
cd /opt/pacific-explorer
rm -rf certbot/conf/live
./scripts/init-letsencrypt.sh
```

### **Database Connection Issues**
```bash
# Test database connectivity from server
docker compose exec app npx prisma db push

# Check if database server is accessible
telnet 170.64.167.7 30432
```

### **Port Already in Use**
```bash
# Check what's using port 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Stop conflicting service (e.g., Apache)
sudo systemctl stop apache2
sudo systemctl disable apache2
```

---

## 🔒 Security Checklist

After deployment:

- [ ] Change default passwords in `.env.production`
- [ ] Enable UFW firewall: `ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] Set up automatic security updates
- [ ] Configure SSH key-only access (disable password auth)
- [ ] Set up fail2ban for SSH protection
- [ ] Regular backups of database

---

## 📚 Additional Resources

- **Complete Guide:** `DOCKER_DEPLOYMENT.md`
- **Docker README:** `DOCKER_README.md`
- **Quick Start:** `QUICK_START.md`

---

## ✅ Success Indicators

Your deployment is successful when:
1. ✅ `docker compose ps` shows all containers "Up"
2. ✅ Health check returns: `{"status":"healthy"}`
3. ✅ Browser shows homepage without errors
4. ✅ SSL certificate is valid (green padlock)
5. ✅ Interactive map loads on `/explore`
6. ✅ Satellite viewer works on destinations

---

**You're all set! 🎉**

If you encounter issues, check the logs or see the troubleshooting section above.
