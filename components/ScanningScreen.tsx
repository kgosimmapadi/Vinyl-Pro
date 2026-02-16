
import React, { useEffect, useState, useRef } from 'react';
import { HardDrive } from 'lucide-react';

interface ScanningScreenProps {
  progress: number; // 0-100
  currentFile: string;
  logs: string[];
  onComplete?: () => void; // Optional, driven by parent
}

const ScanningScreen: React.FC<ScanningScreenProps> = ({ progress, currentFile, logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white font-mono">
      <div className="w-full max-w-md p-8 border border-[#222] bg-[#050505] relative">
        
        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-12 border-b border-[#222] pb-6">
           <div className="w-12 h-12 bg-[#FF4D00] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,77,0,0.4)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" strokeWidth="0.5" />
                <circle cx="12" cy="12" r="3" strokeWidth="0.5" />
                <circle cx="12" cy="12" r="1" fill="black" stroke="none" />
                <path d="M21.5 4.5 L15 10" strokeWidth="1.5" />
                <path d="M15 10 L13.5 12" strokeWidth="1.5" />
                <circle cx="21.5" cy="4.5" r="1.5" fill="black" stroke="none" />
              </svg>
           </div>
           <div>
              <h1 className="text-xl font-bold tracking-tight text-white">VINYL OS</h1>
              <p className="text-[10px] text-[#666] uppercase tracking-widest">Production Build v1.0.0</p>
           </div>
        </div>

        {/* Status Display */}
        <div className="mb-8 space-y-2">
           <div className="flex justify-between text-xs text-[#888]">
              <span>SYSTEM STATUS</span>
              <span className={progress >= 100 ? "text-[#FF4D00]" : "text-white animate-pulse"}>
                {progress >= 100 ? "READY" : "INDEXING ASSETS"}
              </span>
           </div>
           <div className="w-full h-1 bg-[#222]">
              <div 
                className="h-full bg-[#FF4D00] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
           </div>
           <div className="flex justify-between text-[10px] text-[#444]">
              <span className="truncate max-w-[200px]">{currentFile || 'Initializing I/O...'}</span>
              <span>{Math.round(progress)}%</span>
           </div>
        </div>

        {/* Terminal Output */}
        <div ref={logContainerRef} className="bg-black p-4 border border-[#222] h-40 flex flex-col overflow-hidden">
           {logs.length === 0 && <div className="text-xs text-[#444]">Waiting for input...</div>}
           {logs.map((log, i) => (
             <div key={i} className="text-xs text-[#888] truncate font-mono">{log}</div>
           ))}
           {progress < 100 && <div className="text-xs text-[#FF4D00] mt-1 animate-pulse">_</div>}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-[10px] text-[#444]">
           <div className="flex items-center gap-2">
             <HardDrive size={12} />
             <span>Secure Enclave Active</span>
           </div>
           <div>
             SIGNED BUILD
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScanningScreen;
