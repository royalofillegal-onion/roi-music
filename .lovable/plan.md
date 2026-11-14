# Secure song administration

## What will change
- Replace the disconnected catalog screen with a Lovable Cloud song manager using the existing `songs`, `artists`, and `albums` tables.
- Let authorized admins add songs, edit song and linked artist/album details, publish or unpublish entries, and delete entries. Use validated HTTPS audio and artwork URLs; public file uploads are unavailable because workspace policy blocked public storage buckets.
- Load published cloud songs into Home and Search so new catalog entries are available to listeners.
- Protect the screen with the existing `user_roles` admin role and database policies. Do not create or embed the requested shared username/password; administrator access must be granted to an identified existing account.

## Technical details
- Reuse the existing auth session, `has_role` function, `songs` RLS policy, and role enum; no schema migration is expected.
- Validate fields in the interface and rely on existing database RLS for authoritative admin-only changes.
- The administrator account is not yet identified, so assigning the admin role will remain pending until an account is specified.
