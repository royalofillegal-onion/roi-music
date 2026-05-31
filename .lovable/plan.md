
## Scope & honest caveats

You chose Firebase auth despite the warnings. This plan implements it cleanly, but please accept these realities up front:

1. **Existing user accounts will not migrate.** Every user currently in Supabase Auth must re-sign-up under Firebase. Their playlists / liked songs are tied to Supabase `auth.uid()` UUIDs that Firebase will never reproduce.
2. **Firebase web `apiKey` is public.** Putting it in `.env` does not hide it — it ends up in the JS bundle. That's normal and safe for Firebase, but don't expect "secrecy" from the env file.
3. **Firebase has no native email-OTP password reset.** I'll build a custom one: a Supabase edge function (kept just for this) generates a 6-digit OTP, emails it via Lovable Emails, and verifies it. Resetting the password itself requires the **Firebase Admin SDK** in an edge function, which needs a `FIREBASE_SERVICE_ACCOUNT_JSON` secret you'll need to paste once.
4. **RLS on existing tables (`playlists`, `user_likes`, `profiles`) will stop working** because they check `auth.uid()` which is empty under Firebase. To keep your data layer working, I'll **disable RLS** on those four tables and store the Firebase UID as a plain `text` column. This is less secure than RLS — anyone with the anon key could in theory read/write all rows. (This is a direct consequence of leaving Supabase Auth.)

If any of those four are dealbreakers, stop me here and I'll switch back to Lovable Cloud.

---

## Stage 1 — Auth migration (Firebase + OTP reset + login-only chrome)

**Firebase setup**
- Install `firebase` package.
- Create `src/lib/firebase.ts` reading config from `import.meta.env.VITE_FIREBASE_*`.
- Add `.env` with the 7 Firebase keys you provided (prefixed `VITE_FIREBASE_…`) and update `.env.example`.
- Create `src/context/AuthContext.tsx` (Firebase) exposing `user`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `requestPasswordOtp`, `verifyOtpAndResetPassword`.

**New auth screens** (`/auth`, login-only chrome)
- Rebuild `src/Pages/Auth.tsx`: glassmorphism card, purple/pink gradient bg, tabs for Login / Sign Up, "Continue with Google" button, "Forgot password?" link.
- Wrap `/auth` in a layout that does NOT render `Navbar`, `Player`, `FloatingMusicInfo`, or any sidebar.
- New `/forgot-password` flow (single page, 3 steps): enter email → enter 6-digit OTP → set new password → success → redirect to `/auth`.

**OTP edge functions** (using existing Lovable Cloud for email + admin SDK)
- `supabase/functions/send-password-otp/index.ts`: generates 6-digit code, stores in new `password_otps` table (email, code_hash, expires_at, used), sends via Lovable transactional email.
- `supabase/functions/verify-otp-and-reset/index.ts`: verifies code, calls Firebase Admin SDK `auth.updateUser()` to set new password. Requires `FIREBASE_SERVICE_ACCOUNT_JSON` secret.
- New migration: `password_otps` table + grants + a cleanup policy.

**Data layer adjustments**
- Add `firebase_uid TEXT` to `profiles`, `playlists`, `user_likes`, `playlist_songs` (keep existing `user_id uuid` for back-compat but stop writing to it).
- Disable RLS on those tables and grant `SELECT, INSERT, UPDATE, DELETE` to `anon`.
- Update every `supabase.from(...).eq('user_id', authUser.id)` call site to use `firebase_uid` from the Firebase context.

**Remove old Supabase auth usage**
- Delete imports of `supabase.auth.*` from `Auth.tsx`, `LoginForm.tsx`, `SignUpForm.tsx`, `ResetPasswordForm.tsx`, `useOnboarding`, `UserProfile`, `Navbar`, etc.
- Replace with `useAuth()` from new context.

## Stage 2 — Home screen redesign (`src/Pages/Index.tsx`)

- Top header: ROI Music logo (left), greeting "Good Morning/Afternoon/Evening, {displayName}" + subtitle, notification bell + search + avatar (right).
- Hero carousel: Embla autoplay, 3D stacked-card effect (scale + translate neighbors), gradient overlay, centered play button.
- Quick Actions row: 6 pill cards (Recently Played, Favorites, Downloads, Playlists, AI Mix, Discover Weekly) with gradient backgrounds.
- Trending Now: horizontal scroll, hover zoom.
- Recommended For You: reuse existing `UserPreferenceLearner` to sort.
- Genres row: 10 chips (Rock, Pop, Hip-Hop, EDM, Telugu, Tamil, Hindi, Lofi, Chill, Workout) linking to filtered Search.

## Stage 3 — Now Playing redesign (`src/Pages/NowPlaying.tsx`)

- Full-screen, dynamic blurred album-art background.
- Rotating circular album image (CSS `@keyframes spin`, paused when not playing).
- Draggable progress bar using existing shadcn `Slider`.
- Controls row: shuffle / prev / play-pause (large gradient circle) / next / repeat.
- Action row: favorite, download, share, queue.
- **Skipped to keep scope sane:** lyrics swipe, AI DJ, social feed — these are separate large features; we'll do them in follow-up messages.

---

## What I will NOT do in this pass
- Lyrics screen, AI DJ, mood detection, social/follow, collaborative playlists, in-app equalizer — each is its own multi-day feature.
- Migrating existing Supabase user accounts to Firebase (technically impossible without users re-setting passwords).

## Order of operations
1. You confirm this plan.
2. I'll request the `FIREBASE_SERVICE_ACCOUNT_JSON` secret (needed for admin-SDK password reset).
3. I implement Stage 1 (auth) end-to-end and verify.
4. Then Stage 2 (Home), then Stage 3 (Now Playing).

## Files touched (approx)
- New: `src/lib/firebase.ts`, `src/context/AuthContext.tsx`, `src/Pages/ForgotPassword.tsx`, `src/components/auth/AuthLayout.tsx`, `supabase/functions/send-password-otp/`, `supabase/functions/verify-otp-and-reset/`, `.env`, `.env.example`, migration for `password_otps` + RLS changes.
- Rewritten: `src/Pages/Auth.tsx`, `src/Pages/Index.tsx`, `src/Pages/NowPlaying.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/auth/SignUpForm.tsx`, `src/components/auth/ResetPasswordForm.tsx`.
- Adjusted: `src/App.tsx` (routes + auth provider + login-only layout), every file currently calling `supabase.auth.*` or filtering by `user_id`.
