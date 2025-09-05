// Artist data file - Add/remove artists here to control what appears on the site
export interface Artist {
  name: string;
  image?: string; // Optional - will use first song's image if not provided
}

// Add or remove artists from this list to control homepage display
export const featuredArtists: Artist[] = [
  { name: "Mirai" },
  { name: "Andhra King Taluka" },
  { name: "Monica" },
  { name: "Kingdom" },
  { name: "Mahavatar Narsimha" },
  { name: "OG" },
  { name: "Devi Sri Prasad" },
  { name: "Anirudh Ravichander" },
  { name: "Thaman S" },
  { name: "Sid Sriram" },
  { name: "Shreya Ghoshal" },
  { name: "Armaan Malik" },
  { name: "Arijit Singh" },
  { name: "KK" },
  { name: "Sonu Nigam" }
];