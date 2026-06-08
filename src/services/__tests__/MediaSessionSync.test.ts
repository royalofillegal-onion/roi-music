/**
 * Verifies notification (Media Session) prev / next / play / pause buttons
 * always stay in sync with the in-app player state — just like a real
 * music app (Spotify, YT Music, Apple Music).
 *
 * Strategy: stub `navigator.mediaSession` so we can capture the action
 * handlers the player registers, then simulate the OS firing them and
 * assert the same player callbacks fire that the in-app UI uses.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mediaSessionManager } from "../MediaSessionService";

type ActionMap = Record<string, ((d?: any) => void) | null>;

function installMediaSessionStub() {
  const handlers: ActionMap = {};
  const state = {
    metadata: null as any,
    playbackState: "none" as "none" | "playing" | "paused",
    position: null as { duration: number; position: number; playbackRate: number } | null,
  };

  // @ts-ignore
  global.MediaMetadata = class {
    title: string; artist: string; album: string; artwork: any;
    constructor(init: any) {
      this.title = init.title; this.artist = init.artist;
      this.album = init.album; this.artwork = init.artwork;
    }
  };

  Object.defineProperty(navigator, "mediaSession", {
    configurable: true,
    value: {
      setActionHandler: (action: string, cb: any) => { handlers[action] = cb; },
      set metadata(v: any) { state.metadata = v; },
      get metadata() { return state.metadata; },
      set playbackState(v: any) { state.playbackState = v; },
      get playbackState() { return state.playbackState; },
      setPositionState: (s: any) => { state.position = s; },
    },
  });

  return { handlers, state };
}

describe("Notification ↔ Player sync", () => {
  let env: ReturnType<typeof installMediaSessionStub>;
  let player: {
    isPlaying: boolean;
    currentSong: { title: string; artist: string } | null;
    onPlay: ReturnType<typeof vi.fn>;
    onPause: ReturnType<typeof vi.fn>;
    onNext: ReturnType<typeof vi.fn>;
    onPrev: ReturnType<typeof vi.fn>;
    onSeek: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    env = installMediaSessionStub();

    player = {
      isPlaying: false,
      currentSong: null,
      onPlay: vi.fn(() => { player.isPlaying = true; mediaSessionManager.updatePlaybackState(true); }),
      onPause: vi.fn(() => { player.isPlaying = false; mediaSessionManager.updatePlaybackState(false); }),
      onNext: vi.fn(() => {
        player.currentSong = { title: "Next", artist: "B" };
        player.isPlaying = true;
        mediaSessionManager.updateMetadata({ title: "Next", artist: "B" });
        mediaSessionManager.updatePlaybackState(true);
      }),
      onPrev: vi.fn(() => {
        player.currentSong = { title: "Prev", artist: "A" };
        player.isPlaying = true;
        mediaSessionManager.updateMetadata({ title: "Prev", artist: "A" });
        mediaSessionManager.updatePlaybackState(true);
      }),
      onSeek: vi.fn(),
    };

    mediaSessionManager.registerHandlers({
      onPlay: player.onPlay,
      onPause: player.onPause,
      onNextTrack: player.onNext,
      onPreviousTrack: player.onPrev,
      onSeekTo: player.onSeek,
      onSeekForward: player.onSeek,
      onSeekBackward: player.onSeek,
    });
  });

  it("registers every transport action handler", () => {
    for (const a of ["play", "pause", "nexttrack", "previoustrack", "seekto", "seekforward", "seekbackward"]) {
      expect(typeof env.handlers[a]).toBe("function");
    }
  });

  it("notification PAUSE button mirrors UI pause", () => {
    player.isPlaying = true;
    mediaSessionManager.updatePlaybackState(true);
    expect(env.state.playbackState).toBe("playing");

    env.handlers["pause"]!();

    expect(player.onPause).toHaveBeenCalledOnce();
    expect(player.isPlaying).toBe(false);
    expect(env.state.playbackState).toBe("paused");
  });

  it("notification PLAY button mirrors UI resume", () => {
    env.handlers["play"]!();
    expect(player.onPlay).toHaveBeenCalledOnce();
    expect(player.isPlaying).toBe(true);
    expect(env.state.playbackState).toBe("playing");
  });

  it("notification NEXT button advances the song and updates metadata", () => {
    env.handlers["nexttrack"]!();
    expect(player.onNext).toHaveBeenCalledOnce();
    expect(player.currentSong).toEqual({ title: "Next", artist: "B" });
    expect(env.state.metadata?.title).toBe("Next");
    expect(env.state.playbackState).toBe("playing");
  });

  it("notification PREVIOUS button rewinds the song and updates metadata", () => {
    env.handlers["previoustrack"]!();
    expect(player.onPrev).toHaveBeenCalledOnce();
    expect(player.currentSong).toEqual({ title: "Prev", artist: "A" });
    expect(env.state.metadata?.title).toBe("Prev");
  });

  it("seekto forwards the requested position", () => {
    env.handlers["seekto"]!({ seekTime: 42 });
    expect(player.onSeek).toHaveBeenCalledWith(42);
  });

  it("full real-app flow: play → pause → resume → next → prev stays in sync", () => {
    // user taps play in UI
    player.onPlay();
    expect(env.state.playbackState).toBe("playing");

    // user taps pause on the notification
    env.handlers["pause"]!();
    expect(env.state.playbackState).toBe("paused");
    expect(player.isPlaying).toBe(false);

    // user taps play on the notification
    env.handlers["play"]!();
    expect(env.state.playbackState).toBe("playing");
    expect(player.isPlaying).toBe(true);

    // user taps next on the notification
    env.handlers["nexttrack"]!();
    expect(player.currentSong?.title).toBe("Next");

    // user taps prev on the notification
    env.handlers["previoustrack"]!();
    expect(player.currentSong?.title).toBe("Prev");

    // metadata + playbackState stayed in lockstep throughout
    expect(env.state.metadata?.title).toBe("Prev");
    expect(env.state.playbackState).toBe("playing");
  });

  it("position state mirrors audio progress (lock-screen seek bar)", () => {
    mediaSessionManager.updatePositionState(30, 180, 1);
    expect(env.state.position).toEqual({ duration: 180, position: 30, playbackRate: 1 });
  });
});
