import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Track, LyricLine } from '../types';
import { parseLrc, getActiveLyricIndex } from '../utils/lrcParser';
import { X, Edit2, Check, Clock, Type, AlignCenter, Minus, Plus, PlayCircle } from 'lucide-react';

interface LyricsModuleProps {
  currentTrack: Track;
  currentTime: number;
  onClose: () => void;
  onSaveLyrics: (trackId: string, newLyrics: string) => void;
  onSeek?: (time: number) => void;
}

const LyricsModule: React.FC<LyricsModuleProps> = ({ 
    currentTrack, 
    currentTime, 
    onClose, 
    onSaveLyrics, 
    onSeek 
}) => {
  const [mode, setMode] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [rawLyrics, setRawLyrics] = useState('');
  const [syncOffset, setSyncOffset] = useState(0); 
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // Transform State for smooth scrolling
  const [translateY, setTranslateY] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize Data
  useEffect(() => {
    const lrc = currentTrack.lyrics || '';
    setRawLyrics(lrc);
    setParsedLyrics(parseLrc(lrc));
    setSyncOffset(0);
    setIsUserScrolling(false);
  }, [currentTrack]);

  // Sync Logic
  useEffect(() => {
    const idx = getActiveLyricIndex(parsedLyrics, currentTime, syncOffset);
    setActiveIndex(idx);
  }, [currentTime, parsedLyrics, syncOffset]);

  // Auto-Scroll Animation Engine
  useEffect(() => {
    if (mode === 'VIEW' && !isUserScrolling && activeIndex !== -1 && containerRef.current) {
        const activeEl = lineRefs.current[activeIndex];
        if (activeEl) {
            // Calculate position to center the active line at ~35% of the screen height (Ergonomic reading zone)
            const containerHeight = containerRef.current.clientHeight;
            const lineTop = activeEl.offsetTop;
            const lineHeight = activeEl.clientHeight;
            
            // Target Y position for the transform container
            const targetY = - (lineTop - (containerHeight * 0.35) + (lineHeight / 2));
            setTranslateY(targetY);
        }
    }
  }, [activeIndex, mode, isUserScrolling]);

  const handleSave = () => {
    onSaveLyrics(currentTrack.id, rawLyrics);
    setParsedLyrics(parseLrc(rawLyrics));
    setMode('VIEW');
  };

  const handleSyncAdjust = (delta: number) => {
    setSyncOffset(prev => prev + delta);
  };

  // User Interaction Handlers
  const handleWheel = () => {
      if (mode === 'VIEW') setIsUserScrolling(true);
  };
  
  const handleResumeSync = () => {
      setIsUserScrolling(false);
  };

  const handleLineClick = (time: number) => {
      if (onSeek) {
          onSeek(time);
          setIsUserScrolling(false);
      }
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col animate-in fade-in duration-500 bg-black">
      
      {/* CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         {/* Deep Blur Background */}
         <img 
            src={currentTrack.coverUrl} 
            className="absolute inset-0 w-full h-full object-cover blur-[80px] scale-150 opacity-40 transition-opacity duration-1000"
            alt="Ambient Background"
         />
         {/* Gradients for readability */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black z-10" />
         <div className="absolute inset-0 bg-black/20 z-10 mix-blend-multiply" />
      </div>

      {/* HEADER TOOLBAR */}
      <div className="relative z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Type size={14} />
                </div>
                <div>
                    <span className="block font-sans font-bold text-sm tracking-wide">Lyrics</span>
                    <span className="block text-[10px] text-white/50 uppercase tracking-widest">{currentTrack.artist}</span>
                </div>
            </div>
            
            {/* Sync Controls */}
            {mode === 'VIEW' && parsedLyrics.length > 0 && (
                <div className="flex items-center gap-1 bg-black/40 rounded-full border border-white/5 px-3 py-1 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Clock size={10} className="text-white/40 mr-2" />
                    <button onClick={() => handleSyncAdjust(-0.1)} className="hover:text-[#FF4D00] text-white/60"><Minus size={10} /></button>
                    <span className={`text-[9px] font-mono w-10 text-center ${syncOffset !== 0 ? 'text-[#FF4D00]' : 'text-white/60'}`}>
                        {(syncOffset * 1000).toFixed(0)}ms
                    </span>
                    <button onClick={() => handleSyncAdjust(0.1)} className="hover:text-[#FF4D00] text-white/60"><Plus size={10} /></button>
                </div>
            )}
        </div>

        <div className="flex items-center gap-3">
            {mode === 'VIEW' ? (
                <button 
                    onClick={() => setMode('EDIT')} 
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all backdrop-blur-sm"
                >
                    <Edit2 size={12} /> <span>Edit</span>
                </button>
            ) : (
                <button 
                    onClick={handleSave} 
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#FF4D00] text-black rounded-full hover:bg-[#ff6a2b] transition-all shadow-[0_0_15px_rgba(255,77,0,0.4)]"
                >
                    <Check size={12} /> <span>Done</span>
                </button>
            )}
            <button 
                onClick={onClose} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-colors backdrop-blur-sm"
            >
                <X size={16} />
            </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 overflow-hidden w-full max-w-4xl mx-auto">
        
        {/* VIEW MODE: CINEMATIC SCROLL */}
        {mode === 'VIEW' ? (
            parsedLyrics.length > 0 ? (
                <div 
                    ref={containerRef}
                    className="h-full w-full overflow-hidden relative cursor-grab active:cursor-grabbing"
                    onWheel={handleWheel}
                    onTouchMove={() => setIsUserScrolling(true)}
                >
                    {/* Floating Resume Button */}
                    <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isUserScrolling ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <button 
                            onClick={handleResumeSync}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FF4D00] text-black font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            <PlayCircle size={16} fill="black" />
                            <span>Resume Sync</span>
                        </button>
                    </div>

                    {/* Transform Container */}
                    <div 
                        ref={contentRef}
                        className="w-full px-8 py-[40vh] transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)"
                        style={{ transform: `translate3d(0, ${isUserScrolling ? 0 : translateY}px, 0)` }}
                    >
                        {parsedLyrics.map((line, index) => {
                            const isActive = index === activeIndex;
                            const isNear = Math.abs(index - activeIndex) <= 1;
                            const isPast = index < activeIndex;
                            
                            // Visual Hierarchy Logic
                            let opacity = 0.2;
                            let scale = 0.9;
                            let blur = '2px';
                            let weight = '400';
                            let color = 'rgba(255,255,255,0.4)';

                            if (isActive) {
                                opacity = 1;
                                scale = 1.05;
                                blur = '0px';
                                weight = '700';
                                color = '#ffffff';
                            } else if (isNear) {
                                opacity = 0.6;
                                scale = 0.98;
                                blur = '0.5px';
                                color = 'rgba(255,255,255,0.8)';
                            }

                            return (
                                <div
                                    key={index}
                                    ref={(el) => { lineRefs.current[index] = el; }}
                                    onClick={() => handleLineClick(line.time)}
                                    className="mb-10 text-center origin-center transition-all duration-700 ease-out cursor-pointer hover:opacity-100 group"
                                    style={{ 
                                        opacity, 
                                        transform: `scale(${scale})`,
                                        filter: `blur(${blur})`,
                                    }}
                                >
                                    <p 
                                        className="text-3xl md:text-4xl lg:text-5xl leading-tight font-sans tracking-tight"
                                        style={{ color, fontWeight: weight }}
                                    >
                                        {line.text}
                                    </p>
                                    
                                    {/* Timestamp hint on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-[#FF4D00] mt-2">
                                        {(line.time / 60).toFixed(0).padStart(2, '0')}:{(line.time % 60).toFixed(0).padStart(2, '0')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-white/30">
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6">
                        <AlignCenter size={24} />
                    </div>
                    <p className="font-sans text-lg">No time-synced lyrics available</p>
                    <button 
                        onClick={() => setMode('EDIT')}
                        className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium transition-colors"
                    >
                        Open Editor
                    </button>
                </div>
            )
        ) : (
            // EDIT MODE (Preserved functional layout but restyled)
            <div className="h-full p-8 flex flex-col max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-mono text-[#FF4D00] font-bold">LRC SOURCE EDITOR</label>
                    <span className="text-[10px] font-mono text-white/40">SUPPORTS [MM:SS.xx] FORMAT</span>
                </div>
                <textarea 
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl p-6 font-mono text-sm text-gray-300 focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] outline-none resize-none leading-relaxed shadow-inner"
                    value={rawLyrics}
                    onChange={(e) => setRawLyrics(e.target.value)}
                    placeholder="[00:12.50] Paste your lyrics here..."
                    spellCheck={false}
                />
            </div>
        )}
      </div>

    </div>
  );
};

export default LyricsModule;