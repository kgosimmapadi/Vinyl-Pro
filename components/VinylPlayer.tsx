
import React, { useEffect, useState } from 'react';
import { Track } from '../types';

interface VinylPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  enableAnimation?: boolean; // New prop
}

const VinylPlayer: React.FC<VinylPlayerProps> = ({ currentTrack, isPlaying, enableAnimation = true }) => {
  // Arm rotation state
  // 85 deg = Rest position
  // 125 deg = Play position
  const [armRotation, setArmRotation] = useState(85); 

  useEffect(() => {
    if (isPlaying && enableAnimation) {
      setArmRotation(125); 
    } else {
      setArmRotation(85); 
    }
  }, [isPlaying, enableAnimation]);

  return (
    <div className="relative w-full flex items-center justify-center perspective-[1000px]">
      
      {/* TURNTABLE CHASSIS */}
      <div className="relative w-full max-w-[480px] aspect-square rounded-[1rem] bg-[#121212] shadow-smooth border border-[#1a1a1a] flex items-center justify-center group overflow-hidden select-none">
        
        {/* Matte Texture Overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.4] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>

        {/* Start/Stop Button */}
        <div className="absolute bottom-[5%] left-[5%] z-20 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full border border-[#222] flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-[#FF4D00] shadow-[0_0_15px_rgba(255,77,0,0.3)]' : 'bg-[#0f0f0f] shadow-inner'}`}>
                 <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-white' : 'bg-[#333]'}`}></div>
            </div>
            <div className="text-[8px] font-mono text-[#444] mt-2 tracking-widest font-bold">START</div>
        </div>

        {/* RPM Strobe Dots */}
        <div className="absolute bottom-[5%] right-[5%] z-20 flex flex-col gap-1 items-end">
             <div className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full opacity-80 shadow-[0_0_5px_#FF4D00]"></div>
             <div className="text-[8px] font-mono text-[#444] tracking-widest font-bold mt-1">33 / 45</div>
        </div>
        
        {/* PLATTER */}
        <div className="absolute w-[90%] h-[90%] rounded-full bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl flex items-center justify-center">
            <div className="absolute inset-2 rounded-full border border-[#151515]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#000] via-transparent to-[#222] opacity-50 rounded-full"></div>
        </div>

        {/* VINYL RECORD */}
        <div 
          className={`relative z-10 w-[86%] h-[86%] rounded-full bg-[#050505] flex items-center justify-center overflow-hidden transition-transform duration-[2000ms] ease-out shadow-xl ${isPlaying ? 'scale-[1]' : 'scale-[0.99]'}`}
        >
          {/* Grooves */}
          <div className="absolute inset-0 rounded-full vinyl-groove opacity-90" />
          
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_40%)] pointer-events-none"></div>

          {/* Rotating Label */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: enableAnimation ? `spin 1.8s linear infinite` : 'none',
              animationPlayState: isPlaying ? 'running' : 'paused',
            }}
          >
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            
            <div className="w-[38%] h-[38%] rounded-full overflow-hidden border-[4px] border-[#111] shadow-md relative z-10 bg-[#FF4D00]">
              <img 
                src={currentTrack.coverUrl} 
                alt="Label" 
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#000] rounded-full border border-[#333]"></div>
            </div>
          </div>
        </div>

        {/* TONEARM */}
        <div className="absolute inset-0 z-30 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <filter id="armShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
                    </filter>
                    <linearGradient id="armGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2a2a2a" />
                        <stop offset="50%" stopColor="#444" />
                        <stop offset="100%" stopColor="#2a2a2a" />
                    </linearGradient>
                </defs>
                
                <g transform="translate(420, 80)">
                    <circle r="40" fill="#111" stroke="#222" strokeWidth="1" filter="url(#armShadow)" />
                    <circle r="30" fill="url(#armGradient)" stroke="#111" />
                    <circle r="20" fill="#080808" stroke="#333" strokeWidth="0.5" />
                    <circle r="8" fill="#111" />
                </g>

                <g 
                    style={{ 
                        transformOrigin: '420px 80px', 
                        transform: `rotate(${armRotation}deg)`,
                        transition: enableAnimation ? 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                    }}
                >
                    <rect x="420" y="65" width="50" height="30" rx="2" fill="#1a1a1a" stroke="#222" transform="translate(-10, 0)" />
                    <path d="M420 80 L390 80 L280 340" stroke="url(#armGradient)" strokeWidth="10" strokeLinecap="round" fill="none" filter="url(#armShadow)" />
                    <g transform="translate(280, 340) rotate(22)">
                         <path d="M-5 0 L25 0 L25 45 L-5 45 Z" fill="#111" stroke="#222" filter="url(#armShadow)" />
                         <rect x="5" y="5" width="10" height="35" fill="#222" />
                         <rect x="8" y="40" width="4" height="8" fill="#FF4D00" /> 
                         <path d="M25 10 C 35 10, 35 30, 25 35" fill="none" stroke="#666" strokeWidth="2" />
                    </g>
                </g>
            </svg>
        </div>

      </div>
    </div>
  );
};

export default VinylPlayer;
