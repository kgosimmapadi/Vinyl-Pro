
import { LyricLine } from '../types';

/**
 * Parses a standard LRC string into an array of LyricLines.
 * Supports format: [mm:ss.xx] Lyrics text
 */
export const parseLrc = (lrc: string): LyricLine[] => {
  if (!lrc) return [];

  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  
  // Regex for [mm:ss.xx] or [mm:ss.xxx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);
      
      // Convert to total seconds. If ms is 2 digits, it's centiseconds (x10). If 3, it's ms.
      const msNormalizer = match[3].length === 2 ? 10 : 1;
      const totalSeconds = minutes * 60 + seconds + (milliseconds * msNormalizer) / 1000;
      
      const text = line.replace(timeRegex, '').trim();
      
      if (text) {
        result.push({ time: totalSeconds, text });
      }
    }
  });

  return result.sort((a, b) => a.time - b.time);
};

/**
 * OPTIMIZED: Gets the active line index using Binary Search.
 * Complexity: O(log n) vs previous O(n).
 * Essential for 60FPS updates.
 */
export const getActiveLyricIndex = (lyrics: LyricLine[], currentTime: number, offset: number = 0): number => {
  const adjustedTime = currentTime + offset;
  
  if (lyrics.length === 0) return -1;
  if (adjustedTime < lyrics[0].time) return -1;
  if (adjustedTime >= lyrics[lyrics.length - 1].time) return lyrics.length - 1;

  let low = 0;
  let high = lyrics.length - 1;
  let ans = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lyrics[mid].time <= adjustedTime) {
      ans = mid; // Candidate found
      low = mid + 1; // Try to find a later one
    } else {
      high = mid - 1;
    }
  }

  return ans;
};
