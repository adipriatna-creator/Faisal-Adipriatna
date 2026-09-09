import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ProjectSettings, AudioMetrics } from '../types';
import { EQUALIZER_MODELS, COLOR_PRESETS, ASPECT_RATIOS } from '../constants';
import { renderEqualizer } from '../utils/equalizers';
import { ParticleAnimationSystem } from '../utils/animations';
import { Maximize2, Move, RotateCcw, Image, Activity, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface VideoPreviewProps {
  settings: ProjectSettings;
  metrics: AudioMetrics;
  isPlaying: boolean;
  currentTime: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onUpdateTransform: (target: 'equalizer' | 'logo', newTransform: Partial<ProjectSettings['equalizerTransform']>) => void;
  onResetTransform: (target: 'equalizer' | 'logo') => void;
  selectedElement: 'equalizer' | 'logo' | null;
  setSelectedElement: (el: 'equalizer' | 'logo' | null) => void;
  isExporting?: boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  settings,
  metrics,
  isPlaying,
  currentTime,
  videoRef,
  onUpdateTransform,
  onResetTransform,
  selectedElement,
  setSelectedElement,
  isExporting,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particleSystemRef = useRef<ParticleAnimationSystem>(new ParticleAnimationSystem());
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Pulse interpolation state
  const pulseScaleRef = useRef(1);

  // Dragging & Resizing state for interactive bounding box
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null); // 'move', 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Load logo image object when url changes
  useEffect(() => {
    if (!settings.logoUrl) {
      logoImageRef.current = null;
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = settings.logoUrl;
    img.onload = () => {
      logoImageRef.current = img;
    };
  }, [settings.logoUrl]);

  // Load background image object when imageUrl changes
  useEffect(() => {
    if (!settings.imageUrl) {
      bgImageRef.current = null;
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = settings.imageUrl;
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, [settings.imageUrl]);

  // Compute aspect ratio dimensions for preview container
  const activeAspect = ASPECT_RATIOS.find((r) => r.id === settings.aspectRatio) || ASPECT_RATIOS[0];
  let targetRatio = activeAspect.ratio;
  if (settings.aspectRatio === 'original') {
    if (settings.backgroundType === 'image' && settings.imageWidth && settings.imageHeight) {
      targetRatio = settings.imageWidth / settings.imageHeight;
    } else if (settings.videoWidth && settings.videoHeight) {
      targetRatio = settings.videoWidth / settings.videoHeight;
    }
  }

  // Handle Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isExporting) {
        animId = requestAnimationFrame(render);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const time = performance.now() / 1000;

      // 1. Calculate Beat Pulse (Denyut Video)
      let currentPulse = 1;
      if (settings.pulseEnabled && settings.pulseIntensity > 0) {
        const factor = (settings.pulseIntensity / 100) * 0.18;
        const targetPulse = 1 + (metrics.bass * factor) + (metrics.peak ? factor * 0.5 : 0);

        let smoothingFactor = 0.15;
        if (settings.pulseSmoothing === 'smooth') smoothingFactor = 0.08;
        else if (settings.pulseSmoothing === 'normal') smoothingFactor = 0.15;
        else if (settings.pulseSmoothing === 'strong') smoothingFactor = 0.28;
        else if (settings.pulseSmoothing === 'extreme') smoothingFactor = 0.45;

        pulseScaleRef.current = pulseScaleRef.current + (targetPulse - pulseScaleRef.current) * smoothingFactor;
        currentPulse = pulseScaleRef.current;
      } else {
        pulseScaleRef.current = 1;
        currentPulse = 1;
      }

      // 2. Clear canvas with deep background
      ctx.fillStyle = '#06080d';
      ctx.fillRect(0, 0, w, h);

      // 3. Draw Background (Video atau Foto) with pulse zoom and fit/fill/crop
      const isImgBg = settings.backgroundType === 'image' && Boolean(bgImageRef.current && bgImageRef.current.complete);
      const vid = videoRef.current;
      const isVidBg = !isImgBg && Boolean(vid && vid.readyState >= 2);

      if (isImgBg || isVidBg) {
        ctx.save();
        // Beat Pulse transform centered
        ctx.translate(w / 2, h / 2);
        ctx.scale(currentPulse, currentPulse);
        ctx.translate(-w / 2, -h / 2);

        const sourceEl = (isImgBg ? bgImageRef.current! : vid!) as CanvasImageSource;
        const vw = isImgBg ? (bgImageRef.current!.naturalWidth || 1280) : (vid!.videoWidth || 1280);
        const vh = isImgBg ? (bgImageRef.current!.naturalHeight || 720) : (vid!.videoHeight || 720);
        const vRatio = vw / vh;
        const cRatio = w / h;

        let drawW = w;
        let drawH = h;
        let drawX = 0;
        let drawY = 0;

        if (settings.fitMode === 'fit') {
          if (cRatio > vRatio) {
            drawH = h;
            drawW = h * vRatio;
            drawX = (w - drawW) / 2;
          } else {
            drawW = w;
            drawH = w / vRatio;
            drawY = (h - drawH) / 2;
          }
        } else if (settings.fitMode === 'fill') {
          drawW = w;
          drawH = h;
        } else {
          // crop
          if (cRatio > vRatio) {
            drawW = w;
            drawH = w / vRatio;
            drawY = (h - drawH) / 2;
          } else {
            drawH = h;
            drawW = h * vRatio;
            drawX = (w - drawW) / 2;
          }
        }

        ctx.drawImage(sourceEl, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else {
        // Dark animated backdrop when media not uploaded yet
        const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
        grad.addColorStop(0, '#131929');
        grad.addColorStop(1, '#080a10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 4. Render Particle Animation Overlay (if enabled)
      if (settings.animationEnabled) {
        particleSystemRef.current.render({
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
          metrics,
          time,
        });
      }

      // 5. Render Equalizer Overlay
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
        metrics,
        colorPreset: eqColorPreset,
        colorMode: settings.equalizerColorMode,
        customColor1: settings.customColor1,
        customColor2: settings.customColor2,
        sensitivity: settings.equalizerSensitivity,
        time,
      });

      // 6. Render Logo Overlay (if loaded)
      const logoImg = logoImageRef.current;
      if (logoImg && logoImg.complete) {
        const logoX = (settings.logoTransform.x / 100) * w;
        const logoY = (settings.logoTransform.y / 100) * h;
        const logoW = (settings.logoTransform.width / 100) * w;
        const logoH = (settings.logoTransform.height / 100) * h;
        const opacity = settings.logoTransform.opacity ?? 1;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [settings, metrics, videoRef]);

  // Handle Drag & Resize Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;

    setIsDragging(true);
    setActiveHandle(handle);

    const transform = selectedElement === 'equalizer' ? settings.equalizerTransform : settings.logoTransform;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: transform.x,
      startY: transform.y,
      startW: transform.width,
      startH: transform.height,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current || !selectedElement || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const dxPx = e.clientX - dragStartRef.current.mouseX;
      const dyPx = e.clientY - dragStartRef.current.mouseY;

      // Convert pixel delta to percentage
      const dxPercent = (dxPx / rect.width) * 100;
      const dyPercent = (dyPx / rect.height) * 100;

      const { startX, startY, startW, startH } = dragStartRef.current;

      if (activeHandle === 'move') {
        const newX = Math.max(0, Math.min(100 - startW, startX + dxPercent));
        const newY = Math.max(0, Math.min(100 - startH, startY + dyPercent));
        onUpdateTransform(selectedElement, { x: newX, y: newY });
      } else if (activeHandle === 'se') {
        const newW = Math.max(5, Math.min(100 - startX, startW + dxPercent));
        const newH = Math.max(5, Math.min(100 - startY, startH + dyPercent));
        onUpdateTransform(selectedElement, { width: newW, height: newH });
      } else if (activeHandle === 'sw') {
        const newX = Math.max(0, startX + dxPercent);
        const newW = Math.max(5, startW - dxPercent);
        const newH = Math.max(5, Math.min(100 - startY, startH + dyPercent));
        onUpdateTransform(selectedElement, { x: newX, width: newW, height: newH });
      } else if (activeHandle === 'ne') {
        const newY = Math.max(0, startY + dyPercent);
        const newW = Math.max(5, Math.min(100 - startX, startW + dxPercent));
        const newH = Math.max(5, startH - dyPercent);
        onUpdateTransform(selectedElement, { y: newY, width: newW, height: newH });
      } else if (activeHandle === 'nw') {
        const newX = Math.max(0, startX + dxPercent);
        const newY = Math.max(0, startY + dyPercent);
        const newW = Math.max(5, startW - dxPercent);
        const newH = Math.max(5, startH - dyPercent);
        onUpdateTransform(selectedElement, { x: newX, y: newY, width: newW, height: newH });
      }
    },
    [isDragging, selectedElement, activeHandle, onUpdateTransform]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const activeTransform = selectedElement === 'equalizer' ? settings.equalizerTransform : settings.logoTransform;
  const currentModelInfo = EQUALIZER_MODELS.find((m) => m.id === settings.equalizerModel);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 bg-[#090b10] select-none overflow-hidden"
      onClick={() => setSelectedElement(null)}
    >
      {/* Top Floating Badges */}
      <div className="absolute top-4 left-4 sm:left-6 z-20 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-lg shadow-black/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>REAL-TIME PREVIEW</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-gray-300 text-xs">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentModelInfo?.name || 'Equalizer'}</span>
        </div>
      </div>

      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 sm:right-6 z-20 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFullscreen();
          }}
          title="Layar Penuh"
          className="p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white transition-all shadow-md cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Viewport with selected aspect ratio */}
      <div
        className="relative shadow-2xl rounded-xl overflow-hidden border border-gray-800/80 bg-black max-w-full max-h-[calc(100vh-180px)] flex items-center justify-center"
        style={{
          aspectRatio: `${targetRatio}`,
          width: targetRatio > 1 ? '100%' : 'auto',
          height: targetRatio <= 1 ? '100%' : 'auto',
          maxHeight: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <canvas
          ref={canvasRef}
          width={1280}
          height={Math.round(1280 / targetRatio)}
          className="w-full h-full object-contain block cursor-crosshair"
        />

        {/* Clickable Overlay Targets to select elements */}
        {/* 1. Equalizer Target Box */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement('equalizer');
          }}
          className={`absolute cursor-pointer transition-all ${
            selectedElement === 'equalizer'
              ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black/50 bg-indigo-500/10'
              : 'hover:ring-1 hover:ring-indigo-400/60'
          }`}
          style={{
            left: `${settings.equalizerTransform.x}%`,
            top: `${settings.equalizerTransform.y}%`,
            width: `${settings.equalizerTransform.width}%`,
            height: `${settings.equalizerTransform.height}%`,
          }}
        >
          {selectedElement === 'equalizer' && (
            <>
              {/* Corner handles */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'nw')}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-sm cursor-nwse-resize shadow"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'ne')}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-sm cursor-nesw-resize shadow"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-sm cursor-nwse-resize shadow"
              />
              <div
                onMouseDown={(e) => handleMouseDown(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-sm cursor-nesw-resize shadow"
              />

              {/* Center Move Handle */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                className="absolute inset-0 flex items-center justify-center cursor-move"
              >
                <div className="px-2 py-1 bg-indigo-600/90 text-white rounded text-[10px] font-medium backdrop-blur-sm flex items-center gap-1 shadow-md opacity-80 hover:opacity-100">
                  <Move className="w-3 h-3" /> Geser Equalizer
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. Logo Target Box (if logo exists) */}
        {settings.logoUrl && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement('logo');
            }}
            className={`absolute cursor-pointer transition-all ${
              selectedElement === 'logo'
                ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-black/50 bg-pink-500/10'
                : 'hover:ring-1 hover:ring-pink-400/60'
            }`}
            style={{
              left: `${settings.logoTransform.x}%`,
              top: `${settings.logoTransform.y}%`,
              width: `${settings.logoTransform.width}%`,
              height: `${settings.logoTransform.height}%`,
            }}
          >
            {selectedElement === 'logo' && (
              <>
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-pink-500 border-2 border-white rounded-sm cursor-nwse-resize shadow"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-pink-500 border-2 border-white rounded-sm cursor-nesw-resize shadow"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                  className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-pink-500 border-2 border-white rounded-sm cursor-nwse-resize shadow"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                  className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-pink-500 border-2 border-white rounded-sm cursor-nesw-resize shadow"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                  className="absolute inset-0 flex items-center justify-center cursor-move"
                >
                  <div className="px-2 py-1 bg-pink-600/90 text-white rounded text-[10px] font-medium backdrop-blur-sm flex items-center gap-1 shadow-md opacity-80 hover:opacity-100">
                    <Move className="w-3 h-3" /> Geser Logo
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state guidance when no media uploaded */}
        {!settings.videoUrl && !settings.imageUrl && !settings.audioUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs p-6 text-center z-10 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
              Kanvas Real-time Siap Digunakan
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm">
              Unggah video / foto & audio di panel kiri atau klik tombol <strong className="text-emerald-400">Demo Proyek</strong> di atas untuk mencoba equalizer & visualizer audio-reaktif langsung.
            </p>
          </div>
        )}
      </div>

      {/* Floating Selected Element Toolbar */}
      {selectedElement && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 sm:bottom-6 z-20 bg-gray-900/95 backdrop-blur-md border border-gray-700/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-4 text-xs"
        >
          <div className="flex items-center gap-1.5 text-white font-medium">
            {selectedElement === 'equalizer' ? (
              <Activity className="w-4 h-4 text-indigo-400" />
            ) : (
              <Image className="w-4 h-4 text-pink-400" />
            )}
            <span className="capitalize">{selectedElement} Terpilih</span>
          </div>

          <div className="text-gray-400 font-mono text-[11px] hidden sm:flex items-center gap-2">
            <span>X: {Math.round(activeTransform.x)}%</span>
            <span>Y: {Math.round(activeTransform.y)}%</span>
            <span>W: {Math.round(activeTransform.width)}%</span>
            <span>H: {Math.round(activeTransform.height)}%</span>
          </div>

          <button
            onClick={() => onResetTransform(selectedElement)}
            className="flex items-center gap-1 text-indigo-300 hover:text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-all cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Posisi
          </button>
        </div>
      )}
    </div>
  );
};
