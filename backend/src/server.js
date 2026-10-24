import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:8080")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin not allowed"));
}, credentials: false }));
app.use(express.json({ limit: "32kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

const songSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  artist: { type: String, required: true, trim: true, maxlength: 180 },
  imageUrl: { type: String, required: true }, audioUrl: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 }, album: { type: String, trim: true, maxlength: 180 },
  year: { type: Number, min: 1800, max: 2200 }, genre: { type: String, trim: true, maxlength: 80 },
  language: { type: String, trim: true, maxlength: 80 }, sync: { type: String, trim: true, maxlength: 80 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true, strict: "throw" });
songSchema.index({ isPublished: 1, title: 1, artist: 1 });
const Song = mongoose.models.Song || mongoose.model("Song", songSchema);

const mongoUri = process.env.MONGODB_URI;
if (mongoUri) mongoose.connect(mongoUri).then(() => console.info("MongoDB connected")).catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exitCode = 1;
});

const authClient = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;
async function requireAdmin(req, res, next) {
  try {
    const token = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token || !authClient) return res.status(401).json({ error: "Authentication required" });
    const { data, error } = await authClient.auth.getUser(token);
    const allowed = (process.env.ADMIN_USER_IDS || "").split(",").map((id) => id.trim()).filter(Boolean);
    if (error || !data.user || !allowed.includes(data.user.id)) return res.status(403).json({ error: "Administrator access required" });
    req.admin = data.user;
    return next();
  } catch {
    return res.status(401).json({ error: "Authentication could not be verified" });
  }
}

const songInput = z.object({
  id: z.string().trim().min(1).max(120).optional(), title: z.string().trim().min(1).max(180),
  artist: z.string().trim().min(1).max(180),
  imageUrl: z.string().url().refine((value) => new URL(value).protocol === "https:" && /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(new URL(value).pathname + new URL(value).search), "HTTPS image URL required"),
  audioUrl: z.string().url().refine((value) => new URL(value).protocol === "https:" && /\.mp3(?:$|\?)/i.test(new URL(value).pathname + new URL(value).search), "HTTPS MP3 URL required"),
  duration: z.number().int().positive(), album: z.string().max(180).optional(),
  year: z.number().int().min(1800).max(2200).optional(), genre: z.string().max(80).optional(),
  language: z.string().max(80).optional(), sync: z.string().max(80).optional(), isPublished: z.boolean().optional(),
}).strict();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024, files: 2, fields: 4 }, fileFilter: (_req, file, cb) => {
  const allowed = file.fieldname === "audio" ? ["audio/mpeg", "audio/mp3"] : ["image/jpeg", "image/png", "image/webp"];
  cb(allowed.includes(file.mimetype) ? null : new Error("Unsupported upload type"), allowed.includes(file.mimetype));
} });
const cloudinaryReady = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (cloudinaryReady) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
function uploadBuffer(buffer, resourceType, folder) {
  return new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ resource_type: resourceType, folder, filename_override: `${Date.now()}`, use_filename: false, unique_filename: true }, (error, result) => error ? reject(error) : resolve(result)).end(buffer));
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/ready", (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ ready: mongoose.connection.readyState === 1 }));
app.get("/api/songs", async (req, res, next) => {
  try {
    const page = Math.max(1, Math.min(10000, Number.parseInt(String(req.query.page || "1"), 10) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(String(req.query.limit || "50"), 10) || 50));
    const query = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
    const filter = { isPublished: true };
    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["title", "artist", "album", "genre", "language"].map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
    }
    const [songs, total] = await Promise.all([Song.find(filter).sort({ title: 1 }).skip((page - 1) * limit).limit(limit).lean(), Song.countDocuments(filter)]);
    res.json({ data: songs, page, limit, total });
  } catch (error) { next(error); }
});
app.get("/api/songs/:id", async (req, res, next) => {
  try { const song = await Song.findOne({ id: req.params.id, isPublished: true }).lean(); return song ? res.json({ data: song }) : res.status(404).json({ error: "Song not found" }); }
  catch (error) { next(error); }
});
app.get("/api/admin/songs", requireAdmin, async (_req, res, next) => {
  try { const songs = await Song.find({}).sort({ updatedAt: -1 }).lean(); res.json({ data: songs }); }
  catch (error) { next(error); }
});
app.post("/api/admin/songs", requireAdmin, async (req, res, next) => {
  try { const parsed = songInput.parse(req.body); const song = await Song.create({ ...parsed, id: parsed.id || new mongoose.Types.ObjectId().toString() }); res.status(201).json({ data: song }); }
  catch (error) { if (error?.code === 11000) return res.status(409).json({ error: "Song id already exists" }); next(error); }
});
app.patch("/api/admin/songs/:id", requireAdmin, async (req, res, next) => {
  try { const parsed = songInput.partial().strict().parse(req.body); const song = await Song.findOneAndUpdate({ id: req.params.id }, { $set: parsed }, { new: true, runValidators: true }); return song ? res.json({ data: song }) : res.status(404).json({ error: "Song not found" }); }
  catch (error) { next(error); }
});
app.delete("/api/admin/songs/:id", requireAdmin, async (req, res, next) => {
  try { const result = await Song.deleteOne({ id: req.params.id }); return result.deletedCount ? res.status(204).end() : res.status(404).json({ error: "Song not found" }); }
  catch (error) { next(error); }
});
app.post("/api/admin/uploads", requireAdmin, (req, res, next) => upload.fields([{ name: "audio", maxCount: 1 }, { name: "cover", maxCount: 1 }])(req, res, (error) => error ? res.status(400).json({ error: "Invalid or oversized upload" }) : next()), async (req, res, next) => {
  try {
    if (!cloudinaryReady) return res.status(503).json({ error: "Media storage is not configured" });
    const files = req.files || {};
    if (!files.audio?.[0] || !files.cover?.[0]) return res.status(400).json({ error: "MP3 audio and cover image are required" });
    const [audioType, imageType] = await Promise.all([fileTypeFromBuffer(files.audio[0].buffer), fileTypeFromBuffer(files.cover[0].buffer)]);
    if (audioType?.mime !== "audio/mpeg" || !["image/jpeg", "image/png", "image/webp"].includes(imageType?.mime || "")) return res.status(400).json({ error: "File contents do not match supported MP3/image formats" });
    const [audio, image] = await Promise.all([uploadBuffer(files.audio[0].buffer, "video", "roi-music/audio"), uploadBuffer(files.cover[0].buffer, "image", "roi-music/covers")]);
    res.status(201).json({ data: { audioUrl: audio.secure_url, imageUrl: image.secure_url } });
  } catch (error) { next(error); }
});
app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request data", details: error.issues.map((issue) => ({ path: issue.path, message: issue.message })) });
  console.error("API error:", error.message);
  return res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.info(`ROI Music API listening on ${port}`));
