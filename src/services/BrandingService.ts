// Comprehensive branding service for ROI MUSIC app

export interface BrandingConfig {
  appName: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  logos: {
    main: string;
    icon: string;
    splash: string;
  };
}

export const brandingConfig: BrandingConfig = {
  appName: 'ROI MUSIC',
  tagline: 'Ultimate Music Experience',
  colors: {
    primary: '#9333ea',
    secondary: '#22c55e',
    accent: '#f59e0b',
    background: '#000000',
    surface: '#1a1a1a'
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Poppins, system-ui, sans-serif'
  },
  logos: {
    main: '/icon-512x512.png',
    icon: '/icon-192x192.png',
    splash: '/icon-512x512.png'
  }
};

class BrandingService {
  private config: BrandingConfig;

  constructor(config: BrandingConfig) {
    this.config = config;
  }

  initializeBranding(): void {
    this.setFavicon();
    this.setThemeColors();
    this.setDocumentTitle();
    this.addBrandingStyles();
    this.setupAppBranding();
  }

  private setFavicon(): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = this.config.logos.icon;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = this.config.logos.icon;
      document.head.appendChild(newFavicon);
    }
  }

  private setThemeColors(): void {
    // Set theme color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = this.config.colors.primary;

    // Set msapplication theme color
    let msThemeColorMeta = document.querySelector('meta[name="msapplication-TileColor"]') as HTMLMetaElement;
    if (!msThemeColorMeta) {
      msThemeColorMeta = document.createElement('meta');
      msThemeColorMeta.name = 'msapplication-TileColor';
      document.head.appendChild(msThemeColorMeta);
    }
    msThemeColorMeta.content = this.config.colors.primary;

    // Set Apple status bar style
    let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement;
    if (!appleStatusBarMeta) {
      appleStatusBarMeta = document.createElement('meta');
      appleStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleStatusBarMeta);
    }
    appleStatusBarMeta.content = 'black-translucent';
  }

  private setDocumentTitle(): void {
    document.title = `${this.config.appName} - ${this.config.tagline}`;
  }

  private addBrandingStyles(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --brand-primary: ${this.config.colors.primary};
        --brand-secondary: ${this.config.colors.secondary};
        --brand-accent: ${this.config.colors.accent};
        --brand-background: ${this.config.colors.background};
        --brand-surface: ${this.config.colors.surface};
        --brand-font-primary: ${this.config.fonts.primary};
        --brand-font-secondary: ${this.config.fonts.secondary};
      }

      /* PWA Loading Animation */
      .roi-music-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: var(--brand-background);
        flex-direction: column;
      }

      .roi-music-logo {
        width: 120px;
        height: 120px;
        margin-bottom: 2rem;
        animation: roiPulse 2s ease-in-out infinite;
      }

      .roi-music-title {
        font-family: var(--brand-font-secondary);
        font-size: 2rem;
        font-weight: 700;
        color: var(--brand-primary);
        margin-bottom: 0.5rem;
        text-align: center;
      }

      .roi-music-tagline {
        font-family: var(--brand-font-primary);
        font-size: 1rem;
        color: var(--brand-secondary);
        text-align: center;
        opacity: 0.8;
      }

      @keyframes roiPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }

      /* Enhanced Notification Styles */
      .notification-roi-branding {
        font-family: var(--brand-font-primary) !important;
        background: var(--brand-surface) !important;
        color: white !important;
        border-left: 4px solid var(--brand-primary) !important;
      }

      /* Audio Visualizer Brand Colors */
      .audio-visualizer-bar {
        background: linear-gradient(180deg, var(--brand-primary), var(--brand-secondary)) !important;
      }

      /* Player Controls Brand Colors */
      .player-control-active {
        color: var(--brand-primary) !important;
      }

      /* Brand Consistency Utilities */
      .brand-primary { color: var(--brand-primary) !important; }
      .brand-secondary { color: var(--brand-secondary) !important; }
      .brand-accent { color: var(--brand-accent) !important; }
      .brand-bg-primary { background-color: var(--brand-primary) !important; }
      .brand-bg-secondary { background-color: var(--brand-secondary) !important; }
      .brand-border-primary { border-color: var(--brand-primary) !important; }
    `;
    document.head.appendChild(style);
  }

  private setupAppBranding(): void {
    // Add brand classes to body
    document.body.classList.add('roi-music-app');
    
    // Set up dynamic app store metadata
    this.setupAppStoreMetadata();
    
    // Add brand watermark to notifications
    this.enhanceNotificationBranding();
  }

  private setupAppStoreMetadata(): void {
    const metadata = [
      { name: 'application-name', content: this.config.appName },
      { name: 'apple-mobile-web-app-title', content: this.config.appName },
      { name: 'description', content: `${this.config.appName} - ${this.config.tagline}. Premium music streaming with high-quality audio and seamless experience.` },
      { property: 'og:title', content: `${this.config.appName} - ${this.config.tagline}` },
      { property: 'og:description', content: 'Premium music streaming platform with high-quality audio and seamless experience.' },
      { property: 'og:image', content: this.config.logos.main },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${this.config.appName} - ${this.config.tagline}` },
      { name: 'twitter:description', content: 'Premium music streaming platform with high-quality audio and seamless experience.' },
      { name: 'twitter:image', content: this.config.logos.main }
    ];

    metadata.forEach(meta => {
      let element = document.querySelector(`meta[${meta.name ? 'name' : 'property'}="${meta.name || meta.property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (meta.name) element.name = meta.name;
        if (meta.property) element.setAttribute('property', meta.property);
        document.head.appendChild(element);
      }
      element.content = meta.content;
    });
  }

  private enhanceNotificationBranding(): void {
    // Override notification styles if supported
    if ('Notification' in window) {
      const originalNotification = window.Notification;
      
      window.Notification = class extends originalNotification {
        constructor(title: string, options?: NotificationOptions) {
          const enhancedOptions = {
            ...options,
            icon: options?.icon || brandingConfig.logos.icon,
            badge: brandingConfig.logos.icon,
            tag: options?.tag || 'roi-music-notification'
          };
          
          super(`🎵 ${title}`, enhancedOptions);
        }
      } as any;
    }
  }

  getBrandingConfig(): BrandingConfig {
    return this.config;
  }

  updateBranding(updates: Partial<BrandingConfig>): void {
    this.config = { ...this.config, ...updates };
    this.initializeBranding();
  }
}

export const brandingService = new BrandingService(brandingConfig);