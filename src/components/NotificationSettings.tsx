import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, CheckCircle2, AlertTriangle, RefreshCw, Music2, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type PermState = "default" | "granted" | "denied" | "unsupported";

const LS_PUSH = "notif:push:enabled";
const LS_INAPP = "notif:inapp:enabled";
const LS_BG = "notif:background:enabled";

function getPermission(): PermState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as PermState;
}

export default function NotificationSettings() {
  const [perm, setPerm] = useState<PermState>(getPermission());
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => localStorage.getItem(LS_PUSH) !== "false");
  const [inAppEnabled, setInAppEnabled] = useState<boolean>(() => localStorage.getItem(LS_INAPP) !== "false");
  const [bgEnabled, setBgEnabled] = useState<boolean>(() => localStorage.getItem(LS_BG) !== "false");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => { localStorage.setItem(LS_PUSH, String(pushEnabled)); }, [pushEnabled]);
  useEffect(() => { localStorage.setItem(LS_INAPP, String(inAppEnabled)); }, [inAppEnabled]);
  useEffect(() => { localStorage.setItem(LS_BG, String(bgEnabled)); }, [bgEnabled]);

  // Poll permission changes (e.g. after user changes browser settings)
  useEffect(() => {
    const id = setInterval(() => setPerm(getPermission()), 2000);
    return () => clearInterval(id);
  }, []);

  const requestPermission = async () => {
    if (perm === "unsupported") {
      toast.error("Notifications are not supported on this device/browser.");
      return;
    }
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPerm(result as PermState);
      if (result === "granted") {
        toast.success("Notifications enabled");
        try {
          new Notification("Royal of Illegal", {
            body: "You'll now get song notifications and lock-screen controls.",
            icon: "/icon-192.png",
            silent: true,
          });
        } catch {}
      } else if (result === "denied") {
        toast.error("Notifications blocked. Enable them in your browser settings.");
      }
    } finally {
      setRequesting(false);
    }
  };

  const testNotification = () => {
    if (perm !== "granted") {
      toast.error("Grant permission first");
      return;
    }
    try {
      new Notification("Test notification 🎵", {
        body: "Lock-screen media controls are active while playing.",
        icon: "/icon-192.png",
      });
    } catch {
      toast.error("Could not show test notification");
    }
  };

  const statusBadge = () => {
    if (perm === "granted") return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
      </span>
    );
    if (perm === "denied") return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
        <BellOff className="h-3.5 w-3.5" /> Blocked
      </span>
    );
    if (perm === "unsupported") return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-500/10 border border-gray-500/30 px-2.5 py-1 rounded-full">
        <AlertTriangle className="h-3.5 w-3.5" /> Unsupported
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-full">
        <Bell className="h-3.5 w-3.5" /> Not granted
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Notifications & Background Audio
          </CardTitle>
          {statusBadge()}
        </div>
        <CardDescription>
          Control song notifications, lock-screen playback, and background audio.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Permission block */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">System notification permission</p>
              <p className="text-xs text-muted-foreground mt-1">
                {perm === "granted" && "Granted. You'll see now-playing controls on your lock screen and notification shade."}
                {perm === "default" && "Not requested yet. Allow notifications so the player can show controls outside the app."}
                {perm === "denied" && "Blocked by browser. Open site settings → Notifications → Allow, then return and tap Retry."}
                {perm === "unsupported" && "Your browser/device does not support web notifications."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {perm !== "granted" && perm !== "unsupported" && (
              <Button size="sm" onClick={requestPermission} disabled={requesting}>
                {requesting ? (
                  <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4 mr-1.5" />
                )}
                {perm === "denied" ? "Retry" : "Allow notifications"}
              </Button>
            )}
            {perm === "granted" && (
              <Button size="sm" variant="secondary" onClick={testNotification}>
                <BellRing className="h-4 w-4 mr-1.5" />
                Send test
              </Button>
            )}
            {perm === "denied" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Open your browser settings → Site settings → Notifications → Allow.")}
              >
                How to unblock
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Toggles */}
        <div className="space-y-4">
          <ToggleRow
            icon={<BellRing className="h-4 w-4" />}
            title="Song notifications"
            description="Show song info and playback controls in the notification shade."
            checked={pushEnabled && perm === "granted"}
            disabled={perm !== "granted"}
            onCheckedChange={setPushEnabled}
          />
          <ToggleRow
            icon={<Music2 className="h-4 w-4" />}
            title="In-app alerts"
            description="Toast messages for likes, queue updates and song changes."
            checked={inAppEnabled}
            onCheckedChange={setInAppEnabled}
          />
          <ToggleRow
            icon={<Volume2 className="h-4 w-4" />}
            title="Always allow background audio"
            description="Keep music playing when the screen is off or app is in background."
            checked={bgEnabled}
            onCheckedChange={(v) => {
              setBgEnabled(v);
              toast.success(v ? "Background audio enabled" : "Background audio disabled");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  icon, title, description, checked, onCheckedChange, disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 text-primary">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
