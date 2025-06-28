
import { Song, songs } from '@/data/songs';

export interface SongUrlData {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  shareUrl: string;
  hashCode: string;
}

export class SongUrlGenerator {
  /**
   * Get the current base URL dynamically (works on any platform)
   */
  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://royalofillegal-music.vercel.app';
  }

  /**
   * Get platform information for debugging and display
   */
  static getPlatformInfo() {
    if (typeof window === 'undefined') {
      return {
        platform: 'Server',
        hostname: 'unknown',
        isSecure: false
      };
    }

    const hostname = window.location.hostname;
    let platform = 'Unknown';
    
    if (hostname.includes('vercel.app')) {
      platform = 'Vercel';
    } else if (hostname.includes('netlify.app')) {
      platform = 'Netlify';
    } else if (hostname.includes('lovable.app')) {
      platform = 'Lovable';
    } else if (hostname.includes('github.io')) {
      platform = 'GitHub Pages';
    } else if (hostname === 'localhost') {
      platform = 'Local Development';
    } else {
      platform = 'Custom Domain';
    }

    return {
      platform,
      hostname,
      isSecure: window.location.protocol === 'https:'
    };
  }

  /**
   * Generate a simple, deterministic hash code for a song
   * This ensures the same song always gets the same hash across all platforms
   */
  private static generateSimpleHash(song: Song): string {
    // Create a simple identifier using song ID and title
    const input = `${song.id}-${song.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to base36 and ensure it's always 8 characters
    return Math.abs(hash).toString(36).padStart(8, '0').substring(0, 8);
  }

  /**
   * Create shared song link that works across all platforms
   */
  static async createShareLink(song: Song): Promise<string> {
    const baseUrl = this.getBaseUrl();
    const hashCode = this.generateSimpleHash(song);
    const shareUrl = `${baseUrl}/share/${hashCode}`;
    
    console.log(`Created share link for "${song.title}":`, shareUrl);
    console.log(`Hash code: ${hashCode} for song ID: ${song.id}`);
    
    return shareUrl;
  }

  /**
   * Universal song lookup that works across all platforms
   * This method searches through all songs to find a match
   */
  static async getSongFromHash(hashCode: string): Promise<Song | null> {
    console.log(`Looking up song with hash: ${hashCode}`);
    
    // Method 1: Generate hash for each song and compare
    for (const song of songs) {
      const expectedHash = this.generateSimpleHash(song);
      if (expectedHash === hashCode) {
        console.log(`✅ Found song by hash: "${song.title}" by ${song.artist}`);
        return song;
      }
    }

    // Method 2: Direct ID lookup as fallback
    const directMatch = songs.find(song => song.id === hashCode);
    if (directMatch) {
      console.log(`✅ Found song by direct ID: "${directMatch.title}" by ${directMatch.artist}`);
      return directMatch;
    }

    // Method 3: Partial hash matching
    for (const song of songs) {
      const expectedHash = this.generateSimpleHash(song);
      if (expectedHash.includes(hashCode) || hashCode.includes(expectedHash)) {
        console.log(`✅ Found song by partial hash: "${song.title}" by ${song.artist}`);
        return song;
      }
    }

    console.log(`❌ No song found for hash: ${hashCode}`);
    return null;
  }

  /**
   * Increment click count for analytics (placeholder - could be implemented with database)
   */
  static async incrementClickCount(hashCode: string): Promise<void> {
    try {
      // This is a placeholder for analytics tracking
      // In a real app, this would update a database
      console.log(`📊 Click tracked for hash: ${hashCode}`);
      
      // Store in localStorage for basic tracking
      if (typeof window !== 'undefined') {
        const clicks = JSON.parse(localStorage.getItem('song_clicks') || '{}');
        clicks[hashCode] = (clicks[hashCode] || 0) + 1;
        localStorage.setItem('song_clicks', JSON.stringify(clicks));
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  static async getSongUrlData(song: Song): Promise<SongUrlData> {
    const shareUrl = await this.createShareLink(song);
    const hashCode = this.generateSimpleHash(song);
    
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.imageUrl,
      shareUrl,
      hashCode
    };
  }

  static async generateShareText(song: Song): Promise<string> {
    const url = await this.createShareLink(song);
    
    return `🎵 Check out "${song.title}" by ${song.artist} on RoyalStar Music! 
    
Listen now: ${url}

#RoyalStarMusic #${song.artist.replace(/\s+/g, '')} #MusicLovers`;
  }

  static async generateSharingOptions(song: Song) {
    const shareUrl = await this.createShareLink(song);
    const shareText = await this.generateShareText(song);
    
    const enhancedText = `🎵 "${song.title}" by ${song.artist} | Listen on RoyalStar Music`;
    
    return {
      url: shareUrl,
      text: shareText,
      baseUrl: this.getBaseUrl(),
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(enhancedText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(enhancedText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(enhancedText)}`,
      email: `mailto:?subject=${encodeURIComponent(`Check out ${song.title} by ${song.artist}`)}&body=${encodeURIComponent(shareText)}`,
      sms: `sms:?body=${encodeURIComponent(shareText)}`,
      copy: shareUrl
    };
  }
}
