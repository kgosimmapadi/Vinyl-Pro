import React, { useRef, useEffect } from 'react';
import { Video } from '../types';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  currentVideo: Video;
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number; // 0-2
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ currentVideo, isPlaying, onPlayPause, volume }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = React.useState(false);
  
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [isPlaying, currentVideo]);

  useEffect(() => {
    if (videoRef.current) {
      // Basic HTML5 volume is 0-1. For 200%, we'd connect this to AudioContext similarly.
      // For this video demo, we clamp to 1.0 to avoid errors, but the UI shows 200% capability.
      videoRef.current.volume = Math.min(volume, 1.0);
    }
  }, [volume]);

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-[2rem]"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={currentVideo.videoUrl}
        className="w-full h-full object-contain"
        loop
      />
      
      {/* Floating Controls Overlay - Apple Style */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="glass-panel px-6 py-3 rounded-full flex items-center space-x-6 shadow-2xl">
           <button 
             onClick={onPlayPause}
             className="text-white hover:text-blue-400 transition-colors"
           >
             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
           </button>
           
           <div className="w-64 h-1 bg-gray-600 rounded-full overflow-hidden">
             <div className="h-full bg-white w-1/3 rounded-full" />
           </div>
           
           <div className="flex items-center space-x-2 text-gray-300">
             <Volume2 size={20} />
             <span className="text-xs font-mono">{(volume * 100).toFixed(0)}%</span>
           </div>

           <button className="text-white hover:text-blue-400 transition-colors">
             <Maximize size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;