# 🚀 Inngest Integration Guide - Music Streaming App

## 📋 What is Inngest?

Inngest is a **background job and workflow platform** that helps you run tasks asynchronously, schedule jobs, and handle complex workflows.

**Perfect for your music streaming app!**

---

## 🎯 What You Can Use Inngest For

### 1. **Email Notifications** 📧
- Welcome emails when users register
- Password reset emails
- Playlist collaboration invites
- Weekly listening reports
- New music recommendations

### 2. **Analytics & Reporting** 📊
- Calculate user listening statistics
- Generate weekly/monthly reports
- Update recommendation algorithms
- Track popular songs/albums
- User engagement metrics

### 3. **Data Processing** 🔄
- Process uploaded songs (metadata extraction)
- Generate song thumbnails
- Audio file optimization
- Batch updates to recommendations
- Clean up old sessions

### 4. **Scheduled Tasks** ⏰
- Daily recommendation updates
- Weekly playlist suggestions
- Monthly user reports
- Clean up expired sessions
- Archive old chat messages

### 5. **Real-time Features** ⚡
- Send notifications to session participants
- Update collaborative playlists
- Sync playback across devices
- Real-time chat processing

---

## 📦 Installation

```bash
cd backend
npm install inngest
```

---

## 🔧 Setup

### 1. Create Inngest Client

**`src/config/inngest.js`:**
```javascript
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "music-streaming-app",
  name: "Music Streaming Application"
});
```

### 2. Create Functions Directory

```bash
mkdir -p src/inngest/functions
```

---

## 💡 Example Use Cases

### Example 1: Welcome Email on Registration

**`src/inngest/functions/send-welcome-email.js`:**
```javascript
import { inngest } from "../../config/inngest.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/registered" },
  async ({ event, step }) => {
    const { email, name } = event.data;

    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "Music App <noreply@yourapp.com>",
        to: email,
        subject: "Welcome to Music Streaming!",
        html: `
          <h1>Welcome ${name}!</h1>
          <p>Thanks for joining our music streaming platform.</p>
          <p>Start exploring thousands of songs and create your first playlist!</p>
        `
      });
    });

    return { success: true };
  }
);
```

**Trigger it in auth controller:**
```javascript
// In auth.controller.js after user registration
import { inngest } from "../config/inngest.js";

// After creating user
await inngest.send({
  name: "user/registered",
  data: {
    userId: user.id,
    email: user.email,
    name: user.name
  }
});
```

---

### Example 2: Update Recommendations Daily

**`src/inngest/functions/update-recommendations.js`:**
```javascript
import { inngest } from "../../config/inngest.js";
import prisma from "../../config/database.js";

export const updateRecommendations = inngest.createFunction(
  { id: "update-recommendations" },
  { cron: "0 2 * * *" }, // Run at 2 AM daily
  async ({ step }) => {
    await step.run("calculate-scores", async () => {
      // Get all recommendations
      const recommendations = await prisma.recommendation.findMany();

      // Update weighted scores
      for (const rec of recommendations) {
        const weightedScore = rec.globalPlayCount - (rec.globalSkipCount * 0.5);

        await prisma.recommendation.update({
          where: { id: rec.id },
          data: { weightedScore }
        });
      }
    });

    return { processed: recommendations.length };
  }
);
```

---

### Example 3: Clean Up Old Sessions

**`src/inngest/functions/cleanup-sessions.js`:**
```javascript
import { inngest } from "../../config/inngest.js";
import prisma from "../../config/database.js";

export const cleanupSessions = inngest.createFunction(
  { id: "cleanup-old-sessions" },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ step }) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await step.run("delete-inactive-sessions", async () => {
      const result = await prisma.session.deleteMany({
        where: {
          isActive: false,
          updatedAt: { lt: oneDayAgo }
        }
      });

      return { deleted: result.count };
    });
  }
);
```

---

### Example 4: Weekly Listening Report

**`src/inngest/functions/weekly-report.js`:**
```javascript
import { inngest } from "../../config/inngest.js";
import prisma from "../../config/database.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWeeklyReport = inngest.createFunction(
  { id: "send-weekly-report" },
  { cron: "0 9 * * 1" }, // Every Monday at 9 AM
  async ({ step }) => {
    const users = await step.run("get-active-users", async () => {
      return await prisma.user.findMany({
        where: { isEmailVerified: true }
      });
    });

    for (const user of users) {
      await step.run(`send-report-${user.id}`, async () => {
        // Get user's listening stats from last week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const stats = await prisma.recentlyPlayed.findMany({
          where: {
            userId: user.id,
            playedAt: { gte: weekAgo }
          }
        });

        const totalPlays = stats.length;
        const totalMinutes = stats.reduce((sum, s) => sum + (s.playDuration / 60), 0);

        await resend.emails.send({
          from: "Music App <noreply@yourapp.com>",
          to: user.email,
          subject: "Your Weekly Music Report 🎵",
          html: `
            <h1>Hi ${user.name}!</h1>
            <h2>Your Week in Music</h2>
            <p>🎵 Songs played: ${totalPlays}</p>
            <p>⏱️ Minutes listened: ${Math.round(totalMinutes)}</p>
            <p>Keep discovering great music!</p>
          `
        });
      });
    }

    return { userCount: users.length };
  }
);
```

