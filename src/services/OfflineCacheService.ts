// Advanced Offline Audio Cache Service using IndexedDB

const DB_NAME = 'roi-music-offline';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio-cache';
const METADATA_STORE = 'song-metadata';
const MAX_CACHE_SIZE = 50; // Max songs to cache

interface CachedSong {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  audioBlob?: Blob;
  cachedAt: number;
  lastPlayed: number;
  playCount: number;
  size: number;
}

class OfflineCacheService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private cacheQueue: Set<string> = new Set();

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          console.error('Failed to open IndexedDB');
          resolve(false);
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          console.log('Offline cache service initialized');
          resolve(true);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Audio blob store
          if (!db.objectStoreNames.contains(AUDIO_STORE)) {
            db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
          }
          
          // Metadata store for quick access
          if (!db.objectStoreNames.contains(METADATA_STORE)) {
            const metaStore = db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
            metaStore.createIndex('cachedAt', 'cachedAt', { unique: false });
            metaStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
            metaStore.createIndex('playCount', 'playCount', { unique: false });
          }
        };
      } catch (error) {
        console.error('IndexedDB not available:', error);
        resolve(false);
      }
    });
  }

  async cacheSong(song: { id: string; title: string; artist: string; audioUrl: string; imageUrl?: string }): Promise<boolean> {
    if (!this.db || this.cacheQueue.has(song.id)) return false;
    
    // Check if already cached
    const existing = await this.getCachedSong(song.id);
    if (existing?.audioBlob) {
      // Update last played
      await this.updatePlayStats(song.id);
      return true;
    }

    this.cacheQueue.add(song.id);

    try {
      // Fetch audio file
      const response = await fetch(song.audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio');
      
      const audioBlob = await response.blob();
      const size = audioBlob.size;

      // Ensure we have space
      await this.ensureCacheSpace(size);

      const cachedSong: CachedSong = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        audioUrl: song.audioUrl,
        imageUrl: song.imageUrl,
        audioBlob,
        cachedAt: Date.now(),
        lastPlayed: Date.now(),
        playCount: 1,
        size
      };

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([AUDIO_STORE, METADATA_STORE], 'readwrite');
        
        // Store audio blob
        const audioStore = transaction.objectStore(AUDIO_STORE);
        audioStore.put({ id: song.id, audioBlob });

        // Store metadata
        const metaStore = transaction.objectStore(METADATA_STORE);
        const { audioBlob: _, ...metadata } = cachedSong;
        metaStore.put(metadata);

        transaction.oncomplete = () => {
          this.cacheQueue.delete(song.id);
          console.log(`Cached song for offline: ${song.title}`);
          resolve(true);
        };

        transaction.onerror = () => {
          this.cacheQueue.delete(song.id);
          console.error('Failed to cache song:', song.title);
          resolve(false);
        };
      });
    } catch (error) {
      this.cacheQueue.delete(song.id);
      console.error('Error caching song:', error);
      return false;
    }
  }

  async getCachedSong(songId: string): Promise<CachedSong | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([AUDIO_STORE, METADATA_STORE], 'readonly');
        
        const metaStore = transaction.objectStore(METADATA_STORE);
        const metaRequest = metaStore.get(songId);
        
        metaRequest.onsuccess = () => {
          const metadata = metaRequest.result;
          if (!metadata) {
            resolve(null);
            return;
          }

          const audioStore = transaction.objectStore(AUDIO_STORE);
          const audioRequest = audioStore.get(songId);
          
          audioRequest.onsuccess = () => {
            const audioData = audioRequest.result;
            resolve({
              ...metadata,
              audioBlob: audioData?.audioBlob
            });
          };
          
          audioRequest.onerror = () => resolve(metadata);
        };
        
        metaRequest.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async getOfflineAudioUrl(songId: string): Promise<string | null> {
    const cached = await this.getCachedSong(songId);
    if (cached?.audioBlob) {
      await this.updatePlayStats(songId);
      return URL.createObjectURL(cached.audioBlob);
    }
    return null;
  }

  async isOfflineAvailable(songId: string): Promise<boolean> {
    const cached = await this.getCachedSong(songId);
    return !!cached?.audioBlob;
  }

  async getAllCachedSongs(): Promise<CachedSong[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(METADATA_STORE, 'readonly');
        const store = transaction.objectStore(METADATA_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          const songs = request.result || [];
          resolve(songs.sort((a, b) => b.lastPlayed - a.lastPlayed));
        };

        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    const songs = await this.getAllCachedSongs();
    return {
      count: songs.length,
      totalSize: songs.reduce((acc, s) => acc + (s.size || 0), 0)
    };
  }

  private async updatePlayStats(songId: string): Promise<void> {
    if (!this.db) return;

    const cached = await this.getCachedSong(songId);
    if (!cached) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(METADATA_STORE, 'readwrite');
      const store = transaction.objectStore(METADATA_STORE);
      
      store.put({
        ...cached,
        audioBlob: undefined,
        lastPlayed: Date.now(),
        playCount: (cached.playCount || 0) + 1
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  private async ensureCacheSpace(neededSize: number): Promise<void> {
    const songs = await this.getAllCachedSongs();
    
    if (songs.length >= MAX_CACHE_SIZE) {
      // Remove least recently played songs
      const toRemove = songs
        .sort((a, b) => a.lastPlayed - b.lastPlayed)
        .slice(0, Math.ceil(MAX_CACHE_SIZE * 0.2));
      
      for (const song of toRemove) {
        await this.removeCachedSong(song.id);
      }
    }
  }

  async removeCachedSong(songId: string): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([AUDIO_STORE, METADATA_STORE], 'readwrite');
        
        transaction.objectStore(AUDIO_STORE).delete(songId);
        transaction.objectStore(METADATA_STORE).delete(songId);

        transaction.oncomplete = () => {
          console.log(`Removed cached song: ${songId}`);
          resolve(true);
        };
        
        transaction.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async clearAllCache(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([AUDIO_STORE, METADATA_STORE], 'readwrite');
        
        transaction.objectStore(AUDIO_STORE).clear();
        transaction.objectStore(METADATA_STORE).clear();

        transaction.oncomplete = () => {
          console.log('All cache cleared');
          resolve();
        };
        
        transaction.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const offlineCacheService = new OfflineCacheService();
