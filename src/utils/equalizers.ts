import { AudioMetrics, ColorMode, ColorPreset } from '../types';

export interface EqualizerRenderParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  model: number;
  metrics: AudioMetrics;
  colorPreset: ColorPreset;
  colorMode: ColorMode;
  customColor1?: string;
  customColor2?: string;
  sensitivity: number;
  time: number;
}

/**
 * Resolves drawing styles (fill / stroke) based on the chosen color mode and audio metrics
 */
export function resolveColor(
  ctx: CanvasRenderingContext2D,
  params: EqualizerRenderParams,
  index = 0,
  total = 1,
  gradientDirection: 'vertical' | 'horizontal' | 'radial' = 'vertical'
): string | CanvasGradient {
  const { colorPreset, colorMode, customColor1, customColor2, metrics, x, y, width, height, time } = params;

  if (colorMode === 'single') {
    return customColor1 || colorPreset.primary;
  }

  if (colorMode === 'rainbow') {
    const hue = (index / total) * 360 + (time * 50) % 360;
    return `hsl(${hue}, 100%, 55%)`;
  }

  if (colorMode === 'reactive') {
    // Dynamic shift based on bass & volume
    const baseHue = (metrics.bass * 280 + metrics.volume * 100 + time * 30) % 360;
    const lightness = 45 + metrics.mid * 35;
    return `hsl(${baseHue}, 95%, ${lightness}%)`;
  }

  if (colorMode === 'multi') {
    const stops = colorPreset.gradient.length > 0 ? colorPreset.gradient : [colorPreset.primary, colorPreset.secondary];
    const colorIdx = Math.floor((index / total) * stops.length) % stops.length;
    return stops[colorIdx];
  }

  // Default: Gradient
  if (gradientDirection === 'horizontal') {
    const grad = ctx.createLinearGradient(x, y, x + width, y);
    const stops = colorPreset.gradient.length > 0 ? colorPreset.gradient : [customColor1 || colorPreset.primary, customColor2 || colorPreset.secondary];
    stops.forEach((c, idx) => {
      grad.addColorStop(idx / (stops.length - 1 || 1), c);
    });
    return grad;
  } else if (gradientDirection === 'radial') {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const radius = Math.max(width, height) / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const stops = colorPreset.gradient.length > 0 ? colorPreset.gradient : [customColor1 || colorPreset.primary, customColor2 || colorPreset.secondary];
    stops.forEach((c, idx) => {
      grad.addColorStop(idx / (stops.length - 1 || 1), c);
    });
    return grad;
  } else {
    // vertical
    const grad = ctx.createLinearGradient(x, y + height, x, y);
    const stops = colorPreset.gradient.length > 0 ? colorPreset.gradient : [customColor1 || colorPreset.primary, customColor2 || colorPreset.secondary];
    stops.forEach((c, idx) => {
      grad.addColorStop(idx / (stops.length - 1 || 1), c);
    });
    return grad;
  }
}

/**
 * Main dispatcher for all 50 Equalizer Models
 */
export function renderEqualizer(params: EqualizerRenderParams): void {
  const { ctx, x, y, width, height, model } = params;

  ctx.save();
  // Clip within bounds
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  switch (model) {
    case 1: drawClassicVerticalBars(params); break;
    case 2: drawNeonSpectrumBars(params); break;
    case 3: drawCircularSpectrum(params); break;
    case 4: drawRadialPulse(params); break;
    case 5: drawWaveSpectrum(params); break;
    case 6: drawMirrorBars(params); break;
    case 7: drawCenterPulse(params); break;
    case 8: drawDualSideSpectrum(params); break;
    case 9: drawTunnelSpectrum(params); break;
    case 10: drawArcSpectrum(params); break;
    case 11: drawCircularRing(params); break;
    case 12: drawHalfCircleSpectrum(params); break;
    case 13: drawFullRingEqualizer(params); break;
    case 14: drawSpiralSpectrum(params); break;
    case 15: drawGalaxySpectrum(params); break;
    case 16: drawParticleSpectrum(params); break;
    case 17: drawLiquidWave(params); break;
    case 18: drawFireSpectrum(params); break;
    case 19: drawMountainSpectrum(params); break;
    case 20: drawSkylineSpectrum(params); break;
    case 21: drawDotMatrixSpectrum(params); break;
    case 22: drawLEDGrid(params); break;
    case 23: drawVerticalWave(params); break;
    case 24: drawHorizontalSpectrum(params); break;
    case 25: drawSymmetricalWave(params); break;
    case 26: drawHeartPulse(params); break;
    case 27: drawStarBurst(params); break;
    case 28: drawSunRaySpectrum(params); break;
    case 29: drawOrbitalSpectrum(params); break;
    case 30: drawDNAWave(params); break;
    case 31: drawInfinitySpectrum(params); break;
    case 32: drawDiamondSpectrum(params); break;
    case 33: drawTriangleSpectrum(params); break;
    case 34: drawHexagonSpectrum(params); break;
    case 35: drawPolygonPulse(params); break;
    case 36: drawVortexSpectrum(params); break;
    case 37: drawShockwaveRing(params); break;
    case 38: drawFrequencyTunnel(params); break;
    case 39: drawNeonHorizon(params); break;
    case 40: drawAudioFlame(params); break;
    case 41: drawElectricWave(params); break;
    case 42: drawPlasmaSpectrum(params); break;
    case 43: drawSoundCloud(params); break;
    case 44: drawParticleBurst(params); break;
    case 45: drawRadarSpectrum(params); break;
    case 46: drawEqualizerWall(params); break;
    case 47: drawFrequencyBars3D(params); break;
    case 48: drawCircularBars3D(params); break;
    case 49: drawWaveformGlow(params); break;
    case 50: drawUltimateHybridSpectrum(params); break;
    default: drawClassicVerticalBars(params); break;
  }

  ctx.restore();
}

