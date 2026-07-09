import { useEffect, useRef, useState, useCallback } from "react";
import { usePlayer } from "@/context/PlayerContext";
import mascotMega from "@/assets/mascot.png";
import mascotDance from "@/assets/mascot-dance.png";
import mascotPeace from "@/assets/mascot-peace.png";
import mascotMorning from "@/assets/mascot-morning.png";
import mascotNight from "@/assets/mascot-night.png";

const STORAGE_KEY = "mascot-pos-v1";
const DEFAULT = { x: 0, y: 90 };

type Pose = {
  src: string;
  anim: string; // css class driving the body motion
  lines: string[];
};

const POSES: Record<string, Pose> = {
  dance: {
    src: mascotDance,
    anim: "mascot-dancing",
    lines: ["Let's dance! 💃", "Turn it up! 🔊", "Feel the beat! 🎧", "Move it! 🕺"],
  },
  mega: {
    src: mascotMega,
    anim: "mascot-shout",
    lines: ["Hey, listen up! 📣", "New tunes inside!", "Press play! ▶️"],
  },
  peace: {
    src: mascotPeace,
    anim: "mascot-bob",
    lines: ["Peace & music ✌️", "Vibe with me!", "All good here 😎"],
  },
  morning: {
    src: mascotMorning,
    anim: "mascot-stretch",
    lines: ["Good Morning! ☀️", "Rise & vibe!", "Fresh playlist time!"],
  },
  night: {
    src: mascotNight,
    anim: "mascot-sleepy",
    lines: ["Good Night 🌙", "Sleepy tunes 😴", "Wind down with me"],
  },
};

function timePose(): keyof typeof POSES {
  const h = new Date().getHours();
  if (h < 7) return "night";
  if (h < 11) return "morning";
  if (h >= 21) return "night";
  return "dance";
}

const ROTATION: (keyof typeof POSES)[] = ["dance", "peace", "mega"];

export default function FloatingMascot({ onOpenChat }: { onOpenChat?: () => void } = {}) {
  const { isPlaying } = usePlayer();
  const ref = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, moved: false, offX: 0, offY: 0 });
  const [pos, setPos] = useState(DEFAULT);
  const [poseKey, setPoseKey] = useState<keyof typeof POSES>(() => timePose());
  const [bubble, setBubble] = useState<string | null>(null);
  const [landed, setLanded] = useState(false);
  const posRef = useRef(pos);
  useEffect(() => { posRef.current = pos; }, [pos]);

  const pose = POSES[poseKey];

  const speak = useCallback((key: keyof typeof POSES) => {
    const p = POSES[key];
    setBubble(p.lines[Math.floor(Math.random() * p.lines.length)]);
    window.clearTimeout((speak as any)._t);
    (speak as any)._t = window.setTimeout(() => setBubble(null), 3200);
  }, []);

  // Restore position + entrance + preload all poses so switching is instant
  useEffect(() => {
    Object.values(POSES).forEach((p) => { const im = new Image(); im.src = p.src; });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPos(JSON.parse(raw));
    } catch { /* ignore */ }
    const t = setTimeout(() => setLanded(true), 50);
    const greet = setTimeout(() => speak(timePose()), 900);
    return () => { clearTimeout(t); clearTimeout(greet); };
  }, [speak]);

  // Auto-rotate poses (skip rotation during night/morning special hours)
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const tp = timePose();
      if (tp === "night" || tp === "morning") {
        setPoseKey(tp);
        speak(tp);
        return;
      }
      i = (i + 1) % ROTATION.length;
      const next = ROTATION[i];
      setPoseKey(next);
      speak(next);
    }, 6500);
    return () => clearInterval(id);
  }, [speak]);

  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  const clamp = (x: number, y: number) => {
    const el = ref.current;
    const w = el?.offsetWidth ?? 110;
    const h = el?.offsetHeight ?? 140;
    return {
      x: Math.min(Math.max(x, 8), window.innerWidth - w - 8),
      y: Math.min(Math.max(y, 8), window.innerHeight - h - 8),
    };
  };

  const flush = useCallback(() => {
    rafRef.current = null;
    const el = ref.current;
    const p = pendingRef.current;
    if (!el || !p) return;
    // Direct DOM write — no React re-render, so dragging stays at 60fps.
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
    el.style.right = "auto";
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.right = "auto";
    dragState.current = { dragging: true, moved: false, offX: e.clientX - rect.left, offY: e.clientY - rect.top };
    pendingRef.current = { x: rect.left, y: rect.top };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds.dragging) return;
    ds.moved = true;
    pendingRef.current = clamp(e.clientX - ds.offX, e.clientY - ds.offY);
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current;
    if (ds.dragging) {
      ds.dragging = false;
      if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (ds.moved && pendingRef.current) {
        const final = pendingRef.current;
        flush();
        posRef.current = final;
        setPos(final);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(final)); } catch { /* ignore */ }
      } else {
        const tp = timePose();
        const next = tp === "night" || tp === "morning"
          ? tp
          : ROTATION[(ROTATION.indexOf(poseKey as any) + 1 + ROTATION.length) % ROTATION.length] || "dance";
        setPoseKey(next);
        speak(next);
      }
    }
    ref.current?.releasePointerCapture?.(e.pointerId);
  }, [poseKey, speak, flush]);

  useEffect(() => () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="fixed z-50 touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        right: pos === DEFAULT ? "0.25rem" : "auto",
        left: pos === DEFAULT ? "auto" : pos.x,
        top: pos.y,
        willChange: "left, top",
      }}
    >
      <div className={`mascot-float ${isPlaying ? "mascot-disco" : ""}`}>
        {isPlaying && (
          <div className="disco-stage" aria-hidden>
            <span className="disco-beam disco-beam-1" />
            <span className="disco-beam disco-beam-2" />
            <span className="disco-beam disco-beam-3" />
            <span className="disco-ball" />
            <span className="disco-sparkle disco-sparkle-1" />
            <span className="disco-sparkle disco-sparkle-2" />
            <span className="disco-sparkle disco-sparkle-3" />
          </div>
        )}
        <div className="mascot-aura" aria-hidden />
        <div className="mascot-shadow" aria-hidden />

        {bubble && (
          <div className="mascot-bubble">
            {bubble}
            <span className="mascot-bubble-tail" aria-hidden />
          </div>
        )}

        <img
          key={poseKey}
          src={pose.src}
          alt="Cheerful 3D mascot"
          draggable={false}
          className={`mascot-img ${pose.anim} ${landed ? "mascot-landed" : ""} ${isPlaying ? "mascot-img-disco" : ""}`}
        />
      </div>
    </div>
  );
}
