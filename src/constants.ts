import {
  ColorPreset,
  EqualizerModelInfo,
  AnimationModelInfo,
  PresetConfig,
  AspectRatioType,
  ResolutionPreset,
} from './types';

export const EQUALIZER_MODELS: EqualizerModelInfo[] = [
  { id: 1, name: 'Classic Vertical Bars', category: 'Bars', description: 'Balok vertikal klasik dengan level frekuensi' },
  { id: 2, name: 'Neon Spectrum Bars', category: 'Bars', description: 'Glow neon vertikal dengan bayangan cahaya' },
  { id: 3, name: 'Circular Spectrum', category: 'Circular', description: 'Lingkaran frekuensi radial mekar keluar' },
  { id: 4, name: 'Radial Pulse', category: 'Circular', description: 'Cincin konsentris berdenyut dinamis' },
  { id: 5, name: 'Wave Spectrum', category: 'Waves', description: 'Gelombang sinusoidal halus berkelanjutan' },
  { id: 6, name: 'Mirror Bars', category: 'Bars', description: 'Spektrum simetris atas dan bawah' },
  { id: 7, name: 'Center Pulse', category: 'Circular', description: 'Denyut rombus berpusat dari tengah' },
  { id: 8, name: 'Dual Side Spectrum', category: 'Bars', description: 'Spektrum frekuensi dari dua sisi kiri-kanan' },
  { id: 9, name: 'Tunnel Spectrum', category: '3D & Space', description: 'Lorong perspektif 3D kedalaman audio' },
  { id: 10, name: 'Arc Spectrum', category: 'Circular', description: 'Busur dial spidometer setengah lingkaran' },
  { id: 11, name: 'Circular Ring', category: 'Circular', description: 'Lingkaran partikel terhubung bergelombang' },
  { id: 12, name: 'Half Circle Spectrum', category: 'Circular', description: 'Kubah setengah lingkaran menghadap ke atas' },
  { id: 13, name: 'Full Ring Equalizer', category: 'Circular', description: 'Cincin ganda tersegmentasi berputar' },
  { id: 14, name: 'Spiral Spectrum', category: '3D & Space', description: 'Pusaran spiral logaritmik bercahaya' },
  { id: 15, name: 'Galaxy Spectrum', category: '3D & Space', description: 'Galaksi spiral ganda berputar mengikuti bass' },
  { id: 16, name: 'Particle Spectrum', category: 'Energy', description: 'Gumpalan partikel magnetik melayang' },
  { id: 17, name: 'Liquid Wave', category: 'Waves', description: 'Permukaan cairan organik bergelombang' },
  { id: 18, name: 'Fire Spectrum', category: 'Energy', description: 'Lidah api menyala dinamis mengikuti audio' },
  { id: 19, name: 'Mountain Spectrum', category: 'Waves', description: 'Siluet pegunungan multilayer bersusun' },
  { id: 20, name: 'Skyline Spectrum', category: 'Bars', description: 'Gedung pencakar langit futuristik naik-turun' },
  { id: 21, name: 'Dot Matrix Spectrum', category: 'Bars', description: 'Kisi-kisi titik LED digital retro' },
  { id: 22, name: 'LED Grid', category: 'Bars', description: 'Grid blok VU meter warna bertingkat' },
  { id: 23, name: 'Vertical Wave', category: 'Waves', description: 'Pita osiloskop vertikal mengalir' },
  { id: 24, name: 'Horizontal Spectrum', category: 'Bars', description: 'Pita frekuensi horizontal mengalir' },
  { id: 25, name: 'Symmetrical Wave', category: 'Waves', description: 'Bentuk sayap kupu-kupu simetris' },
  { id: 26, name: 'Heart Pulse', category: 'Shapes', description: 'Detak denyut jantung EKG audio-reaktif' },
  { id: 27, name: 'Star Burst', category: 'Shapes', description: 'Bintang geometris dengan ujung memanjang' },
  { id: 28, name: 'Sun Ray Spectrum', category: 'Shapes', description: 'Piringan matahari dengan lidah sinar terik' },
  { id: 29, name: 'Orbital Spectrum', category: 'Circular', description: 'Lintasan orbit planet dengan nodus melayang' },
  { id: 30, name: 'DNA Wave', category: 'Shapes', description: 'Untaian heliks ganda DNA terhubung tangga nada' },
  { id: 31, name: 'Infinity Spectrum', category: 'Shapes', description: 'Simbol infinity (angka 8) berosilasi' },
  { id: 32, name: 'Diamond Spectrum', category: 'Shapes', description: 'Poligon berlian berkedip membiaskan cahaya' },
  { id: 33, name: 'Triangle Spectrum', category: 'Shapes', description: 'Segitiga berlapis berputar membesar' },
  { id: 34, name: 'Hexagon Spectrum', category: 'Shapes', description: 'Sarang lebah heksagonal menyala per band' },
  { id: 35, name: 'Polygon Pulse', category: 'Shapes', description: 'Poligon dinamis berganti sudut bergetar' },
  { id: 36, name: 'Vortex Spectrum', category: '3D & Space', description: 'Pusaran corong vortex menelan frekuensi' },
  { id: 37, name: 'Shockwave Ring', category: 'Energy', description: 'Gelombang kejut seismik meletup saat beat' },
  { id: 38, name: 'Frequency Tunnel', category: '3D & Space', description: 'Koridor neon kotak 3D tak hingga' },
  { id: 39, name: 'Neon Horizon', category: '3D & Space', description: 'Kisi grid synthwave 80s perspektif horizon' },
  { id: 40, name: 'Audio Flame', category: 'Energy', description: 'Obor api plasma biru-oranye menari lincah' },
  { id: 41, name: 'Electric Wave', category: 'Energy', description: 'Sambaran kilat tesla bergerigi antar kutub' },
  { id: 42, name: 'Plasma Spectrum', category: 'Energy', description: 'Gumpalan metaball plasma saling menyatu' },
  { id: 43, name: 'Sound Cloud', category: 'Energy', description: 'Awan volumetrik bergetar mengikuti sub-bass' },
  { id: 44, name: 'Particle Burst', category: 'Energy', description: 'Ledakan kembang api partikel saat puncak suara' },
  { id: 45, name: 'Radar Spectrum', category: 'Circular', description: 'Pemindai sonar militer mendeteksi gelombang' },
  { id: 46, name: 'Equalizer Wall', category: 'Bars', description: 'Dinding menara balok isometrik 3D' },
  { id: 47, name: 'Frequency Bars 3D', category: '3D & Space', description: 'Batang 3D perspektif miring dengan sorotan' },
  { id: 48, name: 'Circular Bars 3D', category: '3D & Space', description: 'Silinder silang 3D dengan pilar-pilar melingkar' },
  { id: 49, name: 'Waveform Glow', category: 'Waves', description: 'Laser osiloskop super tajam dengan jejak fosfor' },
  { id: 50, name: 'Ultimate Hybrid Spectrum', category: 'Energy', description: 'Kombinasi cincin inti, orbit partikel, & spektrum cermin' },
];

