# 🎬 FilmSphere

A full-stack movie discovery and favourites app powered by [TMDB](https://www.themoviedb.org/), built with React, Vite, and Vercel serverless functions.

**Live:** [movie-db-dyz4-c5de06j8q-ganeshs-projects-ca75b173.vercel.app](https://movie-db-dyz4-c5de06j8q-ganeshs-projects-ca75b173.vercel.app)

---

## ✨ Features

- 🔍 **Search** movies with live results
- 🏠 **Home** — Trending, Top Rated, Upcoming, and Popular sections
- 🎥 **Movie Detail** — Cast, crew, reviews, recommendations
- ❤️ **Favourites** — Save movies to your personal list (login required)
- 🔐 **Auth** — Register / Login / Logout with JWT + HTTP-only cookies
- 🔔 **Toast notifications** — All errors and success messages via `react-hot-toast`
- 🛡️ **Protected routes** — Favourites page requires authentication

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand |
| Animations | Framer Motion |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt + HTTP-only cookies |
| Movie data | TMDB API (proxied via `/api/tmdb`) |
| Notifications | react-hot-toast |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- TMDB API key → [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/sri-ganeshk/movieDb.git
cd movieDb

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Fill in all values in .env

# 4. Start dev server (frontend + API)
vercel dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB=moviedb
JWT_SECRET=your_super_secret_key_min_32_chars
```

---

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── auth/
│   │   ├── login.ts        # POST /api/auth/login
│   │   ├── register.ts     # POST /api/auth/register
│   │   ├── logout.ts       # POST /api/auth/logout
│   │   └── user.ts         # GET  /api/auth/user
│   ├── favorites.ts        # GET/POST/DELETE /api/favorites
│   ├── tmdb.ts             # GET  /api/tmdb (TMDB proxy)
│   ├── db.ts               # MongoDB connection + auto-index setup
│   ├── environments.ts     # Env var loader + validation
│   └── tsconfig.json       # API-specific TypeScript config (CommonJS)
│
├── src/
│   ├── components/
│   │   ├── AppBar.tsx
│   │   ├── Home.tsx
│   │   ├── Movie.tsx
│   │   ├── MovieCard.tsx
│   │   └── FavoritesDropdown.tsx
│   ├── components/pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── TopRated.tsx
│   │   ├── PopularMovies.tsx
│   │   └── UpcomingMovies.tsx
│   ├── store/
│   │   ├── useAuthStore.ts       # Auth state (login/register/logout)
│   │   ├── useFavoritesStore.ts  # Favourites state
│   │   └── useMovieStore.ts      # Movies/search state
│   └── App.tsx
│
├── vercel.json             # Vercel deployment config
├── vite.config.ts          # Vite config
└── tailwind.config.js      # Tailwind config
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (10 rounds)
- Auth tokens in **HTTP-only, SameSite=Strict** cookies (not accessible via JS)
- Login endpoint has **IP-based rate limiting** (10 attempts / 15 min)
- TMDB API key never exposed to the browser (server-side proxy)
- CORS restricted to known origins (localhost + Vercel deployment URL)
- Server-side validation on all register/login inputs

---

## 🗄️ Database Schema (MongoDB)

**`users` collection**
```json
{
  "_id": "ObjectId",
  "email": "string (unique, indexed)",
  "password": "string (bcrypt hash)",
  "name": "string",
  "createdAt": "Date"
}
```

**`favorites` collection**
```json
{
  "_id": "ObjectId",
  "userId": "string (unique, indexed)",
  "movies": [12345, 67890]
}
```

> Indexes are created automatically on first server cold-start via `api/db.ts`.

---

## 📦 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in your Vercel project dashboard under **Settings → Environment Variables**.
