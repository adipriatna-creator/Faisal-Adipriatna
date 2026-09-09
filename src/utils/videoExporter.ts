export interface ExportProgressCallback {
  (progress: number, statusText: string): void;
}

export interface RenderCompositeFn {
  (targetCtx: CanvasRenderingContext2D, targetWidth: number, targetHeight: number, currentTime: number): void;
}

export interface VideoExportOptions {
  videoElement: HTMLVideoElement | null;
  audioElement: HTMLAudioElement;
  audioStreamTrack: MediaStreamTrack | null;
  duration: number; // total duration to render in seconds
  width: number;
  height: number;
  format: 'webm' | 'mp4';
  fps?: number;
  renderFrame: RenderCompositeFn;
  onProgress: ExportProgressCallback;
}

export class VideoExporter {
  private isCancelled = false;
  private recorder: MediaRecorder | null = null;
  private animFrameId: number | null = null;

  public cancel(): void {
    this.isCancelled = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch {
        // Ignore stop error on cancel
      }
    }
  }

  public async exportVideo(options: VideoExportOptions): Promise<{ blob: Blob; url: string; format: string }> {
    this.isCancelled = false;
    const {
      videoElement,
      audioElement,
      audioStreamTrack,
      duration,
      width,
      height,
      format,
      fps = 30,
      renderFrame,
      onProgress,
    } = options;

    if (duration <= 0) {
      throw new Error('Durasi video tidak valid');
    }

    onProgress(1, 'Menyiapkan canvas & enkoder video...');

    // 1. Setup Offscreen Canvas with optimized 2D context
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) throw new Error('Gagal menginisialisasi canvas rendering');

    // 2. Select optimal mimeType and file extension
    let mimeType = 'video/webm';
    let fileExtension = 'webm';

    if (format === 'mp4') {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
        mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
        fileExtension = 'mp4';
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        fileExtension = 'mp4';
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
        fileExtension = 'webm';
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
        fileExtension = 'webm';
      }
    } else {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
        fileExtension = 'webm';
      } else if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
        fileExtension = 'webm';
      }
    }

    // 3. Setup Canvas Stream & Combined Media Tracks
    const canvasStream = canvas.captureStream(fps);
    const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

    if (audioStreamTrack) {
      combinedTracks.push(audioStreamTrack);
    }

    const outputStream = new MediaStream(combinedTracks);

    // Balanced bitrate to avoid hardware encoder stutter while maintaining high visual clarity
    const pixelCount = width * height;
    let targetBitrate = 5000000; // 5 Mbps default (smooth for 720p / 1080p)
    if (pixelCount >= 1920 * 1080) {
      targetBitrate = 6500000; // 6.5 Mbps for full HD
    } else if (pixelCount <= 854 * 480) {
      targetBitrate = 2500000; // 2.5 Mbps for 480p
    }

    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(outputStream, {
        mimeType,
        videoBitsPerSecond: targetBitrate,
      });
    } catch {
      // Fallback without bitrate or mimeType constraints if browser is strict
      recorder = new MediaRecorder(outputStream);
    }
    this.recorder = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }

        if (this.isCancelled) {
          reject(new Error('Proses render dibatalkan'));
          return;
        }

        onProgress(99, 'Mengemas file video final...');
        const finalBlob = new Blob(chunks, { type: mimeType });
        const downloadUrl = URL.createObjectURL(finalBlob);
        onProgress(100, 'RENDER SELESAI');

        resolve({
          blob: finalBlob,
          url: downloadUrl,
          format: fileExtension,
        });
      };

      recorder.onerror = (err) => {
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        reject(err);
      };

      // 4. Synchronize Playback and Smooth Render Loop
      const startPlaybackAndRecord = async () => {
        try {
          // Prepare background video element if available
          if (videoElement) {
            videoElement.currentTime = 0;
            videoElement.muted = true;
            try {
              await videoElement.play();
            } catch {
              // Ignore background autoplay restriction if any
            }
          }

          // Prepare main audio playback
          audioElement.currentTime = 0;
          try {
            await audioElement.play();
          } catch (e) {
            console.warn('Audio play notice during export:', e);
          }

          // Start recorder with 500ms chunk intervals for stable memory usage
          recorder.start(500);

          const startTime = performance.now();
          const frameInterval = 1000 / fps;
          let lastFrameTime = performance.now();
          let lastProgressUpdate = 0;

          const loop = (now: number) => {
            if (this.isCancelled) return;

            const elapsedSec = (now - startTime) / 1000;
            const currentAudioTime = audioElement.currentTime || elapsedSec;

            // Frame rate cadence regulation to guarantee smooth playback without stutter
            const timeSinceLastFrame = now - lastFrameTime;
            if (timeSinceLastFrame >= frameInterval - 3) {
              lastFrameTime = now - (timeSinceLastFrame % frameInterval);

              // Render composite frame smoothly
              renderFrame(ctx, width, height, currentAudioTime);
            }

            // Throttle progress updates to ~4 times per second to prevent UI thread lock
            if (now - lastProgressUpdate > 250) {
              lastProgressUpdate = now;
              const progress = Math.min(98, Math.max(1, Math.floor((currentAudioTime / duration) * 98)));
              onProgress(
                progress,
                `Merekam video lancar: ${currentAudioTime.toFixed(1)}s / ${duration.toFixed(1)}s (${progress}%)`
              );
            }

            // Check if export duration has been reached
            if (currentAudioTime >= duration || elapsedSec >= duration + 0.3) {
              audioElement.pause();
              if (videoElement) {
                videoElement.pause();
              }
              recorder.stop();
            } else {
              this.animFrameId = requestAnimationFrame(loop);
            }
          };

          this.animFrameId = requestAnimationFrame(loop);
        } catch (error) {
          if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
          reject(error);
        }
      };

      startPlaybackAndRecord();
    });
  }
}

export const globalVideoExporter = new VideoExporter();
