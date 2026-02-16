import React from 'react';
import { Video } from '../types';
import { Play, FileVideo, HardDrive } from 'lucide-react';
import { formatTime } from '../App';

interface VideoLibraryProps {
  videos: Video[];
  onPlay: (video: Video) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos, onPlay }) => {
  return (
    <div className="h-full w-full overflow-y-auto p-8 bg-[#000000] text-white">
      
      {/* Header */}
      <div className="mb-8 border-b border-[#222] pb-4 flex justify-between items-end">
         <div>
            <h2 className="text-2xl font-mono font-bold tracking-tight text-white mb-1">VISUAL_ASSETS</h2>
            <p className="text-[#666] font-mono text-[10px] uppercase tracking-widest">/mnt/storage/video_pool</p>
         </div>
         <div className="flex gap-4">
             <div className="text-[#666] font-mono text-[10px] border border-[#222] px-2 py-1">
                TOTAL_SIZE: 16.2GB
             </div>
             <div className="text-[#FF4D00] font-mono text-[10px] border border-[#FF4D00]/20 px-2 py-1">
                INDEX_STATUS: SYNCED
             </div>
         </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="group cursor-pointer bg-[#050505] border border-[#222] hover:border-[#FF4D00] transition-colors flex flex-col"
            onClick={() => onPlay(video)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-[#111] overflow-hidden">
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-300"
              />
              
              {/* Overlays */}
              <div className="absolute top-2 left-2 flex gap-1">
                {video.resolution && (
                    <div className="bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-[#FF4D00] border border-[#FF4D00]/30 backdrop-blur-sm">
                        {video.resolution}
                    </div>
                )}
                {video.format && (
                    <div className="bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-[#ccc] border border-[#333] backdrop-blur-sm">
                        {video.format}
                    </div>
                )}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full bg-[#FF4D00]/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Play size={16} fill="black" className="ml-0.5 text-black" />
                  </div>
              </div>
            </div>

            {/* Meta Data */}
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-mono text-xs text-[#eee] truncate mb-1">{video.title}</h3>
              
              <div className="mt-auto pt-2 border-t border-[#1a1a1a] space-y-1">
                 <div className="flex justify-between items-center">
                    <div className="text-[10px] text-[#666] font-mono flex items-center gap-1">
                        <FileVideo size={10} />
                        ID: {video.id.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-[#888] font-mono font-bold">{formatTime(video.duration)}</div>
                 </div>
                 
                 {video.size && (
                     <div className="flex justify-between items-center">
                        <div className="text-[10px] text-[#666] font-mono flex items-center gap-1">
                            <HardDrive size={10} />
                            SIZE
                        </div>
                        <div className="text-[10px] text-[#666] font-mono">{video.size}</div>
                     </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLibrary;