# Project architecture rules
- The song catalog uses the existing Lovable Cloud `songs`, `artists`, and `albums` tables with database-enforced admin roles; do not rely on a client-side secret or the disconnected Mongo API for catalog writes.
- Load listener-visible catalog entries from the published cloud-song query; use the shared player catalog for queue navigation so published songs remain playable across screens.
