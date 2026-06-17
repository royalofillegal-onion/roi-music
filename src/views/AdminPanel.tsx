import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getDeviceId } from "@/lib/deviceTracker";
import {
  fetchAllDevices,
  fetchAllPlays,
  fetchAllLikes,
  fetchAllSearches,
  collaborativeRecsForDevice,
  type DeviceRow,
  type PlayRow,
  type LikeRow,
  type SearchRow,
} from "@/lib/cloudTracker";

const ADMIN_PASSWORD = "&loginme";

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem("roi.adminAuthed") === "1"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [plays, setPlays] = useState<PlayRow[]>([]);
  const [likes, setLikes] = useState<LikeRow[]>([]);
  const [searches, setSearches] = useState<SearchRow[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const myId = (() => { try { return getDeviceId(); } catch { return ""; } })();

  async function loadAll() {
    setLoading(true);
    try {
      const [d, p, l, s] = await Promise.all([
        fetchAllDevices(),
        fetchAllPlays(),
        fetchAllLikes(),
        fetchAllSearches(),
      ]);
      setDevices(d);
      setPlays(p);
      setLikes(l);
      setSearches(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  const filteredDevices = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return devices;
    return devices.filter((d) => d.device_id.toLowerCase().includes(f));
  }, [devices, filter]);

  const sel = selectedDevice;
  const selPlays = useMemo(() => plays.filter((p) => p.device_id === sel), [plays, sel]);
  const selLikes = useMemo(() => likes.filter((l) => l.device_id === sel), [likes, sel]);
  const selSearches = useMemo(() => searches.filter((s) => s.device_id === sel), [searches, sel]);
  const selRecs = useMemo(
    () => (sel ? collaborativeRecsForDevice(sel, plays, likes) : []),
    [sel, plays, likes]
  );

  function tryUnlock() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("roi.adminAuthed", "1");
      setAuthed(true);
    } else setErr("Wrong password");
  }

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
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={tryUnlock}>Unlock</Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalPlays = plays.reduce((s, p) => s + p.play_count, 0);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0418] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">Roi Admin · All Devices</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadAll} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </Button>
            <Button variant="ghost" onClick={() => { sessionStorage.removeItem("roi.adminAuthed"); setAuthed(false); }}>Logout</Button>
            <Button variant="outline" onClick={onClose}>Exit</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total devices" value={String(devices.length)} />
          <Stat label="Total plays" value={String(totalPlays)} />
          <Stat label="Total likes" value={String(likes.length)} />
          <Stat label="Total searches" value={String(searches.length)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Device list */}
          <section className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold">Devices (App IDs)</h2>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search device id…"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredDevices.length === 0 ? <Empty /> : filteredDevices.map((d) => {
                const dPlays = plays.filter((p) => p.device_id === d.device_id).reduce((s, p) => s + p.play_count, 0);
                const dLikes = likes.filter((l) => l.device_id === d.device_id).length;
                return (
                  <button
                    key={d.device_id}
                    onClick={() => setSelectedDevice(d.device_id)}
                    className={`w-full text-left rounded-md p-2 border transition ${
                      sel === d.device_id ? "border-purple-500 bg-purple-500/10" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
                    }`}
                  >
                    <p className="font-mono text-xs truncate">
                      {d.device_id}{d.device_id === myId && <span className="text-purple-400"> (this device)</span>}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {dPlays} plays · {dLikes} likes · last {new Date(d.last_seen).toLocaleDateString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Device detail */}
          <section className="lg:col-span-2 space-y-5">
            {!sel ? (
              <p className="text-sm text-zinc-500">Select a device to view its plays, likes, searches and recommendations.</p>
            ) : (
              <>
                <div className="bg-zinc-900/60 rounded-md p-3">
                  <p className="text-xs text-zinc-500">Selected App ID</p>
                  <p className="font-mono text-sm break-all">{sel}</p>
                </div>

                <Section title={`Played songs (${selPlays.length})`}>
                  {selPlays.length === 0 ? <Empty /> : (
                    <ol className="space-y-2">
                      {selPlays.map((s, i) => (
                        <li key={s.song_id} className="flex items-center gap-3 bg-zinc-900/60 rounded-md p-2">
                          <span className="w-6 text-center text-zinc-500">{i + 1}</span>
                          {s.image_url && <img src={s.image_url} className="w-10 h-10 rounded object-cover" alt="" />}
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{s.title}</p>
                            <p className="truncate text-xs text-zinc-400">{s.artist}</p>
                          </div>
                          <span className="text-sm text-purple-400">{s.play_count} plays</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </Section>

                <Section title={`Liked songs (${selLikes.length})`}>
                  {selLikes.length === 0 ? <Empty /> : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selLikes.map((s) => (
                        <li key={s.song_id} className="flex items-center gap-3 bg-zinc-900/60 rounded-md p-2">
                          {s.image_url && <img src={s.image_url} className="w-10 h-10 rounded object-cover" alt="" />}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{s.title}</p>
                            <p className="truncate text-xs text-zinc-400">{s.artist}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title={`Searches (${selSearches.length})`}>
                  {selSearches.length === 0 ? <Empty /> : (
                    <div className="flex flex-wrap gap-2">
                      {selSearches.map((s, i) => (
                        <span key={i} className="text-xs bg-zinc-800 rounded-full px-3 py-1 text-zinc-300">{s.query}</span>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title={`Cross-user recommendations (${selRecs.length})`}>
                  <p className="text-xs text-zinc-500 mb-2">
                    Songs that similar devices (who share songs with this one) played or liked, that this device hasn't heard yet.
                  </p>
                  {selRecs.length === 0 ? <Empty /> : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selRecs.map((s) => (
                        <li key={s.song_id} className="flex items-center gap-3 bg-zinc-900/60 rounded-md p-2">
                          {s.image_url && <img src={s.image_url} className="w-10 h-10 rounded object-cover" alt="" />}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{s.title}</p>
                            <p className="truncate text-xs text-zinc-400">{s.artist}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </>
            )}
          </section>
        </div>
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
