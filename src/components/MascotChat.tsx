import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Sparkles, Play, Plus, Cloud, Sun, Moon, Music2, Flame, Heart, Headphones } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { uniqueSongs } from "@/data/allSongs";
import lyricsMap from "@/data/lyrics";
import { useWeather } from "@/hooks/useWeather";
import type { Song } from "@/data/Song";
import mascotPeace from "@/assets/mascot-peace.png";

type Msg = { role: "user" | "bot"; text: string; songs?: Song[] };

const MOODS: Array<{
  keys: string[]; label: string; genres: string[]; syncs: string[]; reply: string;
}> = [
  { keys: ["sad","cry","lonely","heartbreak","breakup","depress","hurt","pain","alone","miss"], label: "Sad",
    genres: ["sad","melancholy","soul","ballad"], syncs: ["sad","emotional","melancholy"],
    reply: "Feeling heavy 💔 — here's something soft for the heart." },
  { keys: ["happy","joy","smile","cheer","good","great","excited","party","dance","fun"], label: "Happy",
    genres: ["pop","dance","funk","edm","party"], syncs: ["happy","upbeat","party","energetic"],
    reply: "Yes! Let's turn it up 🎉 — happy vibes on the way." },
  { keys: ["love","romantic","romance","crush","sweet","date"], label: "Romantic",
    genres: ["romantic","love","r&b","ballad"], syncs: ["romantic","love"],
    reply: "Aww 🌹 — a little love in your ears." },
  { keys: ["chill","relax","calm","peace","quiet","sleep","night","lofi","lo-fi","study"], label: "Chill",
    genres: ["lofi","chill","acoustic","ambient"], syncs: ["chill","calm","relax"],
    reply: "Deep breath 🌙 — soft and easy for you." },
  { keys: ["workout","gym","run","energy","pump","hype","beast","training"], label: "Workout",
    genres: ["edm","hip-hop","rock","electronic"], syncs: ["energetic","hype","workout"],
    reply: "Let's go 💪 — power tracks incoming." },
  { keys: ["drive","road","travel","trip","highway"], label: "Drive",
    genres: ["rock","pop","indie"], syncs: ["upbeat","energetic"],
    reply: "Windows down 🚗 — playlist ready." },
];

const FRIENDLY_REPLIES = [
  "I'm right here 🎧 — what are we in the mood for?",
  "Tell me a vibe — happy, sad, chill, love, workout… I'll find the tune.",
  "Drop a feeling or a keyword and I'll dig through the crates for you ✨",
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
  if (q.length > 2) {
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    for (const w of words) {
      if (title.includes(w)) score += 3;
      if (artist.includes(w)) score += 2;
      if (genre.includes(w)) score += 2;
      if (sync.includes(w)) score += 2;
    }
  }
  const lyrics = lyricsMap[song.id];
  if (lyrics && q.length > 2) {
    const l = lyrics.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words) if (l.includes(w)) score += 5;
  }
  return score;
}

function findMatches(query: string, limit = 6): { mood?: (typeof MOODS)[number]; songs: Song[] } {
  const mood = detectMood(query);
  const scored = uniqueSongs.map((s) => ({ s, sc: scoreSong(s, query, mood) }))
    .filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc);
  let songs = scored.slice(0, limit).map((x) => x.s);
  if (songs.length === 0) songs = [...uniqueSongs].sort(() => Math.random() - 0.5).slice(0, 6);
  return { mood, songs };
}

/* Time-of-day helpers */
function partOfDay(): { key: "morning" | "afternoon" | "evening" | "night"; label: string; emoji: string; greet: string } {
  const h = new Date().getHours();
  if (h < 5) return { key: "night", label: "Late night", emoji: "🌙", greet: "Up late? Here's something for the quiet hours." };
  if (h < 12) return { key: "morning", label: "Morning", emoji: "☀️", greet: "Good morning! Let's start the day right." };
  if (h < 17) return { key: "afternoon", label: "Afternoon", emoji: "🌤️", greet: "Afternoon energy — keep it flowing." };
  if (h < 21) return { key: "evening", label: "Evening", emoji: "🌆", greet: "Evening wind‑down — golden hour tunes for you." };
  return { key: "night", label: "Night", emoji: "🌙", greet: "Night mode on — soft and moody." };
}

