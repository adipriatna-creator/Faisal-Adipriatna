import React from 'react';
import { ProjectSettings } from '../types';
import { RESOLUTIONS, ASPECT_RATIOS } from '../constants';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Film,
  Sparkles,
  Loader2,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: () => void;
  onCancelExport: () => void;
  isExporting: boolean;
  progress: number;
  statusText: string;
  isCompleted: boolean;
  downloadUrl: string | null;
  downloadFilename: string;
  error: string | null;
  settings: ProjectSettings;
  canExport: boolean;
  missingRequirements: string[];
  onUpdateSettings?: (settings: Partial<ProjectSettings>) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onStartExport,
  onCancelExport,
  isExporting,
  progress,
  statusText,
  isCompleted,
  downloadUrl,
  downloadFilename,
  error,
  settings,
  canExport,
  missingRequirements,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const resInfo = RESOLUTIONS.find((r) => r.id === settings.resolution) || RESOLUTIONS[2];
  const aspectInfo = ASPECT_RATIOS.find((a) => a.id === settings.aspectRatio) || ASPECT_RATIOS[0];

  // Calculate duration in seconds to show
  let currentDurationSeconds = 15;
  if (settings.exportDurationMode === 'full-audio') {
    currentDurationSeconds = Math.round(settings.audioDuration || 15);
  } else if (settings.exportDurationMode === 'video-length') {
    currentDurationSeconds = Math.round(settings.videoDuration || settings.audioDuration || 15);
  } else if (settings.exportDurationMode === 'custom') {
    currentDurationSeconds = settings.customExportDuration || 15;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#11141f] border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-['Space_Grotesk']">
                Ekspor Video Komposisi
              </h3>
              <p className="text-xs text-gray-400">
                Render final video musik audio-reactive dengan equalizer & efek
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Validation Errors State */}
        {!canExport && !isCompleted && !isExporting && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Lengkapi media sebelum ekspor:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-300 pl-1">
              {missingRequirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
            <p className="text-[11px] text-gray-400 pt-1">
              Tips: Anda dapat mengklik tombol <strong>Demo Proyek</strong> di header atas untuk menguji coba ekspor secara instan tanpa perlu mencari file sendiri.
            </p>
          </div>
        )}

        {/* Turbo Acceleration Badge & Duration Selection */}
        {!isExporting && !isCompleted && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-200">
                Pilihan Durasi Render:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Perekaman Lancar & Stabil
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { mode: 'custom', dur: 15, label: '15 Dtk', sub: 'Express' },
                { mode: 'custom', dur: 30, label: '30 Dtk', sub: 'Story/Reels' },
                { mode: 'custom', dur: 60, label: '60 Dtk', sub: '1 Menit' },
                {
                  mode: 'full-audio',
                  dur: Math.round(settings.audioDuration || 15),
                  label: 'Penuh',
                  sub: settings.audioDuration ? `${Math.round(settings.audioDuration)}s` : 'Audio',
                },
              ].map((item, idx) => {
                const isSelected =
                  item.mode === 'full-audio'
                    ? settings.exportDurationMode === 'full-audio'
                    : settings.exportDurationMode === 'custom' && settings.customExportDuration === item.dur;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onUpdateSettings) {
                        onUpdateSettings({
                          exportDurationMode: item.mode as any,
                          customExportDuration: item.dur,
                        });
                      }
                    }}
                    className={`py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/30 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'border-gray-800 bg-black/25 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className="text-[9px] text-gray-500 truncate mt-0.5">{item.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Export Specification Summary */}
        <div className="bg-black/30 rounded-2xl p-4 border border-gray-800/80 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">Resolusi Output</span>
            <span className="text-white font-semibold">{resInfo.label} ({resInfo.width}x{resInfo.height})</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Rasio Layar</span>
            <span className="text-white font-semibold">{aspectInfo.label} ({aspectInfo.desc})</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Format File</span>
            <span className="text-indigo-400 font-bold uppercase">{settings.exportFormat}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Durasi Video Final</span>
            <span className="text-emerald-400 font-bold">
              {currentDurationSeconds} Detik
            </span>
          </div>
        </div>

        {/* Render Progress State */}
        {isExporting && (
          <div className="space-y-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Rendering... {progress}%
              </span>
              <span className="font-mono text-gray-400">{statusText}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Jangan tutup tab browser selama proses render berjalan</span>
              <button
                onClick={onCancelExport}
                className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Batalkan Render
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Completed State */}
        {isCompleted && downloadUrl && (
          <div className="space-y-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="font-bold text-lg text-emerald-400 font-['Space_Grotesk']">
              RENDER SELESAI
            </h4>
            <p className="text-xs text-gray-300">
              Video musik audio-reactive berhasil dikompilasi dan siap diunduh ke perangkat Anda.
            </p>

            {/* Preview of rendered video */}
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-black aspect-video max-h-48 mx-auto">
              <video src={downloadUrl} controls className="w-full h-full object-contain" />
            </div>

            {/* DOWNLOAD BUTTON */}
            <a
              href={downloadUrl}
              download={downloadFilename}
              className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer transform active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD VIDEO ({downloadFilename})</span>
            </a>
          </div>
        )}

        {/* Bottom Actions */}
        {!isExporting && !isCompleted && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={onStartExport}
              disabled={!canExport}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Render Video</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
