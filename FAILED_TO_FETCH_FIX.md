# 🔧 "Failed to Fetch" Error - Troubleshooting Guide

## ⚠️ **What "Failed to Fetch" Means**

This error appears when the frontend can't connect to the backend API. Common causes:

1. ❌ **Not logged in** (no token in localStorage)
2. ❌ **Token expired** (need to login again)
3. ❌ **Backend not running** (server stopped)
4. ❌ **Wrong API URL** (frontend pointing to wrong port)
5. ❌ **CORS issue** (backend blocking requests)

---

## ✅ **SOLUTION: Step-by-Step Fix**

### **Step 1: Check if You're Logged In**

Open browser console (F12) and run:
```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

**Expected Result:**
- Should show long JWT strings
- If `null` → **You're not logged in!**

**Fix:** Login first at `http://localhost:5173/auth/login`

---

### **Step 2: Check if Backend is Running**

Look at your backend terminal. You should see:
```
🚀 Server running on PORT: 4000
MongoDB connected
```

**If you don't see this:**
1. Stop the backend (Ctrl+C)
2. Restart it:
   ```bash
   cd backend
   npm run dev
   ```

---

### **Step 3: Test Backend Directly**

Open a new terminal and run:
```bash
curl http://localhost:4000
```

**Expected Response:**
```
API Working - Production Optimized
```

**If you get an error:**
- Backend is not running
- Wrong port
- Firewall blocking

---

### **Step 4: Check API URL in Frontend**

Open `client/src/services/api.js` and verify:
```javascript
const API_URL = 'http://localhost:4000/api';  // ✅ Should be this
```

**If it's different, fix it!**

---

### **Step 5: Clear Cache and Restart**

Sometimes the issue is cached data:

```bash
# Stop both servers (Ctrl+C)

# Clear frontend cache
cd client
rm -rf node_modules/.vite
npm run dev

# In another terminal, restart backend
cd backend
npm run dev
```

---

## 🔍 **Detailed Debugging**

### **Check Network Tab:**

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Refresh the profile page
4. Look for `/api/user/me` request

**Possible Results:**

#### **1. Request shows "Failed" or "CORS error":**
```
❌ Backend not running
❌ Wrong URL
❌ CORS not configured
```

**Fix:** Make sure backend is running on port 4000

#### **2. Request shows "401 Unauthorized":**
```
❌ Not logged in
❌ Token expired
```

**Fix:** Login again

#### **3. Request shows "500 Internal Server Error":**
```
❌ Backend error
❌ Database issue
```

**Fix:** Check backend console for errors

#### **4. Request succeeds (200 OK):**
```
✅ Everything working!
```

If you see 200 but still get "failed to fetch", it's a frontend issue.

---

## 🎯 **Most Common Issue: Not Logged In**

### **Quick Test:**

1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Go to login:**
   ```
   http://localhost:5173/auth/login
   ```

3. **Login with your credentials**

4. **Check localStorage again:**
   ```javascript
   localStorage.getItem('accessToken')  // Should show token
   ```

5. **Now go to profile:**
   ```
   http://localhost:5173/profile
   ```

6. ✅ **Should work!**

---

## 📊 **Backend Endpoint Test**

### **Test with curl (if you have a token):**

```bash
# Replace YOUR_TOKEN with actual token from localStorage
curl http://localhost:4000/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Your Name",
    "email": "your@email.com",
    "avatar": "...",
    "bio": "..."
  }
}
```

**If you get error:**
- Check token is valid
- Check backend is running
- Check database is connected

---

## 🔧 **Backend Checklist**

Make sure backend has:

✅ **MongoDB running:**
```bash
# Check if MongoDB is running
# Windows: Check Services
# Mac/Linux: ps aux | grep mongod
```

✅ **Environment variables set:**
```env
# backend/.env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spotify-db
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

✅ **Dependencies installed:**
```bash
cd backend
npm install
```

---

## 🎨 **Frontend Checklist**

✅ **Dependencies installed:**
```bash
cd client
npm install
```

✅ **API URL correct:**
- Check `client/src/services/api.js`
- Should be `http://localhost:4000/api`

✅ **Logged in:**
- Check localStorage has tokens
- If not, login first

---

## 🚀 **Complete Reset (If Nothing Works)**

### **1. Stop Everything:**
```bash
# Stop frontend (Ctrl+C)
# Stop backend (Ctrl+C)
```

### **2. Clear Everything:**
```bash
# Clear browser
localStorage.clear()  # In browser console

# Clear frontend cache
cd client
rm -rf node_modules/.vite

# Clear backend cache (optional)
cd backend
rm -rf node_modules
npm install
```

### **3. Restart Everything:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### **4. Register/Login:**
```
1. Go to http://localhost:5173/auth/register
2. Create account
3. Verify OTP
4. Now try profile page
```

---

## ✅ **Quick Checklist**

Before asking for help, verify:

- [ ] Backend is running (`http://localhost:4000` responds)
- [ ] Frontend is running (`http://localhost:5173` loads)
- [ ] MongoDB is running
- [ ] You're logged in (tokens in localStorage)
- [ ] No console errors in browser
- [ ] No errors in backend terminal

---

## 🎯 **Most Likely Solution**

**90% of the time, the issue is:**

```
❌ You're not logged in!
```

**Fix:**
1. Go to `/auth/login`
2. Login
3. Go to `/profile`
4. ✅ Works!

---

## 📝 **Still Not Working?**

If you've tried everything above and it still doesn't work:

1. **Check browser console** - Copy the exact error message
2. **Check backend console** - Copy any error logs
3. **Check Network tab** - See what the actual request/response is
4. **Share the error details** - So I can help you fix it

---

**Most likely you just need to login!** 🔐

Try logging in first, then the profile page will work perfectly! ✅
