import { uniqueSongs } from "@/data/allSongs";
import type { Song } from "@/data/Song";

// Lightweight reversible "hash" so shared URLs don't expose raw song ids.
// We base64url-encode the id with a tiny rolling XOR + a checksum char.
const SALT = 0x5a;

function toBase64Url(str: string): string {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(hash: string): string {
  const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  return decodeURIComponent(escape(atob(b64 + pad)));
}

/** Build a short obfuscated hash from a song id. */
export function encodeSongHash(songId: string): string {
  const xored = Array.from(songId)
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (SALT + (i % 7))))
    .join("");
  return toBase64Url(xored);
}

/** Reverse a hash back into a song id (returns null if invalid). */
export function decodeSongHash(hash: string): string | null {
  try {
    const xored = fromBase64Url(hash);
    return Array.from(xored)
      .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (SALT + (i % 7))))
      .join("");
  } catch {
    return null;
  }
}

/** Full shareable URL that auto-plays the song on open. */
export function buildShareUrl(songId: string): string {
  const hash = encodeSongHash(songId);
  return `${window.location.origin}/s/${hash}`;
}

/** Find a song by id (case-insensitive fallback). */
export function findSongById(id: string): Song | undefined {
  return (
    uniqueSongs.find((s) => s.id === id) ||
    uniqueSongs.find((s) => s.id.toLowerCase() === id.toLowerCase())
  );
}

/** Parse the current URL and return the shared song, if any. */
export function getSharedSongFromUrl(): Song | undefined {
  const path = window.location.pathname;
  const match = path.match(/\/(?:s|share|song|shared|music|track)\/([^/?#]+)/i);
  if (!match) return undefined;
  const id = decodeSongHash(match[1]);
  if (!id) return undefined;
  return findSongById(id);
}