export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'neon-red', name: 'Neon Red', primary: '#ff0055', secondary: '#ff5588', gradient: ['#ff0055', '#ff4070', '#ff80a0'] },
  { id: 'crimson', name: 'Crimson', primary: '#dc143c', secondary: '#ff4d6d', gradient: ['#990024', '#dc143c', '#ff6b81'] },
  { id: 'ruby', name: 'Ruby', primary: '#e0115f', secondary: '#f85f8c', gradient: ['#b30043', '#e0115f', '#ff82a3'] },
  { id: 'hot-pink', name: 'Hot Pink', primary: '#ff1493', secondary: '#ff69b4', gradient: ['#c71585', '#ff1493', '#ff94c2'] },
  { id: 'magenta', name: 'Magenta', primary: '#ff00ff', secondary: '#d946ef', gradient: ['#c026d3', '#ff00ff', '#f472b6'] },
  { id: 'purple', name: 'Purple', primary: '#a855f7', secondary: '#c084fc', gradient: ['#7e22ce', '#a855f7', '#d8b4fe'] },
  { id: 'violet', name: 'Violet', primary: '#8b5cf6', secondary: '#a78bfa', gradient: ['#6d28d9', '#8b5cf6', '#c4b5fd'] },
  { id: 'deep-purple', name: 'Deep Purple', primary: '#6d28d9', secondary: '#8b5cf6', gradient: ['#4c1d95', '#6d28d9', '#a78bfa'] },
  { id: 'electric-blue', name: 'Electric Blue', primary: '#00e5ff', secondary: '#38bdf8', gradient: ['#0091ea', '#00e5ff', '#80d8ff'] },
  { id: 'cyan', name: 'Cyan', primary: '#06b6d4', secondary: '#22d3ee', gradient: ['#0891b2', '#06b6d4', '#67e8f9'] },
  { id: 'aqua', name: 'Aqua', primary: '#00ffff', secondary: '#5eead4', gradient: ['#0d9488', '#00ffff', '#99f6e4'] },
  { id: 'sky-blue', name: 'Sky Blue', primary: '#38bdf8', secondary: '#7dd3fc', gradient: ['#0284c7', '#38bdf8', '#bae6fd'] },
  { id: 'royal-blue', name: 'Royal Blue', primary: '#2563eb', secondary: '#60a5fa', gradient: ['#1d4ed8', '#2563eb', '#93c5fd'] },
  { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#34d399', gradient: ['#047857', '#10b981', '#6ee7b7'] },
  { id: 'neon-green', name: 'Neon Green', primary: '#39ff14', secondary: '#86efac', gradient: ['#16a34a', '#39ff14', '#bbf7d0'] },
  { id: 'lime', name: 'Lime', primary: '#84cc16', secondary: '#a3e635', gradient: ['#65a30d', '#84cc16', '#bef264'] },
  { id: 'yellow', name: 'Yellow', primary: '#eab308', secondary: '#fde047', gradient: ['#ca8a04', '#eab308', '#fef08a'] },
  { id: 'gold', name: 'Gold', primary: '#ffd700', secondary: '#fbbf24', gradient: ['#b45309', '#ffd700', '#fef3c7'] },
  { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#fb923c', gradient: ['#c2410c', '#f97316', '#fed7aa'] },
  { id: 'coral', name: 'Coral', primary: '#ff7f50', secondary: '#fb7185', gradient: ['#e11d48', '#ff7f50', '#fecdd3'] },
  { id: 'rose', name: 'Rose', primary: '#f43f5e', secondary: '#fb7185', gradient: ['#be123c', '#f43f5e', '#fda4af'] },
  { id: 'lavender', name: 'Lavender', primary: '#c084fc', secondary: '#e879f9', gradient: ['#9333ea', '#c084fc', '#f5d0fe'] },
  { id: 'ice-blue', name: 'Ice Blue', primary: '#93c5fd', secondary: '#e0f2fe', gradient: ['#3b82f6', '#93c5fd', '#f0f9ff'] },
  { id: 'white', name: 'White', primary: '#ffffff', secondary: '#e2e8f0', gradient: ['#94a3b8', '#ffffff', '#f8fafc'] },
  { id: 'silver', name: 'Silver', primary: '#cbd5e1', secondary: '#94a3b8', gradient: ['#64748b', '#cbd5e1', '#f1f5f9'] },
  { id: 'rainbow', name: 'Rainbow', primary: '#ff0055', secondary: '#00e5ff', gradient: ['#ff0055', '#ff9900', '#ffee00', '#00ff66', '#00e5ff', '#9900ff'] },
  { id: 'sunset', name: 'Sunset', primary: '#ff5e62', secondary: '#ff9966', gradient: ['#ff5e62', '#ff7b54', '#ff9966', '#ffb26b'] },
  { id: 'ocean', name: 'Ocean', primary: '#00b4db', secondary: '#0083b0', gradient: ['#0083b0', '#0099cc', '#00b4db', '#66e0ff'] },
  { id: 'rb-purple', name: 'R&B Purple', primary: '#9333ea', secondary: '#ec4899', gradient: ['#7c3aed', '#9333ea', '#db2777', '#ec4899'] },
  { id: 'rb-neon', name: 'R&B Neon', primary: '#3b82f6', secondary: '#10b981', gradient: ['#2563eb', '#3b82f6', '#06b6d4', '#10b981'] },
];

export const ANIMATION_MODELS: AnimationModelInfo[] = [
  { id: 1, name: 'Snow Dust', category: 'Atmosphere', description: 'Serbuk salju halus melayang di udara' },
  { id: 2, name: 'Floating Dust', category: 'Atmosphere', description: 'Debu mikro sinematik melayang lambat' },
  { id: 3, name: 'Falling Snow', category: 'Weather', description: 'Salju lembut berjatuhan dengan efek angin' },
  { id: 4, name: 'Rising Particles', category: 'Particles', description: 'Partikel bercahaya naik perlahan ke atas' },
  { id: 5, name: 'Spark', category: 'Sparks & Fire', description: 'Percikan kilau emas bertebaran dinamis' },
  { id: 6, name: 'Starfield', category: 'Space & Cosmic', description: 'Bintang warp speed melaju menuju layar' },
  { id: 7, name: 'Galaxy', category: 'Space & Cosmic', description: 'Pusaran partikel kosmis nebula berputar' },
  { id: 8, name: 'Fireflies', category: 'Atmosphere', description: 'Kunang-kunang kuning hangat berkelap-kelip' },
  { id: 9, name: 'Smoke', category: 'Atmosphere', description: 'Gumpalan asap halus mengambang organik' },
  { id: 10, name: 'Fog', category: 'Weather', description: 'Kabut tipis melayang di bagian bawah canvas' },
  { id: 11, name: 'Bokeh', category: 'Lights', description: 'Lingkaran cahaya bokeh lembut memudar' },
  { id: 12, name: 'Rain', category: 'Weather', description: 'Tetesan air hujan deras dengan garis miring' },
  { id: 13, name: 'Light Rain', category: 'Weather', description: 'Gerimis halus berirama tenang' },
  { id: 14, name: 'Neon Particles', category: 'Particles', description: 'Partikel warna-warni neon berpijar terang' },
  { id: 15, name: 'Glitter', category: 'Sparks & Fire', description: 'Kilauan bintang berkedip-kedip cepat' },
  { id: 16, name: 'Explosion', category: 'Energy' as any, description: 'Semburan partikel radial berulang secara ritmis' },
  { id: 17, name: 'Energy Burst', category: 'Sparks & Fire', description: 'Ledakan plasma energi melingkar ke luar' },
  { id: 18, name: 'Lightning', category: 'Sparks & Fire', description: 'Kilatan petir menyambar sesekali mengikuti beat' },
  { id: 19, name: 'Electric Sparks', category: 'Sparks & Fire', description: 'Loncatan percikan listrik tak beraturan' },
  { id: 20, name: 'Floating Orbs', category: 'Lights', description: 'Bola cahaya transparan terapung di udara' },
  { id: 21, name: 'Bubble', category: 'Atmosphere', description: 'Gelembung transparan naik dan meletus' },
  { id: 22, name: 'Cosmic Dust', category: 'Space & Cosmic', description: 'Debu stardust antariksa berkilauan' },
  { id: 23, name: 'Meteor', category: 'Space & Cosmic', description: 'Komet meteor meluncur cepat di langit' },
  { id: 24, name: 'Fire Particles', category: 'Sparks & Fire', description: 'Bara api membara naik terbawa angin' },
  { id: 25, name: 'Ash', category: 'Atmosphere', description: 'Abu vulkanik halus berjatuhan melayang' },
  { id: 26, name: 'Sand Dust', category: 'Weather', description: 'Badai debu pasir horizontal berkecepatan' },
  { id: 27, name: 'Light Rays', category: 'Lights', description: 'Sinar cahaya god-rays menembus sudut' },
  { id: 28, name: 'Lens Flare', category: 'Lights', description: 'Suar lensa anamorfik horizontal sinematik' },
  { id: 29, name: 'Wave Particles', category: 'Particles', description: 'Partikel bergerak membentuk alur gelombang' },
  { id: 30, name: 'Audio Reactive Particles', category: 'Particles', description: 'Partikel yang ukuran & kecepatannya meledak saat beat' },
];

export const ASPECT_RATIOS: { id: AspectRatioType; label: string; ratio: number; desc: string }[] = [
  { id: '16:9', label: '16:9 Landscape', ratio: 16 / 9, desc: 'YouTube, TV, Landscape' },
  { id: '9:16', label: '9:16 Portrait', ratio: 9 / 16, desc: 'TikTok, Reels, Shorts' },
  { id: '1:1', label: '1:1 Square', ratio: 1, desc: 'Instagram Feed' },
  { id: '4:5', label: '4:5 Portrait', ratio: 4 / 5, desc: 'Instagram Post' },
  { id: '5:4', label: '5:4 Landscape', ratio: 5 / 4, desc: 'Standard Photo' },
  { id: '4:3', label: '4:3 Classic', ratio: 4 / 3, desc: 'Classic TV, Retro' },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4, desc: 'Tablet Portrait' },
  { id: '2:3', label: '2:3 Vertical', ratio: 2 / 3, desc: 'Pinterest, Poster' },
  { id: '3:2', label: '3:2 Classic', ratio: 3 / 2, desc: 'DSLR 35mm' },
  { id: '21:9', label: '21:9 Ultrawide', ratio: 21 / 9, desc: 'Cinematic Cinema' },
  { id: 'original', label: 'Original Ratio', ratio: 16 / 9, desc: 'Sesuai video asli' },
];

