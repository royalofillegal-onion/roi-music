// Audio Quality Settings Service

export type AudioQuality = 'low' | 'medium' | 'high' | 'auto';

interface AudioQualityConfig {
  quality: AudioQuality;
  dataSaver: boolean;
  downloadQuality: AudioQuality;
  streamingQuality: AudioQuality;
  wifiOnlyHighQuality: boolean;
}

interface QualityInfo {
  label: string;
  bitrate: string;
  description: string;
  sizePer3Min: string;
}

const QUALITY_INFO: Record<AudioQuality, QualityInfo> = {
  low: {
    label: 'Low',
    bitrate: '96 kbps',
    description: 'Uses less data, suitable for slow connections',
    sizePer3Min: '~2.2 MB'
  },
  medium: {
    label: 'Medium',
    bitrate: '160 kbps',
    description: 'Balanced quality and data usage',
    sizePer3Min: '~3.6 MB'
  },
  high: {
    label: 'High',
    bitrate: '320 kbps',
    description: 'Best audio quality, uses more data',
    sizePer3Min: '~7.2 MB'
  },
  auto: {
    label: 'Auto',
    bitrate: 'Variable',
    description: 'Adjusts quality based on network speed',
    sizePer3Min: '~2-7 MB'
  }
};

class AudioQualityService {
  private config: AudioQualityConfig = {
    quality: 'auto',
    dataSaver: false,
    downloadQuality: 'high',
    streamingQuality: 'auto',
    wifiOnlyHighQuality: true
  };

  private connectionType: string = 'unknown';

  constructor() {
    this.loadConfig();
    this.detectConnection();
  }

  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('audio-quality-config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
  }

  private saveConfig(): void {
    localStorage.setItem('audio-quality-config', JSON.stringify(this.config));
  }

  private detectConnection(): void {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        this.connectionType = conn.effectiveType || conn.type || 'unknown';
        
        conn.addEventListener('change', () => {
          this.connectionType = conn.effectiveType || conn.type || 'unknown';
        });
      }
    }
  }

  setQuality(quality: AudioQuality): void {
    this.config.quality = quality;
    this.config.streamingQuality = quality;
    this.saveConfig();
  }

  setDownloadQuality(quality: AudioQuality): void {
    this.config.downloadQuality = quality;
    this.saveConfig();
  }

  setDataSaver(enabled: boolean): void {
    this.config.dataSaver = enabled;
    if (enabled) {
      this.config.streamingQuality = 'low';
    }
    this.saveConfig();
  }

  setWifiOnlyHighQuality(enabled: boolean): void {
    this.config.wifiOnlyHighQuality = enabled;
    this.saveConfig();
  }

  getConfig(): AudioQualityConfig {
    return { ...this.config };
  }

  getQualityInfo(quality: AudioQuality): QualityInfo {
    return QUALITY_INFO[quality];
  }

  getAllQualityOptions(): { value: AudioQuality; info: QualityInfo }[] {
    return (['auto', 'high', 'medium', 'low'] as AudioQuality[]).map(q => ({
      value: q,
      info: QUALITY_INFO[q]
    }));
  }

  getCurrentEffectiveQuality(): AudioQuality {
    if (this.config.dataSaver) return 'low';
    
    if (this.config.quality === 'auto') {
      return this.determineAutoQuality();
    }
    
    return this.config.quality;
  }

  private determineAutoQuality(): AudioQuality {
    // Check connection type
    switch (this.connectionType) {
      case '4g':
        return 'high';
      case '3g':
        return 'medium';
      case '2g':
      case 'slow-2g':
        return 'low';
      default:
        // Check if on wifi
        if (this.isOnWifi()) {
          return 'high';
        }
        return 'medium';
    }
  }

  isOnWifi(): boolean {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return conn?.type === 'wifi';
    }
    return false;
  }

  getConnectionType(): string {
    return this.connectionType;
  }

  getDataUsageEstimate(durationMinutes: number): string {
    const quality = this.getCurrentEffectiveQuality();
    const mbPerMin = {
      low: 0.72,
      medium: 1.2,
      high: 2.4,
      auto: 1.5 // average
    };
    
    const usage = mbPerMin[quality] * durationMinutes;
    
    if (usage >= 1000) {
      return `~${(usage / 1000).toFixed(1)} GB`;
    }
    return `~${usage.toFixed(0)} MB`;
  }
}

export const audioQualityService = new AudioQualityService();
