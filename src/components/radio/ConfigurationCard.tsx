import { useState, useEffect } from 'react';
import { useRadio, useAudioEngine } from '../../hooks/useRadio';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowRight } from '../ui/Icons';

export function ConfigurationCard() {
    const { state, dispatch } = useRadio();
    const { initAudio, togglePlay } = useAudioEngine();
    const [selectedId, setSelectedId] = useState(state.activeStationId);

    // Sync local selection when global active station changes 
    useEffect(() => {
        setSelectedId(state.activeStationId);
    }, [state.activeStationId]);

    const handleUpdate = async () => {
        const targetStation = state.stations.find(s => s.id === selectedId);
        if (!targetStation) return;

        // Initialize audio engine if not already done (safe no-op if already init)
        initAudio();

        // Dispatch station switch – this updates activeStationId in state
        dispatch({ type: 'SWITCH_STATION', stationId: selectedId });
        dispatch({ type: 'ADD_LOG', text: `Tuned into: ${targetStation.name}. Connecting stream...` });

        // Pick a random segment for "Now Playing" display
        const nextSegment = targetStation.mockSegments[Math.floor(Math.random() * targetStation.mockSegments.length)];
        dispatch({ type: 'UPDATE_NOW_PLAYING', text: nextSegment });

        // If not already playing, start playback via the real audio engine
        if (state.status !== 'PLAYING') {
            // Small delay so the SWITCH_STATION effect processes first
            setTimeout(() => {
                togglePlay();
            }, 50);
        }
    };

    const isAlreadyActive = selectedId === state.activeStationId && state.status === 'PLAYING';

    return (
        <Card title="Station Selector" className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="space-y-4 flex-1">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-secondary tracking-widest flex items-center gap-2">
                        Available Frequencies
                    </label>
                    <div className="flex flex-col gap-2 mt-2 overflow-y-auto max-h-[280px] pr-1 -mr-1 custom-scrollbar">
                        {state.stations.map((station) => {
                            const isSelected = selectedId === station.id;
                            const isLive = station.id === state.activeStationId && state.status === 'PLAYING';
                            const count = state.listenerCounts[station.id] || 0;

                            return (
                                <button
                                    key={station.id}
                                    onClick={() => setSelectedId(station.id)}
                                    className={`flex flex-col items-start w-full rounded-lg border px-4 py-3 text-left transition-all ${isSelected
                                        ? 'border-brand bg-brand/5 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        {isLive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                        )}
                                        <span className={`text-sm font-medium ${isSelected ? 'text-brand' : 'text-primary'}`}>
                                            {station.name}
                                        </span>
                                        <span className="ml-auto text-[9px] font-mono text-secondary/50 tabular-nums">
                                            {count.toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 truncate w-full">
                                        {station.description}
                                    </span>
                                    <div className="flex gap-1 mt-1.5">
                                        {station.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ${isSelected
                                                    ? 'bg-brand/10 text-brand'
                                                    : 'bg-gray-100 text-gray-400'
                                                    }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Button
                onClick={handleUpdate}
                className={`w-full mt-auto h-12 hardware-button group font-medium tracking-wide ${isAlreadyActive
                    ? 'text-secondary opacity-60 pointer-events-none'
                    : 'text-primary'
                    }`}
            >
                <span className="mr-2">{isAlreadyActive ? 'ON AIR' : 'TUNE IN'}</span>
                {!isAlreadyActive && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 opacity-50" />}
            </Button>
        </Card>
    );
}