export const RESOLUTIONS: { id: ResolutionPreset; label: string; width: number; height: number; estMbPerMin: number }[] = [
  { id: '360p', label: '360p (SD)', width: 640, height: 360, estMbPerMin: 6 },
  { id: '480p', label: '480p (DVD)', width: 854, height: 480, estMbPerMin: 12 },
  { id: '720p', label: '720p (HD)', width: 1280, height: 720, estMbPerMin: 25 },
  { id: '1080p', label: '1080p (Full HD)', width: 1920, height: 1080, estMbPerMin: 50 },
  { id: '1440p', label: '1440p (2K Quad HD)', width: 2560, height: 1440, estMbPerMin: 90 },
  { id: '2160p', label: '2160p (4K Ultra HD)', width: 3840, height: 2160, estMbPerMin: 180 },
];

export const PRESETS: PresetConfig[] = [
  {
    name: 'R&B',
    description: 'Nuansa sensual dengan spektrum ungu-merah muda dan gelombang halus',
    equalizerModel: 5, // Wave Spectrum
    colorPresetId: 'rb-purple',
    colorMode: 'gradient',
    animationModel: 11, // Bokeh
    animationEnabled: true,
    pulseIntensity: 50,
    pulseSmoothing: 'smooth',
  },
  {
    name: 'Neon',
    description: 'Energi cyberpunk dengan cyan-magenta dan kilau partikel neon',
    equalizerModel: 2, // Neon Spectrum Bars
    colorPresetId: 'electric-blue',
    colorMode: 'gradient',
    animationModel: 14, // Neon Particles
    animationEnabled: true,
    pulseIntensity: 75,
    pulseSmoothing: 'normal',
  },
  {
    name: 'Chill',
    description: 'Atmosfer santai dengan warna pastel dan debu melayang sinematik',
    equalizerModel: 17, // Liquid Wave
    colorPresetId: 'aqua',
    colorMode: 'single',
    animationModel: 2, // Floating Dust
    animationEnabled: true,
    pulseIntensity: 25,
    pulseSmoothing: 'smooth',
  },
  {
    name: 'Party',
    description: 'Dentuman bass maksimal dengan ledakan kembang api partikel audio-reaktif',
    equalizerModel: 44, // Particle Burst
    colorPresetId: 'rainbow',
    colorMode: 'rainbow',
    animationModel: 30, // Audio Reactive Particles
    animationEnabled: true,
    pulseIntensity: 100,
    pulseSmoothing: 'extreme',
  },
  {
    name: 'Night',
    description: 'Malam berbintang misterius dengan cincin bercahaya dan kunang-kunang',
    equalizerModel: 11, // Circular Ring
    colorPresetId: 'deep-purple',
    colorMode: 'gradient',
    animationModel: 8, // Fireflies
    animationEnabled: true,
    pulseIntensity: 25,
    pulseSmoothing: 'smooth',
  },
  {
    name: 'Purple Wave',
    description: 'Gelombang spektrum ultra-halus dengan gradien violet elektrik',
    equalizerModel: 25, // Symmetrical Wave
    colorPresetId: 'violet',
    colorMode: 'gradient',
    animationModel: 29, // Wave Particles
    animationEnabled: true,
    pulseIntensity: 50,
    pulseSmoothing: 'normal',
  },
  {
    name: 'Blue Energy',
    description: 'Pusaran tenaga biru murni dengan denyut shockwave frekuensi tinggi',
    equalizerModel: 4, // Radial Pulse
    colorPresetId: 'electric-blue',
    colorMode: 'reactive',
    animationModel: 17, // Energy Burst
    animationEnabled: true,
    pulseIntensity: 75,
    pulseSmoothing: 'normal',
  },
  {
    name: 'Fire',
    description: 'Kobaran api membara merah-emas dengan percikan bara panas',
    equalizerModel: 18, // Fire Spectrum
    colorPresetId: 'sunset',
    colorMode: 'gradient',
    animationModel: 24, // Fire Particles
    animationEnabled: true,
    pulseIntensity: 75,
    pulseSmoothing: 'strong',
  },
  {
    name: 'Galaxy',
    description: 'Rotasi galaksi spiral kosmis melayang melintasi medan bintang luar angkasa',
    equalizerModel: 15, // Galaxy Spectrum
    colorPresetId: 'lavender',
    colorMode: 'gradient',
    animationModel: 6, // Starfield
    animationEnabled: true,
    pulseIntensity: 50,
    pulseSmoothing: 'smooth',
  },
  {
    name: 'Minimal',
    description: 'Tampilan minimalis bersih monochrome hitam-putih presisi studio',
    equalizerModel: 1, // Classic Vertical Bars
    colorPresetId: 'white',
    colorMode: 'single',
    animationModel: 1, // Snow Dust
    animationEnabled: false,
    pulseIntensity: 10,
    pulseSmoothing: 'smooth',
  },
];

