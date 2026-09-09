import { AudioMetrics } from '../types';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private frequencyArray: Uint8Array | null = null;
  private timeDomainArray: Uint8Array | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  private smoothedBass = 0;
  private smoothedMid = 0;
  private smoothedTreble = 0;
  private smoothedVolume = 0;
  private prevVolume = 0;
  private isInitialized = false;

  constructor() {
    // Audio element instantiated and ready
    if (typeof window !== 'undefined') {
      const el = new Audio();
      el.crossOrigin = 'anonymous';
      el.preload = 'auto';
      this.audioElement = el;
    }
  }

  public getAudioElement(): HTMLAudioElement {
    if (!this.audioElement && typeof window !== 'undefined') {
      const el = new Audio();
      el.crossOrigin = 'anonymous';
      el.preload = 'auto';
      this.audioElement = el;
    }
    return this.audioElement!;
  }

  public async loadAudioUrl(url: string): Promise<void> {
    const el = this.getAudioElement();
    el.src = url;
    el.load();
    this.ensureContext();
  }

  public ensureContext(): void {
    if (this.isInitialized) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioContextClass();
      }

      const el = this.getAudioElement();
      if (!this.sourceNode) {
        this.sourceNode = this.audioContext.createMediaElementSource(el);
      }

      if (!this.analyserNode) {
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 512;
        this.analyserNode.smoothingTimeConstant = 0.8;
      }

      if (!this.destinationNode) {
        this.destinationNode = this.audioContext.createMediaStreamDestination();
      }

      this.sourceNode.disconnect();
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
      this.analyserNode.connect(this.destinationNode);

      const bufferLength = this.analyserNode.frequencyBinCount;
      this.frequencyArray = new Uint8Array(bufferLength);
      this.timeDomainArray = new Uint8Array(bufferLength);

      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioEngine ensureContext error:', err);
    }
  }

  public async play(): Promise<void> {
    this.ensureContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    const el = this.getAudioElement();
    if (el.src) {
      await el.play();
    }
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  public seek(time: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  public setVolume(vol: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, vol));
    }
  }

  public getCurrentTime(): number {
    return this.audioElement ? this.audioElement.currentTime : 0;
  }

  public getMediaStreamTrack(): MediaStreamTrack | null {
    if (this.destinationNode && this.destinationNode.stream.getAudioTracks().length > 0) {
      return this.destinationNode.stream.getAudioTracks()[0];
    }
    return null;
  }

  public async extractWaveform(url: string, samples = 64): Promise<number[]> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await extractWaveformFromBlob(blob, samples);
    } catch {
      return Array.from({ length: samples }, () => 0.2 + Math.random() * 0.6);
    }
  }

  public async generateSynthDemoAudio(duration = 20): Promise<Blob> {
    const demo = await createDemoAudioFile();
    return demo.file;
  }

  public init(audioEl: HTMLAudioElement): void {
    this.audioElement = audioEl;
    this.ensureContext();
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public getExportAudioStream(): MediaStreamTrack | null {
    return this.getMediaStreamTrack();
  }


  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public getMetrics(): AudioMetrics {
    if (!this.analyserNode || !this.frequencyArray || !this.timeDomainArray) {
      return {
        bass: 0,
        lowMid: 0,
        mid: 0,
        highMid: 0,
        treble: 0,
        volume: 0,
        peak: false,
        frequencyData: new Uint8Array(128),
        timeDomainData: new Uint8Array(128),
      };
    }

    this.analyserNode.getByteFrequencyData(this.frequencyArray);
    this.analyserNode.getByteTimeDomainData(this.timeDomainArray);

    const len = this.frequencyArray.length; // 256 bins

    // Calculate band energies
    // Bass: ~20Hz to ~250Hz (bins 1 to 8)
    let bassSum = 0;
    const bassEnd = Math.min(8, len);
    for (let i = 1; i < bassEnd; i++) {
      bassSum += this.frequencyArray[i];
    }
    const rawBass = bassSum / ((bassEnd - 1) * 255 || 1);

    // Low Mid: ~250Hz to ~500Hz (bins 8 to 18)
    let lowMidSum = 0;
    const lowMidEnd = Math.min(18, len);
    for (let i = bassEnd; i < lowMidEnd; i++) {
      lowMidSum += this.frequencyArray[i];
    }
    const rawLowMid = lowMidSum / ((lowMidEnd - bassEnd) * 255 || 1);

    // Mid: ~500Hz to ~2000Hz (bins 18 to 60)
    let midSum = 0;
    const midEnd = Math.min(60, len);
    for (let i = lowMidEnd; i < midEnd; i++) {
      midSum += this.frequencyArray[i];
    }
    const rawMid = midSum / ((midEnd - lowMidEnd) * 255 || 1);

    // High Mid: ~2000Hz to ~4000Hz (bins 60 to 120)
    let highMidSum = 0;
    const highMidEnd = Math.min(120, len);
    for (let i = midEnd; i < highMidEnd; i++) {
      highMidSum += this.frequencyArray[i];
    }
    const rawHighMid = highMidSum / ((highMidEnd - midEnd) * 255 || 1);

    // Treble: ~4000Hz to ~16000Hz (bins 120 to 240)
    let trebleSum = 0;
    const trebleEnd = Math.min(240, len);
    for (let i = highMidEnd; i < trebleEnd; i++) {
      trebleSum += this.frequencyArray[i];
    }
    const rawTreble = trebleSum / ((trebleEnd - highMidEnd) * 255 || 1);

    // Overall volume RMS
    let totalSum = 0;
    for (let i = 0; i < len; i++) {
      totalSum += this.frequencyArray[i];
    }
    const rawVolume = totalSum / (len * 255);

    // Peak detection
    const peak = rawBass > 0.65 && rawBass - this.prevVolume > 0.18;
    this.prevVolume = rawBass;

    // Exponential smoothing
    this.smoothedBass = this.smoothedBass * 0.7 + rawBass * 0.3;
    this.smoothedMid = this.smoothedMid * 0.75 + rawMid * 0.25;
    this.smoothedTreble = this.smoothedTreble * 0.8 + rawTreble * 0.2;
    this.smoothedVolume = this.smoothedVolume * 0.7 + rawVolume * 0.3;

    return {
      bass: this.smoothedBass,
      lowMid: rawLowMid,
      mid: this.smoothedMid,
      highMid: rawHighMid,
      treble: this.smoothedTreble,
      volume: this.smoothedVolume,
      peak,
      frequencyData: this.frequencyArray,
      timeDomainData: this.timeDomainArray,
    };
  }
}

