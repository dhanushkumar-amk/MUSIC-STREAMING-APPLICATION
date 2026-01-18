# 🚀 Complete AWS EC2 Deployment Guide
## Deploy Your Music Streaming App on FREE EC2 t2.micro

---

## 📊 What We'll Deploy

```
Single EC2 t2.micro Instance (FREE for 12 months)
├── Backend API (Node.js + Express) → Port 4000
├── Frontend Client (React) → Port 80 (via Nginx)
├── Admin Panel (React) → Port 80/admin (via Nginx)
├── Nginx (Reverse Proxy + Static Hosting)
├── PM2 (Process Manager)
└── SSL Certificate (Let's Encrypt - FREE)
```

**Domain Setup:**
- `https://dhanushkumaramk.dev` → Frontend Client
- `https://api.dhanushkumaramk.dev` → Backend API
- `https://admin.dhanushkumaramk.dev` → Admin Panel

---

## ✅ Prerequisites

- [ ] AWS Account (Free Tier eligible)
- [ ] Domain: `dhanushkumaramk.dev` (Already have ✅)
- [ ] GitHub repository with your code
- [ ] MongoDB Atlas (Already configured ✅)
- [ ] Cloudinary account (Already configured ✅)

---

## 🎯 Part 1: Create EC2 Instance

### Step 1: Login to AWS Console

1. Go to: https://console.aws.amazon.com/
2. Login with your AWS account
3. **Region**: Select closest to your users (e.g., `ap-south-1` for India)

---

### Step 2: Launch EC2 Instance

1. Go to **EC2 Dashboard**: https://console.aws.amazon.com/ec2/
2. Click **Launch Instance**
3. Configure:

#### **Name and Tags**
```
Name: music-streaming-app
```

#### **Application and OS Images (AMI)**
```
AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
Architecture: 64-bit (x86)
```

#### **Instance Type**
```
Instance Type: t2.micro
vCPUs: 1
Memory: 1 GiB
✅ Free tier eligible
```

#### **Key Pair (Login)**
```
1. Click "Create new key pair"
2. Key pair name: music-app-key
3. Key pair type: RSA
4. Private key file format: .pem (for SSH)
5. Click "Create key pair"
6. ⚠️ SAVE THE .pem FILE - You can't download it again!
```

#### **Network Settings**
```
1. Click "Edit"
2. Auto-assign public IP: Enable
3. Firewall (Security Groups): Create new security group

Security Group Name: music-app-sg
Description: Security group for music streaming app

Inbound Rules:
┌──────────┬──────────┬────────────┬─────────────────┬─────────────────┐
│ Type     │ Protocol │ Port Range │ Source          │ Description     │
├──────────┼──────────┼────────────┼─────────────────┼─────────────────┤
│ SSH      │ TCP      │ 22         │ My IP (Auto)    │ SSH access      │
│ HTTP     │ TCP      │ 80         │ 0.0.0.0/0       │ Web traffic     │
│ HTTPS    │ TCP      │ 443        │ 0.0.0.0/0       │ Secure traffic  │
│ Custom   │ TCP      │ 4000       │ 0.0.0.0/0       │ Backend API     │
└──────────┴──────────┴────────────┴─────────────────┴─────────────────┘
```

#### **Configure Storage**
```
Size: 30 GiB (Maximum for free tier)
Volume Type: gp3 (General Purpose SSD)
✅ Free tier eligible
```

#### **Advanced Details**
```
Leave as default
```

4. Click **Launch Instance**
5. Wait 2-3 minutes for instance to start
6. Click **View Instances**

---

### Step 3: Get Your EC2 IP Address

1. In EC2 Dashboard, select your instance
2. Copy the **Public IPv4 address** (e.g., `13.233.123.45`)
3. **This is YOUR_BACKEND_SERVER_IP** ✅

**Save this IP - you'll need it for:**
- SSH connection
- Cloudflare DNS setup
- Environment variables

---

### Step 4: Allocate Elastic IP (Optional but Recommended)

**Why?** Elastic IP stays the same even if you stop/start the instance.

1. In EC2 Dashboard, click **Elastic IPs** (left sidebar)
2. Click **Allocate Elastic IP address**
3. Click **Allocate**
4. Select the new Elastic IP
5. Click **Actions** → **Associate Elastic IP address**
6. Select your instance
7. Click **Associate**

**Your new static IP**: `XX.XX.XX.XX` ✅

---

## 🎯 Part 2: Connect to EC2 Instance

### Step 1: Move Your Key File (Windows)

