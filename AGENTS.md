# Architecture Notes

- Single-screen app: `src/views/PlayerScreen.tsx` is the only view; `src/App.tsx` renders Splash → PlayerScreen only. No tabs, router, or other pages. Why: user chose one full-screen player (2026-10).
- Kept player dependencies only: `PlayerContext`, `lib/algorithms`, `lib/recos` + `lib/listeningStats` (recommendations learn from plays/skips), `data/*` catalogue + lyrics, `MediaSessionService`, `BackgroundPlaybackPrompt`, `SplashScreen`. Auth, playlists, cloud library, and music-source fetching were removed with the pages.
- Never hardcode colors in components; the red/black Obsidian Nightmare tokens live in `src/index.css` and shadcn variants.
