## Goal

Stay on the current React + Vite + Lovable Cloud (Supabase) stack — no MERN restructure. Fill in the missing pieces from the endpoint list you posted, add an in-app Admin panel at `/admin`, write the docs, and fix a real security gap I found along the way.

## What I'll do, in order

### 1. Security fix (must do first)
`playlists`, `playlist_songs`, `profiles`, `user_likes` all have **RLS disabled** right now. Any logged-in user can read/modify any other user's data. One migration that:
- Enables RLS on all four tables
- Adds owner-scoped policies (`auth.uid() = user_id` for write, profiles readable by everyone, playlists readable when `is_public` or owner)
- Adds missing GRANTs

### 2. Map the endpoints you listed onto Supabase

No Express server. Instead, a clean service layer in `src/services/api/` that mirrors the endpoint list:

| Your endpoint | Implementation |
|---|---|
| `POST /api/auth/register` | `supabase.auth.signUp` (already wired) |
| `POST /api/auth/login` | `supabase.auth.signInWithPassword` (already wired) |
| `GET /api/songs` | `songsApi.list({ page, limit, genre, lang })` — paginated query on `songs` table |
| `GET /api/songs/:id` | `songsApi.get(id)` |
| `POST /api/song/upload` | Edge function `upload-song` + Storage bucket `songs` (audio) + `covers` (images). Admin-only. |
| `POST /api/playlist/create` | `playlistsApi.create` |
| `GET /api/playlist/:id` | `playlistsApi.get` with joined songs |
| `POST /api/like-song` | `likesApi.toggle(songId)` |
| `GET /api/search?q=` | `searchApi.search(q)` — full-text across songs/artists/playlists |

Files: `src/services/api/{songs,playlists,likes,search,upload}.ts` + barrel `index.ts`.

### 3. In-app Admin panel at `/admin`

Protected route gated by a new `user_roles` table + `has_role()` security-definer function (per platform standard — never store role on profile).

Pages:
- `/admin` — dashboard (totals: users, songs, playlists, likes)
- `/admin/songs` — list, create, edit, delete songs; upload audio + cover
- `/admin/users` — list users, grant/revoke admin
- `/admin/playlists` — moderate public playlists

### 4. Storage buckets
- `songs` (private, signed URLs) — audio files
- `covers` (public) — song/playlist cover art
- `avatars` (public) — user avatars

### 5. Docs
Create:
- `docs/API_Documentation.md` — the service-layer "endpoints", inputs, outputs, auth requirements
- `docs/Database_Schema.md` — every table, columns, RLS policies, relationships
- `docs/Deployment_Guide.md` — Lovable Cloud specifics, publish flow, env, edge function deploy notes

## What I will NOT do
- Will not create `client/ + server/ + admin-panel/` folders — Lovable runs one React app, an Express server can't run here.
- Will not touch the existing music player, notification sync, or Media Session work — that's already done and shipped.
- Will not migrate auth away from Firebase (your project uses Firebase for auth + Supabase for data; I'll keep that working).

## Open question I still need answered

**Scope priority** — this is ~5-7 turns of work. Pick one to do first, the rest follow:
1. Security fix only (the RLS gap is real and 15 min of work)
2. Security fix + service layer (`src/services/api/*`) so the endpoint list is callable from React
3. Security fix + service layer + Admin panel
4. Everything above + the three docs

Reply with `1`, `2`, `3`, or `4` and I'll start.
