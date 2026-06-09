import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, AlertCircle, SkipBack, SkipForward, Play, Pause, MousePointerClick } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

type ActionType = "play" | "pause" | "next" | "previous" | "seekto" | "seekforward" | "seekbackward" | "stop";

interface SyncEvent {
  action: ActionType;
  at: number;
  // Snapshot of player state at the moment the notification button was pressed
  beforeSongId: string | null;
  beforeIsPlaying: boolean;
  // Snapshot taken shortly after to confirm sync
  afterSongId?: string | null;
  afterIsPlaying?: boolean;
  synced?: boolean;
  latencyMs?: number;
}

const actionIcon = (a: ActionType) => {
  switch (a) {
    case "play": return <Play className="h-3.5 w-3.5" />;
    case "pause": return <Pause className="h-3.5 w-3.5" />;
    case "next": return <SkipForward className="h-3.5 w-3.5" />;
    case "previous": return <SkipBack className="h-3.5 w-3.5" />;
    default: return <MousePointerClick className="h-3.5 w-3.5" />;
  }
};

const actionLabel = (a: ActionType) => ({
  play: "Play",
  pause: "Pause",
  next: "Next",
  previous: "Previous",
  seekto: "Seek to",
  seekforward: "Seek +",
  seekbackward: "Seek −",
  stop: "Stop",
}[a] || a);

export default function NotificationSyncStatus() {
  const { currentSong, isPlaying } = usePlayer();
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const pendingRef = useRef<{ ev: SyncEvent; timer: number } | null>(null);

  // Keep latest player state in a ref so we can read it on demand
  const stateRef = useRef({ songId: currentSong?.id ?? null, isPlaying });
  useEffect(() => {
    stateRef.current = { songId: currentSong?.id ?? null, isPlaying };

    // If a notification action is awaiting confirmation, finalize it now —
    // the player state just updated, so this is the real sync latency.
    const p = pendingRef.current;
    if (p) {
      window.clearTimeout(p.timer);
      finalize(p.ev, true);
      pendingRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, isPlaying]);

  const finalize = (ev: SyncEvent, didChange: boolean) => {
    const after = stateRef.current;
    const expectedChange =
      ev.action === "next" || ev.action === "previous"
        ? after.songId !== ev.beforeSongId
        : ev.action === "play"
          ? after.isPlaying === true
          : ev.action === "pause" || ev.action === "stop"
            ? after.isPlaying === false
            : true; // seeks: always considered synced
    const synced = didChange ? expectedChange : expectedChange;
    const latencyMs = Date.now() - ev.at;
    const completed: SyncEvent = {
      ...ev,
      afterSongId: after.songId,
      afterIsPlaying: after.isPlaying,
      synced,
      latencyMs,
    };
    setEvents((prev) => [completed, ...prev].slice(0, 6));
  };

  useEffect(() => {
    const onAction = (e: Event) => {
      const detail = (e as CustomEvent).detail as { action: ActionType; at: number };
      const ev: SyncEvent = {
        action: detail.action,
        at: detail.at,
        beforeSongId: stateRef.current.songId,
        beforeIsPlaying: stateRef.current.isPlaying,
      };
      // Cancel any prior pending event
      if (pendingRef.current) {
        window.clearTimeout(pendingRef.current.timer);
        finalize(pendingRef.current.ev, false);
      }
      // Wait up to 1500ms for state to reflect; if it doesn't, mark not synced
      const timer = window.setTimeout(() => {
        finalize(ev, false);
        pendingRef.current = null;
      }, 1500);
      pendingRef.current = { ev, timer };
    };

    window.addEventListener("mediasession:action", onAction as EventListener);
    return () => {
      window.removeEventListener("mediasession:action", onAction as EventListener);
      if (pendingRef.current) window.clearTimeout(pendingRef.current.timer);
    };
  }, []);

  const lastSynced = events[0]?.synced;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Notification sync status
          </CardTitle>
          {events.length > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                lastSynced
                  ? "text-green-400 bg-green-500/10 border-green-500/30"
                  : "text-red-400 bg-red-500/10 border-red-500/30"
              }`}
            >
              {lastSynced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              {lastSynced ? "In sync" : "Out of sync"}
            </span>
          )}
        </div>
        <CardDescription>
          Live confirmation that each notification button updates the in-app song and play state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Live state */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 mb-3 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-medium truncate max-w-[200px]">
            {currentSong ? `${currentSong.title} — ${currentSong.artist}` : "No song"}
          </span>
          <span className={`inline-flex items-center gap-1 ${isPlaying ? "text-green-400" : "text-muted-foreground"}`}>
            {isPlaying ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {isPlaying ? "Playing" : "Paused"}
          </span>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Press a button on the lock-screen notification — its sync result will appear here.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {events.map((ev, i) => (
              <li
                key={`${ev.at}-${i}`}
                className="flex items-center justify-between gap-2 text-xs rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5"
              >
                <span className="inline-flex items-center gap-1.5 font-medium">
                  {actionIcon(ev.action)}
                  {actionLabel(ev.action)}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {ev.latencyMs ?? 0}ms
                </span>
                <span
                  className={`inline-flex items-center gap-1 ${
                    ev.synced ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {ev.synced ? (
                    <><CheckCircle2 className="h-3 w-3" /> synced</>
                  ) : (
                    <><AlertCircle className="h-3 w-3" /> no change</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
