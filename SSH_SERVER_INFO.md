# SSH Server Information & Deployment Guide

## Server Details

### SSH Connection Information
- **Host**: ssh.dhanushkumaramk.dev
- **Username**: dhanushkumaramk
- **Password**: dhanushkumaramk@7080

### Connection Command
```bash
ssh dhanushkumaramk@ssh.dhanushkumaramk.dev
```

## Current Deployments

### n8n Workflow Automation
**Status**: ✅ Running

#### Container Details
| Container Name | Image | Status | Ports | Created |
|---------------|-------|--------|-------|---------|
| n8n-app | n8nio/n8n:stable | Up 10 hours | 0.0.0.0:8081->5678/tcp | 19 hours ago |
| n8n-runners | n8nio/runners:stable | Up 10 hours | 5680/tcp | 19 hours ago |

#### Access URLs
- **n8n Web Interface**: http://ssh.dhanushkumaramk.dev:8081
- **Internal Port**: 5678 (mapped to 8081)

## Server Environment

### Installed Software
- **Git**: v2.43.0
- **Docker**: Running (containers active)
- **Operating System**: Linux (bash shell)

## Useful Commands

### Check Server Information
```bash
# Get server IP address
ip addr show

# Or use hostname command
hostname -I

# Check OS version
cat /etc/os-release

# Check system resources
free -h
df -h

# Check running processes
ps aux

# Check network connections
netstat -tulpn
```

### Docker Management
```bash
# List all containers
docker ps -a

# Check container logs
docker logs n8n-app
docker logs n8n-runners

# Restart containers
docker restart n8n-app
docker restart n8n-runners

# Stop containers
docker stop n8n-app n8n-runners

# Start containers
docker start n8n-app n8n-runners

# View container resource usage
docker stats
```

### System Monitoring
```bash
# Check CPU and memory usage
top

# Or use htop if available
htop

# Check disk usage
du -sh /var/lib/docker

# Check Docker disk usage
docker system df
```

## Deploying Music Streaming Application

### Prerequisites Check
```bash
# Check if Node.js is installed
node --version
npm --version

# Check if PM2 is installed (for process management)
pm2 --version

# Check available ports
sudo netstat -tulpn | grep LISTEN
```

### Recommended Deployment Steps

#### 1. Clone Repository
```bash
cd ~
git clone <your-music-streaming-repo-url>
cd MUSIC-STREAMING-APPLICATION
```

#### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Client
cd ../client
npm install

# Admin
cd ../admin
npm install
```

#### 3. Environment Configuration
```bash
# Create .env files for each component
# Backend .env
cd ~/MUSIC-STREAMING-APPLICATION/backend
nano .env
```

**Backend .env Template**:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://ssh.dhanushkumaramk.dev:3000
ADMIN_URL=http://ssh.dhanushkumaramk.dev:3001
```

#### 4. Build Frontend Applications
```bash
# Client
cd ~/MUSIC-STREAMING-APPLICATION/client
npm run build

# Admin
cd ~/MUSIC-STREAMING-APPLICATION/admin
npm run build
```

#### 5. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

#### 6. Start Applications with PM2
```bash
# Start backend
cd ~/MUSIC-STREAMING-APPLICATION/backend
pm2 start npm --name "music-backend" -- start

# Serve client build
pm2 serve ~/MUSIC-STREAMING-APPLICATION/client/dist 3000 --name "music-client" --spa

# Serve admin build
pm2 serve ~/MUSIC-STREAMING-APPLICATION/admin/dist 3001 --name "music-admin" --spa

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 7. Configure Nginx (Recommended)
```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create configuration
sudo nano /etc/nginx/sites-available/music-app
```

**Nginx Configuration**:
```nginx
# Backend API
server {
    listen 80;
    server_name api.dhanushkumaramk.dev;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Client
server {
    listen 80;
    server_name music.dhanushkumaramk.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin
server {
    listen 80;
    server_name admin.dhanushkumaramk.dev;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/music-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 8. Setup SSL with Let's Encrypt (Optional but Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d api.dhanushkumaramk.dev
sudo certbot --nginx -d music.dhanushkumaramk.dev
sudo certbot --nginx -d admin.dhanushkumaramk.dev
```

### Port Allocation
- **8081**: n8n (already in use)
- **5000**: Music Streaming Backend API
- **3000**: Music Streaming Client
- **3001**: Music Streaming Admin
- **80**: Nginx (HTTP)
- **443**: Nginx (HTTPS)

## Monitoring & Maintenance

### PM2 Commands
```bash
# List all processes
pm2 list

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart music-backend

# Stop application
pm2 stop music-backend

# Delete application
pm2 delete music-backend
```

### Docker Commands for n8n
```bash
# View n8n logs
docker logs -f n8n-app

# Backup n8n data
docker exec n8n-app n8n export:workflow --all --output=/data/backup.json

# Update n8n
docker pull n8nio/n8n:stable
docker-compose up -d
```

## Security Recommendations

1. **Change Default Passwords**: Update SSH password from default
2. **Setup Firewall**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 8081/tcp
   sudo ufw enable
   ```
3. **Setup SSH Key Authentication**: Disable password authentication
4. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Setup Fail2Ban**:
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

## Troubleshooting

### Check Server IP
```bash
# Get public IP
curl ifconfig.me

# Get local IP
hostname -I
```

### Check Port Availability
```bash
# Check if port is in use
sudo lsof -i :5000
sudo lsof -i :3000
sudo lsof -i :3001
```

### Check Application Logs
```bash
# PM2 logs
pm2 logs music-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
# Restart all PM2 processes
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Restart Docker containers
docker restart n8n-app n8n-runners
```

## Next Steps

1. ✅ Verify SSH connection works
2. ⬜ Check server specifications (CPU, RAM, disk space)
3. ⬜ Install required software (Node.js, PM2, Nginx)
4. ⬜ Clone music streaming application repository
5. ⬜ Configure environment variables
6. ⬜ Deploy application
7. ⬜ Setup domain DNS records
8. ⬜ Configure SSL certificates
9. ⬜ Test application functionality
10. ⬜ Setup monitoring and backups