/* Helper to sample frequency buffer smoothly */
function getFreqVal(freq: Uint8Array, index: number, total: number, sensitivity: number): number {
  if (!freq || freq.length === 0) return 0;
  // Map index across useful audible bins (~5 to ~180)
  const binIndex = Math.floor(4 + (index / total) * Math.min(180, freq.length - 5));
  const raw = (freq[binIndex] || 0) / 255;
  return Math.min(1, Math.max(0, raw * sensitivity));
}

// 1. Classic Vertical Bars
function drawClassicVerticalBars(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const bars = 48;
  const barWidth = (width / bars) * 0.75;
  const spacing = (width / bars) * 0.25;

  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, sensitivity);
    const barHeight = Math.max(4, val * height * 0.95);
    const bx = x + i * (barWidth + spacing);
    const by = y + height - barHeight;

    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.beginPath();
    ctx.roundRect(bx, by, barWidth, barHeight, [4, 4, 0, 0]);
    ctx.fill();

    // Floating cap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by - 3, barWidth, 2);
  }
}

// 2. Neon Spectrum Bars
function drawNeonSpectrumBars(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const bars = 36;
  const barWidth = width / bars;

  ctx.shadowBlur = 15;
  ctx.shadowColor = p.colorPreset.primary;

  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, sensitivity);
    const barH = val * height * 0.85;
    const bx = x + i * barWidth + barWidth * 0.15;
    const bw = barWidth * 0.7;

    // Upright bar
    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.fillRect(bx, y + height * 0.7 - barH, bw, barH);

    // Neon reflection
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(bx, y + height * 0.7 + 2, bw, barH * 0.35);
  }
  ctx.shadowBlur = 0;
}

// 3. Circular Spectrum
function drawCircularSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const baseRadius = Math.min(width, height) * 0.22;
  const maxBarLength = Math.min(width, height) * 0.24;
  const bars = 64;

  ctx.lineWidth = 2.5;

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i, bars, sensitivity);
    const r2 = baseRadius + val * maxBarLength;

    const x1 = cx + Math.cos(angle) * baseRadius;
    const y1 = cy + Math.sin(angle) * baseRadius;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;

    ctx.strokeStyle = resolveColor(ctx, p, i, bars, 'radial');
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Center glowing core
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 0.85 * (1 + metrics.bass * 0.2), 0, Math.PI * 2);
  ctx.fill();
}

// 4. Radial Pulse
function drawRadialPulse(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const maxR = Math.min(width, height) * 0.45;
  const rings = 8;

  for (let r = 0; r < rings; r++) {
    const progress = (r / rings + time * 0.5) % 1;
    const radius = progress * maxR * (1 + metrics.bass * 0.4);
    const alpha = (1 - progress) * (0.3 + metrics.volume * 0.7);

    ctx.strokeStyle = resolveColor(ctx, p, r, rings, 'radial');
    ctx.lineWidth = 2 + (1 - progress) * 6 * metrics.bass;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// 5. Wave Spectrum
function drawWaveSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const points = 60;
  const step = width / (points - 1);
  const midY = y + height * 0.6;

  ctx.beginPath();
  ctx.moveTo(x, y + height);

  for (let i = 0; i < points; i++) {
    const val = getFreqVal(metrics.frequencyData, i, points, sensitivity);
    const py = midY - val * height * 0.55;
    const px = x + i * step;
    if (i === 0) ctx.lineTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.lineTo(x + width, y + height);
  ctx.closePath();

  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'vertical');
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Wave crest highlight
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
}

// 6. Mirror Bars
function drawMirrorBars(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const bars = 44;
  const barW = (width / bars) * 0.7;
  const midY = y + height / 2;

  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, sensitivity);
    const halfH = (val * height * 0.45);
    const bx = x + i * (width / bars);

    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.fillRect(bx, midY - halfH, barW, halfH * 2);
  }
}

