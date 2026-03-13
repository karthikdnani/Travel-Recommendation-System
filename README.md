# Travel Recommendation System — Personalized Trip Itineraries

A full-stack web application that generates personalized day-by-day travel itineraries for any destination worldwide.

## Features
- Personalized itineraries generated for ANY city
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
| AI/Generation | Groq API (Llama 3.1 8B) |
| Maps | Leaflet.js + OpenStreetMap + Nominatim |
| Images | Unsplash API (free) |

---

## Setup Instructions

### Step 1: Install MongoDB
Download from https://www.mongodb.com/try/download/community and install it.
Make sure MongoDB service is running.

### Step 2: Get Free API Keys

**Groq API (required for trip generation):**
1. Go to https://console.groq.com
2. Sign up for free
3. Create an API key
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
GROQ_API_KEY=your_groq_api_key_here
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
