# PostgreSQL Migration - Quick Reference

## 🚀 Quick Start

### 1. Set Up Neon Database
1. Go to [https://neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy your connection string

### 2. Update Environment Variables
Add to your `.env` file:
```env
# Keep MongoDB for migration
MONGODB_URI=your_existing_mongodb_uri

# Add PostgreSQL connection
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

### 3. Run Setup Script
```bash
cd backend
node scripts/setup-postgres.js
```

This will:
- Install Prisma dependencies
- Generate Prisma client
- Create database tables

### 4. Migrate Data (Optional)
If you want to migrate existing data from MongoDB:
```bash
node scripts/migrate-data.js
```

### 5. View Database
```bash
npx prisma studio
```

---

## 📚 Key Differences: Mongoose vs Prisma

### Finding Records

**Mongoose:**
```javascript
const user = await User.findById(userId);
const users = await User.find({ isEmailVerified: true });
```

**Prisma:**
```javascript
const user = await prisma.user.findUnique({ where: { id: userId } });
const users = await prisma.user.findMany({ where: { isEmailVerified: true } });
```

### Creating Records

**Mongoose:**
```javascript
const user = await User.create({ email, password, name });
```

**Prisma:**
```javascript
const user = await prisma.user.create({
  data: { email, password, name }
});
```

### Updating Records

**Mongoose:**
```javascript
await User.findByIdAndUpdate(userId, { name: newName });
```

**Prisma:**
```javascript
await prisma.user.update({
  where: { id: userId },
  data: { name: newName }
});
```

### Deleting Records

**Mongoose:**
```javascript
await User.findByIdAndDelete(userId);
```

**Prisma:**
```javascript
await prisma.user.delete({ where: { id: userId } });
```

---

## 🔧 Common Operations

### 1. Pagination
```javascript
const page = 1;
const limit = 10;

const playlists = await prisma.playlist.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

### 2. Counting
```javascript
const count = await prisma.playlist.count({
  where: { userId }
});
```

### 3. Array Operations

**Add to array:**
```javascript
await prisma.library.update({
  where: { userId },
  data: {
    likedSongIds: {
      push: songId
    }
  }
});
```

**Remove from array:**
```javascript
const library = await prisma.library.findUnique({ where: { userId } });
await prisma.library.update({
  where: { userId },
  data: {
    likedSongIds: library.likedSongIds.filter(id => id !== songId)
  }
});
```

**Check if in array:**
```javascript
const library = await prisma.library.findUnique({ where: { userId } });
const isLiked = library.likedSongIds.includes(songId);
```

### 4. Relations

**Include related data:**
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    playlists: true,
    library: true,
    settings: true
  }
});
```

**Select specific fields:**
```javascript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    playlists: {
      select: {
        id: true,
        name: true
      }
    }
  }
});
```

### 5. Search (Case-Insensitive)
```javascript
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ]
  }
});
```

### 6. Transactions
```javascript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.library.create({
    data: { userId: user.id }
  });
  return user;
});
```

---

## 📝 Migration Checklist

- [ ] Create Neon account and project
- [ ] Add DATABASE_URL to .env
- [ ] Run `node scripts/setup-postgres.js`
- [ ] Verify tables in Prisma Studio
- [ ] (Optional) Run data migration script
- [ ] Update controllers to use Prisma
- [ ] Test all API endpoints
- [ ] Update authentication middleware
- [ ] Test user registration/login
- [ ] Test playlist operations
- [ ] Test library operations
- [ ] Test session features
- [ ] Monitor performance
- [ ] Keep MongoDB backup until confident

---

## 🐛 Troubleshooting

### Connection Error
```
Error: Can't reach database server
```
**Solution:** Check your DATABASE_URL in .env and ensure Neon database is running.

### Schema Sync Issues
```
Error: Table doesn't exist
```
**Solution:** Run `npx prisma db push` to sync schema.

### Type Errors
```
Error: Type 'string' is not assignable to type 'number'
```
**Solution:** Prisma is strongly typed. Check your schema and ensure data types match.

### Migration Conflicts
```
Error: Unique constraint failed
```
**Solution:** Check for duplicate data. Ensure unique fields (email, etc.) don't have duplicates.

---

## 📖 Resources

- **Full Migration Guide:** `MONGODB-TO-POSTGRESQL-MIGRATION-GUIDE.md`
- **Example Controller:** `src/controllers/user.controller.example.js`
- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs
- **Prisma Schema Reference:** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

---

## 🎯 Next Steps

1. **Read the full guide:** `MONGODB-TO-POSTGRESQL-MIGRATION-GUIDE.md`
2. **Set up Neon database**
3. **Run setup script:** `node scripts/setup-postgres.js`
4. **Review example controller:** `src/controllers/user.controller.example.js`
5. **Start updating your controllers one by one**
6. **Test thoroughly**
7. **Deploy when confident**

---

## 💡 Tips

- **Start small:** Migrate one controller at a time
- **Use Prisma Studio:** Great for debugging and viewing data
- **Keep MongoDB running:** Don't delete until migration is complete
- **Use transactions:** For operations that need to be atomic
- **Leverage TypeScript:** Prisma has excellent TypeScript support
- **Monitor queries:** Use Prisma's query logging in development

---

Good luck with your migration! 🚀
