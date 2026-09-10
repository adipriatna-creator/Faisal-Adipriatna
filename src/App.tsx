import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectSettings, AudioMetrics, PresetConfig } from './types';
import { DEFAULT_PROJECT_SETTINGS, PRESETS, RESOLUTIONS, ASPECT_RATIOS, COLOR_PRESETS } from './constants';
import { globalAudioEngine } from './utils/audioEngine';
import { globalVideoExporter } from './utils/videoExporter';
import { renderEqualizer } from './utils/equalizers';
import { ParticleAnimationSystem } from './utils/animations';

import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { VideoPreview } from './components/VideoPreview';
import { TimelineControls } from './components/TimelineControls';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_PROJECT_SETTINGS);
  const [currentPreset, setCurrentPreset] = useState<string>('R&B');

  // Playback & Audio Metrics State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<AudioMetrics>({
    frequencyData: new Uint8Array(128),
    timeData: new Uint8Array(128),
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    peak: false,
  });

  // Selected interactive element on canvas
  const [selectedElement, setSelectedElement] = useState<'equalizer' | 'logo' | null>(null);

  // Export Modal State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [exportCompleted, setExportCompleted] = useState(false);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
  const [exportDownloadFilename, setExportDownloadFilename] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);

  // Video element reference
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Background image reference for export composite
  const exportBgImageRef = useRef<HTMLImageElement | null>(null);

  // Load export background image when settings.imageUrl changes
  useEffect(() => {
    if (!settings.imageUrl) {
      exportBgImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = settings.imageUrl;
    img.onload = () => {
      exportBgImageRef.current = img;
    };
  }, [settings.imageUrl]);

  // Animation system reference for exporter composite
  const exportAnimationSystemRef = useRef(new ParticleAnimationSystem());

  // Update Partial Settings
  const handleUpdateSettings = (newPartial: Partial<ProjectSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  // Initialize Audio Source when audioUrl changes
  useEffect(() => {
    if (settings.audioUrl) {
      globalAudioEngine.loadAudioUrl(settings.audioUrl).catch((err) => {
        console.error('Failed to load audio:', err);
      });
      // Extract waveform peaks for timeline
      globalAudioEngine.extractWaveform(settings.audioUrl, 64).then((peaks) => {
        setAudioWaveform(peaks);
      });
    }
  }, [settings.audioUrl]);

  // Handle Video URL change
  useEffect(() => {
    if (videoRef.current && settings.videoUrl) {
      videoRef.current.src = settings.videoUrl;
      videoRef.current.load();
    }
  }, [settings.videoUrl]);

  // Main Audio Analysis & Synchronization Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const curMetrics = globalAudioEngine.getMetrics();
      setMetrics(curMetrics);

      const audioCurrent = globalAudioEngine.getCurrentTime();
      setCurrentTime(audioCurrent);

      // Keep background video synced with audio playback
      if (videoRef.current && isPlaying) {
        const drift = Math.abs(videoRef.current.currentTime - audioCurrent);
        if (drift > 0.3) {
          videoRef.current.currentTime = audioCurrent;
        }
      }

      // Check if audio reached end
      const totalDur = settings.audioDuration || 0;
      if (totalDur > 0 && audioCurrent >= totalDur && isPlaying) {
        handleStop();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, settings.audioDuration]);

  // Play / Pause Toggle
  const handleTogglePlay = async () => {
    if (!settings.audioUrl && !settings.videoUrl && !settings.imageUrl) {
      return;
    }

    if (isPlaying) {
      globalAudioEngine.pause();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      await globalAudioEngine.play();
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch {
          // ignore background video play restrictions
        }
      }
      setIsPlaying(true);
    }
  };

  // Stop Playback
  const handleStop = () => {
    globalAudioEngine.stop();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Seek Scrubber
  const handleSeek = (time: number) => {
    globalAudioEngine.seek(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  // Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    globalAudioEngine.setVolume(isMuted ? 0 : newVol);
  };

  // Mute Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    globalAudioEngine.setVolume(nextMuted ? 0 : volume);
  };

  // Preset Selection
  const handleSelectPreset = (preset: PresetConfig) => {
    setCurrentPreset(preset.name);
    setSettings((prev) => ({
      ...prev,
      equalizerModel: preset.equalizerModel,
      equalizerColorPreset: preset.colorPresetId,
      equalizerColorMode: preset.colorMode,
      pulseIntensity: preset.pulseIntensity,
      pulseSmoothing: preset.pulseSmoothing,
      animationModel: preset.animationModel,
      animationEnabled: preset.animationEnabled,
    }));
  };

  // Reset Project: Kembalikan secara otomatis ke tampilan awal
  const handleResetProject = () => {
    handleStop();
    setSettings(DEFAULT_PROJECT_SETTINGS);
    setCurrentPreset('R&B');
    setSelectedElement(null);
    setAudioWaveform([]);
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    exportBgImageRef.current = null;
    setIsExportOpen(false);
    setIsExporting(false);
    setExportCompleted(false);
    setExportDownloadUrl(null);
    setExportError(null);
  };

  // Reset Equalizer Transform
  const handleResetEqualizerTransform = () => {
    handleUpdateSettings({
      equalizerTransform: {
        x: 10,
        y: 65,
        width: 80,
        height: 25,
      },
    });
  };

  // Reset Logo Transform
  const handleResetLogoTransform = () => {
    handleUpdateSettings({
      logoTransform: {
        x: 5,
        y: 5,
        width: 14,
        height: 14,
        opacity: 0.9,
      },
    });
  };

  // Validation before export
  const missingRequirements: string[] = [];
  if (!settings.audioUrl) missingRequirements.push('File audio belum diunggah.');
  const canExport = settings.audioUrl !== null;

  // Execute Final Export
  const handleStartExport = async () => {
    if (!canExport) return;

    setIsExporting(true);
    setExportProgress(1);
    setExportStatusText('Menginisialisasi encoder...');
    setExportError(null);
    setExportCompleted(false);

    // Determine target resolution
    const res = RESOLUTIONS.find((r) => r.id === settings.resolution) || RESOLUTIONS[2];
    const aspect = ASPECT_RATIOS.find((a) => a.id === settings.aspectRatio) || ASPECT_RATIOS[0];

    // Compute export canvas dimensions matching aspect ratio
    let outWidth = res.width;
    let outHeight = res.height;
    if (settings.aspectRatio !== '16:9') {
      outHeight = Math.round(outWidth / aspect.ratio);
    }

    // Determine duration
    let renderDuration = 15;
    if (settings.exportDurationMode === 'full-audio') {
      renderDuration = settings.audioDuration || 15;
    } else if (settings.exportDurationMode === 'video-length') {
      renderDuration = settings.videoDuration || settings.audioDuration || 15;
    } else if (settings.exportDurationMode === 'custom') {
      renderDuration = settings.customExportDuration || 15;
    }

    try {
      // Ensure audio context is fully unlocked and ready
      await globalAudioEngine.play().catch(() => {});
      globalAudioEngine.pause();

      const audioEl = globalAudioEngine.getAudioElement();
      const audioTrack = globalAudioEngine.getMediaStreamTrack();

      const result = await globalVideoExporter.exportVideo({
        videoElement: videoRef.current,
        audioElement: audioEl,
        audioStreamTrack: audioTrack,
        duration: renderDuration,
        width: outWidth,
        height: outHeight,
        format: settings.exportFormat,
        fps: 30,
        onProgress: (p, status) => {
          setExportProgress(p);
          setExportStatusText(status);
        },
        renderFrame: (ctx, w, h, curTime) => {
          // Audio metrics synchronized with real-time playback
          const curMetrics = globalAudioEngine.getMetrics();

          // Beat pulse
          let currentPulse = 1;
          if (settings.pulseEnabled && settings.pulseIntensity > 0) {
            const factor = (settings.pulseIntensity / 100) * 0.18;
            currentPulse = 1 + curMetrics.bass * factor + (curMetrics.peak ? factor * 0.5 : 0);
          }

          // Clear background
          ctx.fillStyle = '#06080d';
          ctx.fillRect(0, 0, w, h);

          // Background Frame (Foto atau Video)
          const isImgBg = settings.backgroundType === 'image' && Boolean(exportBgImageRef.current && exportBgImageRef.current.complete);
          const vid = videoRef.current;
          const isVidBg = !isImgBg && Boolean(vid && vid.readyState >= 2);

          if (isImgBg || isVidBg) {
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.scale(currentPulse, currentPulse);
            ctx.translate(-w / 2, -h / 2);

            const sourceEl = (isImgBg ? exportBgImageRef.current! : vid!) as CanvasImageSource;
            const vw = isImgBg ? (exportBgImageRef.current!.naturalWidth || w) : (vid!.videoWidth || w);
            const vh = isImgBg ? (exportBgImageRef.current!.naturalHeight || h) : (vid!.videoHeight || h);
            const vRatio = vw / vh;
            const cRatio = w / h;

            let dw = w;
            let dh = h;
            let dx = 0;
            let dy = 0;

            if (settings.fitMode === 'fit') {
              if (cRatio > vRatio) {
                dh = h;
                dw = h * vRatio;
                dx = (w - dw) / 2;
              } else {
                dw = w;
                dh = w / vRatio;
                dy = (h - dh) / 2;
              }
            } else if (settings.fitMode === 'fill') {
              dw = w;
              dh = h;
            } else {
              // crop
              if (cRatio > vRatio) {
                dw = w;
                dh = w / vRatio;
                dy = (h - dh) / 2;
              } else {
                dh = h;
                dw = h * vRatio;
                dx = (w - dw) / 2;
              }
            }

            ctx.drawImage(sourceEl, dx, dy, dw, dh);
            ctx.restore();
          }

          // Animations
          if (settings.animationEnabled) {
            exportAnimationSystemRef.current.render({
              ctx,
              width: w,
              height: h,
              model: settings.animationModel,
              enabled: settings.animationEnabled,
              opacity: settings.animationOpacity,
              speed: settings.animationSpeed,
              density: settings.animationDensity,
              size: settings.animationSize,
              direction: settings.animationDirection,
              metrics: curMetrics,
              time: curTime,
            });
          }

          // Equalizer
          const eqColorPreset = COLOR_PRESETS.find((c) => c.id === settings.equalizerColorPreset) || COLOR_PRESETS[0];
          const eqX = (settings.equalizerTransform.x / 100) * w;
          const eqY = (settings.equalizerTransform.y / 100) * h;
          const eqW = (settings.equalizerTransform.width / 100) * w;
          const eqH = (settings.equalizerTransform.height / 100) * h;

          renderEqualizer({
            ctx,
            x: eqX,
            y: eqY,
            width: eqW,
            height: eqH,
            model: settings.equalizerModel,
            metrics: curMetrics,
            colorPreset: eqColorPreset,
            colorMode: settings.equalizerColorMode,
            customColor1: settings.customColor1,
            customColor2: settings.customColor2,
            sensitivity: settings.equalizerSensitivity,
            time: curTime,
          });
        },
      });

      const exportFilename = `MusicVideo-${settings.resolution}-${Date.now()}.${result.format}`;
      setExportDownloadUrl(result.url);
      setExportDownloadFilename(exportFilename);
      setExportCompleted(true);
      setIsExporting(false);
      setExportProgress(100);

      // Otomatis langsung simpan ke perangkat pengguna saat 100%
      try {
        const downloadLink = document.createElement('a');
        downloadLink.href = result.url;
        downloadLink.download = exportFilename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        setTimeout(() => {
          if (document.body.contains(downloadLink)) {
            document.body.removeChild(downloadLink);
          }
        }, 300);
      } catch (autoSaveErr) {
        console.warn('Auto-save trigger error:', autoSaveErr);
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      setExportError(err?.message || 'Terjadi kesalahan saat mengekspor video');
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    globalVideoExporter.cancel();
    setIsExporting(false);
    setExportError('Proses ekspor dibatalkan');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0c12] text-gray-100 select-none">
      {/* Hidden background video element used as canvas video source */}
      <video
        ref={videoRef}
        playsInline
        muted
        loop={settings.loop}
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Top Application Header */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onReset={handleResetProject}
        hasMedia={Boolean(settings.videoUrl || settings.imageUrl || settings.audioUrl)}
      />

      {/* Main Workspace Layout (2 Panels) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* PANEL KIRI: Seluruh Kontrol dan Pengaturan */}
        <ControlPanel
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetEqualizerTransform={handleResetEqualizerTransform}
          onResetLogoTransform={handleResetLogoTransform}
          onOpenExportModal={() => setIsExportOpen(true)}
        />

        {/* PANEL KANAN: Preview Video Real-Time */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#06080d]">
          <VideoPreview
            settings={settings}
            metrics={metrics}
            isPlaying={isPlaying}
            currentTime={currentTime}
            videoRef={videoRef}
            onUpdateTransform={(target, newTransform) => {
              if (target === 'equalizer') {
                handleUpdateSettings({
                  equalizerTransform: { ...settings.equalizerTransform, ...newTransform },
                });
              } else {
                handleUpdateSettings({
                  logoTransform: { ...settings.logoTransform, ...newTransform },
                });
              }
            }}
            onResetTransform={(target) => {
              if (target === 'equalizer') handleResetEqualizerTransform();
              else handleResetLogoTransform();
            }}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            isExporting={isExporting}
          />

          {/* Synchronized Timeline Bar at bottom of preview */}
          <TimelineControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStop={handleStop}
            currentTime={currentTime}
            duration={settings.audioDuration || settings.videoDuration || 0}
            onSeek={handleSeek}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            videoDuration={settings.videoDuration}
            audioDuration={settings.audioDuration}
            waveform={audioWaveform}
          />
        </div>
      </div>

      {/* Export Modal Dialog */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => {
          setIsExportOpen(false);
          setExportCompleted(false);
          setExportProgress(0);
          setExportStatusText('');
        }}
        onStartExport={handleStartExport}
        onCancelExport={handleCancelExport}
        isExporting={isExporting}
        progress={exportProgress}
        statusText={exportStatusText}
        isCompleted={exportCompleted}
        downloadUrl={exportDownloadUrl}
        downloadFilename={exportDownloadFilename}
        error={exportError}
        settings={settings}
        canExport={canExport}
        missingRequirements={missingRequirements}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
