# 🔍 How to Get Your Backend Server IP Address

## Quick Answer

Based on your DNS screenshot, your current server IP is: **91.195.240.94**

This is already configured in your Cloudflare DNS records! ✅

---

## 📋 Different Scenarios

### Scenario 1: You're Using the Same Server (RECOMMENDED)

If your backend API runs on the same server as your current website:

**✅ Use the existing IP: 91.195.240.94**

You don't need to add a new DNS record. Just use:
- `https://dhanushkumaramk.dev` (already configured)
- Or add subdomain `api.dhanushkumaramk.dev` pointing to same IP

---

### Scenario 2: Backend on Different Server

If your backend is on a different server, here's how to find the IP:

#### Option A: If Backend is on Cloud Provider

**Render.com:**
1. Go to your Render dashboard
2. Click on your backend service
3. Look for "Connect" section
4. Copy the outbound IP address

**Railway.app:**
1. Go to your Railway project
2. Click on your service
3. Settings → Networking
4. Copy the public IP

**Heroku:**
1. Heroku doesn't provide static IPs on free tier
2. Use CNAME record instead (see below)

**DigitalOcean/AWS/Azure:**
1. Go to your server/droplet dashboard
2. Look for "Public IP" or "IPv4 Address"
3. Copy the IP address

#### Option B: If Backend is on Your Local Machine (Development)

**Windows:**
```powershell
# Get your public IP
curl ifconfig.me

# Or
Invoke-RestMethod -Uri 'https://api.ipify.org?format=json'
```

**Result:** Your public IP address

⚠️ **Warning:** Local machine IPs change frequently. Not recommended for production!

---

### Scenario 3: Using Cloudflare Tunnel (FREE Alternative)

If you don't have a static IP or want to expose localhost securely:

#### Install Cloudflare Tunnel (cloudflared)

**Windows:**
1. Download: https://github.com/cloudflare/cloudflared/releases
2. Install `cloudflared-windows-amd64.exe`
3. Rename to `cloudflared.exe`
4. Move to `C:\Windows\System32\`

**Setup Tunnel:**
```powershell
# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create music-streaming-api

# Configure tunnel
cloudflared tunnel route dns music-streaming-api api.dhanushkumaramk.dev

# Run tunnel
cloudflared tunnel run music-streaming-api
```

**Benefits:**
- ✅ No need for public IP
- ✅ Automatic SSL
- ✅ Works from localhost
- ✅ Free forever

---

## 🎯 Recommended Setup for Your Domain

Based on your screenshot, I recommend:

### Option 1: Use Existing Server (EASIEST)

**Current Setup:**
```
@ → 91.195.240.94 (Proxied)
www → 91.195.240.94 (Proxied)
```

**Add API Subdomain:**
```
Type: A
Name: api
IPv4: 91.195.240.94
Proxy: ✅ Proxied
```

**Result:**
- Frontend: `https://dhanushkumaramk.dev`
- Backend: `https://api.dhanushkumaramk.dev`
- Both on same server, different ports

---

### Option 2: Separate Backend Server

If backend is on different server:

**Find Backend IP:**
1. SSH into your backend server
2. Run: `curl ifconfig.me`
3. Copy the IP address

**Add DNS Record:**
```
Type: A
Name: api
IPv4: YOUR_BACKEND_IP
Proxy: ✅ Proxied
```

---

### Option 3: Use Cloudflare Tunnel (NO IP NEEDED)

Perfect if:
- Backend is on localhost
- No static IP available
- Want secure tunnel

**Setup:**
```powershell
cloudflared tunnel create music-api
cloudflared tunnel route dns music-api api.dhanushkumaramk.dev
cloudflared tunnel run music-api
```

---

## 🔧 Quick Commands to Find Your IP

### Windows PowerShell:
```powershell
# Method 1: Using curl
curl ifconfig.me

# Method 2: Using Invoke-RestMethod
(Invoke-RestMethod -Uri 'https://api.ipify.org?format=json').ip

# Method 3: Check network adapter
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*"}
```

### If Backend is Already Running:
```powershell
# Check what IP your backend is listening on
netstat -ano | findstr :4000
```

---

## 📝 What to Do Next

### Step 1: Determine Your Setup

**Question:** Where is your backend running?

- [ ] Same server as frontend (91.195.240.94)
- [ ] Different cloud server (Render, Railway, etc.)
- [ ] Local machine (development)
- [ ] Not deployed yet

### Step 2: Based on Your Answer

#### If Same Server:
✅ **Use IP: 91.195.240.94**
- Add DNS record: `api.dhanushkumaramk.dev → 91.195.240.94`
- Configure backend to listen on port 4000
- Update Cloudflare page rules

#### If Different Server:
1. Find backend IP (see methods above)
2. Add DNS record with that IP
3. Configure firewall to allow port 4000
4. Update Cloudflare page rules

#### If Local Machine:
1. Use Cloudflare Tunnel (recommended)
2. Or use ngrok temporarily
3. Or deploy to cloud provider

---

## 🎯 My Recommendation for You

Based on your current setup, I recommend:

### **Use Your Existing Server (91.195.240.94)**

**Why?**
- ✅ Already configured in Cloudflare
- ✅ Already proxied (orange cloud)
- ✅ SSL already working
- ✅ No additional setup needed

**How?**

1. **Add API subdomain in Cloudflare:**
   ```
   Type: A
   Name: api
   IPv4: 91.195.240.94
   Proxy: ✅ Proxied
   ```

2. **Configure your backend to run on port 4000:**
   ```javascript
   // server.js
   const port = process.env.PORT || 4000;
   ```

3. **Setup reverse proxy (nginx) on your server:**
   ```nginx
   server {
       listen 80;
       server_name api.dhanushkumaramk.dev;

       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Done!** Your API will be accessible at:
   `https://api.dhanushkumaramk.dev`

---

## 🚨 Troubleshooting

### Can't Find Backend IP?

**If backend is on cloud:**
- Check provider dashboard
- Look for "Networking" or "Settings" section

**If backend is local:**
- Use Cloudflare Tunnel
- Or deploy to free tier (Render, Railway)

### IP Keeps Changing?

**Solution:**
- Use Cloudflare Tunnel (free, no IP needed)
- Or upgrade to static IP from provider
- Or use CNAME instead of A record

---

## 📚 Additional Resources

- **Find Public IP**: https://ifconfig.me/
- **Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Render Deployment**: https://render.com/docs
- **Railway Deployment**: https://docs.railway.app/

---

## ✅ Summary

**Your Current IP: 91.195.240.94** (from your DNS screenshot)

**Recommended Action:**
1. Use the same IP for API subdomain
2. Add DNS record: `api → 91.195.240.94`
3. Configure reverse proxy on server
4. Test: `https://api.dhanushkumaramk.dev`

**Alternative:**
- Use Cloudflare Tunnel (no IP needed)
- Deploy backend to Render/Railway (free tier)

---

**Need help with deployment?** Let me know where you want to host your backend!
