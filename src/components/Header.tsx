import React from 'react';
import { PRESETS } from '../constants';
import { PresetConfig } from '../types';
import { Sparkles, RotateCcw, Film } from 'lucide-react';

interface HeaderProps {
  currentPreset: string;
  onSelectPreset: (preset: PresetConfig) => void;
  onReset: () => void;
  hasMedia: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onReset,
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
          <p className="text-[10px] text-indigo-300 font-semibold tracking-wide">
            Created By: FAISAL ADI PRIATNA
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

      {/* Right Actions: Mode Reset (Kembali ke tampilan awal) */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onReset}
          title="Reset proyek dan kembali ke tampilan awal"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-gray-700/80 hover:border-rose-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          <span>Reset Proyek</span>
        </button>
      </div>
    </header>
  );
};
