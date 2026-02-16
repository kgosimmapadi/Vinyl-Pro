import React from 'react';
import { Track } from '../types';
import { Activity, Clock } from 'lucide-react';
import { formatTime } from '../App';

interface PlaylistProps {
  tracks: Track[];
  currentTrackId: string;
  onSelect: (track: Track) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ tracks, currentTrackId, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-[#050505] border border-[#222] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#0a0a0c]">
        <div className="flex items-center gap-2 text-[#666] text-[10px] font-bold uppercase tracking-widest font-mono">
           <Activity size={12} />
           <span>Sequence Buffer</span>
        </div>
        <div className="px-1.5 py-0.5 border border-[#333] text-[#888] text-[9px] font-mono">
           {tracks.length} OBJ
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
        {tracks.map((track, index) => {
          const isActive = track.id === currentTrackId;
          
          return (
            <div
              key={track.id}
              onClick={() => onSelect(track)}
              className={`group flex items-center px-4 py-3 cursor-pointer border-b border-[#111] hover:bg-[#111] transition-colors ${
                isActive ? 'bg-[#111]' : ''
              }`}
            >
              <div className={`w-6 text-[10px] font-mono text-center mr-3 ${isActive ? 'text-[#FF4D00]' : 'text-[#444]'}`}>
                {String(index + 1).padStart(2, '0')}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-mono truncate ${isActive ? 'text-[#FF4D00]' : 'text-[#ccc]'}`}>
                  {track.title}
                </h4>
                <p className="text-[10px] text-[#666] truncate font-mono uppercase mt-0.5">{track.artist}</p>
              </div>

              <div className="text-[10px] text-[#444] font-mono pl-4">
                {formatTime(track.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Playlist;