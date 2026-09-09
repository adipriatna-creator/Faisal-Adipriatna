import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX, FastForward, Rewind, Music, Film } from 'lucide-react';

interface TimelineControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  videoDuration: number;
  audioDuration: number;
  waveform?: number[];
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStop,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  videoDuration,
  audioDuration,
  waveform,
}) => {
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(pos * duration);
  };

  return (
    <div className="h-20 bg-[#0c0e15] border-t border-gray-800/90 px-4 sm:px-6 flex flex-col justify-center gap-2 shrink-0 z-20">
      {/* Waveform Scrubber Line */}
      <div
        onClick={handleTimelineClick}
        className="relative w-full h-8 bg-gray-900/80 rounded-lg cursor-pointer flex items-center overflow-hidden border border-gray-800 group hover:border-gray-700 transition-all"
      >
        {/* Simple Audio Waveform visualization behind scrubber */}
        <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-40">
          {waveform && waveform.length > 0 ? (
            waveform.map((peak, idx) => (
              <div
                key={idx}
                className="w-[2px] bg-indigo-400 rounded-full transition-all"
                style={{ height: `${Math.max(15, peak * 80)}%` }}
              />
            ))
          ) : (
            // Default placeholder waveform
            Array.from({ length: 60 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[2px] bg-gray-600 rounded-full"
                style={{ height: `${20 + (Math.sin(idx * 0.4) + 1) * 30}%` }}
              />
            ))
          )}
        </div>

        {/* Played progress fill */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-indigo-500/30 border-r-2 border-indigo-400 transition-all pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Current scrubber needle */}
        <div
          className="absolute top-0 bottom-0 w-3 -ml-1.5 flex items-center justify-center pointer-events-none transition-all"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md shadow-indigo-500 ring-2 ring-indigo-500" />
        </div>
      </div>

      {/* Control Buttons & Timestamps */}
      <div className="flex items-center justify-between">
        {/* Left: Play/Pause/Stop & Skip */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Jeda (Pause)' : 'Putar (Play)'}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          <button
            onClick={onStop}
            title="Berhenti (Stop)"
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <div className="text-xs font-mono text-gray-300 ml-2">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-gray-500"> / {formatTime(duration)}</span>
          </div>
        </div>

        {/* Center: Track Duration Badges */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-400">
          {videoDuration > 0 && (
            <span className="flex items-center gap-1 bg-gray-800/60 px-2 py-0.5 rounded-md border border-gray-700/50">
              <Film className="w-3 h-3 text-cyan-400" /> Video: {formatTime(videoDuration)}
            </span>
          )}
          {audioDuration > 0 && (
            <span className="flex items-center gap-1 bg-gray-800/60 px-2 py-0.5 rounded-md border border-gray-700/50">
              <Music className="w-3 h-3 text-pink-400" /> Audio: {formatTime(audioDuration)}
            </span>
          )}
        </div>

        {/* Right: Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
