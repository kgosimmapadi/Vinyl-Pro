
import React from 'react';
import { Track, Queue } from '../types';
import { Activity, Plus, X, List, Save } from 'lucide-react';
import { formatTime } from '../App';
import { VirtualList } from './VirtualList';

interface QueueManagerProps {
  queues: Queue[];
  activeQueueId: string;
  currentTrackId: string;
  onSelectTrack: (track: Track) => void;
  onSwitchQueue: (queueId: string) => void;
  onCreateQueue: () => void;
  onDeleteQueue: (id: string) => void;
}

const QueueManager: React.FC<QueueManagerProps> = ({ 
  queues, activeQueueId, currentTrackId, 
  onSelectTrack, onSwitchQueue, onCreateQueue, onDeleteQueue 
}) => {
  const activeQueue = queues.find(q => q.id === activeQueueId) || queues[0];

  const renderTrackRow = (track: Track, index: number, style: React.CSSProperties) => {
      const isActive = track.id === currentTrackId;
      return (
        <div
            key={track.id}
            style={style}
            onClick={() => onSelectTrack(track)}
            className={`group flex items-center px-4 cursor-pointer border-b border-[#111] hover:bg-[#111] transition-colors h-[40px] ${
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
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border border-[#222] overflow-hidden">
      {/* Header / Tabs */}
      <div className="flex items-center overflow-x-auto bg-[#0a0a0c] border-b border-[#222] scrollbar-hide shrink-0">
        {queues.map(queue => (
            <div 
                key={queue.id}
                onClick={() => onSwitchQueue(queue.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[10px] font-mono cursor-pointer border-r border-[#222] min-w-[100px] hover:bg-[#111] transition-colors ${
                    queue.id === activeQueueId ? 'bg-[#111] text-[#FF4D00] border-t-2 border-t-[#FF4D00]' : 'text-[#666] border-t-2 border-t-transparent'
                }`}
            >
                <span className="truncate max-w-[80px]">{queue.name}</span>
                {queues.length > 1 && (
                    <X 
                        size={10} 
                        className="hover:text-white" 
                        onClick={(e) => { e.stopPropagation(); onDeleteQueue(queue.id); }}
                    />
                )}
            </div>
        ))}
        <button 
            onClick={onCreateQueue}
            className="px-3 py-3 text-[#666] hover:text-[#FF4D00] hover:bg-[#111] transition-colors"
        >
            <Plus size={14} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-2 flex justify-between items-center border-b border-[#222] bg-[#080808] shrink-0">
        <div className="flex items-center gap-2 text-[#666] text-[9px] font-mono uppercase tracking-widest">
           <Activity size={10} />
           <span>BUFFER: {activeQueue.name}</span>
        </div>
        <div className="flex gap-2">
            <button className="text-[#444] hover:text-white" title="Save Queue">
                <Save size={12} />
            </button>
            <span className="px-1.5 py-0.5 border border-[#333] text-[#888] text-[9px] font-mono">
            {activeQueue.tracks.length} OBJ
            </span>
        </div>
      </div>

      {/* Virtualized List */}
      <div className="flex-1 min-h-0 bg-[#050505]">
        {activeQueue.tracks.length === 0 ? (
            <div className="p-8 text-center text-[#444] text-xs font-mono">
                [BUFFER EMPTY]
                <br/>
                Add tracks from Library
            </div>
        ) : (
            <VirtualList 
                items={activeQueue.tracks}
                itemHeight={40}
                height="100%"
                renderItem={renderTrackRow}
            />
        )}
      </div>
    </div>
  );
};

export default QueueManager;
