
// FILE SYSTEM SERVICE ADAPTER
// Routes requests to Electron IPC (Production) or Web File System API (Fallback)

import { FileSystemNode, ScanOptions } from '../types';
import { isPlayable } from './mediaFilter';

/**
 * Prompts user to select directory.
 * Uses Electron dialog in Desktop mode.
 */
export const mountDirectory = async (): Promise<FileSystemDirectoryHandle | string> => {
  // 1. Electron Production Mode
  if (window.electron) {
    const path = await window.electron.selectDirectory();
    if (!path) throw new Error('Selection cancelled');
    return path;
  }

  // 2. Web Fallback
  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'read',
      startIn: 'music',
    });
    return dirHandle;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('User cancelled folder selection');
    }
    throw error;
  }
};

/**
 * Scans a directory. 
 * In Electron mode, we delegate the heavy lifting to the main process via IPC.
 */
export const scanDirectory = async (
  handleOrPath: FileSystemDirectoryHandle | string, 
  currentPath: string,
  options: ScanOptions = { showHidden: false, sortMethod: 'NAME' }
): Promise<FileSystemNode[]> => {
  
  // ELECTRON MODE
  if (typeof handleOrPath === 'string' && window.electron) {
     // For a Browse Module in Electron, we might want a simple shallow scan
     // But typically we'd use Node fs here. 
     // For this adapter, we assume the Renderer wants a list of nodes.
     // We trigger the scan via IPC (this would be a custom implementation in main.js)
     const result = await window.electron.scanDirectory(handleOrPath); 
     return result.map((f: any) => ({
         name: f.name,
         kind: f.isDirectory ? 'directory' : 'file',
         path: f.path,
         size: f.size
     }));
  }

  // WEB API MODE (Fallback)
  const dirHandle = handleOrPath as FileSystemDirectoryHandle;
  const entries: FileSystemNode[] = [];
  const YIELD_THRESHOLD_MS = 16;
  let lastYield = performance.now();

  for await (const [name, handle] of dirHandle.entries()) {
    // Time Slicing
    const now = performance.now();
    if (now - lastYield > YIELD_THRESHOLD_MS) {
        await new Promise(resolve => setTimeout(resolve, 0));
        lastYield = performance.now();
    }

    if (!options.showHidden && name.startsWith('.')) continue;

    const kind = handle.kind;
    const path = `${currentPath}/${name}`;

    if (kind === 'file' && !isPlayable(name)) continue;

    entries.push({
      name,
      kind,
      handle,
      path,
      size: 0, 
      modified: 0
    });
  }

  return entries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
    switch (options.sortMethod) {
      case 'TYPE':
         const extA = a.name.split('.').pop() || '';
         const extB = b.name.split('.').pop() || '';
         return extA.localeCompare(extB) || a.name.localeCompare(b.name);
      case 'NAME':
      default:
         return a.name.localeCompare(b.name);
    }
  });
};

/**
 * Resolves a File object/Blob.
 * In Electron, this returns a `file://` URL or blob.
 */
export const getFileFromHandle = async (handleOrPath: FileSystemFileHandle | string): Promise<File | Blob> => {
  if (typeof handleOrPath === 'string' && window.electron) {
      // In Electron, we can load local files directly via `file://` protocol in the video/audio src
      // However, if we need a Blob for analysis, we'd fetch it.
      // For now, we return a mock File object that has the path, 
      // as the Player components will likely use the path directly if 'isLocal' is true.
      const response = await fetch(`file://${handleOrPath}`);
      return await response.blob();
  }
  
  return await (handleOrPath as FileSystemFileHandle).getFile();
};
