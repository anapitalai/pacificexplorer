# Pacific Explorer - Deployment Guide

## Overview
This guide covers the deployment process for the Pacific Explorer application to the production server.

## Prerequisites

### Server Requirements
- Ubuntu/Debian server with Docker and Docker Compose installed
- SSH access with key-based authentication
- Domain name configured (optional but recommended)

### Local Requirements
- Node.js 20+
- npm or yarn
- SSH client
- Git

## Quick Deployment

### Option 1: Automated Pipeline (Recommended)
```bash
# Make sure you're in the project directory
cd /path/to/pacific-explorer

# Run the automated deployment
./deploy-pipeline.sh
```

### Option 2: Manual Deployment
```bash
# 1. Build and package
npm run build
tar -czf deploy.tar.gz --exclude='node_modules' --exclude='.next' .

# 2. Upload to server
scp deploy.tar.gz root@170.64.195.201:/opt/

# 3. Deploy on server
ssh root@170.64.195.201
cd /opt
tar -xzf deploy.tar.gz
cd pacific-explorer
docker-compose up -d --build
```

## Environment Configuration

### Production Environment Variables
Create `.env.production` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Next.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Stripe (optional)
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
```

## SSL/HTTPS Setup

### Automated SSL Setup
```bash
# On the server
./scripts/setup-ssl-apache.sh
```

### Manual SSL Setup
1. Generate self-signed certificate:
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/pacific-explorer.key \
  -out /etc/ssl/certs/pacific-explorer.crt
```

2. Configure Apache for SSL (see `apache-config/`)

## Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl http://170.64.195.201/api/health

# Docker containers
ssh root@170.64.195.201 'docker ps'

# Application logs
ssh root@170.64.195.201 'cd /opt/pacific-explorer && docker-compose logs -f'
```

### Backup & Recovery
```bash
# Database backup
ssh root@170.64.195.201 'docker exec pacific-explorer-db pg_dump -U postgres pacific_explorer > backup.sql'

# Application backup
ssh root@170.64.195.201 'cd /opt && tar -czf backup.tar.gz pacific-explorer'
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Deploy updates
./deploy-pipeline.sh
```

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   ```bash
   ./scripts/setup-ssh-and-deploy.sh
   ```

2. **Application Not Starting**
   ```bash
   ssh root@170.64.195.201
   cd /opt/pacific-explorer
   docker-compose logs
   ```

3. **Database Connection Issues**
   - Check DATABASE_URL in .env.production
   - Verify PostgreSQL is running: `docker ps`

4. **SSL Issues**
   - Check Apache configuration: `apache2ctl configtest`
   - Verify certificates: `openssl x509 -in /etc/ssl/certs/pacific-explorer.crt -text`

### Logs
```bash
# Application logs
ssh root@170.64.195.201 'cd /opt/pacific-explorer && docker-compose logs -f app'

# Nginx logs
ssh root@170.64.195.201 'cd /opt/pacific-explorer && docker-compose logs -f nginx'

# Database logs
ssh root@170.64.195.201 'cd /opt/pacific-explorer && docker-compose logs -f db'
```

## Security Considerations

- Use strong passwords for database and admin accounts
- Keep SSH keys secure and rotate regularly
- Enable firewall rules (UFW)
- Regularly update Docker images
- Monitor logs for suspicious activity

## Performance Optimization

- Enable gzip compression in nginx
- Configure proper caching headers
- Monitor resource usage with `docker stats`
- Scale containers as needed

## Support

For issues or questions:
1. Check the logs using commands above
2. Review this documentation
3. Check GitHub issues for known problems
4. Contact the development team
