import { useEffect, useState, useCallback } from "react";
import { Headphones, Bluetooth, Speaker, RefreshCw, Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LS_SINK = "audio:output:sinkId";

type Device = { deviceId: string; label: string; kind: "bluetooth" | "wired" | "speaker" | "other" };

function classify(label: string): Device["kind"] {
  const l = label.toLowerCase();
  if (/bluetooth|airpod|buds|wireless|bt\b|jbl|sony|bose/.test(l)) return "bluetooth";
  if (/headphone|headset|earphone|wired|jack|usb/.test(l)) return "wired";
  if (/speaker|built-in|internal/.test(l)) return "speaker";
  return "other";
}

function iconFor(kind: Device["kind"]) {
  switch (kind) {
    case "bluetooth": return <Bluetooth className="h-4 w-4 text-blue-400" />;
    case "wired":     return <Cable className="h-4 w-4 text-green-400" />;
    case "speaker":   return <Speaker className="h-4 w-4 text-yellow-400" />;
    default:          return <Headphones className="h-4 w-4 text-primary" />;
  }
}

// Find every <audio> the app created (PlayerContext appends one to body).
function getAudios(): HTMLAudioElement[] {
  return Array.from(document.querySelectorAll("audio"));
}

async function applySink(deviceId: string): Promise<boolean> {
  const audios = getAudios();
  if (!audios.length) return false;
  let ok = false;
  for (const a of audios) {
    const anyA = a as any;
    if (typeof anyA.setSinkId === "function") {
      try { await anyA.setSinkId(deviceId); ok = true; } catch (e) { console.warn("setSinkId failed", e); }
    }
  }
  return ok;
}

export function AudioOutputPicker() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentId, setCurrentId] = useState<string>(() => localStorage.getItem(LS_SINK) || "default");
  const [supported, setSupported] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // setSinkId is HTMLMediaElement; mobile Safari & most mobile browsers don't expose it.
      const probe = document.createElement("audio") as any;
      if (typeof probe.setSinkId !== "function" || !navigator.mediaDevices?.enumerateDevices) {
        setSupported(false);
        return;
      }
      // Permission unlocks device labels.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch { /* user denied — labels may be blank but ids still work */ }

      const list = await navigator.mediaDevices.enumerateDevices();
      const outs = list
        .filter(d => d.kind === "audiooutput")
        .map(d => ({
          deviceId: d.deviceId,
          label: d.label || (d.deviceId === "default" ? "System default" : "Audio device"),
          kind: classify(d.label),
        }));
      setDevices(outs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Re-apply saved sink whenever an audio element appears (e.g. after song change).
  useEffect(() => {
    const saved = localStorage.getItem(LS_SINK);
    if (!saved || saved === "default") return;
    const t = setInterval(() => { applySink(saved); }, 1500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md) return;
    const onChange = () => refresh();
    md.addEventListener?.("devicechange", onChange);
    return () => md.removeEventListener?.("devicechange", onChange);
  }, [refresh]);

  const select = async (d: Device) => {
    const ok = await applySink(d.deviceId);
    if (ok) {
      localStorage.setItem(LS_SINK, d.deviceId);
      setCurrentId(d.deviceId);
      toast.success(`Routing audio to ${d.label}`);
    } else {
      toast.error("Could not switch output (browser blocked it or no audio is playing).");
    }
  };

  if (!supported) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Audio Output</h3>
        </div>
        <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          Switching wired / Bluetooth output isn't available in this browser.
          Connect or pair your headphones in your phone's system settings and the
          music will follow automatically.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Audio Output</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Send music to wired headphones, Bluetooth speakers or the built-in speaker.
      </p>

      <div className="space-y-2">
        {devices.length === 0 && (
          <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            No output devices detected. Tap refresh after connecting one.
          </div>
        )}
        {devices.map(d => (
          <button
            key={d.deviceId}
            onClick={() => select(d)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
              currentId === d.deviceId
                ? "bg-primary/10 border-primary"
                : "bg-muted/50 border-transparent hover:bg-muted"
            )}
          >
            {iconFor(d.kind)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{d.label}</p>
              <p className="text-xs text-muted-foreground capitalize">{d.kind}</p>
            </div>
            {currentId === d.deviceId && (
              <span className="text-xs text-primary font-medium">Active</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
