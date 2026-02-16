
import React, { useState } from 'react';
import { AppSettings, GlobalSettings, AudioSettings, VideoSettings, BrowseSettings, QueueSettings, AppearanceSettings } from '../types';
import { X, Globe, Music, Video, Folder, List, Eye, Shield, Cpu, RefreshCw } from 'lucide-react';

interface SettingsModuleProps {
    settings: AppSettings;
    onUpdate: (newSettings: AppSettings) => void;
    onClose: () => void;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ settings, onUpdate, onClose }) => {
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'AUDIO' | 'VIDEO' | 'BROWSE' | 'QUEUE' | 'APPEARANCE' | 'PRIVACY'>('GLOBAL');

    const updateSection = <K extends keyof Omit<AppSettings, 'version'>>(section: K, data: Partial<AppSettings[K]>) => {
        const updated = {
            ...settings,
            [section]: {
                ...settings[section],
                ...data
            }
        };
        onUpdate(updated);
    };

    const renderToggle = (label: string, value: boolean, onChange: (val: boolean) => void) => (
        <div className="flex items-center justify-between py-3 border-b border-[#222]">
            <span className="text-sm font-mono text-[#ccc]">{label}</span>
            <button 
                onClick={() => onChange(!value)}
                className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-[#FF4D00]' : 'bg-[#333]'}`}
            >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    const renderSelect = (label: string, value: string, options: string[], onChange: (val: any) => void) => (
        <div className="flex items-center justify-between py-3 border-b border-[#222]">
            <span className="text-sm font-mono text-[#ccc]">{label}</span>
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="bg-[#111] border border-[#333] text-xs font-mono text-white px-2 py-1 outline-none focus:border-[#FF4D00]"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    const renderRange = (label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void) => (
         <div className="flex flex-col py-3 border-b border-[#222] gap-2">
            <div className="flex justify-between">
                <span className="text-sm font-mono text-[#ccc]">{label}</span>
                <span className="text-xs font-mono text-[#FF4D00]">{value}</span>
            </div>
            <input 
                type="range" 
                min={min} max={max} step={step} 
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#333] appearance-none rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF4D00]"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full max-w-4xl h-[80vh] bg-[#050505] border border-[#222] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-[#0a0a0c] border-r border-[#222] flex flex-col">
                    <div className="p-6 border-b border-[#222]">
                        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Cpu size={18} className="text-[#FF4D00]"/>
                            SYSTEM_CONFIG
                        </h2>
                        <p className="text-[10px] text-[#666] mt-1 font-mono">NODE_ID: 8F2A // V2.0</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                        {[
                            { id: 'GLOBAL', icon: Globe, label: 'Global System' },
                            { id: 'AUDIO', icon: Music, label: 'Audio Engine' },
                            { id: 'VIDEO', icon: Video, label: 'Video Engine' },
                            { id: 'BROWSE', icon: Folder, label: 'File System' },
                            { id: 'QUEUE', icon: List, label: 'Queue Logic' },
                            { id: 'APPEARANCE', icon: Eye, label: 'Appearance' },
                            { id: 'PRIVACY', icon: Shield, label: 'Privacy & Data' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-6 py-3 text-xs font-mono transition-colors ${activeTab === item.id ? 'bg-[#111] text-[#FF4D00] border-l-2 border-[#FF4D00]' : 'text-[#888] hover:text-white hover:bg-[#0f0f0f] border-l-2 border-transparent'}`}
                            >
                                <item.icon size={14} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-[#222]">
                        <button onClick={onClose} className="w-full py-2 bg-[#FF4D00] text-black font-bold font-mono text-xs hover:bg-[#ff6a2b]">
                            SAVE & CLOSE
                        </button>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto p-8 bg-black">
                    <h3 className="text-xl font-mono text-white mb-6 border-b border-[#222] pb-4 flex items-center gap-2">
                         {activeTab}_SETTINGS
                    </h3>

                    <div className="space-y-1 max-w-2xl">
                        {activeTab === 'GLOBAL' && (
                            <>
                                {renderToggle('Restore Last Session', settings.global.restoreLastSession, (v) => updateSection('global', { restoreLastSession: v }))}
                                {renderSelect('Default Launch Module', settings.global.defaultModule, ['MUSIC', 'VIDEO', 'BROWSE'], (v) => updateSection('global', { defaultModule: v }))}
                                {renderSelect('Theme Mode', settings.global.theme, ['SYSTEM', 'DARK', 'AMOLED'], (v) => updateSection('global', { theme: v }))}
                                {renderToggle('Auto-Check Updates', settings.global.checkUpdates, (v) => updateSection('global', { checkUpdates: v }))}
                            </>
                        )}

                        {activeTab === 'AUDIO' && (
                            <>
                                {renderRange('Playback Speed Multiplier', settings.audio.playbackSpeed, 0.5, 2.0, 0.1, (v) => updateSection('audio', { playbackSpeed: v }))}
                                {renderRange('Crossfade Duration (s)', settings.audio.crossfadeDuration, 0, 12, 0.5, (v) => updateSection('audio', { crossfadeDuration: v }))}
                                {renderToggle('Parametric EQ Enabled', settings.audio.eqEnabled, (v) => updateSection('audio', { eqEnabled: v }))}
                                {renderToggle('Gapless Playback Engine', settings.audio.gapless, (v) => updateSection('audio', { gapless: v }))}
                            </>
                        )}

                        {activeTab === 'VIDEO' && (
                            <>
                                {renderToggle('Hardware Decoding Acceleration', settings.video.hardwareDecoding, (v) => updateSection('video', { hardwareDecoding: v }))}
                                {renderToggle('Auto Full-Screen on Play', settings.video.autoFullScreen, (v) => updateSection('video', { autoFullScreen: v }))}
                                {renderToggle('Enable Subtitles', settings.video.showSubtitles, (v) => updateSection('video', { showSubtitles: v }))}
                            </>
                        )}

                        {activeTab === 'BROWSE' && (
                            <>
                                {renderToggle('Show Hidden Files (.*)', settings.browse.showHiddenFiles, (v) => updateSection('browse', { showHiddenFiles: v }))}
                                {renderSelect('Default Sort Method', settings.browse.sortMethod, ['NAME', 'DATE', 'TYPE'], (v) => updateSection('browse', { sortMethod: v }))}
                                {renderRange('Recursive Scan Depth', settings.browse.recursiveDepth, 1, 5, 1, (v) => updateSection('browse', { recursiveDepth: v }))}
                            </>
                        )}

                        {activeTab === 'APPEARANCE' && (
                            <>
                                {renderToggle('Vinyl Physics Animation', settings.appearance.vinylAnimation, (v) => updateSection('appearance', { vinylAnimation: v }))}
                                {renderToggle('Reduce Motion (Low Power)', settings.appearance.reduceMotion, (v) => updateSection('appearance', { reduceMotion: v }))}
                                {renderToggle('Cinematic Lyrics Mode', settings.appearance.showLyrics, (v) => updateSection('appearance', { showLyrics: v }))}
                                {renderToggle('High Contrast Mode', settings.appearance.highContrast, (v) => updateSection('appearance', { highContrast: v }))}
                            </>
                        )}
                        
                         {activeTab === 'QUEUE' && (
                            <>
                                {renderToggle('Auto-Merge Queues', settings.queue.autoMerge, (v) => updateSection('queue', { autoMerge: v }))}
                                {renderToggle('Persist State on Exit', settings.queue.persistQueue, (v) => updateSection('queue', { persistQueue: v }))}
                                {renderRange('Max History Size', settings.queue.maxHistory, 10, 100, 10, (v) => updateSection('queue', { maxHistory: v }))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModule;