// 7. Center Pulse
function drawCenterPulse(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const size = Math.min(width, height) * 0.45 * (1 + metrics.bass * 0.5);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.4);

  for (let s = 4; s >= 1; s--) {
    const currentSize = (size / 4) * s;
    ctx.fillStyle = resolveColor(ctx, p, s, 4, 'radial');
    ctx.globalAlpha = 0.3 + (s / 4) * 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -currentSize);
    ctx.lineTo(currentSize, 0);
    ctx.lineTo(0, currentSize);
    ctx.lineTo(-currentSize, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// 8. Dual Side Spectrum
function drawDualSideSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const bars = 28;
  const barH = height / bars;

  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, sensitivity);
    const barLen = val * width * 0.42;
    const by = y + i * barH + 2;

    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'horizontal');
    // Left bar pointing in
    ctx.fillRect(x, by, barLen, barH - 3);
    // Right bar pointing in
    ctx.fillRect(x + width - barLen, by, barLen, barH - 3);
  }
}

// 9. Tunnel Spectrum
function drawTunnelSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const layers = 10;

  for (let i = 0; i < layers; i++) {
    const offset = (i / layers + time * 0.8) % 1;
    const rw = width * offset * (0.8 + metrics.bass * 0.4);
    const rh = height * offset * (0.8 + metrics.bass * 0.4);

    ctx.strokeStyle = resolveColor(ctx, p, i, layers, 'radial');
    ctx.lineWidth = 1 + offset * 4;
    ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
  }
}

// 10. Arc Spectrum
function drawArcSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const cx = x + width / 2;
  const cy = y + height * 0.8;
  const radius = Math.min(width, height) * 0.55;
  const segments = 40;

  for (let i = 0; i < segments; i++) {
    const angle = Math.PI + (i / (segments - 1)) * Math.PI;
    const val = getFreqVal(metrics.frequencyData, i, segments, sensitivity);
    const barLen = val * radius * 0.45;

    const x1 = cx + Math.cos(angle) * (radius - barLen);
    const y1 = cy + Math.sin(angle) * (radius - barLen);
    const x2 = cx + Math.cos(angle) * radius;
    const y2 = cy + Math.sin(angle) * radius;

    ctx.strokeStyle = resolveColor(ctx, p, i, segments, 'radial');
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

// 11. Circular Ring
function drawCircularRing(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const baseR = Math.min(width, height) * 0.28;
  const points = 72;

  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i % points, points, sensitivity);
    const r = baseR + val * baseR * 0.8;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.lineWidth = 3 + metrics.bass * 4;
  ctx.stroke();
}

// 12. Half Circle Spectrum
function drawHalfCircleSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, sensitivity } = p;
  const cx = x + width / 2;
  const cy = y + height;
  const radius = Math.min(width / 2, height) * 0.85;
  const bars = 50;

  for (let i = 0; i < bars; i++) {
    const angle = Math.PI + (i / bars) * Math.PI;
    const val = getFreqVal(metrics.frequencyData, i, bars, sensitivity);
    const len = val * radius * 0.5;

    ctx.strokeStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * (radius - len), cy + Math.sin(angle) * (radius - len));
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();
  }
}

// 13. Full Ring Equalizer
function drawFullRingEqualizer(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const r = Math.min(width, height) * 0.32;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.5);

  const segments = 32;
  for (let i = 0; i < segments; i++) {
    const startA = (i / segments) * Math.PI * 2;
    const endA = startA + (Math.PI * 2) / segments * 0.7;
    const val = getFreqVal(metrics.frequencyData, i, segments, 1.2);

    ctx.strokeStyle = resolveColor(ctx, p, i, segments, 'radial');
    ctx.lineWidth = 4 + val * 16;
    ctx.beginPath();
    ctx.arc(0, 0, r, startA, endA);
    ctx.stroke();
  }
  ctx.restore();
}

