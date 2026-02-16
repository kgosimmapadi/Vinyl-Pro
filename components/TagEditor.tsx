import React from 'react';
import { Track } from '../types';
import { X, Save, Disc } from 'lucide-react';

interface TagEditorProps {
    track: Track | null;
    onClose: () => void;
    onSave: (updated: Track) => void;
}

const TagEditor: React.FC<TagEditorProps> = ({ track, onClose, onSave }) => {
    if (!track) return null;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-8">
            <div className="w-full max-w-lg bg-[#050505] border border-[#333] shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
                    <div className="flex items-center gap-2 text-[#FF4D00]">
                        <Disc size={16} />
                        <h2 className="font-mono font-bold text-sm tracking-widest">METADATA_INSPECTOR</h2>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white"><X size={16}/></button>
                </div>

                <div className="grid grid-cols-2 gap-6 font-mono text-xs">
                    <div className="col-span-2 flex gap-4 items-center">
                        <div className="w-20 h-20 bg-[#111] border border-[#333] flex items-center justify-center overflow-hidden">
                            <img src={track.coverUrl} className="w-full h-full object-cover" />
                        </div>
                        <button className="text-[10px] bg-[#111] border border-[#333] px-3 py-1 hover:border-[#FF4D00]">
                            REPLACE_ASSET
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[#666]">TRACK_TITLE</label>
                        <input className="bg-[#0a0a0c] border border-[#333] p-2 text-white focus:border-[#FF4D00] outline-none" defaultValue={track.title} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[#666]">ARTIST</label>
                        <input className="bg-[#0a0a0c] border border-[#333] p-2 text-white focus:border-[#FF4D00] outline-none" defaultValue={track.artist} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[#666]">ALBUM</label>
                        <input className="bg-[#0a0a0c] border border-[#333] p-2 text-white focus:border-[#FF4D00] outline-none" defaultValue={track.album} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[#666]">GENRE</label>
                        <input className="bg-[#0a0a0c] border border-[#333] p-2 text-white focus:border-[#FF4D00] outline-none" defaultValue="Electronic" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-[#333] text-[#888] hover:bg-[#111] font-mono text-xs">CANCEL</button>
                    <button className="px-4 py-2 bg-[#FF4D00] text-black font-bold font-mono text-xs hover:bg-[#e04400] flex items-center gap-2">
                        <Save size={12} />
                        WRITE_TAGS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TagEditor;