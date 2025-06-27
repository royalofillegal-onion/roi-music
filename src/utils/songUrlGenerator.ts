
import { Song, songs } from '@/data/songs';
import { supabase } from '@/integrations/supabase/client';

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
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    // Fallback for SSR or other environments
    return 'https://royalstar-music.lovableproject.com';
  }

  /**
   * Detect the current deployment platform
   */
  private static getDeploymentPlatform(): string {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      return 'Vercel';
    } else if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      return 'Netlify';
    } else if (hostname.includes('lovableproject.com') || hostname.includes('lovable.dev')) {
      return 'Lovable';
    } else if (hostname.includes('github.io')) {
      return 'GitHub Pages';
    } else if (hostname.includes('herokuapp.com')) {
      return 'Heroku';
    } else if (hostname.includes('firebase.app') || hostname.includes('web.app')) {
      return 'Firebase';
    } else if (hostname.includes('surge.sh')) {
      return 'Surge';
    } else if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      return 'Local Development';
    } else {
      return 'Custom Domain';
    }
  }

  /**
   * Generate a unique hash code for a song
   */
  private static generateHashCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create or get existing shared song link
   */
  static async createShareLink(song: Song): Promise<string> {
    try {
      const baseUrl = this.getBaseUrl();
      console.log(`Creating share link on ${this.getDeploymentPlatform()} platform: ${baseUrl}`);

      // First check if a share link already exists for this song
      const { data: existingLink } = await supabase
        .from('shared_songs')
        .select('hash_code')
        .eq('song_id', song.id)
        .maybeSingle();

      if (existingLink) {
        const shareUrl = `${baseUrl}/share/${existingLink.hash_code}`;
        console.log('Using existing share link:', shareUrl);
        return shareUrl;
      }

      // Generate unique hash code
      let hashCode = this.generateHashCode();
      let isUnique = false;
      
      // Ensure hash code is unique
      while (!isUnique) {
        const { data } = await supabase
          .from('shared_songs')
          .select('id')
          .eq('hash_code', hashCode)
          .maybeSingle();
        
        if (!data) {
          isUnique = true;
        } else {
          hashCode = this.generateHashCode();
        }
      }

      // Get current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();

      // Create new shared song record
      const { error } = await supabase
        .from('shared_songs')
        .insert({
          song_id: song.id,
          hash_code: hashCode,
          created_by: session?.user?.id || null
        });

      if (error) {
        console.error('Error creating share link:', error);
        // Fallback to simple URL if database fails
        const fallbackUrl = `${baseUrl}/share/${song.id}`;
        console.log('Using fallback URL:', fallbackUrl);
        return fallbackUrl;
      }

      const newShareUrl = `${baseUrl}/share/${hashCode}`;
      console.log('Created new share link:', newShareUrl);
      return newShareUrl;
    } catch (error) {
      console.error('Error in createShareLink:', error);
      // Fallback to simple URL if anything fails
      const fallbackUrl = `${this.getBaseUrl()}/share/${song.id}`;
      console.log('Using error fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
  }

  /**
   * Get song data from hash code or direct song ID
   */
  static async getSongFromHash(hashCode: string): Promise<Song | null> {
    try {
      console.log(`Looking for song with hash/ID: ${hashCode} on ${this.getDeploymentPlatform()}`);
      console.log('Available songs:', songs.length);
      
      // First try to get song from hash code in database
      const { data } = await supabase
        .from('shared_songs')
        .select('song_id')
        .eq('hash_code', hashCode)
        .maybeSingle();

      console.log('Database lookup result:', data);

      if (data && data.song_id) {
        // Found hash mapping, get song by ID
        const foundSong = songs.find(song => song.id === data.song_id);
        console.log('Found song by hash mapping:', foundSong?.title);
        return foundSong || null;
      }

      // Fallback: try direct song ID lookup (for backward compatibility)
      const directSong = songs.find(song => song.id === hashCode);
      console.log('Found song by direct ID:', directSong?.title);
      return directSong || null;
    } catch (error) {
      console.error('Error getting song from hash:', error);
      
      // Final fallback: try to find song by direct ID
      try {
        const fallbackSong = songs.find(song => song.id === hashCode);
        console.log('Fallback song found:', fallbackSong?.title);
        return fallbackSong || null;
      } catch (fallbackError) {
        console.error('Error in fallback song lookup:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Increment click count for shared link
   */
  static async incrementClickCount(hashCode: string): Promise<void> {
    try {
      await supabase.rpc('increment_click_count', { hash_code: hashCode });
      console.log(`Incremented click count for hash: ${hashCode} on ${this.getDeploymentPlatform()}`);
    } catch (error) {
      console.error('Error incrementing click count:', error);
    }
  }

  /**
   * Get song URL data for sharing (async version)
   */
  static async getSongUrlData(song: Song): Promise<SongUrlData> {
    const shareUrl = await this.createShareLink(song);
    const hashCode = shareUrl.split('/').pop() || '';
    
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.imageUrl,
      shareUrl,
      hashCode
    };
  }

  /**
   * Generate sharing text with unique URL and platform info
   */
  static async generateShareText(song: Song): Promise<string> {
    const url = await this.createShareLink(song);
    const platform = this.getDeploymentPlatform();
    
    return `🎵 Check out "${song.title}" by ${song.artist} on RoyalStar Music! 
    
Shared from ${platform}: ${url}

#RoyalStarMusic #${song.artist.replace(/\s+/g, '')} #MusicLovers`;
  }

  /**
   * Generate multiple sharing formats with unique URLs and platform detection
   */
  static async generateSharingOptions(song: Song) {
    const shareUrl = await this.createShareLink(song);
    const shareText = await this.generateShareText(song);
    const platform = this.getDeploymentPlatform();
    
    // Enhanced share text for different platforms
    const enhancedText = `🎵 "${song.title}" by ${song.artist} | Shared from ${platform}`;
    
    return {
      url: shareUrl,
      text: shareText,
      platform,
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

  /**
   * Validate if a URL is a valid share link
   */
  static isValidShareUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/share/');
    } catch {
      return false;
    }
  }

  /**
   * Get platform-specific sharing metadata
   */
  static getPlatformInfo() {
    return {
      platform: this.getDeploymentPlatform(),
      baseUrl: this.getBaseUrl(),
      hostname: typeof window !== 'undefined' ? window.location.hostname : '',
      isSecure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };
  }
}