// 14. Spiral Spectrum
function drawSpiralSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const points = 100;

  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const angle = i * 0.2 + time;
    const r = (i / points) * Math.min(width, height) * 0.45;
    const val = getFreqVal(metrics.frequencyData, i, points, 1);
    const offset = r + val * 30;
    const px = cx + Math.cos(angle) * offset;
    const py = cy + Math.sin(angle) * offset;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

// 15. Galaxy Spectrum
function drawGalaxySpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const arms = 2;
  const particlesPerArm = 50;

  for (let a = 0; a < arms; a++) {
    const armOffset = (a * Math.PI * 2) / arms;
    for (let i = 0; i < particlesPerArm; i++) {
      const distance = (i / particlesPerArm) * Math.min(width, height) * 0.4;
      const angle = armOffset + (i * 0.15) + time * 0.6;
      const val = getFreqVal(metrics.frequencyData, i, particlesPerArm, 1.4);
      const px = cx + Math.cos(angle) * (distance + val * 20);
      const py = cy + Math.sin(angle) * (distance + val * 20);

      ctx.fillStyle = resolveColor(ctx, p, i, particlesPerArm, 'radial');
      ctx.beginPath();
      ctx.arc(px, py, 2 + val * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// 16. Particle Spectrum
function drawParticleSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const count = 40;
  for (let i = 0; i < count; i++) {
    const val = getFreqVal(metrics.frequencyData, i, count, 1.5);
    const px = x + (i / count) * width;
    const py = y + height * 0.8 - val * height * 0.7 - Math.sin(time * 2 + i) * 10;
    const size = 3 + val * 12;

    ctx.fillStyle = resolveColor(ctx, p, i, count, 'vertical');
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 17. Liquid Wave
function drawLiquidWave(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const layers = 3;

  for (let l = 0; l < layers; l++) {
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    const baseY = y + height * (0.6 + l * 0.12);

    for (let px = x; px <= x + width; px += 10) {
      const relX = (px - x) / width;
      const wave = Math.sin(relX * 6 + time * (2 + l) + l) * (15 + metrics.bass * 25);
      const val = getFreqVal(metrics.frequencyData, Math.floor(relX * 40), 40, 1);
      const py = baseY - wave - val * 40;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x + width, y + height);
    ctx.closePath();

    ctx.fillStyle = resolveColor(ctx, p, l, layers, 'vertical');
    ctx.globalAlpha = 0.4 + l * 0.2;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 18. Fire Spectrum
function drawFireSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const flames = 32;
  const flameW = width / flames;

  for (let i = 0; i < flames; i++) {
    const val = getFreqVal(metrics.frequencyData, i, flames, 1.6);
    const fx = x + i * flameW;
    const flameH = val * height * 0.85 + Math.sin(time * 8 + i) * 12;

    const grad = ctx.createLinearGradient(fx, y + height, fx, y + height - flameH);
    grad.addColorStop(0, '#ff1100');
    grad.addColorStop(0.5, '#ffaa00');
    grad.addColorStop(1, '#ffffaa');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(fx, y + height);
    ctx.quadraticCurveTo(fx + flameW / 2, y + height - flameH * 1.2, fx + flameW, y + height);
    ctx.fill();
  }
}

// 19. Mountain Spectrum
function drawMountainSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const peaks = 24;
  const step = width / (peaks - 1);

  ctx.beginPath();
  ctx.moveTo(x, y + height);
  for (let i = 0; i < peaks; i++) {
    const val = getFreqVal(metrics.frequencyData, i, peaks, 1.4);
    const px = x + i * step;
    const py = y + height - val * height * 0.7;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'vertical');
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 20. Skyline Spectrum
function drawSkylineSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const bldgs = 20;
  const bldgW = width / bldgs;

  for (let i = 0; i < bldgs; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bldgs, 1.3);
    const bh = val * height * 0.8;
    const bx = x + i * bldgW;
    const by = y + height - bh;

    ctx.fillStyle = resolveColor(ctx, p, i, bldgs, 'vertical');
    ctx.fillRect(bx + 2, by, bldgW - 4, bh);

    // Windows
    ctx.fillStyle = '#ffffff';
    for (let wy = by + 6; wy < y + height - 6; wy += 10) {
      ctx.fillRect(bx + 5, wy, bldgW - 10, 4);
    }
  }
}

// 21. Dot Matrix Spectrum
function drawDotMatrixSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cols = 28;
  const rows = 16;
  const dotW = width / cols;
  const dotH = height / rows;

  for (let c = 0; c < cols; c++) {
    const val = getFreqVal(metrics.frequencyData, c, cols, 1.2);
    const activeRows = Math.floor(val * rows);

    for (let r = 0; r < rows; r++) {
      const isLit = r < activeRows;
      const dx = x + c * dotW + dotW / 2;
      const dy = y + height - (r * dotH + dotH / 2);

      ctx.fillStyle = isLit ? resolveColor(ctx, p, c, cols, 'vertical') : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(dx, dy, Math.min(dotW, dotH) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// 22. LED Grid
function drawLEDGrid(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cols = 20;
  const rows = 14;
  const colW = width / cols;
  const rowH = height / rows;

  for (let c = 0; c < cols; c++) {
    const val = getFreqVal(metrics.frequencyData, c, cols, 1.3);
    const lit = Math.floor(val * rows);

    for (let r = 0; r < rows; r++) {
      const active = r < lit;
      const rx = x + c * colW + 2;
      const ry = y + height - ((r + 1) * rowH) + 2;

      let blockColor = '#10b981'; // Green
      if (r > rows * 0.6) blockColor = '#f59e0b'; // Yellow
      if (r > rows * 0.85) blockColor = '#ef4444'; // Red

      ctx.fillStyle = active ? blockColor : 'rgba(255,255,255,0.05)';
      ctx.fillRect(rx, ry, colW - 4, rowH - 4);
    }
  }
}

// 23. Vertical Wave
function drawVerticalWave(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const points = 60;
  const step = height / points;

  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const val = getFreqVal(metrics.frequencyData, i, points, 1.4);
    const py = y + i * step;
    const px = cx + Math.sin(i * 0.2 + time * 3) * (val * width * 0.4);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = resolveColor(ctx, p, 0, 1, 'vertical');
  ctx.lineWidth = 4;
  ctx.stroke();
}

// 24. Horizontal Spectrum
function drawHorizontalSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const bars = 24;
  const barH = height / bars;

  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, 1.4);
    const len = val * width * 0.9;
    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'horizontal');
    ctx.fillRect(x, y + i * barH + 2, len, barH - 4);
  }
}

// 25. Symmetrical Wave
function drawSymmetricalWave(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const points = 30;

  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const val = getFreqVal(metrics.frequencyData, i, points, 1.5);
    const py = y + (i / points) * height;
    const offset = val * width * 0.4;
    // Right wing
    ctx.lineTo(cx + offset, py);
  }
  for (let i = points - 1; i >= 0; i--) {
    const val = getFreqVal(metrics.frequencyData, i, points, 1.5);
    const py = y + (i / points) * height;
    const offset = val * width * 0.4;
    // Left wing
    ctx.lineTo(cx - offset, py);
  }
  ctx.closePath();
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'vertical');
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;
}

