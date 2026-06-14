// Singers data with descriptions and images
export interface Singer {
  name: string;
  image: string;
  description: string;
  genres: string[];
  display?: boolean;
}

// Featured singers list
export const featuredSingers: Singer[] = [
  {
    name: "Sid Sriram",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/sid-sriram_placeholder.jpg",
    description: "Playback singer known for soulful melodies in Telugu, Tamil & Hindi cinema",
    genres: [""],
    display: true
  },
  {
    name: "Anurag Kulkarni",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/anurag-kulkarni_placeholder.jpg",
    description: "Versatile singer famous for devotional and mass songs",
    genres: [""],
    display: true
  },
  {
    name: "Ram Miriyala",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/ram-miriyala_placeholder.jpg",
    description: "Popular Telugu playback singer known for energetic mass numbers",
    genres: [""],
    display: true
  },
  {
    name: "S.P. Balasubrahmanyam",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/spb_placeholder.jpg",
    description: "Legendary playback singer with 40,000+ songs across multiple languages",
    genres: [""],
    display: true
  },
  {
    name: "Kaala Bhairava",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/kaala-bhairava_placeholder.jpg",
    description: "Singer and composer known for unique style and mass songs",
    genres: [""],
    display: true
  },
  {
    name: "Sri Krishna",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/sri-krishna_placeholder.jpg",
    description: "Playback singer known for energetic and fun party tracks",
    genres: [""],
    display: true
  },
  {
    name: "Neha Kakkar",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/neha-kakkar_placeholder.jpg",
    description: "Bollywood playback singer known for peppy dance numbers",
    genres: [""],
    display: true
  }
];

// Music directors list
export const featuredMusicDirectors: Singer[] = [
  {
    name: "Thaman S",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/thaman_placeholder.jpg",
    description: "Award-winning music director known for mass and commercial hits",
    genres: [""],
    display: true
  },
  {
    name: "Anirudh Ravichander",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/anirudh_placeholder.jpg",
    description: "Popular music composer known for trendy and youth-centric music",
    genres: [""],
    display: true
  },
  {
    name: "Devi Sri Prasad",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/dsp_placeholder.jpg",
    description: "Rockstar composer famous for energetic and catchy tunes",
    genres: [""],
    display: true
  },
  {
    name: "Gopi Sundar",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/gopi-sundar_placeholder.jpg",
    description: "Composer known for melodious and soulful compositions",
    genres: [""],
    display: true
  },
  {
    name: "Yuvan Shankar Raja",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/yuvan_placeholder.jpg",
    description: "Legendary composer known for revolutionary music style",
    genres: [""],
    display: true
  },
  {
    name: "Keeravani",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/keeravani_placeholder.jpg",
    description: "Oscar-winning composer known for classical and devotional music",
    genres: [""],
    display: true
  },
  {
    name: "Anup Rubens",
    image: "https://res.cloudinary.com/dilqrz7sw/image/upload/v1752628146/anup-rubens_placeholder.jpg",
    description: "Composer known for melodious and emotional compositions",
    genres: [""],
    display: true
  }
];

// Get visible singers
export const visibleSingers = featuredSingers.filter(s => s.display !== false);
export const visibleMusicDirectors = featuredMusicDirectors.filter(m => m.display !== false);
