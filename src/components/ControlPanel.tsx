import React, { useState } from 'react';
import {
  ProjectSettings,
  AspectRatioType,
  ResolutionPreset,
  FitMode,
  ColorMode,
  PulseSmoothing,
  ParticleDirection,
} from '../types';
import {
  EQUALIZER_MODELS,
  COLOR_PRESETS,
  ANIMATION_MODELS,
  ASPECT_RATIOS,
  RESOLUTIONS,
} from '../constants';
import {
  Upload,
  Video,
  Music,
  Image as ImageIcon,
  Activity,
  Palette,
  Sparkles,
  Zap,
  Maximize,
  Sliders,
  Download,
  RotateCcw,
  Check,
  Search,
  ChevronRight,
  Info,
  Radio,
  FileVideo,
} from 'lucide-react';

interface ControlPanelProps {
  settings: ProjectSettings;
  onUpdateSettings: (newSettings: Partial<ProjectSettings>) => void;
  onResetEqualizerTransform: () => void;
  onResetLogoTransform: () => void;
  onOpenExportModal: () => void;
}

type TabType = 'media' | 'equalizer' | 'effects' | 'export';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onUpdateSettings,
  onResetEqualizerTransform,
  onResetLogoTransform,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('media');
  const [eqSearch, setEqSearch] = useState('');
  const [eqCategory, setEqCategory] = useState<string>('All');
  const [animSearch, setAnimSearch] = useState('');

  // Video Upload Handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      onUpdateSettings({
        backgroundType: 'video',
        videoFile: file,
        videoUrl: url,
        videoName: file.name,
        videoDuration: tempVideo.duration,
        videoWidth: tempVideo.videoWidth,
        videoHeight: tempVideo.videoHeight,
      });
    };
  };

  // Photo / Image Background Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const tempImg = new window.Image();
    tempImg.src = url;
    tempImg.onload = () => {
      onUpdateSettings({
        backgroundType: 'image',
        imageFile: file,
        imageUrl: url,
        imageName: file.name,
        imageWidth: tempImg.naturalWidth,
        imageHeight: tempImg.naturalHeight,
      });
    };
  };

  // Audio Upload Handler
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const tempAudio = document.createElement('audio');
    tempAudio.src = url;
    tempAudio.onloadedmetadata = () => {
      onUpdateSettings({
        audioFile: file,
        audioUrl: url,
        audioName: file.name,
        audioDuration: tempAudio.duration,
      });
    };
  };

  // Logo PNG Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    onUpdateSettings({
      logoFile: file,
      logoUrl: url,
      logoName: file.name,
    });
  };

  // Filtered Equalizers
  const filteredEqModels = EQUALIZER_MODELS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(eqSearch.toLowerCase()) ||
      m.id.toString().includes(eqSearch);
    const matchesCat = eqCategory === 'All' || m.category === eqCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered Animations
  const filteredAnimModels = ANIMATION_MODELS.filter((a) =>
    a.name.toLowerCase().includes(animSearch.toLowerCase()) || a.id.toString().includes(animSearch)
  );

  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const selectedRes = RESOLUTIONS.find((r) => r.id === settings.resolution) || RESOLUTIONS[2];

  return (
    <div className="w-full lg:w-[420px] xl:w-[460px] h-full bg-[#0d1017] border-r border-gray-800/90 flex flex-col shrink-0 overflow-hidden">
      {/* Category Tab Bar */}
      <div className="flex items-center border-b border-gray-800 bg-[#0a0c12] p-1.5 gap-1 shrink-0 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'media'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Media</span>
        </button>

        <button
          onClick={() => setActiveTab('equalizer')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'equalizer'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Equalizer</span>
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'effects'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Efek & Animasi</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'export'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Format & Ekspor</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-sm text-gray-200 scrollbar-thin">
        {/* ================= TAB 1: MEDIA ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* 1. UNGGAH VIDEO ATAU FOTO */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  {settings.backgroundType === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Video className="w-4 h-4 text-cyan-400" />
                  )}
                  1. Visual Latar (Video / Foto)
                </span>
                {settings.backgroundType === 'video' && settings.videoUrl && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                    {settings.videoWidth}x{settings.videoHeight}
                  </span>
                )}
                {settings.backgroundType === 'image' && settings.imageUrl && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                    {settings.imageWidth}x{settings.imageHeight}
                  </span>
                )}
              </div>

              {/* Toggle Video vs Foto */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-lg border border-gray-800">
                <button
                  onClick={() => onUpdateSettings({ backgroundType: 'video' })}
                  className={`py-1 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.backgroundType === 'video'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ backgroundType: 'image' })}
                  className={`py-1 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    settings.backgroundType === 'image'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Foto / Gambar</span>
                </button>
              </div>

              {/* Video Upload Uploader */}
              {settings.backgroundType === 'video' ? (
                <>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-cyan-500/60 rounded-xl p-4 transition-all cursor-pointer bg-black/20 hover:bg-cyan-500/5 group">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <FileVideo className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors mb-1" />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                      PILIH FILE VIDEO
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">MP4, WebM, MOV, AVI</span>
                  </label>

                  {settings.videoUrl && (
                    <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="truncate max-w-[200px] font-medium">{settings.videoName}</span>
                        <span className="text-gray-400 font-mono">{formatDuration(settings.videoDuration)}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Resolusi: {settings.videoWidth} x {settings.videoHeight} px
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Photo / Image Uploader */
                <>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-cyan-500/60 rounded-xl p-4 transition-all cursor-pointer bg-black/20 hover:bg-cyan-500/5 group">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,.jpg,.jpeg,.png,.webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-cyan-400 transition-colors mb-1" />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                      PILIH FILE FOTO / GAMBAR
                    </span>
                    <span className="text-[11px] text-gray-500 mt-0.5">JPG, JPEG, PNG, WEBP</span>
                  </label>

                  {settings.imageUrl && (
                    <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="truncate max-w-[200px] font-medium">{settings.imageName}</span>
                        <span className="text-emerald-400 font-medium">Foto Aktif</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Resolusi: {settings.imageWidth} x {settings.imageHeight} px
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fit / Fill / Crop */}
              <div className="pt-2">
                <label className="text-xs text-gray-400 mb-1.5 block">Penyesuaian Rasio Visual:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['fit', 'fill', 'crop'] as FitMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onUpdateSettings({ fitMode: mode })}
                      className={`py-1.5 px-2 rounded-lg text-xs capitalize transition-all cursor-pointer font-medium ${
                        settings.fitMode === mode
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. UNGGAH AUDIO */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-pink-400" />
                  2. Unggah Audio
                </span>
                {settings.audioUrl && (
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30 font-mono">
                    {formatDuration(settings.audioDuration)}
                  </span>
                )}
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-pink-500/60 rounded-xl p-4 transition-all cursor-pointer bg-black/20 hover:bg-pink-500/5 group">
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <Music className="w-8 h-8 text-gray-500 group-hover:text-pink-400 transition-colors mb-1" />
                <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                  PILIH FILE AUDIO
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">MP3, WAV, M4A, AAC, OGG</span>
              </label>

              {settings.audioUrl && (
                <div className="bg-black/30 p-2.5 rounded-lg border border-gray-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="truncate max-w-[200px] font-medium">{settings.audioName}</span>
                    <span className="text-pink-400 font-mono">{formatDuration(settings.audioDuration)}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Audio-reactive engine aktif
                  </div>
                </div>
              )}
            </section>

            {/* 3. UNGGAH LOGO PNG */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  3. Unggah Logo PNG
                </span>
                {settings.logoUrl && (
                  <button
                    onClick={onResetLogoTransform}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Logo
                  </button>
                )}
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-amber-500/60 rounded-xl p-4 transition-all cursor-pointer bg-black/20 hover:bg-amber-500/5 group">
                <input type="file" accept="image/png,image/webp,.png,.webp" onChange={handleLogoUpload} className="hidden" />
                <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-amber-400 transition-colors mb-1" />
                <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                  PILIH LOGO TRANSPARAN (PNG)
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">Dapat digeser & di-resize langsung di preview</span>
              </label>

              {settings.logoUrl && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Opacity Logo: {Math.round((settings.logoTransform.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={settings.logoTransform.opacity ?? 1}
                    onChange={(e) =>
                      onUpdateSettings({
                        logoTransform: { ...settings.logoTransform, opacity: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================= TAB 2: EQUALIZER & WARNA ================= */}
        {activeTab === 'equalizer' && (
          <div className="space-y-6">
            {/* Header & Reset Position */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Pilih Equalizer (50 Model)
                </h3>
                <p className="text-[11px] text-gray-400">Setiap model memiliki algoritma visual berbeda</p>
              </div>
              <button
                onClick={onResetEqualizerTransform}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Posisi
              </button>
            </div>

            {/* Filter by category and search */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari model equalizer (1-50 atau nama)..."
                  value={eqSearch}
                  onChange={(e) => setEqSearch(e.target.value)}
                  className="w-full bg-[#141824] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {['All', 'Bars', 'Circular', 'Waves', 'Shapes', '3D & Space', 'Energy'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEqCategory(cat)}
                    className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      eqCategory === cat ? 'bg-indigo-600 text-white font-medium' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 50 Equalizer Models Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {filteredEqModels.map((m) => {
                const isSelected = settings.equalizerModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onUpdateSettings({ equalizerModel: m.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/20 shadow-sm shadow-indigo-500/20'
                        : 'border-gray-800 bg-[#121622] hover:border-gray-700 hover:bg-[#161c2c]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'
                      }`}>
                        #{m.id}
                      </span>
                      <span className="text-[10px] text-gray-500">{m.category}</span>
                    </div>

                    <div className="font-medium text-xs text-gray-200 group-hover:text-white line-clamp-1">
                      {m.name}
                    </div>

                    <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                      {m.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sensitivity Slider */}
            <div className="bg-[#121622] p-3.5 rounded-xl border border-gray-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Sensitivitas Frekuensi:</span>
                <span className="font-mono text-indigo-400">{settings.equalizerSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.equalizerSensitivity}
                onChange={(e) => onUpdateSettings({ equalizerSensitivity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* WARNA EQUALIZER (30 WARNA & 5 MODE) */}
            <div className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  Warna Equalizer (30 Preset)
                </span>
              </div>

              {/* Color Modes */}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Mode Pewarnaan:</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'single', label: 'Single Color' },
                    { id: 'gradient', label: 'Gradient' },
                    { id: 'multi', label: 'Multi Color' },
                    { id: 'rainbow', label: 'Rainbow' },
                    { id: 'reactive', label: 'Audio Reactive' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => onUpdateSettings({ equalizerColorMode: mode.id as ColorMode })}
                      className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer font-medium ${
                        settings.equalizerColorMode === mode.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 30 Color Swatches */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Pilih Tema Warna (30 Pilihan):</label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = settings.equalizerColorPreset === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() =>
                          onUpdateSettings({
                            equalizerColorPreset: color.id,
                            customColor1: color.primary,
                            customColor2: color.secondary,
                          })
                        }
                        title={color.name}
                        className={`group flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected ? 'border-white bg-white/10 ring-2 ring-indigo-500' : 'border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full shadow-md transition-transform group-hover:scale-110"
                          style={{
                            background:
                              color.gradient.length > 1
                                ? `linear-gradient(135deg, ${color.gradient[0]}, ${color.gradient[color.gradient.length - 1]})`
                                : color.primary,
                          }}
                        />
                        <span className="text-[9px] text-gray-400 truncate w-full text-center group-hover:text-gray-200">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              {(settings.equalizerColorMode === 'single' || settings.equalizerColorMode === 'gradient') && (
                <div className="flex items-center gap-4 pt-2 border-t border-gray-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-gray-400">Warna 1:</span>
                    <input
                      type="color"
                      value={settings.customColor1}
                      onChange={(e) => onUpdateSettings({ customColor1: e.target.value })}
                      className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                    />
                  </label>
                  {settings.equalizerColorMode === 'gradient' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-gray-400">Warna 2:</span>
                      <input
                        type="color"
                        value={settings.customColor2}
                        onChange={(e) => onUpdateSettings({ customColor2: e.target.value })}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: EFEK & ANIMASI ================= */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            {/* 7. DENYUT VIDEO (BEAT PULSE) */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  7. Denyut Video (Audio Reactive)
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pulseEnabled}
                    onChange={(e) => onUpdateSettings({ pulseEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <p className="text-xs text-gray-400">
                Membuat background video berdenyut/zoom secara halus mengikuti hentakan bass dan beat lagu.
              </p>

              {settings.pulseEnabled && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Intensitas Denyut:</label>
                    <div className="grid grid-cols-6 gap-1">
                      {([0, 10, 25, 50, 75, 100] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => onUpdateSettings({ pulseIntensity: lvl })}
                          className={`py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                            settings.pulseIntensity === lvl
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {lvl}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Tipe Smoothing:</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['smooth', 'normal', 'strong', 'extreme'] as PulseSmoothing[]).map((sm) => (
                        <button
                          key={sm}
                          onClick={() => onUpdateSettings({ pulseSmoothing: sm })}
                          className={`py-1.5 rounded-lg text-xs capitalize cursor-pointer font-medium transition-all ${
                            settings.pulseSmoothing === sm
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {sm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 6. ANIMASI (30 MODEL) */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  6. Animasi Visual (30 Model)
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.animationEnabled}
                    onChange={(e) => onUpdateSettings({ animationEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {settings.animationEnabled && (
                <>
                  {/* Search Animasi */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Cari animasi (1-30)..."
                      value={animSearch}
                      onChange={(e) => setAnimSearch(e.target.value)}
                      className="w-full bg-[#141824] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>

                  {/* 30 Animasi Grid */}
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {filteredAnimModels.map((a) => {
                      const isSelected = settings.animationModel === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => onUpdateSettings({ animationModel: a.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 bg-purple-600/20 shadow-sm'
                              : 'border-gray-800 bg-[#141824] hover:border-gray-700 hover:bg-[#181d2c]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                              #{a.id}
                            </span>
                            <span className="text-[10px] text-gray-500">{a.category}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-200 line-clamp-1">{a.name}</span>
                          <span className="text-[10px] text-gray-400 line-clamp-1">{a.description}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Animation Controls: Opacity, Speed, Density, Size */}
                  <div className="space-y-3 pt-2 border-t border-gray-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Opacity:</span>
                        <span className="font-mono">{Math.round(settings.animationOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={settings.animationOpacity}
                        onChange={(e) => onUpdateSettings({ animationOpacity: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Kecepatan (Speed):</span>
                        <span className="font-mono">{settings.animationSpeed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={settings.animationSpeed}
                        onChange={(e) => onUpdateSettings({ animationSpeed: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Kepadatan (Density):</span>
                        <span className="font-mono">{settings.animationDensity} partikel</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        step="10"
                        value={settings.animationDensity}
                        onChange={(e) => onUpdateSettings({ animationDensity: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Ukuran Partikel (Size):</span>
                        <span className="font-mono">{settings.animationSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={settings.animationSize}
                        onChange={(e) => onUpdateSettings({ animationSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* ================= TAB 4: FORMAT & EKSPOR ================= */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* 10. RASIO VIDEO */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-3">
              <span className="font-semibold text-white flex items-center gap-2">
                <Maximize className="w-4 h-4 text-indigo-400" />
                10. Rasio Video
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_RATIOS.map((r) => {
                  const isSelected = settings.aspectRatio === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onUpdateSettings({ aspectRatio: r.id })}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white'
                          : 'border-gray-800 bg-[#141824] text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{r.label}</div>
                      <div className="text-[10px] text-gray-500 truncate">{r.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 11. RESOLUSI */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-3">
              <span className="font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                11. Resolusi Output
              </span>

              <div className="grid grid-cols-2 gap-2">
                {RESOLUTIONS.map((res) => {
                  const isSelected = settings.resolution === res.id;
                  return (
                    <button
                      key={res.id}
                      onClick={() => onUpdateSettings({ resolution: res.id })}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/20 text-white'
                          : 'border-gray-800 bg-[#141824] text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{res.label}</div>
                      <div className="text-[10px] text-gray-400">
                        {res.width} x {res.height} px
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        ~{res.estMbPerMin} MB/menit
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 16 & 17. FORMAT & DURASI EKSPOR */}
            <section className="bg-[#121622] p-4 rounded-xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Format & Durasi Ekspor</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['mp4', 'webm'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => onUpdateSettings({ exportFormat: fmt })}
                    className={`py-2 rounded-lg text-xs uppercase font-bold transition-all cursor-pointer ${
                      settings.exportFormat === fmt
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {fmt} (Prioritas)
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Durasi Hasil Akhir:</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'full-audio', label: 'Mengikuti Durasi Audio Penuh' },
                    { id: 'video-length', label: 'Mengikuti Durasi Video' },
                    { id: 'custom', label: 'Kustom (15 Detik Cuplikan)' },
                  ].map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-black/20 hover:bg-black/40 cursor-pointer text-xs"
                    >
                      <input
                        type="radio"
                        name="exportDurationMode"
                        checked={settings.exportDurationMode === d.id}
                        onChange={() => onUpdateSettings({ exportDurationMode: d.id as any })}
                        className="accent-indigo-500"
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* BIG EXPORT BUTTON */}
            <div className="pt-2">
              <button
                onClick={onOpenExportModal}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-3 cursor-pointer transform active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                <span>EKSPOR VIDEO</span>
              </button>
              <p className="text-[11px] text-gray-500 text-center mt-2">
                Merender komposisi video, audio, logo, equalizer & animasi partikel ke file download
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
