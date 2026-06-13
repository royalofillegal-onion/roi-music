export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  year?: number;
  language?: 'telugu' | 'hindi' | 'tamil' | 'kannada' | 'other';
  sync?: 'sad' | 'love' | 'break' | 'happy' | 'devotional' | 'feel1' | 'action' | 'romantic' | 'friend' | 'dance' | 'folk' | 'mass' | 'party' | 'classical' | 'rap' | 'moti' | '.' | 'mother' | 'normal' | 'good' | 'Rap' | 'Feel' | 'Sad' | 'Love' | '9';
}

export const additionalSongs: Song[] = [
  {
  id: "Bagavad geetha-1",
  title: "Bagavad geetha-1",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383234/videoplayback_tfbvti.mp4",
  duration: 556,
  album: "Bagavad geetha-1",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-2",
  title: "Bagavad geetha-2",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383512/videoplayback_3_n8okb4.mp4",
  duration: 1008,
  album: "Bagavad geetha-2",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-3",
  title: "Bagavad geetha-3",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383236/videoplayback_1_rx1y6t.mp4",
  duration: 645,
  album: "Bagavad geetha-3",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-4",
  title: "Bagavad geetha-4",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764383547/videoplayback_2_razn2i.mp4",
  duration: 655,
  album: "Bagavad geetha-4",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-5",
  title: "Bagavad geetha-5",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764480896/videoplayback_4_ducxyc.mp4",
  duration: 453,
  album: "Bagavad geetha-5",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-6",
  title: "Bagavad geetha-6",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764481070/videoplayback_5_sgrbpg.mp4",
  duration: 668,
  album: "Bagavad geetha-6",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-7",
  title: "Bagavad geetha-7",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482065/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_7_%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%9C%E0%B1%8D%E0%B0%9E%E0%B0%BE%E0%B0%A8_%E0%B0%B5%E0%B0%BF%E0%B0%9C%E0%B1%8D%E0%B0%9E%E0%B0%BE%E0%B0%A8_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_bT8XMoBsZS4_bqnkfx.mp3",
  duration: 439,
  album: "Bagavad geetha-7",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-8",
  title: "Bagavad geetha-8",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764481259/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_8_%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%85%E0%B0%95%E0%B1%8D%E0%B0%B7%E0%B0%B0_%E0%B0%AC%E0%B1%8D%E0%B0%B0%E0%B0%B9%E0%B1%8D%E0%B0%AE%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_BowVnBxPekI_uldwcp.mp3",
  duration: 434,
  album: "Bagavad geetha-8",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-9",
  title: "Bagavad geetha-9",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482121/videoplayback_6_ulofp9.mp4",
  duration: 545,
  album: "Bagavad geetha-9",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-10",
  title: "Bagavad geetha-10",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482081/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_10_%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%B5%E0%B0%BF%E0%B0%AD%E0%B1%82%E0%B0%A4%E0%B0%BF_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_dkQ32tjMlJs_dazsan.mp3",
  duration: 524,
  album: "Bagavad geetha-10",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-11",
  title: "Bagavad geetha-11",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482108/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_11%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%B5%E0%B0%BF%E0%B0%B6%E0%B1%8D%E0%B0%B5%E0%B0%B0%E0%B1%82%E0%B0%AA_%E0%B0%A6%E0%B0%B0%E0%B1%8D%E0%B0%B6%E0%B0%A8_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_lH1PCanA1Dg_mdx44y.mp3",
  duration: 873,
  album: "Bagavad geetha-11",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-12",
  title: "Bagavad geetha-12",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482082/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_12%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%AD%E0%B0%95%E0%B1%8D%E0%B0%A4%E0%B0%BF_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_021SkcNJHNQ_dazgnx.mp3",
  duration: 324,
  album: "Bagavad geetha-12",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-13",
  title: "Bagavad geetha-13",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482053/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_13%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%95%E0%B1%8D%E0%B0%B7%E0%B1%87%E0%B0%A4%E0%B1%8D%E0%B0%B0_%E0%B0%95%E0%B1%8D%E0%B0%B7%E0%B1%87%E0%B0%A4%E0%B1%8D%E0%B0%B0%E0%B0%9C%E0%B1%8D%E0%B0%9E_%E0%B0%B5%E0%B0%BF%E0%B0%AD%E0%B0%BE%E0%B0%97_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_1afyZBGBbD4_m92rd2.mp3",
  duration: 538,
  album: "Bagavad geetha-13",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-14",
  title: "Bagavad geetha-14",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482077/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_14%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%97%E0%B1%81%E0%B0%A3%E0%B0%A4%E0%B1%8D%E0%B0%B0%E0%B0%AF_%E0%B0%B5%E0%B0%BF%E0%B0%AD%E0%B0%BE%E0%B0%97_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_xVqpHUjb4yc_n4qcwg.mp3",
  duration: 388,
  album: "Bagavad geetha-14",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-15",
  title: "Bagavad geetha-15",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482087/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_15%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%AA%E0%B1%81%E0%B0%B0%E0%B1%81%E0%B0%B7%E0%B1%8B%E0%B0%A4%E0%B1%8D%E0%B0%A4%E0%B0%AE_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_zZ9j4MKJyh8_dktwtv.mp3",
  duration: 352,
  album: "Bagavad geetha-15",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-16",
  title: "Bagavad geetha-16",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482104/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_16%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%A6%E0%B1%88%E0%B0%B5%E0%B0%BE%E0%B0%B8%E0%B1%81%E0%B0%B0_%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B0%A6%E0%B1%8D%E0%B0%B5%E0%B0%BF%E0%B0%AD%E0%B0%BE%E0%B0%97_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_d_ter_Imy4U_a1g1og.mp3",
  duration: 384,
  album: "Bagavad geetha-16",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-17",
  title: "Bagavad geetha-17",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482113/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_17%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%B6%E0%B1%8D%E0%B0%B0%E0%B0%A6%E0%B1%8D%E0%B0%A6%E0%B0%BE%E0%B0%A4%E0%B1%8D%E0%B0%B0%E0%B0%AF_%E0%B0%B5%E0%B0%BF%E0%B0%AD%E0%B0%BE%E0%B0%97_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_i8jfmzEyzKQ_qj9nnr.mp3",
  duration: 430,
  album: "Bagavad geetha-17",
  year: 2025,
  genre: "9"
},
  {
  id: "Bagavad geetha-18",
  title: "Bagavad geetha-18",
  artist: "Bagavad Geetha",
  imageUrl: "https://res.cloudinary.com/dykzuljjr/image/upload/v1764383358/bhagvad-gita_c3enot.jpg",
  audioUrl: "https://res.cloudinary.com/dykzuljjr/video/upload/v1764482131/%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%82%E0%B0%B0%E0%B1%8D%E0%B0%A3_%E0%B0%AD%E0%B0%97%E0%B0%B5%E0%B0%A6%E0%B1%8D%E0%B0%97%E0%B1%80%E0%B0%A4_18%E0%B0%B5_%E0%B0%85%E0%B0%A7%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%AF%E0%B0%82_%E0%B0%AE%E0%B1%8B%E0%B0%95%E0%B1%8D%E0%B0%B7_%E0%B0%B8%E0%B0%A8%E0%B1%8D%E0%B0%AF%E0%B0%BE%E0%B0%B8_%E0%B0%AF%E0%B1%8B%E0%B0%97%E0%B0%82____Bhagavad_Gita_Telugu____RP_patnaik_Oy_oqnWgK44_xaywdh.mp3",
  duration: 1120,
  album: "Bagavad geetha-18",
  year: 2025,
  genre: "9"
}
];
