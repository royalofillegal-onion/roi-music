import { Song } from './songs';

// Trending songs that can be easily updated and managed
export const trendingSongs: Song[] = [
    {
      id: "Choodu Choodu",
      title: "Choodu Choodu",
      artist: "Godari Gattupaina",
      imageUrl: "https://res.cloudinary.com/dd6xwej67/image/upload/v1781363420/Godari-Gattupaina-Telugu-2026-20260505103547-500x500-1_mrv3zu.jpg",
      audioUrl: "https://res.cloudinary.com/dd6xwej67/video/upload/v1781363631/Choodu-Choodu-Naga-Vamshi-NaaSongs_cxbtlg.mp3",
      duration: 333,
      album: "Sahana Sahana",
      year: 2026,
      genre: "Melody",
      language: "telugu",
      sync: "love"
    },
  {
    id: "Chinni Gundelo",
    title: "Chinni Gundelo",
    artist: "Andhra King Taluka",
    imageUrl: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1764302605/chinni-gundelo-andhra-king-taluka_tbnig6.jpg",
    audioUrl: "https://res.cloudinary.com/dilqrz7sw/video/upload/v1764298267/Chinni_Gundelo_wsdnmm.mp3",
    duration: 219,
    album: "Nuvvunte Chaley",
    year: 2025,
    genre: ".",
    language: "telugu",
    sync: "romantic"
  }
];

// Export individual songs for easy access and modification
export const monicatelugu = trendingSongs[0];
export const nuvvuntechaley = trendingSongs[1];
export const minnalvala = trendingSongs[2];
export const omnamobhagavatevasudevaya = trendingSongs[3];
export const hridayamlopala = trendingSongs[4];
export const naakoduka = trendingSongs[5];
export const viralvayyari = trendingSongs[6];
