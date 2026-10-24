import { describe, expect, it } from "vitest";
import { z } from "zod";

const songInput = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().min(1).max(180),
  artist: z.string().trim().min(1).max(180),
  imageUrl: z.string().url().refine((value) => new URL(value).protocol === "https:" && /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(new URL(value).pathname + new URL(value).search)),
  audioUrl: z.string().url().refine((value) => new URL(value).protocol === "https:" && /\.mp3(?:$|\?)/i.test(new URL(value).pathname + new URL(value).search)),
  duration: z.number().int().positive(),
  album: z.string().max(180).optional(), year: z.number().int().min(1800).max(2200).optional(),
  genre: z.string().max(80).optional(), language: z.string().max(80).optional(), isPublished: z.boolean().optional(),
}).strict();

const validSong = {
  title: "Test", artist: "Test Artist", imageUrl: "https://media.example/cover.jpg",
  audioUrl: "https://media.example/test.mp3", duration: 123, isPublished: true,
};

describe("song input validation", () => {
  it("accepts valid metadata and HTTPS media URLs", () => {
    expect(songInput.parse(validSong).title).toBe("Test");
  });
  it("rejects unsupported protocols and non-MP3 audio", () => {
    expect(songInput.safeParse({ ...validSong, audioUrl: "http://media.example/test.mp3" }).success).toBe(false);
    expect(songInput.safeParse({ ...validSong, audioUrl: "https://media.example/test.wav" }).success).toBe(false);
  });
  it("rejects unknown fields and invalid durations", () => {
    expect(songInput.safeParse({ ...validSong, password: "never" }).success).toBe(false);
    expect(songInput.safeParse({ ...validSong, duration: 0 }).success).toBe(false);
  });
});
