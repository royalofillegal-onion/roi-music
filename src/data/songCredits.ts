// Detailed song credits and metadata
export interface SongCredits {
  songId: string;
  singer: string;
  musicDirector: string;
  lyricist: string;
  movie: string;
  programmers?: string[];
  additionalProgramming?: string;
  rhythm?: string;
  strings?: string;
  guitar?: string;
  bass?: string;
  assistants?: string[];
  recordedAt?: string;
  recordedBy?: string;
  studioAssistant?: string;
  masteredBy?: string;
  cast?: string[];
  technicalCrew?: {
    director?: string;
    producer?: string;
    screenplay?: string;
    dop?: string;
    choreographer?: string;
    artDirector?: string;
    pro?: string;
  };
}

// Credits database - add credits for each song here
export const songCreditsData: Record<string, SongCredits> = {
  "Poyiraa Mama": {
    songId: "Poyiraa Mama",
    singer: "Sid Sriram",
    musicDirector: "Anup Rubens",
    lyricist: "Balaji",
    movie: "Kubera",
    programmers: ["Anup Rubens"],
    additionalProgramming: "Rakesh",
    rhythm: "Vikram",
    strings: "Tapas",
    guitar: "Sunny",
    bass: "Sunny",
    assistants: ["Abhishek"],
    recordedAt: "Harmony Studios",
    recordedBy: "Rexson Vejendla",
    studioAssistant: "Reddy",
    masteredBy: "Shadab Rayeen",
    cast: [
      "Akkineni Nagarjuna",
      "Akkineni Naga Chaitanya",
      "Ramya Krishna",
      "Krithi Shetty",
      "Rao Ramesh",
      "Brahmaji",
      "Vennela Kishore",
      "Jhansi",
      "Anitha Chowdhary",
      "Rohini",
      "Praveen",
      "Padma Soorya",
      "Ranjith"
    ],
    technicalCrew: {
      director: "Kalyan Krishna Kurasala",
      producer: "Zee Studios, Annapurna Studios",
      screenplay: "Satyanand",
      dop: "Yuvaraj",
      choreographer: "Harish",
      artDirector: "Brahma Kadali",
      pro: "Vamsi-Shekar"
    }
  },
  "Kalyani Vaccha Vacchaa": {
    songId: "Kalyani Vaccha Vacchaa",
    singer: "Sid Sriram",
    musicDirector: "Gopi Sundar",
    lyricist: "Anantha Sriram",
    movie: "Family Star"
  }
};

// Helper function to get credits for a song
export const getSongCredits = (songId: string): SongCredits | undefined => {
  return songCreditsData[songId];
};

// Helper function to get all songs by a singer
export const getSongsBySinger = (singerName: string): string[] => {
  return Object.values(songCreditsData)
    .filter(credit => credit.singer.toLowerCase().includes(singerName.toLowerCase()))
    .map(credit => credit.songId);
};

// Helper function to get all songs by music director
export const getSongsByMusicDirector = (directorName: string): string[] => {
  return Object.values(songCreditsData)
    .filter(credit => credit.musicDirector.toLowerCase().includes(directorName.toLowerCase()))
    .map(credit => credit.songId);
};

// Get unique singers
export const getAllSingers = (): string[] => {
  const singers = new Set<string>();
  Object.values(songCreditsData).forEach(credit => {
    singers.add(credit.singer);
  });
  return Array.from(singers);
};

// Get unique music directors
export const getAllMusicDirectors = (): string[] => {
  const directors = new Set<string>();
  Object.values(songCreditsData).forEach(credit => {
    directors.add(credit.musicDirector);
  });
  return Array.from(directors);
};
