# Trip Planner — AI Travel Itinerary Generator

A full-stack web application that uses **Google Gemini AI** to generate complete day-by-day travel itineraries for any destination worldwide.

## Features
- Real Gemini AI generates unique itineraries for ANY city
- Precise GPS map pins using Nominatim + OpenStreetMap
- Real destination photos from Unsplash
- Hotel recommendations with images
- Restaurant suggestions for every meal
- Budget breakdown across all categories
- Flight/Train/Bus route options
- User accounts with saved trips

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 18, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB (local or Atlas) |
| AI | Google Gemini 1.5 Flash (free) |
| Maps | Leaflet.js + OpenStreetMap + Nominatim |
| Images | Unsplash API (free) |

---

## Setup Instructions

### Step 1: Install MongoDB
Download from https://www.mongodb.com/try/download/community and install it.
Make sure MongoDB service is running.

### Step 2: Get Free API Keys

**Gemini AI (required):**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

**Unsplash (optional - for photos):**
1. Go to https://unsplash.com/developers
2. Create a free account
3. Click "New Application"
4. Copy the "Access Key"

### Step 3: Setup Backend
```bash
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/trip-planner
JWT_SECRET=any_long_random_string_here
GEMINI_API_KEY=your_gemini_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
npm run dev
```

### Step 4: Setup Frontend
```bash
cd frontend
npm install
copy .env.example .env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### Step 5: Open the App
Go to http://localhost:3000

---

## Free Deployment

### Backend → Render.com
1. Push to GitHub
2. render.com → New Web Service → connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables

### Frontend → Vercel.com
1. vercel.com → New Project → import GitHub repo
2. Root directory: `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`

### Database → MongoDB Atlas (free)
1. cloud.mongodb.com → create free M0 cluster
2. Get connection string
3. Update `MONGODB_URI` in Render backend env vars
