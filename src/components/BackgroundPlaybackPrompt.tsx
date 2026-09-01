import { useEffect, useState } from "react";
import { BatteryCharging, X, Check, Bell, Smartphone, Music4, ChevronRight, ShieldCheck } from "lucide-react";

const KEY = "roi:bg-playback-consent";

type StepState = "idle" | "ok" | "blocked";

/**
 * Guided Android background-playback setup.
 * Step 1: notification permission (lock-screen transport controls)
 * Step 2: screen wake lock + audio session warm-up
 * Step 3: battery optimisation instructions (manual OS setting)
 */
export function BackgroundPlaybackPrompt() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [notif, setNotif] = useState<StepState>("idle");
  const [media, setMedia] = useState<StepState>("idle");

  useEffect(() => {
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const finish = (value: string) => {
    localStorage.setItem(KEY, value);
    setOpen(false);
  };

  const enableNotifications = async () => {
    try {
      if (!("Notification" in window)) {
        setNotif("blocked");
      } else if (Notification.permission === "granted") {
        setNotif("ok");
      } else {
        const res = await Notification.requestPermission();
        setNotif(res === "granted" ? "ok" : "blocked");
      }
    } catch {
      setNotif("blocked");
    }
    setStep(1);
  };

  const enableMediaControls = async () => {
    let ok = false;
    try {
      // Media Session availability = lock-screen / notification controls.
      ok = "mediaSession" in navigator;
    } catch {
      ok = false;
    }
    try {
      await (navigator as any).wakeLock?.request?.("screen");
    } catch {
      /* optional */
    }
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* optional */
    }
    setMedia(ok ? "ok" : "blocked");
    setStep(2);
  };

  if (!open) return null;

  const steps = [
    {
      icon: Bell,
      title: "Allow notifications",
      body: "Needed for play, pause, next and previous buttons on your lock screen and notification shade.",
      cta: "Allow notifications",
      action: enableNotifications,
      state: notif,
    },
    {
      icon: Music4,
      title: "Turn on lock-screen controls",
      body: "Registers ROI Music as your phone's active media session so playback keeps running when the screen is off or the app is closed.",
      cta: "Enable media controls",
      action: enableMediaControls,
      state: media,
    },
    {
      icon: BatteryCharging,
      title: "Unrestrict battery usage",
      body: "Open Settings › Apps › ROI Music › Battery and pick Unrestricted. Android otherwise kills audio a few minutes after you leave the app.",
      cta: "Done, I've set it",
      action: () => finish("allowed"),
      state: "idle" as StepState,
    },
  ];

  const active = steps[step];
  const Icon = active.icon;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] flex justify-center p-4 pb-24">
      <div className="w-full max-w-md rounded-[28px] border border-red-900/50 bg-black/95 p-5 shadow-[0_30px_90px_-20px_rgba(220,38,38,0.5)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-red-800/60 bg-red-950/50">
            <Icon className="h-5 w-5 text-red-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500/80">
              Background play · step {step + 1} of 3
            </p>
            <h3 className="mt-0.5 text-sm font-bold text-white">{active.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{active.body}</p>
          </div>
          <button
            onClick={() => finish("dismissed")}
            aria-label="Dismiss"
            className="text-zinc-500 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={`h-1 flex-1 rounded-full transition ${
                i <= step ? "bg-red-600" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {(notif !== "idle" || media !== "idle") && (
          <div className="mt-3 space-y-1.5">
            {notif !== "idle" && (
              <StatusRow label="Notifications" state={notif} />
            )}
            {media !== "idle" && (
              <StatusRow label="Lock-screen controls" state={media} />
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => finish("dismissed")}
            className="flex-1 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 active:scale-95"
          >
            Not now
          </button>
          <button
            onClick={active.action}
            className="flex-[1.4] rounded-full bg-red-600 py-2.5 text-xs font-bold text-white transition active:scale-95"
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              {active.cta}
              {step < 2 ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Smartphone className="h-3 w-3" /> Works on Android Chrome and the installed app.
        </p>
      </div>
    </div>
  );
}

function StatusRow({ label, state }: { label: string; state: StepState }) {
  const ok = state === "ok";
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
      <span className="text-[11px] text-zinc-300">{label}</span>
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
          ok ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        {ok ? <ShieldCheck className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {ok ? "Enabled" : "Blocked — allow in browser site settings"}
      </span>
    </div>
  );
}
