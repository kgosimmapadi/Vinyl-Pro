import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Mic2 } from 'lucide-react';
import { formatTime } from '../App';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  currentTime: number;
  duration: number;
  onSeek: (val: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLyrics: () => void;
  isLyricsOpen: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, onPlayPause, volume, onVolumeChange, 
  currentTime, duration, onSeek, onNext, onPrev,
  onToggleLyrics, isLyricsOpen
}) => {
  
  const volumePercentage = (volume / 2.0) * 100;

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center space-y-5 pb-4">
      {/* Progress Bar - Interactive Update */}
      <div className="w-full flex items-center space-x-4 text-xs font-bold font-mono text-gray-500 select-none">
        <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
        
        {/* Interaction Wrapper - Taller hit area */}
        <div className="relative flex-1 h-6 flex items-center group cursor-pointer">
            {/* Background Track */}
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-white/10 w-full" 
                />
            </div>
            
            {/* Active Fill */}
            <div 
                className="absolute h-1 bg-[#FF4D00] rounded-full pointer-events-none group-hover:bg-[#ff6a2b] transition-colors"
                style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Native Input - Stretched to fill height for hit testing */}
            <input 
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
        </div>
        
        <span className="w-10 tabular-nums text-left">{formatTime(duration)}</span>
      </div>

      {/* Main Buttons */}
      <div className="flex items-center justify-between w-full px-2">
        <button className="text-gray-500 hover:text-[#FF4D00] transition-colors p-2 hover:bg-[#111] rounded-full">
          <Shuffle size={18} />
        </button>
        
        <div className="flex items-center space-x-6 sm:space-x-10">
          <button onClick={onPrev} className="text-[#e0e0e0] hover:text-[#FF4D00] transition-colors p-2 hover:bg-[#111] rounded-full">
            <SkipBack size={28} fill="currentColor" />
          </button>
          
          <button 
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-[#FF4D00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_8px_25px_-5px_rgba(255,77,0,0.5)] border border-[#ff6a2b]"
          >
            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
          </button>
          
          <button onClick={onNext} className="text-[#e0e0e0] hover:text-[#FF4D00] transition-colors p-2 hover:bg-[#111] rounded-full">
            <SkipForward size={28} fill="currentColor" />
          </button>
        </div>

        <button className="text-gray-500 hover:text-[#FF4D00] transition-colors p-2 hover:bg-[#111] rounded-full">
          <Repeat size={18} />
        </button>
      </div>

      {/* Volume & Extras - Layout Update */}
      <div className="flex items-center gap-3 w-full pt-2">
        {/* Lyrics Toggle Button - Left Side */}
        <button 
            onClick={onToggleLyrics}
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border transition-all ${isLyricsOpen ? 'bg-[#FF4D00] border-[#FF4D00] text-black shadow-[0_0_15px_rgba(255,77,0,0.3)]' : 'bg-[#0a0a0c] border-[#222] text-gray-400 hover:text-white hover:border-[#333]'}`}
            title="Toggle Lyrics Engine"
        >
            <Mic2 size={18} />
        </button>

        {/* Volume Control - Stretched */}
        <div className="group flex-1 px-4 py-2.5 bg-[#0a0a0c] rounded-full border border-[#222] hover:border-[#333] flex items-center space-x-3 transition-colors">
           <Volume2 size={16} className={`flex-shrink-0 ${volume > 1.0 ? 'text-[#FF4D00]' : 'text-gray-400'}`} />
           
           <div className="flex-1 h-6 flex items-center relative">
             <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all ${volume > 1.0 ? 'bg-[#FF4D00]' : 'bg-[#444]'}`}
                    style={{ width: `${volumePercentage}%` }}
                />
             </div>
             <input 
              type="range"
              min={0}
              max={2}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
           </div>
           
           <span className={`text-xs font-mono font-bold w-10 text-right tabular-nums flex-shrink-0 ${volume > 1.0 ? 'text-[#FF4D00]' : 'text-gray-500'}`}>
             {(volume * 100).toFixed(0)}%
           </span>
        </div>
      </div>
    </div>
  );
};

export default Controls;