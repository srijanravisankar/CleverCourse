# 🚀 Setting Up CleverCourse on a New Laptop

This guide will help you clone and set up the CleverCourse project on another laptop.

## Prerequisites

Make sure you have installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
# Clone the project
git clone <repository-url>

# Navigate to the project directory
cd CleverCourse
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all Node.js dependencies from `package.json`.

### 3. Environment Variables

Create a `.env` file in the root directory with the required environment variables:

```bash
# .env file content
GEMINI_API_KEY=AIzaSyB5mRzaBPp3_ZTqKjBfpvCeu1y0ZpxCd2E
```

**Note:** The Gemini API key is needed for the AI course generation feature. Contact the project maintainer if you need to update this.

### 4. Database Setup

The database uses **SQLite** with Drizzle ORM. Here are three options:

#### Option A: Start Fresh (Recommended for Clean Environment)

```bash
# Generate initial database with schema
pnpm drizzle-kit push
```

This will:

- Create a new SQLite database at `/data/clevercourse.db`
- Apply all schema definitions
- Set up all tables automatically

**Result:** You'll have an empty database, ready to create new courses.

#### Option B: Copy Existing Database

If you want to copy the existing database from your current laptop:

```bash
# Before running the new laptop setup:
# On your current laptop, copy the database files:
# - data/clevercourse.db
# - data/clevercourse.db-wal
# - data/clevercourse.db-shm

# Then paste them in the same location on the new laptop
# After pasting, you can skip the `pnpm drizzle-kit push` step
```

**Result:** You'll have all existing courses, users, and progress data.

#### Option C: Verify Existing Database (if already present)

```bash
# If you've copied the database files, verify they're in sync
pnpm drizzle-kit push

# It will say "No changes detected" if everything is good
```

### 5. Start the Development Server

```bash
pnpm dev
```

The app will start at `http://localhost:3000`

---

## 🗄️ Database Information

### Database Type

- **SQLite** - No external server needed, file-based
- **Location:** `/data/clevercourse.db`
- **ORM:** Drizzle ORM

### Database Files

The SQLite database creates 3 files:

- `clevercourse.db` - Main database file
- `clevercourse.db-wal` - Write-Ahead Log (temporary, auto-cleanup)
- `clevercourse.db-shm` - Shared Memory file (temporary, auto-cleanup)

All three files should be kept together for the database to work properly.

### What Gets Stored in the Database

✅ User accounts and authentication  
✅ Courses (metadata, structure, sections)  
✅ Content (articles, flashcards, quizzes, mind maps)  
✅ User progress (completions, XP earned)  
✅ Gamification data (achievements, streaks)

### What's NOT in .gitignore

The entire `/data/` directory is in `.gitignore`, which means:

- Database files won't be committed to git
- Each laptop gets its own separate database
- If you need to share data, you must manually copy the database files

---

## 📋 Quick Command Reference

| Command                     | Purpose                            |
| --------------------------- | ---------------------------------- |
| `pnpm install`              | Install dependencies               |
| `pnpm dev`                  | Start development server           |
| `pnpm build`                | Build for production               |
| `pnpm drizzle-kit push`     | Sync database schema               |
| `pnpm drizzle-kit generate` | Generate migration files           |
| `pnpm drizzle-kit studio`   | Open Drizzle Studio (database GUI) |

---

## 🆘 Troubleshooting

### Issue: "Cannot find module" errors after pnpm install

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Database connection errors

**Solution:**

```bash
# Ensure database is initialized
pnpm drizzle-kit push

# Check that /data directory exists
# If not, it will be created automatically
```

### Issue: Port 3000 already in use

**Solution:**

```bash
# Use a different port
pnpm dev -- -p 3001
```

### Issue: Gemini API errors when generating courses

**Solution:**

- Verify your API key in `.env` is correct
- Check that you have API quota available
- Ensure internet connection is working

---

## 🔄 Keeping Databases in Sync

If you're working on multiple laptops and want to share your progress:

### To Share Your Data:

1. **On Laptop A (current):**

   ```bash
   # Navigate to the project
   cd CleverCourse

   # Copy database files
   cp -r data/ ~/Desktop/clevercourse_backup/
   ```

2. **Transfer to Laptop B:**
   - Copy the backed-up `data/` folder to the new laptop
   - Place it in the same project directory

3. **On Laptop B:**
   ```bash
   # Paste the data folder into your project root
   # The database will be ready to use immediately
   pnpm dev
   ```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `pnpm install` completed without errors
- [ ] `.env` file created with GEMINI_API_KEY
- [ ] `pnpm dev` starts successfully at http://localhost:3000
- [ ] You can create a new course
- [ ] You can view and interact with course content
- [ ] Course Home shows analytics
- [ ] You can mark content as complete
- [ ] Progress is saved to database (refresh page, progress persists)

---

## 📚 Additional Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team/
- **Next.js Docs:** https://nextjs.org/docs
- **SQLite Docs:** https://www.sqlite.org/docs.html

---

## ❓ Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review error messages carefully
3. Ensure Node.js and pnpm versions are compatible
4. Check that all `.env` variables are set correctly
5. Verify the database directory exists and has write permissions

Good luck! 🎉
