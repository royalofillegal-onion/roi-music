import { describe, it, expect } from "vitest";
import { PlaybackQueue } from "@/lib/algorithms/playbackQueue";
import type { Song } from "@/data/Song";

const s = (id: string): Song => ({ id, title: id, artist: "a", imageUrl: "", audioUrl: "https://x/" + id, duration: 1 });

describe("queue transitions", () => {
  it("plays in order and tracks history for previous", () => {
    const q = new PlaybackQueue([s("1"), s("2"), s("3")]);
    expect(q.dequeue()?.id).toBe("1");
    expect(q.dequeue()?.id).toBe("2");
    expect(q.getPrevious()?.id).toBe("2");
    expect(q.peek()?.id).toBe("3");
  });
  it("play next jumps the line", () => {
    const q = new PlaybackQueue([s("1"), s("2")]);
    q.playNext(s("9"));
    expect(q.dequeue()?.id).toBe("9");
  });
  it("empties cleanly at the end", () => {
    const q = new PlaybackQueue([s("1")]);
    q.dequeue();
    expect(q.dequeue()).toBeNull();
    expect(q.isEmpty).toBe(true);
  });
});
