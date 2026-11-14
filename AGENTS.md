# Project architecture rules
- The song catalog uses the existing Lovable Cloud `songs`, `artists`, and `albums` tables with database-enforced admin roles; do not rely on a client-side secret or the disconnected Mongo API for catalog writes.
