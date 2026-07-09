import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Sparkles, Play, Plus } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import lyricsMap from "@/data/lyrics";
import type { Song } from "@/data/Song";
import mascotPeace from "@/assets/mascot-peace.png";

type Msg = { role: "user" | "bot"; text: string; songs?: Song[] };

/* Mood keyword -> attribute weights (genre / sync tag) */
const MOODS: Array<{
  keys: string[];
  label: string;
  genres: string[];
  syncs: string[];
  reply: string;
}> = [
  {
    keys: ["sad", "cry", "cryin", "lonely", "heartbreak", "breakup", "depress", "hurt", "pain", "alone", "miss"],
    label: "Sad",
    genres: ["sad", "melancholy", "soul", "ballad"],
    syncs: ["sad", "emotional", "melancholy"],
    reply: "Feeling heavy 💔 — here are some songs to sit with the feeling.",
  },
  {
    keys: ["happy", "joy", "smile", "cheer", "good", "great", "excited", "party", "dance", "fun"],
    label: "Happy",
    genres: ["pop", "dance", "funk", "edm", "party"],
    syncs: ["happy", "upbeat", "party", "energetic"],
    reply: "Yes! Let's turn it up 🎉 — happy vibes coming right up.",
  },
  {
    keys: ["love", "romantic", "romance", "crush", "sweet", "date"],
    label: "Romantic",
    genres: ["romantic", "love", "r&b", "ballad"],
    syncs: ["romantic", "love"],
    reply: "Aww 🌹 — a little love in your ears.",
  },
  {
    keys: ["chill", "relax", "calm", "peace", "quiet", "sleep", "night", "lofi", "lo-fi", "study"],
    label: "Chill",
    genres: ["lofi", "chill", "acoustic", "ambient"],
    syncs: ["chill", "calm", "relax"],
    reply: "Deep breath 🌙 — soft and easy for you.",
  },
  {
    keys: ["workout", "gym", "run", "energy", "pump", "hype", "beast", "training"],
    label: "Workout",
    genres: ["edm", "hip-hop", "rock", "electronic"],
    syncs: ["energetic", "hype", "workout"],
    reply: "Let's go 💪 — power tracks incoming.",
  },
  {
    keys: ["drive", "road", "travel", "trip", "highway"],
    label: "Drive",
    genres: ["rock", "pop", "indie"],
    syncs: ["upbeat", "energetic"],
    reply: "Windows down 🚗 — playlist ready.",
  },
];

function detectMood(text: string) {
  const t = text.toLowerCase();
  return MOODS.find((m) => m.keys.some((k) => t.includes(k)));
}

function scoreSong(song: Song, query: string, mood?: (typeof MOODS)[number]) {
  const q = query.toLowerCase().trim();
  let score = 0;
  const genre = (song.genre || "").toLowerCase();
  const sync = (song.sync || "").toLowerCase();
  const title = song.title.toLowerCase();
  const artist = song.artist.toLowerCase();

  if (mood) {
    for (const g of mood.genres) if (genre.includes(g)) score += 4;
    for (const s of mood.syncs) if (sync.includes(s)) score += 4;
  }

  // Direct word matches
  if (q.length > 2) {
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    for (const w of words) {
      if (title.includes(w)) score += 3;
      if (artist.includes(w)) score += 2;
      if (genre.includes(w)) score += 2;
      if (sync.includes(w)) score += 2;
    }
  }

  // Lyrics match
  const lyrics = lyricsMap[song.id];
  if (lyrics && q.length > 2) {
    const l = lyrics.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words) if (l.includes(w)) score += 5;
  }

  return score;
}

function findMatches(query: string, limit = 8): { mood?: (typeof MOODS)[number]; songs: Song[] } {
  const mood = detectMood(query);
  const scored = uniqueSongs
    .map((s) => ({ s, sc: scoreSong(s, query, mood) }))
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc);
  let songs = scored.slice(0, limit).map((x) => x.s);
  // Fallback: random 6 if nothing matched
  if (songs.length === 0) {
    songs = [...uniqueSongs].sort(() => Math.random() - 0.5).slice(0, 6);
  }
  return { mood, songs };
}

export default function MascotChat({ onClose }: { onClose: () => void }) {
  const { playSong, addToQueue } = usePlayer();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hey! I'm your music buddy 🎧 — tell me your mood or what you feel like listening to. Try: \"something sad\", \"pump me up\", \"chill night vibes\"…",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const suggestions = useMemo(
    () => ["I'm feeling sad", "Party time 🎉", "Chill night vibes", "Romantic mood", "Workout energy"],
    []
  );

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const { mood, songs } = findMatches(q);
    const botText = mood
      ? mood.reply
      : songs.length
      ? "Here's what I found that matches ✨"
      : "Hmm, nothing exact — try a mood word like happy, sad, chill, love, workout.";
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "bot", text: botText, songs },
    ]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg h-[85dvh] sm:h-[80dvh] rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#1a0a2e] to-[#0a0418] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-purple-500/10">
          <img src={mascotPeace} alt="Buddy" className="h-10 w-10 rounded-full object-cover ring-2 ring-red-500/40" />
          <div className="flex-1">
            <div className="font-semibold flex items-center gap-1.5">
              Music Buddy <Sparkles className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div className="text-xs text-white/60">Tell me your mood, I'll find the vibe</div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col gap-2"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-red-500 text-white px-4 py-2 text-sm"
                    : "max-w-[90%] rounded-2xl rounded-tl-sm bg-white/8 text-white px-4 py-2 text-sm"
                }
              >
                {m.text}
              </div>
              {m.songs && m.songs.length > 0 && (
                <div className="space-y-1.5">
                  {m.songs.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition group"
                    >
                      <img src={s.imageUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.title}</div>
                        <div className="text-xs text-white/60 truncate">
                          {s.artist}
                          {s.genre ? ` · ${s.genre}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => addToQueue(s)}
                        className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition"
                        aria-label="Add to queue"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => playSong(s)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-red-500 hover:bg-red-600 transition"
                        aria-label={`Play ${s.title}`}
                      >
                        <Play className="h-4 w-4 fill-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t border-white/10 flex gap-2 bg-black/30"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your mood…"
            className="flex-1 bg-white/8 border border-white/10 rounded-full px-4 py-2.5 text-sm outline-none focus:border-red-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="grid h-10 w-10 place-items-center rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
