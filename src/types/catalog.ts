export interface CatalogArtist {
  id: string;
  name: string;
  image: string;
  monthlyListeners: number;
  bio: string;
}

export interface CatalogAlbum {
  id: string;
  title: string;
  year: number;
  cover: string;
  artistId: string;
}

export interface CatalogSong {
  id: string;
  title: string;
  cover: string;
  audio: string;
  duration: number;
  genre: string;
  language: string;
  artistId: string;
  albumId: string;
}

export interface CatalogPlaylist {
  id: string;
  title: string;
  cover: string;
  songIds: string[];
  gradient: [string, string];
}

export interface MusicCatalog {
  artist: CatalogArtist;
  album: CatalogAlbum;
  songs: CatalogSong[];
  playlists: CatalogPlaylist[];
}

export interface GenreOption {
  id: string;
  label: string;
  gradient: [string, string];
}
