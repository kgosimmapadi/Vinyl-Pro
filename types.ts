

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  lyrics?: string; // Raw LRC string or plain text
  genre?: string;
  year?: number;
  path?: string; // Real file path
  // Local File System Support
  fileHandle?: FileSystemFileHandle;
  isLocal?: boolean;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  resolution?: string; // e.g. '4K', '1080p'
  format?: string; // e.g. 'MP4', 'MKV'
  size?: string; // e.g. '2.4GB'
  path?: string; // Real file path
  // Local File System Support
  fileHandle?: FileSystemFileHandle;
  isLocal?: boolean;
}

export interface Queue {
  id: string;
  name: string;
  tracks: Track[];
  sourceType?: 'LIBRARY' | 'FOLDER' | 'MANUAL';
  sourcePath?: string;
}

export type PlaybackMode = 'MUSIC' | 'VIDEO';

export interface EQBand {
  frequency: number;
  gain: number; // -12 to 12
  type: 'lowshelf' | 'peaking' | 'highshelf';
}

export interface PlayerState {
  isPlaying: boolean;
  volume: number; // 0 to 2.0 (200%)
  currentTime: number;
  duration: number;
  isMuted: boolean;
}

// File System Types
export interface FileSystemNode {
  name: string;
  kind: 'file' | 'directory';
  handle?: FileSystemHandle; // Optional now, as Electron might just send paths
  path: string; // Absolute path
  size?: number;
  modified?: number;
}

export interface ScanOptions {
  showHidden: boolean;
  sortMethod: 'NAME' | 'DATE' | 'TYPE';
}

// --- ELECTRON IPC BRIDGE ---
export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  scanDirectory: (path: string) => Promise<any>; // Returns stream or events in real impl
  onScanProgress: (callback: (data: { progress: number; file: string; log: string }) => void) => void;
  onScanComplete: (callback: (data: { music: Track[]; videos: Video[] }) => void) => void;
  readMetadata: (filePath: string) => Promise<any>;
  platform: string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

// --- SETTINGS ARCHITECTURE V2 ---

export interface GlobalSettings {
  restoreLastSession: boolean;
  defaultModule: 'MUSIC' | 'VIDEO' | 'BROWSE';
  theme: 'SYSTEM' | 'DARK' | 'AMOLED';
  checkUpdates: boolean;
}

export interface AudioSettings {
  playbackSpeed: number; // 0.5 - 2.0
  crossfadeDuration: number; // seconds
  eqEnabled: boolean;
  gapless: boolean;
  bufferSize: number; // samples
}

export interface VideoSettings {
  showSubtitles: boolean;
  hardwareDecoding: boolean;
  autoFullScreen: boolean;
  defaultSubtitleLang: string;
}

export interface BrowseSettings {
  showHiddenFiles: boolean;
  defaultDir: string;
  sortMethod: 'NAME' | 'DATE' | 'TYPE';
  recursiveDepth: number;
}

export interface QueueSettings {
  autoMerge: boolean;
  persistQueue: boolean;
  maxHistory: number;
}

export interface AppearanceSettings {
  vinylAnimation: boolean;
  reduceMotion: boolean;
  showLyrics: boolean;
  highContrast: boolean;
}

export interface PrivacySettings {
  enableAnalytics: boolean;
  crashReports: boolean;
}

export interface DeveloperSettings {
  debugMode: boolean;
  showFPS: boolean;
}

export interface AppSettings {
  version: number;
  global: GlobalSettings;
  audio: AudioSettings;
  video: VideoSettings;
  browse: BrowseSettings;
  queue: QueueSettings;
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
  developer: DeveloperSettings;
}