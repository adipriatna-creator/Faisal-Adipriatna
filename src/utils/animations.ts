import { AudioMetrics, ParticleDirection } from '../types';

export interface AnimationRenderParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  model: number;
  enabled: boolean;
  opacity: number;
  speed: number;
  density: number;
  size: number;
  direction: ParticleDirection;
  metrics: AudioMetrics;
  time: number;
}

interface Particle {
  x: number;
  y: number;
  z?: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color?: string;
  angle?: number;
  spin?: number;
  life?: number;
}

export class ParticleAnimationSystem {
  private particles: Particle[] = [];
  private currentModel = -1;
  private currentDensity = -1;
  private lastLightningTime = 0;
  private activeLightningBranches: { x1: number; y1: number; x2: number; y2: number }[] = [];

  public initParticles(model: number, density: number, width: number, height: number): void {
    if (this.currentModel === model && this.currentDensity === density && this.particles.length > 0) {
      return;
    }

    this.currentModel = model;
    this.currentDensity = density;
    this.particles = [];

    const count = Math.min(400, Math.max(15, density));

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 1 + Math.random() * 5,
        alpha: 0.2 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        life: Math.random(),
      });
    }
  }

  public render(p: AnimationRenderParams): void {
    if (!p.enabled || p.opacity <= 0) return;

    const { ctx, width, height, model, opacity, speed, density, size, metrics, time } = p;
    this.initParticles(model, density, width, height);

    ctx.save();
    ctx.globalAlpha = opacity;

    switch (model) {
      case 1: this.renderSnowDust(ctx, width, height, speed, size); break;
      case 2: this.renderFloatingDust(ctx, width, height, speed, size); break;
      case 3: this.renderFallingSnow(ctx, width, height, speed, size); break;
      case 4: this.renderRisingParticles(ctx, width, height, speed, size); break;
      case 5: this.renderSpark(ctx, width, height, speed, size, metrics); break;
      case 6: this.renderStarfield(ctx, width, height, speed, size, metrics); break;
      case 7: this.renderGalaxy(ctx, width, height, speed, size, time); break;
      case 8: this.renderFireflies(ctx, width, height, speed, size, time); break;
      case 9: this.renderSmoke(ctx, width, height, speed, size, time); break;
      case 10: this.renderFog(ctx, width, height, speed, time); break;
      case 11: this.renderBokeh(ctx, width, height, speed, size, metrics); break;
      case 12: this.renderRain(ctx, width, height, speed, size, false); break;
      case 13: this.renderRain(ctx, width, height, speed, size, true); break;
      case 14: this.renderNeonParticles(ctx, width, height, speed, size, time); break;
      case 15: this.renderGlitter(ctx, width, height, speed, size, time); break;
      case 16: this.renderExplosion(ctx, width, height, speed, size, metrics, time); break;
      case 17: this.renderEnergyBurst(ctx, width, height, metrics, time); break;
      case 18: this.renderLightning(ctx, width, height, metrics, time); break;
      case 19: this.renderElectricSparks(ctx, width, height, speed, size, metrics); break;
      case 20: this.renderFloatingOrbs(ctx, width, height, speed, size, time); break;
      case 21: this.renderBubble(ctx, width, height, speed, size); break;
      case 22: this.renderCosmicDust(ctx, width, height, speed, size); break;
      case 23: this.renderMeteor(ctx, width, height, speed, size, time); break;
      case 24: this.renderFireParticles(ctx, width, height, speed, size, metrics); break;
      case 25: this.renderAsh(ctx, width, height, speed, size); break;
      case 26: this.renderSandDust(ctx, width, height, speed, size); break;
      case 27: this.renderLightRays(ctx, width, height, metrics, time); break;
      case 28: this.renderLensFlare(ctx, width, height, metrics, time); break;
      case 29: this.renderWaveParticles(ctx, width, height, speed, size, time); break;
      case 30: this.renderAudioReactiveParticles(ctx, width, height, speed, size, metrics); break;
      default: this.renderFloatingDust(ctx, width, height, speed, size); break;
    }

    ctx.restore();
  }

  // 1. Snow Dust
  private renderSnowDust(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.fillStyle = '#ffffff';
    for (const pt of this.particles) {
      pt.y += (0.5 + pt.size * 0.2) * speed;
      pt.x += Math.sin(pt.y * 0.02) * 0.5;
      if (pt.y > h) pt.y = -10;
      if (pt.x > w) pt.x = 0;
      if (pt.x < 0) pt.x = w;

      ctx.globalAlpha = pt.alpha * 0.6;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Floating Dust
  private renderFloatingDust(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.fillStyle = '#e2e8f0';
    for (const pt of this.particles) {
      pt.x += pt.vx * 0.4 * speed;
      pt.y += pt.vy * 0.4 * speed;
      if (pt.x < 0) pt.x = w;
      if (pt.x > w) pt.x = 0;
      if (pt.y < 0) pt.y = h;
      if (pt.y > h) pt.y = 0;

      ctx.globalAlpha = pt.alpha * 0.4;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1 + pt.size * 0.3) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Falling Snow
  private renderFallingSnow(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.fillStyle = '#ffffff';
    for (const pt of this.particles) {
      pt.y += (2 + pt.size * 0.5) * speed;
      pt.x += (Math.sin(pt.y * 0.01) * 1.5 + 0.5) * speed;
      if (pt.y > h) pt.y = -10;
      if (pt.x > w) pt.x = 0;

      ctx.globalAlpha = pt.alpha * 0.8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (2 + pt.size * 0.6) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Rising Particles
  private renderRisingParticles(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.fillStyle = '#a78bfa';
    for (const pt of this.particles) {
      pt.y -= (1.5 + pt.size * 0.4) * speed;
      pt.x += Math.sin(pt.y * 0.03) * 0.8;
      if (pt.y < -10) pt.y = h + 10;
      if (pt.x > w) pt.x = 0;
      if (pt.x < 0) pt.x = w;

      ctx.globalAlpha = pt.alpha * 0.7;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1.5 + pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. Spark
  private renderSpark(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics) {
    ctx.fillStyle = '#fbbf24';
    for (const pt of this.particles) {
      pt.x += pt.vx * 1.8 * speed * (1 + metrics.bass);
      pt.y += pt.vy * 1.8 * speed * (1 + metrics.bass);
      if (pt.x < 0 || pt.x > w) pt.vx *= -1;
      if (pt.y < 0 || pt.y > h) pt.vy *= -1;

      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1 + pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. Starfield (warp speed)
  private renderStarfield(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics) {
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = '#ffffff';

    for (const pt of this.particles) {
      pt.z = (pt.z || w) - 4 * speed * (1 + metrics.bass * 2);
      if ((pt.z || 0) <= 0) {
        pt.z = w;
        pt.x = (Math.random() - 0.5) * w;
        pt.y = (Math.random() - 0.5) * h;
      }

      const k = 250 / (pt.z || 1);
      const px = pt.x * k + cx;
      const py = pt.y * k + cy;

      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        const starSize = Math.max(0.5, (1 - (pt.z || 1) / w) * 4 * (size / 5));
        ctx.globalAlpha = Math.min(1, (1 - (pt.z || 1) / w) * 1.5);
        ctx.beginPath();
        ctx.arc(px, py, starSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 7. Galaxy
  private renderGalaxy(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      const dist = (i / this.particles.length) * (Math.min(w, h) * 0.45);
      const angle = i * 0.1 + time * 0.4 * speed;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist * 0.5; // perspective tilt

      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#ec4899';
      ctx.globalAlpha = pt.alpha * 0.7;
      ctx.beginPath();
      ctx.arc(px, py, (1 + pt.size * 0.3) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. Fireflies
  private renderFireflies(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    for (const pt of this.particles) {
      pt.x += Math.cos(time + pt.angle!) * 0.8 * speed;
      pt.y += Math.sin(time + pt.angle!) * 0.8 * speed;
      if (pt.x < 0) pt.x = w;
      if (pt.x > w) pt.x = 0;
      if (pt.y < 0) pt.y = h;
      if (pt.y > h) pt.y = 0;

      const glow = (Math.sin(time * 3 + pt.angle!) + 1) * 0.5;
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10 * glow;
      ctx.globalAlpha = glow * 0.85;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (2 + pt.size * 0.5) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // 9. Smoke
  private renderSmoke(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    ctx.fillStyle = '#94a3b8';
    for (const pt of this.particles) {
      pt.y -= (0.8 + pt.size * 0.2) * speed;
      pt.x += Math.sin(time * 0.5 + pt.y * 0.01) * 0.6;
      if (pt.y < -50) pt.y = h + 50;

      ctx.globalAlpha = 0.08 * pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (15 + pt.size * 6) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 10. Fog
  private renderFog(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, time: number) {
    const grad = ctx.createLinearGradient(0, h * 0.6, 0, h);
    grad.addColorStop(0, 'rgba(203, 213, 225, 0)');
    grad.addColorStop(0.5, 'rgba(203, 213, 225, 0.15)');
    grad.addColorStop(1, 'rgba(203, 213, 225, 0.35)');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.7 + Math.sin(x * 0.01 + time * speed) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  // 11. Bokeh
  private renderBokeh(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics) {
    const colors = ['#f43f5e', '#a855f7', '#38bdf8', '#fbbf24'];
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      pt.y -= 0.3 * speed;
      if (pt.y < -40) pt.y = h + 40;

      const r = (12 + pt.size * 5) * (size / 5) * (1 + metrics.bass * 0.3);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = pt.alpha * 0.25;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 12 & 13. Rain / Light Rain
  private renderRain(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, isLight: boolean) {
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = isLight ? 1 : 2 * (size / 5);
    const dropSpeed = isLight ? 12 : 22;

    for (const pt of this.particles) {
      pt.y += dropSpeed * speed;
      pt.x += 2 * speed;
      if (pt.y > h) {
        pt.y = -20;
        pt.x = Math.random() * w;
      }

      ctx.globalAlpha = pt.alpha * (isLight ? 0.3 : 0.6);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + 2, pt.y + (isLight ? 12 : 25));
      ctx.stroke();
    }
  }

  // 14. Neon Particles
  private renderNeonParticles(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      pt.x += pt.vx * speed;
      pt.y += pt.vy * speed;
      if (pt.x < 0) pt.x = w;
      if (pt.x > w) pt.x = 0;
      if (pt.y < 0) pt.y = h;
      if (pt.y > h) pt.y = 0;

      const hue = (i * 15 + time * 60) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (2 + pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // 15. Glitter
  private renderGlitter(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    ctx.fillStyle = '#ffffff';
    for (const pt of this.particles) {
      const blink = Math.abs(Math.sin(time * 6 + pt.angle!));
      ctx.globalAlpha = blink;

      const arm = (3 + pt.size) * (size / 5);
      ctx.beginPath();
      ctx.moveTo(pt.x - arm, pt.y);
      ctx.lineTo(pt.x + arm, pt.y);
      ctx.moveTo(pt.x, pt.y - arm);
      ctx.lineTo(pt.x, pt.y + arm);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // 16. Explosion
  private renderExplosion(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics, time: number) {
    const cx = w / 2;
    const cy = h / 2;
    const trigger = metrics.peak || Math.sin(time * 4) > 0.85;

    for (const pt of this.particles) {
      if (trigger) {
        pt.x = cx;
        pt.y = cy;
        const a = Math.random() * Math.PI * 2;
        const s = (4 + Math.random() * 8) * speed;
        pt.vx = Math.cos(a) * s;
        pt.vy = Math.sin(a) * s;
      }
      pt.x += pt.vx;
      pt.y += pt.vy;

      ctx.fillStyle = '#f97316';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (2 + pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 17. Energy Burst
  private renderEnergyBurst(ctx: CanvasRenderingContext2D, w: number, h: number, metrics: AudioMetrics, time: number) {
    const cx = w / 2;
    const cy = h / 2;
    const rings = 4;

    for (let r = 0; r < rings; r++) {
      const progress = (r / rings + time * 1.5) % 1;
      const radius = progress * Math.min(w, h) * 0.5;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = (1 - progress) * 8 * (0.5 + metrics.bass);
      ctx.globalAlpha = (1 - progress) * 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 18. Lightning
  private renderLightning(ctx: CanvasRenderingContext2D, w: number, h: number, metrics: AudioMetrics, time: number) {
    if (metrics.peak || time - this.lastLightningTime > 2.5) {
      this.lastLightningTime = time;
      this.activeLightningBranches = [];
      let curX = w * (0.3 + Math.random() * 0.4);
      let curY = 0;

      while (curY < h) {
        const nextX = curX + (Math.random() - 0.5) * 80;
        const nextY = curY + 20 + Math.random() * 40;
        this.activeLightningBranches.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
        curX = nextX;
        curY = nextY;
      }
    }

    if (this.activeLightningBranches.length > 0 && time - this.lastLightningTime < 0.2) {
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const b of this.activeLightningBranches) {
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // 19. Electric Sparks
  private renderElectricSparks(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (const pt of this.particles) {
      if (Math.random() < 0.2 + metrics.treble * 0.5) {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + (Math.random() - 0.5) * 20, pt.y + (Math.random() - 0.5) * 20);
        ctx.stroke();
      }
    }
  }

  // 20. Floating Orbs
  private renderFloatingOrbs(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    for (let i = 0; i < Math.min(15, this.particles.length); i++) {
      const pt = this.particles[i];
      pt.y -= 0.6 * speed;
      pt.x += Math.sin(time + i) * 0.5;
      if (pt.y < -80) pt.y = h + 80;

      const r = (25 + pt.size * 10) * (size / 5);
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      grad.addColorStop(0, 'rgba(192, 132, 252, 0.4)');
      grad.addColorStop(1, 'rgba(192, 132, 252, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 21. Bubble
  private renderBubble(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    for (const pt of this.particles) {
      pt.y -= (1 + pt.size * 0.4) * speed;
      pt.x += Math.sin(pt.y * 0.03) * 0.5;
      if (pt.y < -20) pt.y = h + 20;

      const r = (3 + pt.size * 1.5) * (size / 5);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // 22. Cosmic Dust
  private renderCosmicDust(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      pt.x += pt.vx * 0.3 * speed;
      pt.y += pt.vy * 0.3 * speed;
      if (pt.x < 0) pt.x = w;
      if (pt.x > w) pt.x = 0;
      if (pt.y < 0) pt.y = h;
      if (pt.y > h) pt.y = 0;

      ctx.fillStyle = i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#38bdf8' : '#fda4af';
      ctx.globalAlpha = pt.alpha * 0.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1 + pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 23. Meteor
  private renderMeteor(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * (size / 5);
    for (let i = 0; i < Math.min(8, this.particles.length); i++) {
      const pt = this.particles[i];
      pt.x += 16 * speed;
      pt.y += 9 * speed;
      if (pt.x > w + 100 || pt.y > h + 100) {
        pt.x = -100 - Math.random() * 200;
        pt.y = Math.random() * (h * 0.6);
      }

      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x - 60, pt.y - 34);
      ctx.stroke();
    }
  }

  // 24. Fire Particles
  private renderFireParticles(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics) {
    for (const pt of this.particles) {
      pt.y -= (2 + pt.size * 0.6) * speed * (1 + metrics.bass * 0.8);
      pt.x += Math.sin(pt.y * 0.05) * 1.5;
      if (pt.y < 0) {
        pt.y = h;
        pt.x = Math.random() * w;
      }

      ctx.fillStyle = pt.y > h * 0.7 ? '#f97316' : '#ef4444';
      ctx.globalAlpha = (pt.y / h) * 0.8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1.5 + pt.size * 0.5) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 25. Ash
  private renderAsh(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.fillStyle = '#475569';
    for (const pt of this.particles) {
      pt.y += (0.8 + pt.size * 0.2) * speed;
      pt.x += Math.sin(pt.y * 0.02) * 0.8;
      if (pt.y > h) pt.y = -10;

      ctx.globalAlpha = pt.alpha * 0.6;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1 + pt.size * 0.4) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 26. Sand Dust
  private renderSandDust(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number) {
    ctx.fillStyle = '#fde047';
    for (const pt of this.particles) {
      pt.x += (8 + pt.size * 2) * speed;
      pt.y += Math.sin(pt.x * 0.02) * 0.5;
      if (pt.x > w) pt.x = -10;

      ctx.globalAlpha = pt.alpha * 0.4;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1 + pt.size * 0.3) * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 27. Light Rays
  private renderLightRays(ctx: CanvasRenderingContext2D, w: number, h: number, metrics: AudioMetrics, time: number) {
    const rays = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let r = 0; r < rays; r++) {
      const a = (r / rays) * (Math.PI * 0.4) + Math.sin(time * 0.5 + r) * 0.05;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * w * 1.5, Math.sin(a) * h * 1.5);
      ctx.lineTo(Math.cos(a + 0.08) * w * 1.5, Math.sin(a + 0.08) * h * 1.5);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 28. Lens Flare
  private renderLensFlare(ctx: CanvasRenderingContext2D, w: number, h: number, metrics: AudioMetrics, time: number) {
    const cx = w / 2 + Math.sin(time) * (w * 0.2);
    const cy = h * 0.3;

    // Horizontal streak
    const streakW = (w * 0.6) * (0.6 + metrics.volume * 0.8);
    const grad = ctx.createLinearGradient(cx - streakW / 2, cy, cx + streakW / 2, cy);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.7)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(cx - streakW / 2, cy - 2, streakW, 4);

    // Glowing core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 6 * (1 + metrics.bass * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  // 29. Wave Particles
  private renderWaveParticles(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, time: number) {
    ctx.fillStyle = '#818cf8';
    for (let i = 0; i < this.particles.length; i++) {
      const px = (i / this.particles.length) * w;
      const py = h / 2 + Math.sin((i * 0.1) + time * 3 * speed) * (h * 0.25);

      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(px, py, 3 * (size / 5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 30. Audio Reactive Particles
  private renderAudioReactiveParticles(ctx: CanvasRenderingContext2D, w: number, h: number, speed: number, size: number, metrics: AudioMetrics) {
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      const audioBoost = 1 + metrics.bass * 3;
      pt.x += pt.vx * speed * audioBoost;
      pt.y += pt.vy * speed * audioBoost;
      if (pt.x < 0) pt.x = w;
      if (pt.x > w) pt.x = 0;
      if (pt.y < 0) pt.y = h;
      if (pt.y > h) pt.y = 0;

      const pSize = (2 + pt.size * 0.5) * (size / 5) * (1 + metrics.volume * 2);
      ctx.fillStyle = metrics.peak ? '#ff0055' : '#00e5ff';
      ctx.globalAlpha = pt.alpha * (0.4 + metrics.volume * 0.6);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
