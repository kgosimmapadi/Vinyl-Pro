
import React, { useState, useEffect } from 'react';
import { 
    Folder, FileAudio, FileVideo, HardDrive, ChevronRight, 
    ArrowLeft, Home, Play
} from 'lucide-react';
import { mountDirectory, scanDirectory } from '../utils/fileSystem';
import { getFileType } from '../utils/mediaFilter';
import { FileSystemNode, BrowseSettings } from '../types';
import { VirtualList } from './VirtualList'; // Optimized Renderer

interface BrowseModuleProps {
    onPlayFolder: (files: FileSystemNode[], startIndex: number) => void;
    onQueueFiles: (files: FileSystemNode[]) => void;
    settings: BrowseSettings;
}

const BrowseModule: React.FC<BrowseModuleProps> = ({ onPlayFolder, onQueueFiles, settings }) => {
    // State
    const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | string | null>(null);
    const [currentHandle, setCurrentHandle] = useState<FileSystemDirectoryHandle | string | null>(null);
    const [history, setHistory] = useState<{ handle: FileSystemDirectoryHandle | string; name: string }[]>([]);
    const [items, setItems] = useState<FileSystemNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const getHandleName = (handle: FileSystemDirectoryHandle | string): string => {
        if (typeof handle === 'string') return handle;
        return handle.name;
    };

    // Mount Handler
    const handleMount = async () => {
        try {
            const handle = await mountDirectory();
            setRootHandle(handle);
            setCurrentHandle(handle);
            const name = getHandleName(handle);
            setHistory([{ handle, name }]);
        } catch (err) {
            console.log("Mount cancelled");
        }
    };

    // Directory Scanner (Optimized)
    useEffect(() => {
        const loadDir = async () => {
            if (!currentHandle) return;
            setIsLoading(true);
            setItems([]); // Clear immediate to avoid ghost interactions
            try {
                const path = history.map(h => h.name).join('/');
                // Async scan with time-slicing
                const nodes = await scanDirectory(currentHandle, path, {
                    showHidden: settings.showHiddenFiles,
                    sortMethod: settings.sortMethod
                });
                setItems(nodes);
            } catch (error) {
                console.error("Failed to scan directory", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDir();
    }, [currentHandle, settings]);

    // Navigation
    const handleNavigate = async (node: FileSystemNode) => {
        if (node.kind === 'directory') {
            const newHandle = node.handle ? (node.handle as FileSystemDirectoryHandle) : node.path;
            setHistory(prev => [...prev, { handle: newHandle, name: node.name }]);
            setCurrentHandle(newHandle);
            setSelectedIds(new Set()); 
        }
    };

    const handleBack = () => {
        if (history.length <= 1) return;
        const newHistory = [...history];
        newHistory.pop();
        setHistory(newHistory);
        setCurrentHandle(newHistory[newHistory.length - 1].handle);
    };

    const handleBreadcrumb = (index: number) => {
        const newHistory = history.slice(0, index + 1);
        setHistory(newHistory);
        setCurrentHandle(newHistory[newHistory.length - 1].handle);
    };

    // Selection & Playback
    const toggleSelection = (path: string, multi: boolean) => {
        const newSet = multi ? new Set(selectedIds) : new Set<string>();
        if (newSet.has(path)) newSet.delete(path);
        else newSet.add(path);
        setSelectedIds(newSet);
    };

    const handleFileClick = (node: FileSystemNode) => {
        toggleSelection(node.path, false);
    };

    const handleFileDoubleClick = (node: FileSystemNode) => {
        if (node.kind === 'directory') {
            handleNavigate(node);
        } else {
            const playableItems = items.filter(i => i.kind === 'file');
            const index = playableItems.findIndex(i => i.path === node.path);
            if (index !== -1) {
                onPlayFolder(playableItems, index);
            }
        }
    };

    const handlePlaySelection = () => {
        const selectedNodes = items.filter(i => selectedIds.has(i.path) && i.kind === 'file');
        if (selectedNodes.length > 0) {
            onPlayFolder(selectedNodes, 0);
        }
    };

    const getIcon = (node: FileSystemNode) => {
        if (node.kind === 'directory') return <Folder size={18} className="text-[#FF4D00]" />;
        const type = getFileType(node.name);
        return type === 'VIDEO' 
            ? <FileVideo size={18} className="text-blue-400" /> 
            : <FileAudio size={18} className="text-[#ccc]" />;
    };

    // VIRTUALIZED ITEM RENDERER
    const renderRow = (node: FileSystemNode, index: number, style: React.CSSProperties) => {
        const isSelected = selectedIds.has(node.path);
        return (
            <div 
                key={node.path}
                style={style}
                onClick={(e) => {
                    e.stopPropagation();
                    if (e.ctrlKey || e.metaKey) toggleSelection(node.path, true);
                    else handleFileClick(node);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleFileDoubleClick(node);
                }}
                className={`group grid grid-cols-[auto_1fr_auto_auto] gap-4 px-3 items-center cursor-pointer border-b border-[#111] hover:bg-[#111] select-none transition-colors h-[40px] ${isSelected ? 'bg-[#1a1a1a] text-[#FF4D00]' : 'text-[#aaa]'}`}
            >
                <div className="w-6 flex justify-center opacity-70 group-hover:opacity-100">
                    {getIcon(node)}
                </div>
                <div className="font-mono text-xs truncate">
                    {node.name}
                </div>
                <div className="w-24 text-right font-mono text-[10px] text-[#555] group-hover:text-[#888]">
                    {node.kind === 'file' ? 'FILE' : 'DIR'}
                </div>
            </div>
        );
    };

    if (!rootHandle) {
        return (
            <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mb-6 border border-[#222]">
                    <HardDrive size={40} className="text-[#444]" />
                </div>
                <h2 className="text-xl font-mono font-bold text-white mb-2">NO_DRIVE_MOUNTED</h2>
                <p className="text-[#666] font-mono text-xs max-w-md mb-8">
                    Select a local directory to mount as a media source. Vinyl OS requires permission to access your file system.
                </p>
                <button 
                    onClick={handleMount}
                    className="px-6 py-3 bg-[#FF4D00] hover:bg-[#ff6a2b] text-black font-bold font-mono text-sm rounded-sm flex items-center gap-2 transition-all"
                >
                    <HardDrive size={16} />
                    MOUNT_LOCAL_DRIVE
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#000000] flex flex-col">
            {/* Top Navigation Bar */}
            <div className="h-14 border-b border-[#222] bg-[#050505] flex items-center px-4 gap-4 shrink-0">
                <button 
                    onClick={handleBack}
                    disabled={history.length <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] disabled:opacity-30 disabled:hover:bg-transparent text-[#eee] transition-colors"
                >
                    <ArrowLeft size={16} />
                </button>

                <div className="flex-1 flex items-center gap-1 overflow-hidden px-2 py-1 bg-[#0a0a0c] border border-[#222] rounded-md">
                     <HardDrive size={12} className="text-[#FF4D00] mr-2 shrink-0" />
                     <div className="flex items-center gap-1 text-xs font-mono overflow-x-auto scrollbar-hide whitespace-nowrap mask-linear-fade">
                        {history.map((h, i) => (
                            <React.Fragment key={i}>
                                <span 
                                    onClick={() => handleBreadcrumb(i)}
                                    className="hover:text-[#FF4D00] cursor-pointer text-[#888] hover:underline"
                                >
                                    {h.name}
                                </span>
                                {i < history.length - 1 && <ChevronRight size={10} className="text-[#444]" />}
                            </React.Fragment>
                        ))}
                     </div>
                </div>

                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <button 
                            onClick={handlePlaySelection}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#FF4D00] text-black text-xs font-bold font-mono rounded-sm hover:bg-[#ff6a2b] animate-in slide-in-from-right-2"
                        >
                            <Play size={12} fill="black" />
                            PLAY_SELECTED ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0">
                {/* Side Panel */}
                <div className="w-48 border-r border-[#222] bg-[#030303] hidden md:flex flex-col py-4">
                    <div className="px-4 mb-2 text-[10px] font-mono text-[#666] font-bold tracking-widest">MOUNT_POINTS</div>
                    <div 
                        className="flex items-center gap-2 px-4 py-2 bg-[#111] text-[#FF4D00] border-l-2 border-[#FF4D00] cursor-pointer"
                        onClick={() => handleBreadcrumb(0)}
                    >
                        <HardDrive size={14} />
                        <span className="text-xs font-mono truncate">{getHandleName(rootHandle)}</span>
                    </div>
                    
                    <div className="mt-auto px-4">
                        <div className="p-3 border border-[#222] bg-[#080808] rounded-md">
                            <div className="text-[9px] text-[#666] font-mono mb-1">TOTAL_ITEMS</div>
                            <div className="text-xl text-[#eee] font-mono">{items.length}</div>
                        </div>
                    </div>
                </div>

                {/* File List - Virtualized */}
                <div className="flex-1 bg-black relative flex flex-col" onClick={() => setSelectedIds(new Set())}>
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-[#FF4D00] font-mono text-xs">
                                <div className="w-2 h-2 bg-[#FF4D00] animate-bounce" />
                                SCANNING_SECTOR...
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-3 py-2 border-b border-[#222] text-[10px] font-mono text-[#666] uppercase bg-black z-10 shrink-0">
                        <div className="w-6">Type</div>
                        <div>Name</div>
                        <div className="w-24 text-right">Size</div>
                    </div>

                    {/* Virtual List Container */}
                    <div className="flex-1 min-h-0">
                        {items.length === 0 ? (
                            <div className="py-20 text-center text-[#333] font-mono text-xs">
                                [EMPTY_DIRECTORY]
                            </div>
                        ) : (
                            <VirtualList 
                                items={items}
                                itemHeight={40}
                                height="100%"
                                renderItem={renderRow}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            <div className="h-6 border-t border-[#222] bg-[#050505] flex items-center px-4 justify-between text-[9px] font-mono text-[#444]">
                <span>{currentHandle ? getHandleName(currentHandle).toUpperCase() : 'NO_ROOT'}</span>
                <span>SELECTED: {selectedIds.size}</span>
            </div>
        </div>
    );
};

export default BrowseModule;
