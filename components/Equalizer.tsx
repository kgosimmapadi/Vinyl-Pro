import React from 'react';
import { Sliders } from 'lucide-react';
import { setEQGain } from '../utils/audioContext';

const FREQUENCIES = ['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'];

const Equalizer: React.FC = () => {
  const handleChange = (index: number, value: string) => {
    const gain = parseFloat(value);
    setEQGain(index, gain);
  };

  return (
    <div className="bg-[#050505] border border-[#222] p-4 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-[#222] pb-2">
         <div className="flex items-center gap-2 text-[#FF4D00] text-xs font-mono font-bold">
            <Sliders size={14} />
            <span>AUDIO_PROCESSOR</span>
         </div>
         <div className="text-[9px] text-[#666] font-mono">5-BAND EQ</div>
      </div>

      <div className="flex-1 flex justify-between items-center px-2">
        {FREQUENCIES.map((freq, i) => (
          <div key={freq} className="flex flex-col items-center h-full gap-2">
            <div className="relative h-32 w-8 bg-[#0a0a0c] rounded-full border border-[#222] overflow-hidden group">
               {/* Center Line */}
               <div className="absolute top-1/2 w-full h-[1px] bg-[#333]"></div>
               
               <input 
                 type="range" 
                 min="-12" 
                 max="12" 
                 defaultValue="0" 
                 step="0.1"
                 className="absolute w-32 h-8 -rotate-90 top-12 -left-12 opacity-0 cursor-pointer z-20"
                 onChange={(e) => {
                    handleChange(i, e.target.value);
                    const thumb = document.getElementById(`thumb-${i}`);
                    if(thumb) thumb.style.bottom = `${(parseInt(e.target.value) + 12) / 24 * 100}%`;
                 }}
               />
               
               {/* Visual Thumb */}
               <div 
                 id={`thumb-${i}`}
                 className="absolute left-1 w-6 h-3 bg-[#333] border border-[#555] rounded-sm pointer-events-none transition-all duration-75 bottom-[50%] translate-y-[50%]"
               />
            </div>
            <span className="text-[9px] font-mono text-[#666]">{freq}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        {['FLAT', 'BASS', 'VOCAL'].map(preset => (
            <button key={preset} className="flex-1 py-1 border border-[#333] text-[9px] text-[#666] hover:text-[#FF4D00] hover:border-[#FF4D00] transition-colors font-mono">
                {preset}
            </button>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;