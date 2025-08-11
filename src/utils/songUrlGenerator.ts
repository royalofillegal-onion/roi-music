import { Song } from '@/data/songs';
import { uniqueSongs } from '@/data/allSongs';
import { AppDeepLinks } from './appDeepLinks';

export interface SongUrlData {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  shareUrl: string;
  hashCode: string;
  appDeepLink?: string;
}

export class SongUrlGenerator {
  /**
   * Get the current base URL dynamically
   */
  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://roimusic.netlify.app';
  }

  /**
   * Generate a simple hash from song ID and title
   */
  private static generateHash(song: Song): string {
    const input = `${song.id}-${song.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36).padStart(6, '0').substring(0, 6);
  }

  /**
   * Create a shareable link for a song
   */
  static async createShareLink(song: Song): Promise<string> {
    const baseUrl = this.getBaseUrl();
    const hashCode = this.generateHash(song);
    return `${baseUrl}/share/${hashCode}`;
  }

  /**
   * Create app deep link for a song
   */
  static createAppDeepLink(song: Song): string {
    const hashCode = this.generateHash(song);
    return `roimusic://share/${hashCode}`;
  }

  /**
   * Find song by hash code with multiple fallback methods
   */
  static async getSongFromHash(hashCode: string): Promise<Song | null> {
    console.log('🔍 Looking up song with hash:', hashCode);
    
    // Method 1: Try to find by generated hash
    for (const song of uniqueSongs) {
      const expectedHash = this.generateHash(song);
      if (expectedHash === hashCode) {
        console.log('✅ Found song by hash:', song.title);
        return song;
      }
    }

    // Method 2: Try direct ID match
    const directMatch = uniqueSongs.find(song => song.id === hashCode);
    if (directMatch) {
      console.log('✅ Found song by ID:', directMatch.title);
      return directMatch;
    }

    // Method 3: Try partial match
    const partialMatch = uniqueSongs.find(song => 
      song.id.includes(hashCode) || 
      this.generateHash(song).includes(hashCode)
    );
    if (partialMatch) {
      console.log('✅ Found song by partial match:', partialMatch.title);
      return partialMatch;
    }

    console.log('❌ No song found for hash:', hashCode);
    return null;
  }

  /**
   * Get complete song URL data
   */
  static async getSongUrlData(song: Song): Promise<SongUrlData> {
    const shareUrl = await this.createShareLink(song);
    const hashCode = this.generateHash(song);
    const appDeepLink = this.createAppDeepLink(song);
    
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.imageUrl,
      shareUrl,
      hashCode,
      appDeepLink
    };
  }

  /**
   * Generate share text for social media
   */
  static async generateShareText(song: Song): Promise<string> {
    const url = await this.createShareLink(song);
    
    return `🎵 Check out "${song.title}" by ${song.artist} on RoyalStar Music! 

Listen now: ${url}

#RoyalStarMusic #MusicLovers`;
  }

  /**
   * Generate all sharing options with app deep link support
   */
  static async generateSharingOptions(song: Song) {
    const shareUrl = await this.createShareLink(song);
    const shareText = await this.generateShareText(song);
    const appDeepLink = this.createAppDeepLink(song);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    return {
      url: shareUrl,
      text: shareText,
      appDeepLink,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(`🎵 "${song.title}" by ${song.artist}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(`${song.title} - ${song.artist}`)}&body=${encodedText}`,
      sms: `sms:?body=${encodedText}`,
      copy: shareUrl
    };
  }

  /**
   * Handle smart app redirect with APK detection and prevent multiple reloads
   */
  static handleSmartRedirect(hashCode: string): void {
    const fallbackUrl = `${this.getBaseUrl()}/share/${hashCode}`;
    
    // Check if running in APK/mobile app
    const isAPK = window.location.protocol === 'file:' || 
                  window.navigator.userAgent.includes('wv') ||
                  (window as any).Android ||
                  (window as any).webkit?.messageHandlers;
    
    // Prevent multiple redirects using session storage
    const redirectKey = `redirect_${hashCode}`;
    const lastRedirect = sessionStorage.getItem(redirectKey);
    const now = Date.now();
    
    // Prevent redirect if attempted within last 5 seconds
    if (lastRedirect && (now - parseInt(lastRedirect)) < 5000) {
      console.log('Preventing duplicate redirect within 5 seconds');
      return;
    }
    
    sessionStorage.setItem(redirectKey, now.toString());
    
    if (isAPK) {
      // If in APK, use location.href instead of window.open
      setTimeout(() => {
        window.location.href = fallbackUrl;
      }, 500); // Small delay to prevent reload loops
    } else {
      // If in web, try to open app then fallback to web
      AppDeepLinks.openApp(`share/${hashCode}`, fallbackUrl);
    }
  }
}
