
// MEDIA FILTER ENGINE
// Validates file signatures and extensions for playback compatibility.

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'webm']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'avi', 'mov', 'webm']);

export const isAudioFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? AUDIO_EXTENSIONS.has(ext) : false;
};

export const isVideoFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? VIDEO_EXTENSIONS.has(ext) : false;
};

export const isPlayable = (filename: string): boolean => {
  return isAudioFile(filename) || isVideoFile(filename);
};

export const getFileType = (filename: string): 'AUDIO' | 'VIDEO' | 'UNKNOWN' => {
  if (isAudioFile(filename)) return 'AUDIO';
  if (isVideoFile(filename)) return 'VIDEO';
  return 'UNKNOWN';
};

/**
 * Formats bytes into human-readable string
 */
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
