# 🚀 Project Thani v2 — PostgreSQL Edition
## How to Run

---

## Step 1 — Get Free PostgreSQL (Neon.tech — No Install)

1. Go to **https://neon.tech** → Sign up free
2. Click **"New Project"** → name it `thani`
3. Click **"Create Project"**
4. Copy the **Connection String** — it looks like:
   ```
   postgresql://thani_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/thanidb?sslmode=require
   ```

---

## Step 2 — Configure Backend

Open `backend/.env` in VS Code and paste your connection string:

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://thani_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/thanidb?sslmode=require
JWT_SECRET=thani_aljabri_pharma_jwt_secret_2024
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

---

## Step 3 — Setup Database Tables

```bash
cd backend
npm install
node db/setup.js
```

You should see:
```
✅ PostgreSQL Connected
✅ users table
✅ owner_profiles table
✅ professional_profiles table
✅ jobs table
✅ applications table
✅ reviews table
✅ Indexes created
🎉 Database setup complete!
```

---

## Step 4 — Seed Demo Data (Optional)

```bash
node db/seed.js
```

Creates demo accounts:
- **owner@demo.com** / demo1234  (Pharmacy Owner)
- **pro@demo.com**   / demo1234  (Pharmacist)

---

## Step 5 — Start Backend

```bash
npm run dev
```

Should show:
```
✅ PostgreSQL Connected
🚀  Project Thani API  v2.0 — PostgreSQL
📡  http://localhost:5000/api
```

---

## Step 6 — Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Opens at: **http://localhost:3000**

---

## Full Command Summary

```bash
# Terminal 1 — Backend
cd backend
npm install
node db/setup.js
node db/seed.js
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Current user |
| GET  | /api/profiles/me | My profile |
| PUT  | /api/profiles/me | Update profile |
| GET  | /api/profiles/professionals | Search professionals |
| GET  | /api/jobs | List jobs |
| POST | /api/jobs | Create job (owner) |
| GET  | /api/jobs/my | My jobs (owner) |
| PUT  | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |
| GET  | /api/jobs/:id/applications | Job applications |
| POST | /api/applications/:jobId | Apply to job |
| GET  | /api/applications/my | My applications |
| PUT  | /api/applications/:id/status | Update status |
| POST | /api/reviews | Post review |
| GET  | /api/reviews/:userId | Get reviews |
| GET  | /api/dashboard/owner | Owner stats |
| GET  | /api/dashboard/pro | Pro stats |

---

## Deploy Free

- **Backend** → https://render.com (free Node.js hosting)
- **Frontend** → https://vercel.com (free React hosting)  
- **Database** → https://neon.tech (free PostgreSQL)

