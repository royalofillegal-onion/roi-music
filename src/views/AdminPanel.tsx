import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  getDeviceId,
  getFirstSeen,
  getLastSeen,
  getTopPlayed,
  getTotalPlays,
  getLikedMeta,
  getDeviceRecommendations,
} from "@/lib/deviceTracker";
import { uniqueSongs } from "@/data/allSongs";

const ADMIN_PASSWORD = "&loginme";

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem("roi.adminAuthed") === "1"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const data = useMemo(() => {
    if (!authed) return null;
    const likedIds: string[] = JSON.parse(localStorage.getItem("likedSongs") || "[]");
    return {
      deviceId: getDeviceId(),
      firstSeen: getFirstSeen(),
      lastSeen: getLastSeen(),
      totalPlays: getTotalPlays(),
      topPlayed: getTopPlayed(20),
      liked: getLikedMeta(likedIds),
      recs: getDeviceRecommendations(uniqueSongs, 12),
    };
  }, [authed]);

  if (!authed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6">
        <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 p-6 space-y-4">
          <h1 className="text-xl font-bold text-white">Admin Access</h1>
          <p className="text-sm text-zinc-400">Enter admin password to continue.</p>
          <Input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="bg-zinc-800 border-zinc-700 text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pw === ADMIN_PASSWORD) {
                  sessionStorage.setItem("roi.adminAuthed", "1");
                  setAuthed(true);
                } else setErr("Wrong password");
              }
            }}
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                if (pw === ADMIN_PASSWORD) {
                  sessionStorage.setItem("roi.adminAuthed", "1");
                  setAuthed(true);
                } else setErr("Wrong password");
              }}
            >
              Unlock
            </Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </Card>
      </div>
    );
  }

  const d = data!;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0418] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Roi Admin · Device Analytics</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { sessionStorage.removeItem("roi.adminAuthed"); setAuthed(false); }}>Logout</Button>
            <Button variant="outline" onClick={onClose}>Exit</Button>
          </div>
        </div>

        <p className="text-xs text-amber-400/80">
          Local-only mode: this shows analytics stored on THIS device. Cross-user data requires a backend.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Device ID" value={d.deviceId.slice(0, 12) + "…"} />
          <Stat label="Total plays" value={String(d.totalPlays)} />
          <Stat label="Liked songs" value={String(d.liked.length)} />
          <Stat label="Unique tracks" value={String(d.topPlayed.length)} />
          <Stat label="First seen" value={new Date(d.firstSeen).toLocaleDateString()} />
          <Stat label="Last seen" value={new Date(d.lastSeen).toLocaleString()} />
        </div>

        <Section title="Most played (this device)">
          {d.topPlayed.length === 0 ? <Empty /> : (
            <ol className="space-y-2">
              {d.topPlayed.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 bg-zinc-900/60 rounded-md p-2">
                  <span className="w-6 text-center text-zinc-500">{i + 1}</span>
                  {s.imageUrl && <img src={s.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate text-xs text-zinc-400">{s.artist}</p>
                  </div>
                  <span className="text-sm text-purple-400">{s.count} plays</span>
                </li>
              ))}
            </ol>
          )}
        </Section>

        <Section title="Liked songs">
          {d.liked.length === 0 ? <Empty /> : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {d.liked.map((s) => (
                <li key={s.id} className="flex items-center gap-3 bg-zinc-900/60 rounded-md p-2">
                  {s.imageUrl && <img src={s.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate text-xs text-zinc-400">{s.artist}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Recommendations (based on this device)">
          {d.recs.length === 0 ? <Empty /> : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {d.recs.map((s) => (
                <li key={s.id} className="flex items-center gap-3 bg-zinc-900/60 rounded-md p-2">
                  {s.imageUrl && <img src={s.imageUrl} className="w-10 h-10 rounded object-cover" alt="" />}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate text-xs text-zinc-400">{s.artist}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold truncate">{value}</p>
    </Card>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </section>
  );
}
function Empty() {
  return <p className="text-sm text-zinc-500">No data yet.</p>;
}
