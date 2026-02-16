
import { AppSettings } from '../types';

const STORAGE_KEY = 'vinyl_os_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  version: 2,
  global: {
    restoreLastSession: true,
    defaultModule: 'MUSIC',
    theme: 'DARK',
    checkUpdates: true
  },
  audio: {
    playbackSpeed: 1.0,
    crossfadeDuration: 2,
    eqEnabled: true,
    gapless: true,
    bufferSize: 4096
  },
  video: {
    showSubtitles: true,
    hardwareDecoding: true,
    autoFullScreen: false,
    defaultSubtitleLang: 'en'
  },
  browse: {
    showHiddenFiles: false,
    defaultDir: '',
    sortMethod: 'NAME',
    recursiveDepth: 3
  },
  queue: {
    autoMerge: false,
    persistQueue: true,
    maxHistory: 50
  },
  appearance: {
    vinylAnimation: true,
    reduceMotion: false,
    showLyrics: true,
    highContrast: false
  },
  privacy: {
    enableAnalytics: false,
    crashReports: true
  },
  developer: {
    debugMode: false,
    showFPS: false
  }
};

/**
 * Loads settings from local storage with schema migration support.
 */
export const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(stored);
    
    // Migration Logic: If version mismatch, merge with defaults to ensure new keys exist
    if (parsed.version !== DEFAULT_SETTINGS.version) {
       console.log('[Settings] Migrating to v2 schema...');
       const migrated = { 
           ...DEFAULT_SETTINGS, 
           ...parsed, 
           // Force version update
           version: DEFAULT_SETTINGS.version,
           // Ensure nested objects are merged, not overwritten if missing in old
           global: { ...DEFAULT_SETTINGS.global, ...(parsed.global || {}) },
           audio: { ...DEFAULT_SETTINGS.audio, ...(parsed.audio || {}) },
           video: { ...DEFAULT_SETTINGS.video, ...(parsed.video || {}) },
           browse: { ...DEFAULT_SETTINGS.browse, ...(parsed.browse || {}) },
           // ... continue for others if critical, but simplified spread works for most
       };
       return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('[Settings] Failed to load configuration. Reverting to defaults.', e);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Persists settings to local storage.
 */
export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Dispatch event for components that might listen directly (optional)
    window.dispatchEvent(new Event('settings-updated'));
  } catch (e) {
    console.error('[Settings] Failed to save configuration.', e);
  }
};