export const DEFAULT_PROJECT_SETTINGS: import('./types').ProjectSettings = {
  // Visual Background (Video atau Foto)
  backgroundType: 'video',
  videoFile: null,
  videoUrl: null,
  videoName: '',
  videoDuration: 0,
  videoWidth: 1280,
  videoHeight: 720,
  imageFile: null,
  imageUrl: null,
  imageName: '',
  imageWidth: 0,
  imageHeight: 0,
  aspectRatio: '16:9',
  fitMode: 'fit',
  resolution: '720p',

  // Audio
  audioFile: null,
  audioUrl: null,
  audioName: '',
  audioDuration: 0,
  volume: 0.85,
  isMuted: false,

  // Logo
  logoFile: null,
  logoUrl: null,
  logoName: '',
  logoTransform: {
    x: 5,
    y: 5,
    width: 14,
    height: 14,
    opacity: 0.9,
  },

  // Equalizer
  equalizerModel: 1,
  equalizerColorPreset: 'neon-cyan',
  equalizerColorMode: 'gradient',
  customColor1: '#00e5ff',
  customColor2: '#9d00ff',
  equalizerTransform: {
    x: 10,
    y: 65,
    width: 80,
    height: 25,
  },
  equalizerSensitivity: 1.0,
  equalizerBarCount: 64,

  // Animation (Overlay)
  animationEnabled: true,
  animationModel: 1,
  animationOpacity: 0.6,
  animationSpeed: 1.0,
  animationDensity: 80,
  animationSize: 3,
  animationDirection: 'random',

  // Denyut Video (Beat Pulse)
  pulseEnabled: true,
  pulseIntensity: 50,
  pulseSmoothing: 'normal',

  // Export
  exportFormat: 'mp4',
  exportDurationMode: 'custom',
  customExportDuration: 15,
};

