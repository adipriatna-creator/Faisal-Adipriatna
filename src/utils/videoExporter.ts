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

/**
 * Helper to get best supported mimeType and extension
 */
function getBestSupportedMimeType(format: 'mp4' | 'webm'): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: '', extension: format };
  }

  if (format === 'mp4') {
    const mp4Types = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ];
    for (const t of mp4Types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return { mimeType: t, extension: 'mp4' };
      }
    }
  }

  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const t of webmTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      return { mimeType: t, extension: 'webm' };
    }
  }

  return { mimeType: '', extension: format };
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

    onProgress(2, 'Menyiapkan canvas & media perekaman...');

    // 1. Offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Gagal menginisialisasi canvas rendering');

    // 2. Render initial frame immediately so stream has active pixels
    try {
      renderFrame(ctx, width, height, 0);
    } catch (e) {
      console.warn('First frame paint error:', e);
    }

    // 3. Determine best supported mime type
    const { mimeType, extension } = getBestSupportedMimeType(format);

    // 4. Capture canvas stream
    const canvasStream = canvas.captureStream(fps);
    const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

    if (audioStreamTrack && audioStreamTrack.readyState === 'live') {
      combinedTracks.push(audioStreamTrack);
    }

    const outputStream = new MediaStream(combinedTracks);

    // Dynamic bitrate calculation (balanced for performance and crystal clarity)
    const pixelCount = width * height;
    let targetBitrate = 5000000;
    if (pixelCount >= 1920 * 1080) {
      targetBitrate = 6500000;
    } else if (pixelCount <= 854 * 480) {
      targetBitrate = 2500000;
    }

    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      const optionsObj: MediaRecorderOptions = { videoBitsPerSecond: targetBitrate };
      if (mimeType) {
        optionsObj.mimeType = mimeType;
      }
      recorder = new MediaRecorder(outputStream, optionsObj);
    } catch {
      try {
        // Fallback without bitrate
        recorder = mimeType ? new MediaRecorder(outputStream, { mimeType }) : new MediaRecorder(outputStream);
      } catch {
        // Ultimate fallback with canvas stream only
        recorder = new MediaRecorder(canvasStream);
      }
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
        const finalBlob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const downloadUrl = URL.createObjectURL(finalBlob);
        onProgress(100, 'RENDER SELESAI');

        resolve({
          blob: finalBlob,
          url: downloadUrl,
          format: extension,
        });
      };

      recorder.onerror = (err) => {
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        reject(err);
      };

      // 5. Start Playback and Non-Blocking Render Loop
      const startPlaybackAndRecord = async () => {
        try {
          // Play background video if valid and loaded
          if (videoElement && videoElement.readyState >= 1) {
            videoElement.currentTime = 0;
            videoElement.muted = true;
            try {
              await videoElement.play();
            } catch {
              // Ignore background autoplay restriction
            }
          }

          // Reset audio playback to start
          if (audioElement && audioElement.src) {
            audioElement.currentTime = 0;
            try {
              await audioElement.play();
            } catch (e) {
              console.warn('Audio auto-play during export:', e);
            }
          }

          // Start recorder with 350ms chunk intervals
          recorder.start(350);

          const startTime = performance.now();
          const frameInterval = 1000 / fps;
          let lastFrameTime = performance.now();
          let lastProgressUpdate = 0;

          const loop = (now: number) => {
            if (this.isCancelled) return;

            // Absolute elapsed time from wall clock (never gets stuck)
            const elapsedSec = (now - startTime) / 1000;
            const currentAudioTime = Math.min(
              duration,
              Math.max(elapsedSec, audioElement ? audioElement.currentTime || 0 : 0)
            );

            // Frame cadence throttling to eliminate judder
            const timeSinceLastFrame = now - lastFrameTime;
            if (timeSinceLastFrame >= frameInterval - 3) {
              lastFrameTime = now - (timeSinceLastFrame % frameInterval);

              // Render composite frame safely
              try {
                renderFrame(ctx, width, height, currentAudioTime);
              } catch (err) {
                console.warn('Render frame catch:', err);
              }
            }

            // Progress guaranteed to advance smoothly
            const progress = Math.min(99, Math.max(2, Math.floor((currentAudioTime / duration) * 99)));
            if (now - lastProgressUpdate > 200) {
              lastProgressUpdate = now;
              onProgress(
                progress,
                `Mengekspor video: ${currentAudioTime.toFixed(1)}s / ${duration.toFixed(1)}s (${progress}%)`
              );
            }

            // Check if full duration reached
            if (elapsedSec >= duration || currentAudioTime >= duration) {
              try {
                if (audioElement) audioElement.pause();
                if (videoElement) videoElement.pause();
              } catch {
                // Ignore pause error
              }

              if (recorder.state !== 'inactive') {
                recorder.stop();
              }
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
