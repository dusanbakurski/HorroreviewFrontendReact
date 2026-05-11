# Horroreview Frontend

A React frontend for the Horroreview horror movie review platform.

## Features

- Browse and search horror movies, actors, and directors
- User registration and login with JWT authentication
- Rate movies with story, scare, and gore scores
- Personal watchlist management
- Profile pages with picture uploads
- Admin panel for managing movies, users, actors, directors, and genres
- Toast notifications for user feedback

## Tech Stack

- React 19 + TypeScript
- Vite (with React Compiler)
- React Router DOM v7
- Tailwind CSS v4
- Axios

## Prerequisites

- Node.js 18+
- The [Horroreview backend](https://github.com/dusanbakurski/Horroreview) running on `http://localhost:8080`

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different address:
```env
VITE_API_URL=http://localhost:8080/Horroreview/api
```

**3. Start the dev server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Scripts

```bash
npm run dev        # Start dev server with HMR
npm run build      # TypeScript check + production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Home — featured and recent movies |
| `/movies` | Public | Browse and search all movies |
| `/movies/:id` | Public | Movie detail, ratings, cast |
| `/actors/:id` | Public | Actor detail and filmography |
| `/directors/:id` | Public | Director detail and filmography |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/profile/:id` | User | User profile and their reviews |
| `/watchlist` | User | Personal watchlist |
| `/admin` | Admin | Manage movies, users, actors, directors, genres |

## Authentication

After login, the JWT token is stored in `localStorage` and sent automatically on every request via an `Authorization: Bearer <token>` header.