```powershell
# Move the .pem file to a safe location
Move-Item -Path "$env:USERPROFILE\Downloads\music-app-key.pem" -Destination "$env:USERPROFILE\.ssh\music-app-key.pem"

# Set proper permissions (important!)
icacls "$env:USERPROFILE\.ssh\music-app-key.pem" /inheritance:r
icacls "$env:USERPROFILE\.ssh\music-app-key.pem" /grant:r "$($env:USERNAME):(R)"
```

---

### Step 2: Connect via SSH

```powershell
# Replace with your Elastic IP
ssh -i "$env:USERPROFILE\.ssh\music-app-key.pem" ubuntu@YOUR_EC2_IP

# Example:
ssh -i "$env:USERPROFILE\.ssh\music-app-key.pem" ubuntu@13.233.123.45
```

**First time?** Type `yes` when asked about authenticity.

---

## 🎯 Part 3: Setup Server Environment

### Step 1: Update System

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y
```

---

### Step 2: Install Node.js 20.x

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

---

### Step 3: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

### Step 4: Install Nginx (Web Server)

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx

# Test: Open browser and go to http://YOUR_EC2_IP
# You should see "Welcome to nginx!"
```

---

### Step 5: Install Git

```bash
# Install Git
sudo apt install -y git

# Verify
git --version
```

---

### Step 6: Install FFmpeg (for HLS transcoding)

```bash
# Install FFmpeg
sudo apt install -y ffmpeg

# Verify
ffmpeg -version
```

---

### Step 7: Install Certbot (for SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🎯 Part 4: Deploy Backend

### Step 1: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your GitHub URL)
git clone https://github.com/YOUR_USERNAME/MUSIC-STREAMING-APPLICATION.git

# Navigate to project
cd MUSIC-STREAMING-APPLICATION
```

---

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create production .env file
nano .env
```

**Paste this configuration:**

```env
# MongoDB
MONGODB_URI=mongodb+srv://dk6032907:ty7PoPDiLw389n0X@cluster-mern.bwafrzq.mongodb.net/music-streaming-DB?retryWrites=true&w=majority&appName=cluster-mern

# Server
PORT=4000
NODE_ENV=production

# JWT
JWT_ACCESS_SECRET=access_secret_key
JWT_REFRESH_SECRET=refresh_secret_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Cloudinary
CLOUDINARY_NAME=ddcqjydoe
CLOUDINARY_API_KEY=769683357792756
CLOUDINARY_SECRET_KEY=RY11doFLe7HQROeiTJmKu4U6CcY

# Redis (Local - we'll use local Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Upstash Redis (Backup)
UPSTASH_REDIS_REST_URL=https://unique-bullfrog-16957.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUI9AAIncDJjM2I5MzljMmFjOGM0NTZiOWQ0NDA5NTAzNmQ1NWJlMnAyMTY5NTc

# Email
RESEND_API_KEY=re_h3mAHFrX_45EK3votvdr9X2g9gL2eN2Us
MAIL_FROM=no-reply@dhanushkumaramk.dev

# Cloudflare R2
R2_ACCESS_KEY_ID=46e5591053fca70d64880e286a17fda3
R2_SECRET_ACCESS_KEY=2ee5f39c9669920e57dd1e4170491c0730ce339bec5e8a8c495404f3532f1a15
R2_BUCKET=music-audio
R2_ACCOUNT_ID=82f0e39a991bb0b7c2d541b9ccf0xxxx
R2_PUBLIC_URL=https://cdn.dhanushkumaramk.dev

# MeiliSearch
MEILI_URL=https://music-streaming-application-pfyr.onrender.com
MEILI_MASTER_KEY=f3c7df8b23af9098c23ab1123ee99872b99ff203aa9912df88aa22ac3321ff9a

# URLs (Update these after domain setup)
API_URL=https://api.dhanushkumaramk.dev
FRONTEND_URL=https://dhanushkumaramk.dev
ADMIN_URL=https://admin.dhanushkumaramk.dev
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 3: Install Redis Locally (Optional)

```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

---

### Step 4: Start Backend with PM2

```bash
# Make sure you're in backend directory
cd ~/MUSIC-STREAMING-APPLICATION/backend

# Start backend with PM2
pm2 start server.js --name music-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it shows

# Check status
pm2 status

# View logs
pm2 logs music-backend
```

**Test Backend:**
```bash
curl http://localhost:4000/api/health
# Should return JSON response
```

---

## 🎯 Part 5: Build and Deploy Frontend

### Step 1: Build Client (Frontend)