export const globalAudioEngine = new AudioEngine();

/**
 * Generates an audio waveform array for visualization preview
 */
export async function extractWaveformFromBlob(blob: Blob, samples = 100): Promise<number[]> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData: number[] = [];

    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j] || 0);
      }
      filteredData.push(sum / blockSize);
    }

    // Normalize to 0 - 1
    const maxVal = Math.max(...filteredData, 0.01);
    return filteredData.map((n) => Math.min(1, n / maxVal));
  } catch (e) {
    console.warn('Waveform extraction fallback:', e);
    // fallback dummy peaks
    return Array.from({ length: samples }, () => 0.2 + Math.random() * 0.6);
  }
}

/**
 * Synthesizes a high quality 25-second demo R&B / Synthwave music track
 * so users can test immediately with zero uploads.
 */
export async function createDemoAudioFile(): Promise<{ file: File; url: string; duration: number }> {
  const sampleRate = 44100;
  const duration = 24; // 24 seconds loop
  const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  const bpm = 95;
  const beatDuration = 60 / bpm; // ~0.63s per beat

  // Master compressor & limiter
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -12;
  compressor.knee.value = 10;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  compressor.connect(offlineCtx.destination);

  // Chords progression (Dm9 - Bbmaj7 - Gm9 - A7alt)
  const chordNotes = [
    [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
    [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7
    [98.0, 146.83, 196.0, 246.94, 293.66],   // Gm9
    [110.0, 164.81, 220.0, 277.18, 329.63],  // A7
  ];

  const totalBars = Math.floor(duration / (beatDuration * 4));

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * beatDuration * 4;
    const currentChord = chordNotes[bar % chordNotes.length];

    // Chords Synth (warm Rhodes / Electric Piano style)
    currentChord.forEach((freq, idx) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, barStart);

      gain.gain.setValueAtTime(0.001, barStart);
      gain.gain.linearRampToValueAtTime(0.06, barStart + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, barStart + beatDuration * 3.8);

      osc.connect(gain);
      gain.connect(compressor);

      osc.start(barStart);
      osc.stop(barStart + beatDuration * 3.9);
    });

    // Sub Bass (808 style punch + glide)
    const bassOsc = offlineCtx.createOscillator();
    const bassGain = offlineCtx.createGain();
    const bassFreq = currentChord[0] / 2; // sub octave
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq * 1.5, barStart);
    bassOsc.frequency.exponentialRampToValueAtTime(bassFreq, barStart + 0.08);

    bassGain.gain.setValueAtTime(0.35, barStart);
    bassGain.gain.exponentialRampToValueAtTime(0.001, barStart + beatDuration * 2);

    bassOsc.connect(bassGain);
    bassGain.connect(compressor);
    bassOsc.start(barStart);
    bassOsc.stop(barStart + beatDuration * 2.5);

    // Second bass hit at beat 2.5
    const bassOsc2 = offlineCtx.createOscillator();
    const bassGain2 = offlineCtx.createGain();
    bassOsc2.type = 'sine';
    bassOsc2.frequency.setValueAtTime(bassFreq, barStart + beatDuration * 2.5);
    bassGain2.gain.setValueAtTime(0.3, barStart + beatDuration * 2.5);
    bassGain2.gain.exponentialRampToValueAtTime(0.001, barStart + beatDuration * 3.8);
    bassOsc2.connect(bassGain2);
    bassGain2.connect(compressor);
    bassOsc2.start(barStart + beatDuration * 2.5);
    bassOsc2.stop(barStart + beatDuration * 3.9);

    // Drum Beats: 4 beats per bar
    for (let beat = 0; beat < 4; beat++) {
      const beatTime = barStart + beat * beatDuration;

      // Kick on beat 0 and beat 2.5
      if (beat === 0 || beat === 2) {
        const kickOsc = offlineCtx.createOscillator();
        const kickGain = offlineCtx.createGain();
        kickOsc.frequency.setValueAtTime(150, beatTime);
        kickOsc.frequency.exponentialRampToValueAtTime(38, beatTime + 0.12);

        kickGain.gain.setValueAtTime(0.6, beatTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.35);

        kickOsc.connect(kickGain);
        kickGain.connect(compressor);
        kickOsc.start(beatTime);
        kickOsc.stop(beatTime + 0.38);
      }

      // Snare on beat 1 and 3
      if (beat === 1 || beat === 3) {
        // Noise buffer for snappy snare
        const noiseBuffer = offlineCtx.createBuffer(1, sampleRate * 0.2, sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = offlineCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = offlineCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const snareGain = offlineCtx.createGain();
        snareGain.gain.setValueAtTime(0.4, beatTime);
        snareGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.18);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(snareGain);
        snareGain.connect(compressor);
        whiteNoise.start(beatTime);
        whiteNoise.stop(beatTime + 0.2);
      }

      // Hi-Hats (16th notes: 4 hits per beat)
      for (let h = 0; h < 4; h++) {
        const hatTime = beatTime + (h * beatDuration) / 4;
        const hatBuffer = offlineCtx.createBuffer(1, sampleRate * 0.05, sampleRate);
        const hatData = hatBuffer.getChannelData(0);
        for (let i = 0; i < hatBuffer.length; i++) {
          hatData[i] = Math.random() * 2 - 1;
        }
        const hatSource = offlineCtx.createBufferSource();
        hatSource.buffer = hatBuffer;

        const hatFilter = offlineCtx.createBiquadFilter();
        hatFilter.type = 'bandpass';
        hatFilter.frequency.value = 8000;

        const hatGain = offlineCtx.createGain();
        const hatVol = h % 2 === 0 ? 0.12 : 0.06;
        hatGain.gain.setValueAtTime(hatVol, hatTime);
        hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.04);

        hatSource.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(compressor);
        hatSource.start(hatTime);
        hatSource.stop(hatTime + 0.05);
      }
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const file = new File([wavBlob], 'demo-synthwave-beat.wav', { type: 'audio/wav' });
  const url = URL.createObjectURL(file);

  return { file, url, duration };
}

