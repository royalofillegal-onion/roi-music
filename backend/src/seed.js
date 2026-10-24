import "dotenv/config";
import mongoose from "mongoose";

const songs = [
  { id: "Night Changes", title: "Night Changes", artist: ".", imageUrl: "https://res.cloudinary.com/duux8y9nt/image/upload/v1781535307/IMG_20260615_202457_ew8xao.jpg", audioUrl: "https://res.cloudinary.com/duux8y9nt/video/upload/v1781535231/Night_Changes_x_Tu_Jaane_Na_Mashup_KoshalWorld.Com_eujuom.mp3", duration: 274, album: "Night Changes", year: 2014, genre: "pop", language: "English", sync: "flok", isPublished: true },
  { id: "aura-hiphop-tamizha", title: "Aura (Hiphop Tamizha)", artist: "Aura 10/10", imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1782115827/Aura-10-10-Meesaya-Murukku-2-Songs_nnlroy.jpg", audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1782115829/Aura_i27v00.mp3", duration: 128, album: "Aura", year: 2026, genre: ".", language: "Tamil", sync: ".", isPublished: true },
  { id: "ganapathi-bappa-suraj-jagan", title: "Ganapathi Bappa (Suraj Jagan)", artist: "Iddarammayiatho", imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1782126392/OIP_dynpu2.jpg", audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1782126378/Ganapathi_Bappa-SenSongsMp3.Com_qbgsjj.mp3", duration: 210, album: "Ganapathi Bappa", year: 2013, genre: ".", language: "Telugu", sync: ".", isPublished: true },
];

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI before seeding.");
await mongoose.connect(process.env.MONGODB_URI);
const Song = mongoose.models.Song || mongoose.model("Song", new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true }, title: { type: String, required: true }, artist: { type: String, required: true },
  imageUrl: { type: String, required: true }, audioUrl: { type: String, required: true }, duration: { type: Number, required: true },
  album: String, year: Number, genre: String, language: String, sync: String, isPublished: { type: Boolean, default: true },
}, { timestamps: true }));
await Song.bulkWrite(songs.map((song) => ({ updateOne: { filter: { id: song.id }, update: { $set: song }, upsert: true } })));
console.info(`Seeded ${songs.length} sample songs (metadata only).`);
await mongoose.disconnect();
