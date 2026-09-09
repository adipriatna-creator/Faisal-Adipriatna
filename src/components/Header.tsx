import React from 'react';
import { PRESETS } from '../constants';
import { PresetConfig } from '../types';
import { Sparkles, RotateCcw, PlayCircle, Film, Radio, Music2 } from 'lucide-react';

interface HeaderProps {
  currentPreset: string;
  onSelectPreset: (preset: PresetConfig) => void;
  onLoadDemo: () => void;
  onReset: () => void;
  isLoadingDemo: boolean;
  hasMedia: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onLoadDemo,
  onReset,
  isLoadingDemo,
  hasMedia,
}) => {
  return (
    <header className="h-16 border-b border-gray-800 bg-[#0d1017]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#0b0d13] rounded-[10px] flex items-center justify-center">
            <Film className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5 font-['Space_Grotesk']">
              RENDER VIDEO <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans font-medium">Real-time</span>
            </h1>
          </div>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            Studio Pembuat Video Musik Audio-Reactive
          </p>
        </div>
      </div>

      {/* Center Presets Quick Selector */}
      <div className="hidden lg:flex items-center gap-1.5 bg-[#141824] px-2 py-1 rounded-xl border border-gray-800/80">
        <span className="text-xs text-gray-400 flex items-center gap-1 px-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Preset:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto max-w-md scrollbar-none">
          {PRESETS.map((p) => {
            const isActive = currentPreset === p.name;
            return (
              <button
                key={p.name}
                onClick={() => onSelectPreset(p)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onLoadDemo}
          disabled={isLoadingDemo}
          title="Muat contoh video & musik untuk pengujian instan"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoadingDemo ? (
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4 text-emerald-400" />
          )}
          <span>{isLoadingDemo ? 'Membuat Demo...' : 'Demo Proyek'}</span>
        </button>

        <button
          onClick={onReset}
          title="Reset semua pengaturan proyek ke default"
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