// 26. Heart Pulse
function drawHeartPulse(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const scale = (Math.min(width, height) / 28) * (1 + metrics.bass * 0.35);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, -scale);
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 2; t += 0.05) {
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    if (t === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.fill();
  ctx.restore();
}

// 27. Star Burst
function drawStarBurst(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const points = 12;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.4);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const val = getFreqVal(metrics.frequencyData, i, points * 2, 1.4);
    const r = i % 2 === 0 ? Math.min(width, height) * 0.45 * (0.5 + val * 0.6) : Math.min(width, height) * 0.15;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.fill();
  ctx.restore();
}

// 28. Sun Ray Spectrum
function drawSunRaySpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const baseR = Math.min(width, height) * 0.2;
  const rays = 48;

  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i, rays, 1.4);
    const rayLen = val * baseR * 1.5;

    ctx.strokeStyle = resolveColor(ctx, p, i, rays, 'radial');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * baseR, cy + Math.sin(angle) * baseR);
    ctx.lineTo(cx + Math.cos(angle) * (baseR + rayLen), cy + Math.sin(angle) * (baseR + rayLen));
    ctx.stroke();
  }
  // Central sun disc
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 0.9, 0, Math.PI * 2);
  ctx.fill();
}

// 29. Orbital Spectrum
function drawOrbitalSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const orbits = 5;

  for (let o = 1; o <= orbits; o++) {
    const r = (o / (orbits + 1)) * Math.min(width, height) * 0.45;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting node
    const angle = time * (1 / o) + o;
    const val = getFreqVal(metrics.frequencyData, o * 8, 40, 1.5);
    const nx = cx + Math.cos(angle) * r;
    const ny = cy + Math.sin(angle) * r;

    ctx.fillStyle = resolveColor(ctx, p, o, orbits, 'radial');
    ctx.beginPath();
    ctx.arc(nx, ny, 4 + val * 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 30. DNA Wave
function drawDNAWave(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const steps = 24;
  const stepW = width / steps;
  const midY = y + height / 2;

  for (let i = 0; i < steps; i++) {
    const val = getFreqVal(metrics.frequencyData, i, steps, 1.3);
    const px = x + i * stepW;
    const amp = height * 0.35;
    const y1 = midY + Math.sin(i * 0.4 + time * 2) * amp;
    const y2 = midY - Math.sin(i * 0.4 + time * 2) * amp;

    // Rung
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, y1);
    ctx.lineTo(px, y2);
    ctx.stroke();

    // Strands
    ctx.fillStyle = resolveColor(ctx, p, i, steps, 'horizontal');
    ctx.beginPath();
    ctx.arc(px, y1, 4 + val * 6, 0, Math.PI * 2);
    ctx.arc(px, y2, 4 + val * 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 31. Infinity Spectrum
function drawInfinitySpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const scale = Math.min(width, height) * 0.4;

  ctx.beginPath();
  for (let t = 0; t <= Math.PI * 2; t += 0.05) {
    const val = getFreqVal(metrics.frequencyData, Math.floor(t * 10), 65, 1.2);
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const px = cx + (scale * Math.cos(t)) / denom;
    const py = cy + (scale * Math.sin(t) * Math.cos(t)) / denom + (val * 15);

    if (t === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = resolveColor(ctx, p, 0, 1, 'vertical');
  ctx.lineWidth = 4 + metrics.bass * 4;
  ctx.stroke();
}

// 32. Diamond Spectrum
function drawDiamondSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const facets = 8;

  for (let i = 0; i < facets; i++) {
    const val = getFreqVal(metrics.frequencyData, i * 4, 32, 1.4);
    const r = (width * 0.35) * (0.4 + val * 0.6);
    const a1 = (i / facets) * Math.PI * 2;
    const a2 = ((i + 1) / facets) * Math.PI * 2;

    ctx.fillStyle = resolveColor(ctx, p, i, facets, 'radial');
    ctx.globalAlpha = 0.6 + val * 0.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
    ctx.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 33. Triangle Spectrum
function drawTriangleSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const triangles = 4;

  for (let t = 0; t < triangles; t++) {
    const val = getFreqVal(metrics.frequencyData, t * 10, 40, 1.3);
    const r = (Math.min(width, height) * 0.45 * (t + 1)) / triangles * (1 + val * 0.3);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * (t % 2 === 0 ? 0.4 : -0.4));
    ctx.strokeStyle = resolveColor(ctx, p, t, triangles, 'radial');
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let pIdx = 0; pIdx < 3; pIdx++) {
      const angle = (pIdx * Math.PI * 2) / 3 - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (pIdx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// 34. Hexagon Spectrum
function drawHexagonSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const hexR = Math.min(width, height) * 0.12;

  // 7 hexagons (1 center + 6 surrounding)
  const centers = [
    { x: cx, y: cy },
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return { x: cx + Math.cos(a) * hexR * 2.1, y: cy + Math.sin(a) * hexR * 2.1 };
    }),
  ];

  centers.forEach((c, idx) => {
    const val = getFreqVal(metrics.frequencyData, idx * 6, 42, 1.4);
    ctx.fillStyle = resolveColor(ctx, p, idx, 7, 'radial');
    ctx.beginPath();
    for (let h = 0; h < 6; h++) {
      const a = (h / 6) * Math.PI * 2;
      const r = hexR * (0.6 + val * 0.6);
      const px = c.x + Math.cos(a) * r;
      const py = c.y + Math.sin(a) * r;
      if (h === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  });
}

// 35. Polygon Pulse
function drawPolygonPulse(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const sides = 8;
  const r = Math.min(width, height) * 0.38;

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i * 4, sides * 4, 1.5);
    const radius = r * (0.6 + val * 0.7);
    const px = cx + Math.cos(a) * radius;
    const py = cy + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.fill();
}

// 36. Vortex Spectrum
function drawVortexSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const spirals = 36;

  for (let s = 0; s < spirals; s++) {
    const a = (s / spirals) * Math.PI * 2 + time * 1.5;
    const val = getFreqVal(metrics.frequencyData, s, spirals, 1.5);
    const r1 = 15;
    const r2 = Math.min(width, height) * 0.45 * (0.5 + val * 0.5);

    ctx.strokeStyle = resolveColor(ctx, p, s, spirals, 'radial');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a + 0.6) * r2, cy + Math.sin(a + 0.6) * r2);
    ctx.stroke();
  }
}

// 37. Shockwave Ring
function drawShockwaveRing(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const waves = 5;

  for (let w = 0; w < waves; w++) {
    const waveProgress = (w / waves + time * 1.2) % 1;
    const r = waveProgress * Math.min(width, height) * 0.48;
    const alpha = (1 - waveProgress) * (0.2 + metrics.bass * 0.8);

    ctx.strokeStyle = resolveColor(ctx, p, w, waves, 'radial');
    ctx.lineWidth = 3 + metrics.bass * 8;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// 38. Frequency Tunnel
function drawFrequencyTunnel(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const count = 12;

  for (let i = 0; i < count; i++) {
    const progress = (i / count + time * 0.5) % 1;
    const w = width * progress;
    const h = height * progress;
    const val = getFreqVal(metrics.frequencyData, i * 2, count * 2, 1.3);

    ctx.strokeStyle = resolveColor(ctx, p, i, count, 'radial');
    ctx.lineWidth = 2 + val * 6;
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  }
}

// 39. Neon Horizon
function drawNeonHorizon(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const midY = y + height * 0.6;
  const lines = 16;

  // Horizontal scanlines
  for (let l = 0; l < lines; l++) {
    const ly = midY + Math.pow(l / lines, 2) * (height * 0.4);
    const val = getFreqVal(metrics.frequencyData, l * 2, lines * 2, 1.2);
    ctx.strokeStyle = resolveColor(ctx, p, l, lines, 'vertical');
    ctx.lineWidth = 1.5 + val * 3;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + width, ly);
    ctx.stroke();
  }
}

// 40. Audio Flame
function drawAudioFlame(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const flameH = (height * 0.7) * (0.4 + metrics.bass * 0.8);

  const grad = ctx.createLinearGradient(cx, y + height, cx, y + height - flameH);
  grad.addColorStop(0, '#3b82f6');
  grad.addColorStop(0.4, '#06b6d4');
  grad.addColorStop(0.8, '#ffffff');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - 35, y + height);
  ctx.quadraticCurveTo(cx - 50 + Math.sin(time * 10) * 15, y + height - flameH * 0.6, cx, y + height - flameH);
  ctx.quadraticCurveTo(cx + 50 + Math.sin(time * 10) * 15, y + height - flameH * 0.6, cx + 35, y + height);
  ctx.closePath();
  ctx.fill();
}

// 41. Electric Wave
function drawElectricWave(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const midY = y + height / 2;
  const points = 40;
  const step = width / points;

  ctx.beginPath();
  ctx.moveTo(x, midY);
  for (let i = 1; i < points; i++) {
    const val = getFreqVal(metrics.frequencyData, i, points, 1.8);
    const jitter = (Math.random() - 0.5) * val * height * 0.8;
    ctx.lineTo(x + i * step, midY + jitter);
  }
  ctx.lineTo(x + width, midY);

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// 42. Plasma Spectrum
function drawPlasmaSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const blobs = 6;
  const cx = x + width / 2;
  const cy = y + height / 2;

  for (let b = 0; b < blobs; b++) {
    const angle = (b / blobs) * Math.PI * 2 + time;
    const val = getFreqVal(metrics.frequencyData, b * 5, blobs * 5, 1.4);
    const dist = (width * 0.25) * (0.3 + val * 0.7);
    const bx = cx + Math.cos(angle) * dist;
    const by = cy + Math.sin(angle) * dist;
    const radius = (width * 0.15) * (0.6 + val * 0.8);

    ctx.fillStyle = resolveColor(ctx, p, b, blobs, 'radial');
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 43. Sound Cloud
function drawSoundCloud(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const puffs = 16;

  for (let i = 0; i < puffs; i++) {
    const a = (i / puffs) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i * 2, puffs * 2, 1.3);
    const dist = (width * 0.2) + val * 30;
    const px = cx + Math.cos(a) * dist;
    const py = cy + Math.sin(a) * dist;

    ctx.fillStyle = resolveColor(ctx, p, i, puffs, 'radial');
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(px, py, 25 + val * 35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 44. Particle Burst
function drawParticleBurst(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rays = 36;

  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i, rays, 1.8);
    const d = (Math.min(width, height) * 0.45) * val;

    ctx.fillStyle = resolveColor(ctx, p, i, rays, 'radial');
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3 + val * 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 45. Radar Spectrum
function drawRadarSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const r = Math.min(width, height) * 0.42;

  // Radar grid rings
  ctx.strokeStyle = 'rgba(0, 255, 128, 0.25)';
  ctx.lineWidth = 1.5;
  [0.33, 0.66, 1].forEach((f) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Sweep line
  const sweepAngle = time * 2;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(sweepAngle) * r, cy + Math.sin(sweepAngle) * r);
  ctx.stroke();

  // Blips based on audio
  for (let i = 0; i < 8; i++) {
    const val = getFreqVal(metrics.frequencyData, i * 4, 32, 1.4);
    if (val > 0.4) {
      const a = (i / 8) * Math.PI * 2;
      const d = r * (0.2 + val * 0.7);
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 4 + val * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// 46. Equalizer Wall
function drawEqualizerWall(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cols = 12;
  const rows = 8;
  const colW = width / cols;
  const rowH = height / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const idx = c + r * cols;
      const val = getFreqVal(metrics.frequencyData, idx, cols * rows, 1.3);
      const bx = x + c * colW + 3;
      const by = y + r * rowH + 3;

      ctx.fillStyle = resolveColor(ctx, p, idx, cols * rows, 'vertical');
      ctx.globalAlpha = 0.15 + val * 0.85;
      ctx.fillRect(bx, by, colW - 6, rowH - 6);
    }
  }
  ctx.globalAlpha = 1;
}

// 47. Frequency Bars 3D
function drawFrequencyBars3D(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const bars = 24;
  const barW = (width / bars) * 0.6;
  const depth = 12;

  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, 1.4);
    const bh = val * height * 0.8;
    const bx = x + i * (width / bars);
    const by = y + height - bh;

    // Front face
    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.fillRect(bx, by, barW, bh);

    // Top face (isometric)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + depth, by - depth * 0.5);
    ctx.lineTo(bx + barW + depth, by - depth * 0.5);
    ctx.lineTo(bx + barW, by);
    ctx.closePath();
    ctx.fill();

    // Side face
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(bx + barW, by);
    ctx.lineTo(bx + barW + depth, by - depth * 0.5);
    ctx.lineTo(bx + barW + depth, by + bh - depth * 0.5);
    ctx.lineTo(bx + barW, by + bh);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// 48. Circular Bars 3D
function drawCircularBars3D(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width * 0.38;
  const ry = height * 0.22;
  const bars = 40;

  for (let i = 0; i < bars; i++) {
    const a = (i / bars) * Math.PI * 2;
    const val = getFreqVal(metrics.frequencyData, i, bars, 1.4);
    const bh = val * height * 0.35;
    const bx = cx + Math.cos(a) * rx;
    const by = cy + Math.sin(a) * ry;

    ctx.strokeStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - bh);
    ctx.stroke();
  }
}

// 49. Waveform Glow
function drawWaveformGlow(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics } = p;
  const midY = y + height / 2;
  const timeData = metrics.timeDomainData;
  if (!timeData || timeData.length === 0) return;

  ctx.shadowBlur = 18;
  ctx.shadowColor = p.colorPreset.primary;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  const sliceW = width / timeData.length;
  for (let i = 0; i < timeData.length; i++) {
    const v = timeData[i] / 128.0; // 0 to 2
    const py = midY + (v - 1.0) * (height * 0.45);
    const px = x + i * sliceW;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// 50. Ultimate Hybrid Spectrum
function drawUltimateHybridSpectrum(p: EqualizerRenderParams) {
  const { ctx, x, y, width, height, metrics, time } = p;
  // Combine: 1) Pulsing central orb, 2) Radial frequency ring, 3) Bottom frequency bars
  const cx = x + width / 2;
  const cy = y + height * 0.45;
  const r = Math.min(width, height) * 0.22;

  // 1. Central Core
  ctx.fillStyle = resolveColor(ctx, p, 0, 1, 'radial');
  ctx.beginPath();
  ctx.arc(cx, cy, r * (0.6 + metrics.bass * 0.5), 0, Math.PI * 2);
  ctx.fill();

  // 2. Radial rays
  const rays = 36;
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + time * 0.3;
    const val = getFreqVal(metrics.frequencyData, i, rays, 1.4);
    const r2 = r + val * 45;
    ctx.strokeStyle = resolveColor(ctx, p, i, rays, 'radial');
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // 3. Bottom sleek bars
  const bars = 28;
  const barW = (width / bars) * 0.7;
  for (let i = 0; i < bars; i++) {
    const val = getFreqVal(metrics.frequencyData, i, bars, 1.2);
    const bh = val * height * 0.25;
    const bx = x + i * (width / bars);
    ctx.fillStyle = resolveColor(ctx, p, i, bars, 'vertical');
    ctx.fillRect(bx, y + height - bh, barW, bh);
  }
}