```bash
# Navigate to client directory
cd ~/MUSIC-STREAMING-APPLICATION/client

# Create production .env file
nano .env.production
```

**Paste this:**

```env
VITE_API_URL=https://api.dhanushkumaramk.dev
VITE_CDN_URL=https://cdn.dhanushkumaramk.dev
VITE_SOCKET_URL=https://api.dhanushkumaramk.dev
```

**Save:** `Ctrl+X`, `Y`, `Enter`

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in: dist/
```

---

### Step 2: Build Admin Panel

```bash
# Navigate to admin directory
cd ~/MUSIC-STREAMING-APPLICATION/admin

# Create production .env file
nano .env.production
```

**Paste this:**

```env
VITE_API_URL=https://api.dhanushkumaramk.dev
VITE_CDN_URL=https://cdn.dhanushkumaramk.dev
```

**Save:** `Ctrl+X`, `Y`, `Enter`

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in: dist/
```

---

## 🎯 Part 6: Configure Nginx

### Step 1: Create Nginx Configuration

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create new config for main site
sudo nano /etc/nginx/sites-available/music-app
```

**Paste this configuration:**

```nginx
# Backend API - api.dhanushkumaramk.dev
server {
    listen 80;
    server_name api.dhanushkumaramk.dev;

    # Increase body size for file uploads
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for streaming
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

# Frontend Client - dhanushkumaramk.dev
server {
    listen 80;
    server_name dhanushkumaramk.dev www.dhanushkumaramk.dev;

    root /home/ubuntu/MUSIC-STREAMING-APPLICATION/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Admin Panel - admin.dhanushkumaramk.dev
server {
    listen 80;
    server_name admin.dhanushkumaramk.dev;

    root /home/ubuntu/MUSIC-STREAMING-APPLICATION/admin/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 2: Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/music-app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Should show: "syntax is ok" and "test is successful"

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🎯 Part 7: Configure DNS in Cloudflare

### Step 1: Add DNS Records

1. Go to: https://dash.cloudflare.com/
2. Select your domain: `dhanushkumaramk.dev`
3. Click **DNS** in left sidebar
4. Add these records:

```
Type    Name    Content                 Proxy Status    TTL
────────────────────────────────────────────────────────────
A       @       YOUR_EC2_ELASTIC_IP     ✅ Proxied      Auto
A       www     YOUR_EC2_ELASTIC_IP     ✅ Proxied      Auto
A       api     YOUR_EC2_ELASTIC_IP     ✅ Proxied      Auto
A       admin   YOUR_EC2_ELASTIC_IP     ✅ Proxied      Auto
```

**Example (if your Elastic IP is 13.233.123.45):**
```
A       @       13.233.123.45           ✅ Proxied      Auto
A       www     13.233.123.45           ✅ Proxied      Auto
A       api     13.233.123.45           ✅ Proxied      Auto
A       admin   13.233.123.45           ✅ Proxied      Auto
```

---

### Step 2: Wait for DNS Propagation

```bash
# Test DNS (from your local machine)
nslookup dhanushkumaramk.dev
nslookup api.dhanushkumaramk.dev
nslookup admin.dhanushkumaramk.dev

# Should resolve to Cloudflare IPs (104.x.x.x range)
```

**Wait:** 5-10 minutes for DNS to propagate

---

## 🎯 Part 8: Setup SSL Certificates

### Step 1: Get SSL Certificates

```bash
# Get certificates for all domains
sudo certbot --nginx -d dhanushkumaramk.dev -d www.dhanushkumaramk.dev -d api.dhanushkumaramk.dev -d admin.dhanushkumaramk.dev

# Follow prompts:
# 1. Enter email: your-email@example.com
# 2. Agree to terms: Y
# 3. Share email: N (optional)
# 4. Redirect HTTP to HTTPS: 2 (Yes, recommended)
```

**Certbot will:**
- Verify domain ownership
- Issue SSL certificates
- Auto-configure Nginx for HTTPS
- Setup auto-renewal

---

### Step 2: Test Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Should show: "Congratulations, all simulated renewals succeeded"
```

**Certificates auto-renew every 90 days!** ✅

---

## 🎯 Part 9: Final Testing

### Step 1: Test All Endpoints

```bash
# Test Backend API
curl https://api.dhanushkumaramk.dev/api/health

# Test Frontend
curl -I https://dhanushkumaramk.dev

# Test Admin
curl -I https://admin.dhanushkumaramk.dev
```

---

### Step 2: Test in Browser

1. **Frontend**: https://dhanushkumaramk.dev
2. **Admin**: https://admin.dhanushkumaramk.dev
3. **API**: https://api.dhanushkumaramk.dev/api/health

**Check:**
- ✅ HTTPS padlock icon
- ✅ No mixed content warnings
- ✅ All features working
- ✅ Music playback working

---

## 🎯 Part 10: Monitoring & Maintenance

### PM2 Commands

```bash
# View all processes
pm2 status

# View logs
pm2 logs music-backend

# Restart backend
pm2 restart music-backend

# Stop backend
pm2 stop music-backend

# Delete process
pm2 delete music-backend

# Monitor in real-time
pm2 monit
```

---

### Update Code (Git Pull)

```bash
# Navigate to project
cd ~/MUSIC-STREAMING-APPLICATION

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
pm2 restart music-backend

# Rebuild frontend
cd ../client
npm install
npm run build

# Rebuild admin
cd ../admin
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

---

### View Logs

```bash
# Backend logs
pm2 logs music-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

---

### Monitor Resources

```bash
# CPU and Memory usage
htop

# Disk usage
df -h

# Check running processes
ps aux | grep node
```

---

## 🎯 Part 11: Security Hardening

### Step 1: Setup UFW Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

---

### Step 2: Disable Root Login

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and change:
PermitRootLogin no
PasswordAuthentication no

# Save and restart SSH
sudo systemctl restart sshd
```

---

### Step 3: Setup Fail2Ban (Optional)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 📊 Cost Breakdown

### Free Tier (First 12 Months)
```
EC2 t2.micro:           $0/month (750 hours/month free)
Elastic IP:             $0/month (while attached)
30 GB Storage:          $0/month (30 GB free)
100 GB Bandwidth:       $0/month (15 GB out free)
SSL Certificate:        $0/month (Let's Encrypt)
──────────────────────────────────────────────
Total:                  $0/month ✅
```

### After Free Tier (Month 13+)
```
EC2 t2.micro:           ~$8.50/month
Elastic IP:             $0/month (while attached)
30 GB Storage:          ~$2.40/month
100 GB Bandwidth:       ~$9.00/month
──────────────────────────────────────────────
Total:                  ~$20/month
```

**💡 Tip:** Switch to **AWS Lightsail** ($3.50/month) after free tier!

---

## 🚨 Troubleshooting

### Issue: Can't SSH to EC2

**Solution:**
```bash
# Check security group allows SSH from your IP
# Check key file permissions
icacls "$env:USERPROFILE\.ssh\music-app-key.pem"
```

---

### Issue: Backend Not Starting

**Solution:**
```bash
# Check logs
pm2 logs music-backend

# Check if port 4000 is in use
sudo lsof -i :4000

# Restart
pm2 restart music-backend
```

---

### Issue: Nginx 502 Bad Gateway

**Solution:**
```bash
# Check backend is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart music-backend
sudo systemctl restart nginx
```

---

### Issue: SSL Certificate Error

**Solution:**
```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Reload Nginx
sudo systemctl reload nginx
```

---

## ✅ Deployment Checklist

- [ ] EC2 instance created (t2.micro)
- [ ] Elastic IP allocated and associated
- [ ] Security group configured (ports 22, 80, 443, 4000)
- [ ] SSH connection working
- [ ] Node.js, PM2, Nginx, Git installed
- [ ] Repository cloned
- [ ] Backend .env configured
- [ ] Backend running with PM2
- [ ] Frontend built and deployed
- [ ] Admin built and deployed
- [ ] Nginx configured
- [ ] DNS records added in Cloudflare
- [ ] SSL certificates installed
- [ ] All domains accessible via HTTPS
- [ ] Music playback tested
- [ ] PM2 auto-start enabled
- [ ] Firewall configured

---

## 🎉 Success!

Your music streaming application is now live on AWS EC2!

**URLs:**
- 🎵 **Frontend**: https://dhanushkumaramk.dev
- ⚙️ **Admin**: https://admin.dhanushkumaramk.dev
- 🔌 **API**: https://api.dhanushkumaramk.dev

**Server IP**: `YOUR_EC2_ELASTIC_IP`

---

## 📚 Next Steps

1. **Setup Monitoring**: Use AWS CloudWatch
2. **Setup Backups**: Snapshot your EC2 instance weekly
3. **Setup CI/CD**: Auto-deploy from GitHub
4. **Optimize Performance**: Enable caching, CDN
5. **Scale**: Add load balancer when needed

---

**Need Help?**
- AWS Documentation: https://docs.aws.amazon.com/
- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/

---

**🎯 Your Backend Server IP**: Check EC2 Dashboard → Elastic IPs
