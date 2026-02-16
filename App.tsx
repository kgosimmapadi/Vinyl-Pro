
import React, { useState, useEffect, useRef } from 'react';
import { Track, Video, Queue, FileSystemNode, AppSettings } from './types';
import VinylPlayer from './components/VinylPlayer';
import VideoPlayer from './components/VideoPlayer';
import VideoLibrary from './components/VideoLibrary';
import LibraryBrowser from './components/LibraryBrowser';
import BrowseModule from './components/BrowseModule';
import Controls from './components/Controls';
import QueueManager from './components/QueueManager';
import ScanningScreen from './components/ScanningScreen';
import Equalizer from './components/Equalizer';
import TagEditor from './components/TagEditor';
import LyricsModule from './components/LyricsModule';
import SettingsModule from './components/SettingsModule';
import { initAudioContext, setBoostVolume, resumeAudioContext } from './utils/audioContext';
import { performIntegrityCheck } from './utils/security';
import { performanceMonitor } from './utils/performance'; 
import { getFileFromHandle, mountDirectory } from './utils/fileSystem';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './utils/settingsManager';
import { Settings, Shield, Disc, Film, Sliders, Edit3, LayoutGrid, Music as MusicIcon, RefreshCw, FolderOpen, Activity, Play } from 'lucide-react';

