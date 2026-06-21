# ROI Music

A mobile-first, fully-free music streaming app with an AI-inspired emotional layer. Plays from a curated local catalog (English, Hindi, Tamil, Telugu, Malayalam, Trending, New Releases, Popular). 100% client-side — **no backend, no database, no accounts, no API keys required.**

> Built with React 18 + Vite 5 + TypeScript + Tailwind + shadcn/ui. Capacitor wraps it as an Android app.

---

## ✨ Features

- 🎵 **Full music player** — play / pause / next / previous / seek / shuffle / repeat / queue
- 📱 **Mobile-first UI** — splash screen, mini-player, full-screen player, slide-up search
- ❤️ **Likes & recently played** — stored locally in `localStorage`
- 🧠 **On-device recommendations** — hybrid algorithm (content + collaborative-style scoring) over the local catalog
- 🌦️ **Mood + weather hooks** — `useWeather` + `useLocation` hooks influence suggestions
- 🎚️ **Media Session API** — lock-screen + Bluetooth controls
- 📲 **PWA + Capacitor Android** — installable, offline-friendly service worker
- 🛡️ **Content protection** utilities for production builds

---

## 🗂 Project Structure

```
roi-music/
├── android/                      # Capacitor Android wrapper
├── public/                       # PWA assets, sw.js, manifest, icons
├── src/
│   ├── App.tsx                   # App shell (Splash → Home → Mini/Full player → Search)
│   ├── main.tsx                  # Entry, PWA registration, PlayerProvider
│   ├── index.css                 # Design tokens + Tailwind layers
│   │
│   ├── views/                    # Top-level screens
│   │   ├── HomeView.tsx          #   Feed of carousels & sections
│   │   ├── SearchView.tsx        #   Search overlay
│   │   ├── MiniPlayer.tsx        #   Persistent bottom player
│   │   └── FullPlayer.tsx        #   Immersive full-screen player
│   │
│   ├── components/               # Reusable UI
│   │   ├── ui/                   #   shadcn primitives
│   │   ├── SplashScreen.tsx
│   │   ├── MusicVisualizer.tsx
│   │   ├── LibrarySheet.tsx
│   │   ├── FloatingMascot.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── context/
│   │   └── PlayerContext.tsx     # Global player state (current song, queue, likes, history)
│   │
│   ├── data/                     # Local song catalog (no API needed)
│   │   ├── Song.ts               #   Song type
│   │   ├── allSongs.ts           #   Merged + de-duplicated list
│   │   ├── EnglishSongs.ts | HindiSongs.ts | TamilSongs.ts
│   │   ├── TeluguSongs.ts  | MalayalamSongs.ts
│   │   ├── PopularSongs.ts | TrendingSongs.ts | NewReleaseSongs.ts
│   │   ├── playlists.ts
│   │   └── lyrics.ts / lyrics.json
│   │
│   ├── lib/
│   │   ├── algorithms/           # playbackQueue, fisherYatesShuffle, recommendations
│   │   ├── deviceTracker.ts      # Anonymous local device id (localStorage)
│   │   └── utils.ts              # cn() helper
│   │
│   ├── hooks/                    # use-mobile, useLocation, useWeather, usePlaybackHistory
│   ├── services/MediaSessionService.ts
│   ├── utils/                    # contentProtection, permissions
│   ├── config/maintenance.ts
│   └── types/                    # Shared TS types
│
├── capacitor.config.ts           # Android build config
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 🧠 How the "AI" layer works

There is **no external AI service** — everything runs in the browser:

| Signal              | Source                                  | Used in                              |
| ------------------- | --------------------------------------- | ------------------------------------ |
| Listening history   | `PlayerContext` → `localStorage`        | Recommendations, Recently Played     |
| Likes               | `PlayerContext` → `localStorage`        | Recommendations weighting            |
| Mood inference      | `lib/algorithms/recommendations`        | Home sections, FullPlayer            |
| Weather             | `hooks/useWeather` (open public API)    | Mood-aware suggestions               |
| Location            | `hooks/useLocation` (browser geo)       | Weather + regional surfacing         |
| Device id           | `lib/deviceTracker` (anonymous, local)  | Stable identity for local history    |

The hybrid recommender combines:
1. **Content similarity** — language, mood, era, artist overlap
2. **Behavior weighting** — recency + play count + likes
3. **Shuffling** — Fisher–Yates with a no-repeat window

---

## 🚀 Frontend ↔ "Backend"

There is **no backend**. All state is held by:

- **React Context** (`PlayerContext`) — current song, queue, playing state
- **`localStorage`** — likes, recently played, device id, play counts
- **Static JSON / TS modules** in `src/data/` — the entire song catalog

If you ever want a real backend, the cleanest path is to enable **Lovable Cloud** and add a `plays` / `likes` table — but the app is intentionally shipped 100% free of any cloud cost.

---

## 🛠️ Run locally

```bash
bun install
bun run dev          # http://localhost:5173
bun run build        # production build → dist/
```

### Android (Capacitor)

```bash
bun run build
npx cap sync android
npx cap open android
```

---


## 📜 License

MIT — do whatever you want.
