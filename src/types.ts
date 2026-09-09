export type AspectRatioType = 
  | 'original'
  | '16:9'
  | '9:16'
  | '1:1'
  | '4:5'
  | '5:4'
  | '4:3'
  | '3:4'
  | '2:3'
  | '3:2'
  | '21:9';

export type FitMode = 'fit' | 'fill' | 'crop';

export type ResolutionPreset = '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';

export type PulseSmoothing = 'smooth' | 'normal' | 'strong' | 'extreme';

export type ColorMode = 'single' | 'gradient' | 'multi' | 'rainbow' | 'reactive';

export type ParticleDirection = 'up' | 'down' | 'radial' | 'left' | 'right' | 'random';

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent?: string;
  gradient: string[];
}

export interface EqualizerModelInfo {
  id: number;
  name: string;
  category: 'Bars' | 'Circular' | 'Waves' | 'Shapes' | '3D & Space' | 'Energy';
  description: string;
}

export interface AnimationModelInfo {
  id: number;
  name: string;
  category: 'Atmosphere' | 'Weather' | 'Sparks & Fire' | 'Space & Cosmic' | 'Lights' | 'Particles';
  description: string;
}

export interface ElementTransform {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  width: number; // percentage of canvas width
  height: number; // percentage of canvas height
  rotation?: number; // degrees
  opacity?: number; // 0 to 1
}

export interface AudioMetrics {
  bass: number; // 0 - 1
  lowMid: number; // 0 - 1
  mid: number; // 0 - 1
  highMid: number; // 0 - 1
  treble: number; // 0 - 1
  volume: number; // 0 - 1
  peak: boolean;
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
}

export interface ProjectSettings {
  // Visual Background (Video atau Foto)
  backgroundType: 'video' | 'image';
  videoFile: File | null;
  videoUrl: string | null;
  videoName: string;
  videoDuration: number;
  videoWidth: number;
  videoHeight: number;
  imageFile: File | null;
  imageUrl: string | null;
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  aspectRatio: AspectRatioType;
  fitMode: FitMode;
  resolution: ResolutionPreset;

  // Audio
  audioFile: File | null;
  audioUrl: string | null;
  audioName: string;
  audioDuration: number;
  volume: number;
  isMuted: boolean;

  // Logo
  logoFile: File | null;
  logoUrl: string | null;
  logoName: string;
  logoTransform: ElementTransform;

  // Equalizer
  equalizerModel: number; // 1 - 50
  equalizerColorPreset: string;
  equalizerColorMode: ColorMode;
  customColor1: string;
  customColor2: string;
  equalizerTransform: ElementTransform;
  equalizerSensitivity: number; // 0.5 - 2.0
  equalizerBarCount: number; // 16 - 128

  // Animation (Overlay)
  animationEnabled: boolean;
  animationModel: number; // 1 - 30
  animationOpacity: number; // 0 - 1
  animationSpeed: number; // 0.2 - 3.0
  animationDensity: number; // 20 - 300
  animationSize: number; // 1 - 20
  animationDirection: ParticleDirection;

  // Denyut Video (Audio-Reactive Beat Pulse)
  pulseEnabled: boolean;
  pulseIntensity: 0 | 10 | 25 | 50 | 75 | 100;
  pulseSmoothing: PulseSmoothing;

  // Export
  exportFormat: 'webm' | 'mp4';
  exportDurationMode: 'full-audio' | 'video-length' | 'custom';
  customExportDuration: number;
}

export interface PresetConfig {
  name: string;
  description: string;
  equalizerModel: number;
  colorPresetId: string;
  colorMode: ColorMode;
  animationModel: number;
  animationEnabled: boolean;
  pulseIntensity: 0 | 10 | 25 | 50 | 75 | 100;
  pulseSmoothing: PulseSmoothing;
}