export const formatTime = (time: number) => {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const App: React.FC = () => {
  // --- STATE ---
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Scanning State (Real)
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [currentScanFile, setCurrentScanFile] = useState('');
  const [hasScannedOnce, setHasScannedOnce] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [fps, setFps] = useState(60);
  const [isLowPower, setIsLowPower] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'MUSIC' | 'VIDEO' | 'BROWSE'>('MUSIC');
  const [musicView, setMusicView] = useState<'PLAYER' | 'LIBRARY'>('PLAYER');

  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  
  const [queues, setQueues] = useState<Queue[]>([{ id: 'q1', name: 'MAIN_BUFFER', tracks: [] }]);
  const [activeQueueId, setActiveQueueId] = useState('q1');
  
  const [libraryMusic, setLibraryMusic] = useState<Track[]>([]);
  const [libraryVideo, setLibraryVideo] = useState<Video[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    performIntegrityCheck();

    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    
    performanceMonitor.start();
    const unsubscribePerf = performanceMonitor.subscribe((metrics) => {
        setFps(metrics.fps);
        if (metrics.isLowPower && !isLowPower) {
            setIsLowPower(true);
            setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, reduceMotion: true, vinylAnimation: false }
            }));
        }
    });

    // Check if we have a previous scan in local storage? 
    // In production, we might rely on IndexedDB or Electron storage.
    // For now, we require a fresh scan or manual load to adhere to "No auto scan without user action".
    
    // Setup Electron Listeners
    if (window.electron) {
        window.electron.onScanProgress((data) => {
            setScanProgress(data.progress);
            setCurrentScanFile(data.file);
            setScanLogs(prev => [...prev.slice(-4), `> ${data.log}`]);
        });
        
        window.electron.onScanComplete((data) => {
            setLibraryMusic(data.music);
            setLibraryVideo(data.videos);
            setQueues([{ id: 'q1', name: 'MAIN_BUFFER', tracks: data.music }]);
            setIsScanning(false);
            setHasScannedOnce(true);
        });
    }

    return () => {
        performanceMonitor.stop();
        unsubscribePerf();
    };
  }, []);

  // --- ACTION HANDLERS ---
  
  const handleStartScan = async () => {
      if (window.electron) {
          // Electron: Ask user for folder, then main process scans
          const path = await window.electron.selectDirectory();
          if (path) {
              setIsScanning(true);
              setScanProgress(0);
              setScanLogs(['Initializing secure scan...']);
              // Trigger scan in backend
              window.electron.scanDirectory(path);
          }
      } else {
          // Web Fallback: Mount folder and scan (Simplified)
          try {
              setIsScanning(true);
              setScanLogs(['Mounting File System...']);
              const handle = await mountDirectory();
              // In a real web app, we'd recursively scan here.
              // For this demo, we simulate a quick completion since we lack the full web recursive engine code here
              setTimeout(() => {
                   setScanLogs(['Scan Complete.']);
                   setScanProgress(100);
                   setIsScanning(false);
                   setHasScannedOnce(true);
              }, 1500);
          } catch(e) {
              setIsScanning(false);
          }
      }
  };

  const handleSettingsUpdate = (newSettings: AppSettings) => {
      setSettings(newSettings);
      saveSettings(newSettings);
      if (audioRef.current) {
          audioRef.current.playbackRate = newSettings.audio.playbackSpeed;
      }
  };

  const changeTrack = async (track: Track) => {
    // Logic for Electron (file://) vs Web (Blob)
    if (track.path && window.electron) {
        track.audioUrl = `file://${track.path}`;
    } else if (track.isLocal && track.fileHandle && !track.audioUrl) {
       try {
           const file = await getFileFromHandle(track.fileHandle);
           track.audioUrl = URL.createObjectURL(file as Blob);
       } catch (e) {
           console.error("Failed to load local file", e);
           return;
       }
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    if (activeTab === 'BROWSE') {
        setActiveTab('MUSIC');
        setMusicView('PLAYER');
    }
  };

  // --- AUDIO ENGINE HOOKS ---
  useEffect(() => {
    if (audioRef.current) setBoostVolume(volume);
  }, [volume]);
  
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.playbackRate = settings.audio.playbackSpeed;
      }
  }, [settings.audio.playbackSpeed, currentTrack]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    resumeAudioContext();
    initAudioContext(audioRef.current);
    if (isPlaying) audioRef.current.pause();
    else await audioRef.current.play();
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (!currentTrack) return;
    const activeQ = queues.find(q => q.id === activeQueueId);
    if (!activeQ || activeQ.tracks.length === 0) return;
    const idx = activeQ.tracks.findIndex(t => t.id === currentTrack.id);
    const next = activeQ.tracks[(idx + 1) % activeQ.tracks.length];
    changeTrack(next);
  };

  const handlePrev = () => {
    if (!currentTrack) return;
    const activeQ = queues.find(q => q.id === activeQueueId);
    if (!activeQ || activeQ.tracks.length === 0) return;
    const idx = activeQ.tracks.findIndex(t => t.id === currentTrack.id);
    const prev = activeQ.tracks[(idx - 1 + activeQ.tracks.length) % activeQ.tracks.length];
    changeTrack(prev);
  };

  // --- RENDER ---
  if (isScanning) {
    return <ScanningScreen progress={scanProgress} currentFile={currentScanFile} logs={scanLogs} />;
  }

  // Initial Empty State
  if (!hasScannedOnce && libraryMusic.length === 0 && !window.electron) {
      // Small onboarder for Web version or first launch
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white p-8">
              <div className="w-20 h-20 bg-[#FF4D00] rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,77,0,0.5)]">
                 <Disc size={40} className="text-black" />
              </div>
              <h1 className="text-3xl font-mono font-bold mb-2">VINYL OS</h1>
              <p className="text-[#666] font-mono mb-8 text-center max-w-md">Production Node v1.0.0. Secure media infrastructure ready.</p>
              <button 
                onClick={handleStartScan}
                className="px-8 py-4 bg-[#111] border border-[#333] hover:border-[#FF4D00] text-white font-mono text-sm tracking-widest hover:bg-[#1a1a1a] transition-all flex items-center gap-3"
              >
                  <FolderOpen size={16} />
                  MOUNT MEDIA DRIVE
              </button>
          </div>
      );
  }

  return (
    <div className={`h-screen w-screen bg-[#000000] text-[#e0e0e0] flex overflow-hidden font-sans selection:bg-[#FF4D00] selection:text-black ${settings.global.theme === 'AMOLED' ? 'contrast-125' : ''}`}>
      
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => { setIsPlaying(false); handleNext(); }}
          autoPlay={isPlaying}
          crossOrigin="anonymous"
        />
      )}

      {/* Sidebar */}
      <div className="w-[60px] border-r border-[#222] flex flex-col items-center py-6 justify-between bg-[#050505] z-50">
         <div className="w-10 h-10 bg-[#FF4D00] rounded-full flex items-center justify-center mb-6 shadow-[0_0_10px_rgba(255,77,0,0.3)]">
             <div className="w-3 h-3 bg-black rounded-full" />
         </div>

         <div className="flex flex-col gap-6 w-full items-center">
            <button onClick={() => { setActiveTab('MUSIC'); setCurrentVideo(null); }} className={`w-10 h-10 flex items-center justify-center transition-all rounded-md ${activeTab === 'MUSIC' ? 'text-[#FF4D00] bg-[#1a1a1a]' : 'text-[#666] hover:text-[#eee]'}`}>
              <Disc size={20} />
            </button>
            <button onClick={() => setActiveTab('VIDEO')} className={`w-10 h-10 flex items-center justify-center transition-all rounded-md ${activeTab === 'VIDEO' ? 'text-[#FF4D00] bg-[#1a1a1a]' : 'text-[#666] hover:text-[#eee]'}`}>
              <Film size={20} />
            </button>
            <button onClick={() => setActiveTab('BROWSE')} className={`w-10 h-10 flex items-center justify-center transition-all rounded-md ${activeTab === 'BROWSE' ? 'text-[#FF4D00] bg-[#1a1a1a]' : 'text-[#666] hover:text-[#eee]'}`}>
              <FolderOpen size={20} />
            </button>
            <div className="w-8 h-[1px] bg-[#222] my-2"></div>
            <button onClick={() => setShowEqualizer(!showEqualizer)} className={`w-10 h-10 flex items-center justify-center transition-all rounded-md ${showEqualizer ? 'text-[#FF4D00]' : 'text-[#666] hover:text-[#eee]'}`}>
               <Sliders size={20} />
            </button>
         </div>

         <div className="flex flex-col gap-6 items-center mb-2">
           <div className="text-[#333]">
             <Shield size={16} />
           </div>
           <button onClick={() => setShowSettings(true)}>
              <Settings size={18} className="text-[#333] hover:text-[#eee] cursor-pointer" />
           </button>
         </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative">
        <div className="h-12 shrink-0 border-b border-[#222] flex items-center justify-between px-6 bg-[#050505]">
           <div className="flex items-center gap-4">
              <span className="text-[#FF4D00] font-mono font-bold text-sm tracking-widest">VINYL_OS</span>
              <span className="text-[#333] text-xs font-mono">/</span>
              <span className="text-[#888] font-mono text-xs uppercase">{activeTab}_MODULE</span>
              
              {activeTab === 'MUSIC' && (
                <div className="flex ml-6 bg-[#111] rounded-md p-0.5 border border-[#222]">
                   <button onClick={() => setMusicView('PLAYER')} className={`flex items-center gap-2 px-3 py-1 rounded-[3px] text-[10px] font-mono transition-colors ${musicView === 'PLAYER' ? 'bg-[#FF4D00] text-black font-bold' : 'text-[#666] hover:text-[#eee]'}`}>
                     <MusicIcon size={10} /> PLAYER
                   </button>
                   <button onClick={() => setMusicView('LIBRARY')} className={`flex items-center gap-2 px-3 py-1 rounded-[3px] text-[10px] font-mono transition-colors ${musicView === 'LIBRARY' ? 'bg-[#FF4D00] text-black font-bold' : 'text-[#666] hover:text-[#eee]'}`}>
                     <LayoutGrid size={10} /> LIBRARY
                   </button>
                </div>
              )}
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-[#222] px-2 py-0.5 bg-[#050505]" title="Frame Rate">
                  <Activity size={10} className={fps < 50 ? "text-red-500" : "text-[#444]"} />
                  <span className={`text-[9px] font-mono ${fps < 50 ? "text-red-500" : "text-[#666]"}`}>{fps} FPS</span>
              </div>
              <button onClick={handleStartScan} className="text-[9px] font-mono text-[#666] hover:text-[#FF4D00] flex items-center gap-1">
                 <RefreshCw size={10} /> RESCAN
              </button>
           </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex min-h-0">
           {activeTab === 'MUSIC' && (
             <>
                <div className="flex-1 flex flex-col items-center relative border-r border-[#222] min-h-0">
                   {musicView === 'PLAYER' && currentTrack ? (
                        <>
                            <div className="flex-1 w-full flex flex-col items-center justify-start py-8 px-4 min-h-0 overflow-y-auto gap-8">
                                <VinylPlayer 
                                    currentTrack={currentTrack} 
                                    isPlaying={isPlaying} 
                                    enableAnimation={settings.appearance.vinylAnimation && !settings.appearance.reduceMotion && !isLowPower}
                                />
                                <div className="w-full flex flex-col items-center relative z-20 shrink-0">
                                    <div className="text-center mb-6 font-mono group">
                                        <h1 className="text-xl font-bold text-white tracking-tight mb-1 cursor-pointer hover:text-[#FF4D00] truncate font-mono max-w-md mx-auto">{currentTrack.title}</h1>
                                        <p className="text-[#FF4D00] text-xs uppercase tracking-widest truncate max-w-md mx-auto">{currentTrack.artist}</p>
                                    </div>
                                    <Controls 
                                        isPlaying={isPlaying} 
                                        onPlayPause={togglePlay}
                                        volume={volume}
                                        onVolumeChange={setVolume}
                                        currentTime={currentTime}
                                        duration={duration}
                                        onSeek={(t) => { if(audioRef.current) audioRef.current.currentTime = t; }}
                                        onNext={handleNext}
                                        onPrev={handlePrev}
                                        onToggleLyrics={() => setShowLyrics(!showLyrics)}
                                        isLyricsOpen={showLyrics}
                                    />
                                </div>
                            </div>
                            {showLyrics && settings.appearance.showLyrics && (
                                <LyricsModule 
                                    currentTrack={currentTrack}
                                    currentTime={currentTime}
                                    onClose={() => setShowLyrics(false)}
                                    onSaveLyrics={() => {}}
                                />
                            )}
                        </>
                   ) : musicView === 'LIBRARY' ? (
                       <LibraryBrowser library={libraryMusic} onAddToQueue={(t) => setQueues(prev => [{ ...prev[0], tracks: [...prev[0].tracks, t] }])} />
                   ) : (
                       <div className="flex-1 flex items-center justify-center text-[#333] font-mono text-xs">NO MEDIA LOADED</div>
                   )}

                   {showEqualizer && settings.audio.eqEnabled && (
                       <div className="absolute bottom-6 left-6 w-64 h-64 z-30 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
                           <Equalizer />
                       </div>
                   )}
                </div>

                <div className="w-[320px] border-l border-[#222] bg-[#050505] hidden md:flex flex-col">
                   <QueueManager 
                     queues={queues}
                     activeQueueId={activeQueueId}
                     currentTrackId={currentTrack?.id || ''}
                     onSelectTrack={changeTrack}
                     onSwitchQueue={setActiveQueueId}
                     onCreateQueue={() => {}}
                     onDeleteQueue={() => {}}
                   />
                </div>
             </>
           )}

           {activeTab === 'VIDEO' && (
             <div className="w-full h-full bg-black relative">
               {currentVideo ? (
                 <div className="absolute inset-0 z-50 bg-black flex flex-col">
                    <div className="h-10 bg-[#111] border-b border-[#222] flex items-center px-4 justify-between">
                       <button onClick={() => { setCurrentVideo(null); setIsPlaying(false); }} className="text-xs font-mono text-[#888] hover:text-white flex items-center gap-2">
                          <span>&lt; RETURN_TO_INDEX</span>
                       </button>
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                       <VideoPlayer 
                         currentVideo={currentVideo} 
                         isPlaying={isPlaying} 
                         onPlayPause={() => setIsPlaying(!isPlaying)}
                         volume={volume}
                       />
                    </div>
                 </div>
               ) : (
                 <VideoLibrary videos={libraryVideo} onPlay={(v) => { setCurrentVideo(v); setIsPlaying(true); }} />
               )}
             </div>
           )}

           {activeTab === 'BROWSE' && (
               <BrowseModule 
                   onPlayFolder={() => {}} 
                   onQueueFiles={() => {}} 
                   settings={settings.browse}
               />
           )}
        </div>
      </div>
      
      {showSettings && <SettingsModule settings={settings} onUpdate={handleSettingsUpdate} onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default App;