/**
 * Converts AudioBuffer to standard PCM 16-bit stereo WAV Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length * numChannels;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + dataSize, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, byteRate, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, dataSize, true);

  // Write audio samples
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit PCM integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Creates a procedural animated demo video with a futuristic neon visual
 */
export async function createDemoVideoFile(): Promise<{ file: File; url: string; duration: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm',
    videoBitsPerSecond: 3000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const totalFrames = 30 * 10; // 10 seconds loopable
  let currentFrame = 0;

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'demo-cyber-scenery.webm', { type: 'video/webm' });
      const url = URL.createObjectURL(file);
      resolve({ file, url, duration: 10 });
    };

    recorder.start();

    const renderLoop = () => {
      if (currentFrame >= totalFrames) {
        recorder.stop();
        return;
      }

      const t = currentFrame / 30;

      // Draw cyber synthwave background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0a0314');
      grad.addColorStop(0.5, '#1e0836');
      grad.addColorStop(1, '#05020a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant neon sun
      const sunY = canvas.height * 0.45;
      const sunGrad = ctx.createRadialGradient(
        canvas.width / 2,
        sunY,
        10,
        canvas.width / 2,
        sunY,
        160,
      );
      sunGrad.addColorStop(0, '#ffdd55');
      sunGrad.addColorStop(0.6, '#ff0077');
      sunGrad.addColorStop(1, 'rgba(255, 0, 119, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, sunY, 160, 0, Math.PI * 2);
      ctx.fill();

      // Sun horizontal stripes
      ctx.fillStyle = '#0a0314';
      for (let s = 0; s < 7; s++) {
        const barY = sunY + s * 16 + 10;
        ctx.fillRect(canvas.width / 2 - 160, barY, 320, 2 + s * 1.5);
      }

      // Horizon glow
      ctx.fillStyle = '#ff00aa';
      ctx.fillRect(0, canvas.height * 0.6 - 2, canvas.width, 4);

      // Perspective Grid (Synthwave road)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 1.5;

      const horizonY = canvas.height * 0.6;
      const vLines = 24;
      for (let i = -vLines; i <= vLines; i++) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + i * 25, horizonY);
        ctx.lineTo(canvas.width / 2 + i * 180, canvas.height);
        ctx.stroke();
      }

      // Moving horizontal grid lines
      const offset = (t * 60) % 40;
      for (let y = horizonY; y < canvas.height; y += Math.pow((y - horizonY) / 18, 1.4) + 6) {
        const animatedY = y + offset * ((y - horizonY) / (canvas.height - horizonY));
        if (animatedY <= canvas.height && animatedY >= horizonY) {
          ctx.beginPath();
          ctx.moveTo(0, animatedY);
          ctx.lineTo(canvas.width, animatedY);
          ctx.stroke();
        }
      }

      currentFrame++;
      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  });
}
