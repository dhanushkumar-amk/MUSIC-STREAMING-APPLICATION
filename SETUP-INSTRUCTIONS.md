# 🚀 SETUP INSTRUCTIONS - START HERE

## ⚡ Quick Setup (Follow in Order)

### Step 1: Create Free Accounts (10 minutes)

#### 1.1 Neon PostgreSQL (Required)
1. Go to: https://neon.tech
2. Click "Sign Up" → Sign in with GitHub
3. Create new project:
   - Name: `music-streaming-app`
   - Region: `US East` (or closest to you)
4. **Copy your connection string** (looks like this):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

#### 1.2 Upstash Redis (Required for caching)
1. Go to: https://upstash.com
2. Sign up with GitHub
3. Create new database:
   - Name: `music-app-cache`
   - Region: Same as Neon (for low latency)
4. **Copy REST credentials**:
   - REST URL: `https://xxx.upstash.io`
   - REST Token: `AXXXxxx`

---

### Step 2: Update Environment Variables (5 minutes)

**File: `backend/.env`**

Add these lines (replace with your actual values):

```env
# ==================== DATABASE ====================
# Paste your Neon connection string here:
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require&connection_limit=100&pool_timeout=20"

# ==================== REDIS CACHE ====================
# Paste your Upstash credentials here:
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXxxx"

# ==================== EXISTING SERVICES ====================
# Keep your existing values below:
MEILI_HOST="your_existing_value"
MEILI_MASTER_KEY="your_existing_value"

CLOUDINARY_NAME="your_existing_value"
CLOUDINARY_API_KEY="your_existing_value"
CLOUDINARY_API_SECRET="your_existing_value"

JWT_SECRET="your_existing_value"
JWT_REFRESH_SECRET="your_existing_value"

RESEND_API_KEY="your_existing_value"

NODE_ENV="development"
PORT=4000
```

---

### Step 3: Install Dependencies (2 minutes)

```bash
cd backend

# Install required packages
npm install node-cache

# Verify Prisma is installed
npm list @prisma/client prisma
```

---

### Step 4: Setup Database (5 minutes)

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Verify connection
node scripts/test-postgres-connection.js
```

**Expected output:**
```
✅ Connection successful!
✅ Query successful!
✅ Found 11 tables
🎉 All tests passed!
```

---

### Step 5: Test Caching (2 minutes)

```bash
node scripts/setup-caching.js
```

**Expected output:**
```
✅ Redis connected!
✅ Cache write/read successful!
🎉 Redis caching is ready!
```

---

### Step 6: View Database (Optional)

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Opens at: http://localhost:5555

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Neon account created
- [ ] Upstash account created
- [ ] DATABASE_URL added to .env
- [ ] Redis credentials added to .env
- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Database tables created
- [ ] Connection test passed
- [ ] Cache test passed

---

## 🎯 Next Steps

Once setup is complete:

### Option A: Start Fresh (No Data Migration)
```bash
# Just start using PostgreSQL
npm run dev
```

### Option B: Migrate Existing Data
```bash
# Create migration script (we'll do this next)
# This will copy data from MongoDB to PostgreSQL
```

---

## 🆘 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```bash
npm install @prisma/client prisma
npx prisma generate
```

### Issue: "Can't reach database server"
**Solution:**
- Check DATABASE_URL in .env
- Ensure Neon project is active (not paused)
- Verify internet connection
- Check connection string includes `?sslmode=require`

### Issue: "Redis connection failed"
**Solution:**
- Verify UPSTASH_REDIS_REST_URL in .env
- Verify UPSTASH_REDIS_REST_TOKEN in .env
- Check Upstash dashboard - database should be active

### Issue: "Table doesn't exist"
**Solution:**
```bash
npx prisma db push
```

---

## 📊 What Gets Created

After setup, you'll have:

### Database Tables (11 total)
- `users` - User accounts
- `user_settings` - User preferences
- `playlists` - User playlists
- `libraries` - Liked songs/albums
- `sessions` - Collaborative sessions
- `session_participants` - Session members
- `chat_messages` - Session chat
- `recently_played` - Listening history
- `recent_searches` - Search history
- `recommendations` - Song recommendations
- `lyrics` - Song lyrics

### Performance Features
- ✅ Connection pooling (100 connections)
- ✅ Multi-level caching (Memory + Redis)
- ✅ Optimized indexes
- ✅ Query optimization

---

## 🚀 Ready to Continue?

Once you complete this setup:

1. **Test the connection** - Run the test scripts
2. **Verify in Prisma Studio** - See your empty tables
3. **Ready for migration** - We can migrate MongoDB data
4. **Or start fresh** - Begin using PostgreSQL directly

**Status: Setup Complete! ✅**

---

## 💡 Pro Tips

- Keep MongoDB running during migration for safety
- Use Prisma Studio to verify data
- Monitor performance with the cache stats
- Check Neon dashboard for connection metrics

---

**Need help? Check the detailed guides:**
- `QUICK-START-GUIDE.md` - Overview
- `IMPLEMENTATION-GUIDE.md` - Step-by-step
- `PERFORMANCE-OPTIMIZATION-CHECKLIST.md` - Optimization

**Let's get started! 🎉**