---

### Example 5: Process New Song Upload

**`src/inngest/functions/process-song.js`:**
```javascript
import { inngest } from "../../config/inngest.js";

export const processSongUpload = inngest.createFunction(
  { id: "process-song-upload" },
  { event: "song/uploaded" },
  async ({ event, step }) => {
    const { songId, audioUrl } = event.data;

    // Extract metadata
    await step.run("extract-metadata", async () => {
      // Use a library to extract duration, bitrate, etc.
      console.log("Extracting metadata for", songId);
    });

    // Generate waveform
    await step.run("generate-waveform", async () => {
      console.log("Generating waveform for", songId);
    });

    // Create recommendation entry
    await step.run("create-recommendation", async () => {
      await prisma.recommendation.create({
        data: {
          songId,
          globalPlayCount: 0,
          globalSkipCount: 0,
          weightedScore: 0
        }
      });
    });

    return { success: true };
  }
);
```

---

### Example 6: Session Notifications

**`src/inngest/functions/session-notifications.js`:**
```javascript
import { inngest } from "../../config/inngest.js";
import { io } from "../../socket/socketService.js";

export const notifySessionParticipants = inngest.createFunction(
  { id: "notify-session-participants" },
  { event: "session/song-changed" },
  async ({ event, step }) => {
    const { sessionId, songId, participants } = event.data;

    await step.run("send-notifications", async () => {
      // Emit socket event to all participants
      participants.forEach(userId => {
        io.to(userId).emit("session:song-changed", {
          sessionId,
          songId
        });
      });
    });

    return { notified: participants.length };
  }
);
```

---

## 🔌 Setup Inngest Endpoint

**`src/routes/inngest.route.js`:**
```javascript
import { serve } from "inngest/express";
import { inngest } from "../config/inngest.js";

// Import all functions
import { sendWelcomeEmail } from "../inngest/functions/send-welcome-email.js";
import { updateRecommendations } from "../inngest/functions/update-recommendations.js";
import { cleanupSessions } from "../inngest/functions/cleanup-sessions.js";
import { sendWeeklyReport } from "../inngest/functions/weekly-report.js";
import { processSongUpload } from "../inngest/functions/process-song.js";
import { notifySessionParticipants } from "../inngest/functions/session-notifications.js";

export default serve({
  client: inngest,
  functions: [
    sendWelcomeEmail,
    updateRecommendations,
    cleanupSessions,
    sendWeeklyReport,
    processSongUpload,
    notifySessionParticipants
  ]
});
```

**Add to `server.js`:**
```javascript
import inngestRouter from "./src/routes/inngest.route.js";

// Add this route
app.use("/api/inngest", inngestRouter);
```

---

## 🌐 Inngest Cloud Setup

1. **Sign up:** https://www.inngest.com/
2. **Create app** in Inngest dashboard
3. **Get API key**
4. **Add to `.env`:**
```env
INNGEST_EVENT_KEY="your-event-key"
INNGEST_SIGNING_KEY="your-signing-key"
```

5. **Connect your app:**
   - In Inngest dashboard, add your app URL
   - Point to: `https://yourapp.com/api/inngest`

---

## 📊 Monitoring

Inngest provides:
- ✅ Function execution logs
- ✅ Error tracking
- ✅ Retry management
- ✅ Performance metrics
- ✅ Visual workflow editor

Access at: https://app.inngest.com

---

## 🎯 Recommended Functions for Your App

### High Priority:
1. ✅ **Welcome emails** - Better user onboarding
2. ✅ **Password reset emails** - Already using Resend
3. ✅ **Session cleanup** - Keep database clean
4. ✅ **Recommendation updates** - Better suggestions

### Medium Priority:
5. ✅ **Weekly reports** - User engagement
6. ✅ **Playlist notifications** - Social features
7. ✅ **Song processing** - Better metadata

### Low Priority:
8. ✅ **Analytics aggregation** - Insights
9. ✅ **Archive old data** - Performance
10. ✅ **Backup tasks** - Safety

---

## 🚀 Benefits

**With Inngest you get:**
- ✅ Reliable background jobs
- ✅ Automatic retries
- ✅ Scheduled tasks (cron)
- ✅ Event-driven workflows
- ✅ Visual monitoring
- ✅ No queue management needed
- ✅ Scales automatically

---

## 📝 Next Steps

1. Install Inngest: `npm install inngest`
2. Create Inngest account
3. Set up welcome email function
4. Test with user registration
5. Add more functions as needed

---

**Inngest will make your app more professional and reliable!** 🎉

Would you like me to help you set up any specific function?