function pickForPart(part: ReturnType<typeof partOfDay>["key"], count = 4): Song[] {
  const pool = uniqueSongs;
  let filtered: Song[] = [];
  const has = (s: Song, arr: string[]) =>
    arr.some((k) => (s.genre || "").toLowerCase().includes(k) || (s.sync || "").toLowerCase().includes(k));
  if (part === "morning") filtered = pool.filter((s) => has(s, ["happy", "upbeat", "pop", "acoustic"]));
  else if (part === "afternoon") filtered = pool.filter((s) => has(s, ["pop", "dance", "energetic", "indie"]));
  else if (part === "evening") filtered = pool.filter((s) => has(s, ["romantic", "chill", "love", "acoustic", "soul"]));
  else filtered = pool.filter((s) => has(s, ["chill", "lofi", "sad", "ambient", "ballad"]));
  if (filtered.length < count) filtered = [...filtered, ...pool].filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

/* Best-of pick: prefer songs that have lyrics */
function pickBestOf(): Song | null {
  const withLyrics = uniqueSongs.filter((s) => lyricsMap[s.id]);
  const pool = withLyrics.length ? withLyrics : uniqueSongs;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

export default function MascotChat({ onClose }: { onClose: () => void }) {
  const { playSong, addToQueue, currentSong, currentTime, duration } = usePlayer();
  const weather = useWeather();
  const part = useMemo(partOfDay, []);
  const [bestOf] = useState<Song | null>(() => pickBestOf());
  const partPicks = useMemo(() => pickForPart(part.key, 4), [part.key]);

  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot",
      text: `Hey! I'm your music buddy 🎧 ${part.emoji} ${part.greet} Tell me a mood or a lyric — I'll match it from genre, vibe & lyrics.` },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const { mood, songs } = findMatches(q);
    const botText = mood ? mood.reply
      : songs.length ? "Here's what fits ✨"
      : FRIENDLY_REPLIES[Math.floor(Math.random() * FRIENDLY_REPLIES.length)];
    setMessages((p) => [...p, { role: "user", text: q }, { role: "bot", text: botText, songs }]);
    setInput("");
  };

  const suggestions = ["I'm feeling sad", "Party time 🎉", "Chill night vibes", "Romantic mood", "Workout energy", "Something new"];

  const quickActions = [
    { icon: Flame, label: "Trending", q: "trending" },
    { icon: Heart, label: "Romantic", q: "romantic mood" },
    { icon: Moon, label: "Sleep", q: "chill night vibes" },
    { icon: Headphones, label: "Focus", q: "chill study" },
  ];

  /* Lyrics-sync highlight for best-of / currently playing */
  const lyricsSource = currentSong ? currentSong : bestOf;
  const rawLyrics = lyricsSource ? lyricsMap[lyricsSource.id] : null;
  const lyricLines = useMemo(
    () => (rawLyrics ? rawLyrics.split(/\n+/).map((l) => l.trim()).filter(Boolean) : []),
    [rawLyrics]
  );
  // Even-time distribution (no LRC available) — approximate karaoke feel.
  const activeLine = useMemo(() => {
    if (!lyricLines.length) return -1;
    const isCurrent = currentSong && lyricsSource && currentSong.id === lyricsSource.id;
    if (!isCurrent || !duration || duration <= 0) return -1;
    const idx = Math.floor((currentTime / duration) * lyricLines.length);
    return Math.min(lyricLines.length - 1, Math.max(0, idx));
  }, [lyricLines, currentSong, lyricsSource, currentTime, duration]);

  const activeLineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLine]);

  const WeatherIcon = weather.isDay ? Sun : Moon;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg h-[92dvh] sm:h-[88dvh] rounded-t-3xl sm:rounded-3xl bg-black text-white border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-red-500/15 via-black to-black">
          <div className="relative">
            <img src={mascotPeace} alt="Buddy" className="h-11 w-11 rounded-full object-cover ring-2 ring-red-500/50" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold flex items-center gap-1.5 text-white">
              Music Buddy AI <Sparkles className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div className="text-xs text-white/60 truncate">
              {part.emoji} {part.label}
              {weather.city ? ` · ${weather.city}` : ""}
              {typeof weather.tempC === "number" ? ` · ${weather.tempC}°` : ""}
              {weather.condition ? ` ${weather.emoji}` : ""}
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition" aria-label="Close chat">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {/* Quick action rail */}
          <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {quickActions.map(({ icon: Icon, label, q }) => (
              <button key={label} onClick={() => send(q)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 text-xs text-white transition">
                <Icon className="h-3.5 w-3.5 text-red-400" />{label}
              </button>
            ))}
          </div>

          {/* Weather + time picks card */}
          <div className="mx-4 mt-2 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <WeatherIcon className="h-4 w-4 text-red-400" />
              <div className="text-sm font-medium text-white">
                {part.label} picks
                <span className="text-white/50 font-normal">
                  {weather.condition ? ` · ${weather.condition} ${weather.emoji}` : ""}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {partPicks.map((s) => (
                <button key={s.id} onClick={() => playSong(s)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-left transition">
                  <img src={s.imageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white truncate">{s.title}</div>
                    <div className="text-[10px] text-white/50 truncate">{s.artist}</div>
                  </div>
                  <Play className="h-3.5 w-3.5 text-red-400 fill-red-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Best-of with synced lyrics */}
          {bestOf && (
            <div className="mx-4 mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/10 via-black to-black overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <img src={bestOf.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-red-400 flex items-center gap-1">
                    <Music2 className="h-3 w-3" /> Best of · Sing-along
                  </div>
                  <div className="text-sm font-semibold text-white truncate">{bestOf.title}</div>
                  <div className="text-xs text-white/60 truncate">{bestOf.artist}</div>
                </div>
                <button onClick={() => playSong(bestOf)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-red-500 hover:bg-red-600 transition" aria-label="Play best of">
                  <Play className="h-4 w-4 fill-white text-white" />
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto px-4 pb-3 space-y-1">
                {lyricLines.length ? lyricLines.map((line, i) => {
                  const isActive = i === activeLine;
                  const isPast = activeLine >= 0 && i < activeLine;
                  return (
                    <div key={i} ref={isActive ? activeLineRef : undefined}
                      className={
                        "text-sm leading-relaxed transition-all duration-300 " +
                        (isActive
                          ? "text-white font-semibold drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] scale-[1.02]"
                          : isPast ? "text-white/30" : "text-white/55")
                      }>
                      {line}
                    </div>
                  );
                }) : (
                  <div className="text-xs text-white/40 italic">Play to see the lyrics glow.</div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex flex-col gap-2"}>
                <div className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-red-500 text-white px-4 py-2 text-sm"
                    : "max-w-[90%] rounded-2xl rounded-tl-sm bg-white/[0.08] text-white px-4 py-2 text-sm border border-white/10"
                }>
                  {m.text}
                </div>
                {m.songs && m.songs.length > 0 && (
                  <div className="space-y-1.5">
                    {m.songs.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/5 transition group">
                        <img src={s.imageUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{s.title}</div>
                          <div className="text-xs text-white/60 truncate">{s.artist}{s.genre ? ` · ${s.genre}` : ""}</div>
                        </div>
                        <button onClick={() => addToQueue(s)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition" aria-label="Add to queue">
                          <Plus className="h-4 w-4 text-white" />
                        </button>
                        <button onClick={() => playSong(s)}
                          className="grid h-9 w-9 place-items-center rounded-full bg-red-500 hover:bg-red-600 transition" aria-label={`Play ${s.title}`}>
                          <Play className="h-4 w-4 fill-white text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/10 text-white transition">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="p-3 border-t border-white/10 flex gap-2 bg-black">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your mood or a lyric…"
            className="flex-1 bg-white/[0.08] border border-white/10 text-white placeholder:text-white/40 rounded-full px-4 py-2.5 text-sm outline-none focus:border-red-500/60" />
          <button type="submit" disabled={!input.trim()}
            className="grid h-10 w-10 place-items-center rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition" aria-label="Send">
            <Send className="h-4 w-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
