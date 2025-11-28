// Artist data file - Add/remove artists here to control what appears on the site
export interface Artist {
  name: string;
  image?: string; // Optional - will use first song's image if not provided
  display?: boolean; // Control visibility dynamically
}

// Display control for featured artists section
export const displayFeaturedArtists = true; // Set to false to hide all artists

// Add or remove artists from this list to control homepage display
export const featuredArtists: Artist[] = [
  { name: "Mirai", display: true },
  { name: "Andhra King Taluka", display: true },
  { name: "Monica", display: true },
  { name: "Kingdom", display: true },
  { name: "Mahavatar Narsimha", display: true },
  { name: "OG", display: true },
  { name: "Devi Sri Prasad", display: true },
  { name: "Anirudh Ravichander", display: true },
  { name: "Thaman S", display: true },
  { name: "Sid Sriram", display: true },
  { name: "Shreya Ghoshal", display: true },
  { name: "Armaan Malik", display: true },
  { name: "Arijit Singh", display: true },
  { name: "KK", display: true },
  { name: "Sonu Nigam", display: true }
];

// Get visible artists based on display flags
export const visibleArtists = displayFeaturedArtists 
  ? featuredArtists.filter(artist => artist.display !== false)
  : [];