import React, { useState } from 'react';
import { Folder, Music, ChevronRight, ChevronDown, HardDrive } from 'lucide-react';
import { Track } from '../types';

interface LibraryBrowserProps {
  library: Track[];
  onAddToQueue: (track: Track) => void;
}

// Mock folder structure generation based on artists/albums
const generateMockFolders = (tracks: Track[]) => {
    // Flatten into a simple structure for demo: Root -> Artist -> Album -> Track
    const structure: any = {};
    
    tracks.forEach(track => {
        if (!structure[track.artist]) structure[track.artist] = {};
        if (!structure[track.artist][track.album]) structure[track.artist][track.album] = [];
        structure[track.artist][track.album].push(track);
    });
    return structure;
};

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({ library, onAddToQueue }) => {
  const [structure] = useState(() => generateMockFolders(library));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-full w-full bg-[#000000] text-[#e0e0e0] p-8 overflow-y-auto">
        <div className="mb-8 border-b border-[#222] pb-4">
             <h2 className="text-2xl font-mono font-bold tracking-tight text-white mb-1">ROOT_DIRECTORY</h2>
             <p className="text-[#666] text-[10px] font-mono uppercase tracking-widest">/mnt/media_pool/audio</p>
        </div>

        <div className="font-mono text-xs">
            {Object.keys(structure).map((artist, i) => (
                <div key={artist} className="mb-2">
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-[#FF4D00] py-1 select-none"
                        onClick={() => toggle(artist)}
                    >
                        {expanded[artist] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Folder size={14} className="text-[#FF4D00]" />
                        <span className="font-bold">{artist}</span>
                    </div>

                    {expanded[artist] && (
                        <div className="ml-[1.4rem] border-l border-[#222] pl-4 mt-1">
                            {Object.keys(structure[artist]).map(album => (
                                <div key={album} className="mb-2">
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer hover:text-white text-[#888] py-1 select-none"
                                        onClick={() => toggle(`${artist}-${album}`)}
                                    >
                                        {expanded[`${artist}-${album}`] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                        <Folder size={12} />
                                        <span>{album}</span>
                                    </div>
                                    
                                    {expanded[`${artist}-${album}`] && (
                                        <div className="ml-[1.4rem] mt-1 border-l border-[#222] pl-4">
                                            {structure[artist][album].map((track: Track) => (
                                                <div 
                                                    key={track.id} 
                                                    className="flex items-center gap-2 py-2 cursor-pointer hover:bg-[#111] px-2 text-[#666] hover:text-[#FF4D00] group transition-colors rounded-sm"
                                                    onClick={() => onAddToQueue(track)}
                                                >
                                                    <Music size={10} />
                                                    <span className="truncate">{track.title}</span>
                                                    <span className="ml-auto text-[9px] opacity-0 group-hover:opacity-100 font-bold">[+]</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default LibraryBrowser;