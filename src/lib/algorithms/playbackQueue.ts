import { Song } from '@/data/Song';

/**
 * FIFO (First In, First Out) Queue for sequential playlist playback.
 * Songs play in the exact order they are added.
 * 
 * Supports:
 * - enqueue / dequeue (FIFO)
 * - priority insert (play next)
 * - peek without removing
 * - reorder by index
 * - circular mode (loops back to start)
 */
export class PlaybackQueue {
  private items: Song[] = [];
  private history: Song[] = [];
  private maxHistory = 50;

  constructor(initialSongs: Song[] = []) {
    this.items = [...initialSongs];
  }

  /** Add song to end of queue (FIFO enqueue) */
  enqueue(song: Song): void {
    this.items.push(song);
  }

  /** Add multiple songs to end of queue */
  enqueueMany(songs: Song[]): void {
    this.items.push(...songs);
  }

  /** Remove and return the first song (FIFO dequeue) */
  dequeue(): Song | null {
    const song = this.items.shift() ?? null;
    if (song) {
      this.history.push(song);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }
    return song;
  }

  /** Insert song to play next (priority position) */
  playNext(song: Song): void {
    this.items.unshift(song);
  }

  /** Insert multiple songs to play next */
  playNextMany(songs: Song[]): void {
    this.items.unshift(...songs);
  }

  /** See what's next without removing it */
  peek(): Song | null {
    return this.items[0] ?? null;
  }

  /** Remove a specific song by ID */
  remove(songId: string): boolean {
    const index = this.items.findIndex(s => s.id === songId);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  /** Move a song from one position to another */
  reorder(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.items.length) return;
    if (toIndex < 0 || toIndex >= this.items.length) return;
    const [song] = this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, song);
  }

  /** Clear all songs from queue */
  clear(): void {
    this.items = [];
  }

  /** Get the previous song from history */
  getPrevious(): Song | null {
    return this.history.pop() ?? null;
  }

  /** Get all items in queue (read-only snapshot) */
  getAll(): Song[] {
    return [...this.items];
  }

  /** Get play history */
  getHistory(): Song[] {
    return [...this.history];
  }

  get length(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Replace entire queue contents */
  replace(songs: Song[]): void {
    this.items = [...songs];
  }
}
