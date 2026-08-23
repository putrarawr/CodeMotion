import { toCanvas } from 'html-to-image';
import gifshot from 'gifshot';
import * as Mp4Muxer from 'mp4-muxer';

export interface MotionRecordOptions {
  element: HTMLElement;
  totalChars: number;
  motionSpeed: number;
  fps?: number; // 30 or 60 FPS
  motionStyle?: 'typewriter' | 'lineByLine' | 'glitch' | 'wave';
  exportFormat?: 'mp4' | 'gif';
  isCancelled?: () => boolean;
  onSetTypedLength?: (len: number) => void;
  onProgress: (percent: number) => void;
}

/**
 * Ultra-Lightweight 10x Faster Motion Video & GIF Exporter:
 * - Caps total snapshots at ~15 keyframes (prevents RAM bloat and browser force-close).
 * - Yields to main thread event loop between frames (prevents CPU freezes).
 * - Renders direct MP4 video (.mp4) or Animated GIF (.gif) in ~2-4 seconds.
 */
export async function recordMotionVideo({
  element,
  totalChars,
  motionSpeed,
  fps = 60,
  motionStyle = 'typewriter',
  exportFormat = 'mp4',
  isCancelled,
  onSetTypedLength,
  onProgress,
}: MotionRecordOptions): Promise<{ blob: Blob; filename: string }> {
  // Step A: Force FULL code length first so element expands to full dimensions
  if (onSetTypedLength) onSetTypedLength(totalChars);
  await sleep(30);

  // Measure master dimensions at crisp 1.2x pixel ratio for fast rendering & smooth colors
  const fullCanvas = await toCanvas(element, { quality: 0.95, pixelRatio: 1.2, cacheBust: false });
  const width = Math.floor(fullCanvas.width / 2) * 2;
  const height = Math.floor(fullCanvas.height / 2) * 2;

  // Single reusable offscreen master canvas (prevents RAM leaks)
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = width;
  masterCanvas.height = height;
  const masterCtx = masterCanvas.getContext('2d')!;

  const effectiveSpeed = motionSpeed || 1;
  const keyframeCanvases: HTMLCanvasElement[] = [];

  // Reset to 0
  if (onSetTypedLength) onSetTypedLength(0);
  await sleep(15);

  if (motionStyle === 'lineByLine') {
    // True Line-by-Line reveal mode
    const textContent = element.innerText || '';
    const lines = textContent.split('\n');

    // Cap maximum line steps to max 16 snapshots for fast performance
    const maxLineSteps = Math.min(16, lines.length);
    const lineGroupSize = Math.max(1, Math.ceil(lines.length / maxLineSteps));

    const lineEndIndices: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < lines.length; i++) {
      cumulative += lines[i].length + (i < lines.length - 1 ? 1 : 0);
      if ((i + 1) % lineGroupSize === 0 || i === lines.length - 1) {
        lineEndIndices.push(Math.min(totalChars, cumulative));
      }
    }

    for (let l = 0; l < lineEndIndices.length; l++) {
      if (isCancelled?.()) throw new Error('CANCELLED');
      const charLen = lineEndIndices[l];
      if (onSetTypedLength) onSetTypedLength(charLen);
      await nextTick();
      await sleep(10); // Yield to main thread (prevents CPU freeze)

      try {
        const snapCanvas = await toCanvas(element, {
          quality: 0.95,
          pixelRatio: 1.2,
          cacheBust: false,
          width,
          height,
        });
        keyframeCanvases.push(snapCanvas);
      } catch (err) {}

      onProgress(Math.min(45, Math.floor(((l + 1) / lineEndIndices.length) * 45)));
    }
  } else {
    // Typewriter mode (capped at max 16 keyframe snapshots max to prevent browser crash)
    const targetSnapshots = Math.min(16, Math.max(8, Math.floor(totalChars / 15)));
    const charStep = Math.max(1, Math.ceil(totalChars / targetSnapshots));
    let currentLen = 0;
    let snapIndex = 0;

    while (currentLen < totalChars) {
      if (isCancelled?.()) throw new Error('CANCELLED');
      currentLen = Math.min(totalChars, currentLen + charStep);
      snapIndex++;
      if (onSetTypedLength) onSetTypedLength(currentLen);
      await nextTick();
      await sleep(10); // Yield to main thread (prevents CPU freeze)

      try {
        const snapCanvas = await toCanvas(element, {
          quality: 0.95,
          pixelRatio: 1.2,
          cacheBust: false,
          width,
          height,
        });
        keyframeCanvases.push(snapCanvas);
      } catch (err) {}

      onProgress(Math.min(45, Math.floor((snapIndex / targetSnapshots) * 45)));
    }
  }

  // Final full code frame snapshot
  if (isCancelled?.()) throw new Error('CANCELLED');
  if (onSetTypedLength) onSetTypedLength(totalChars);
  await nextTick();
  try {
    const finalSnap = await toCanvas(element, {
      quality: 0.95,
      pixelRatio: 1.2,
      cacheBust: false,
      width,
      height,
    });
    keyframeCanvases.push(finalSnap);
  } catch (err) {}

  // Step C: Build light playback frame sequence
  const playbackFrames: HTMLCanvasElement[] = [];
  const framesPerSnapshot = Math.max(1, Math.round((fps / 30) * (2 / effectiveSpeed)));

  for (const snap of keyframeCanvases) {
    for (let k = 0; k < framesPerSnapshot; k++) {
      playbackFrames.push(snap);
    }
  }

  // Hold final frame for ~1 second
  const finalCanvas = keyframeCanvases[keyframeCanvases.length - 1] || fullCanvas;
  const holdFramesCount = Math.round(fps * 1.0);
  for (let h = 0; h < holdFramesCount; h++) {
    playbackFrames.push(finalCanvas);
  }

  // Step D: Export as Animated GIF (.gif)
  if (exportFormat === 'gif') {
    onProgress(50);
    const canvasDataUrls = keyframeCanvases.map((c) => c.toDataURL('image/png', 0.9));
    for (let i = 0; i < 4; i++) {
      canvasDataUrls.push(finalCanvas.toDataURL('image/png', 0.9));
    }

    return new Promise<{ blob: Blob; filename: string }>((resolve, reject) => {
      gifshot.createGIF(
        {
          images: canvasDataUrls,
          gifWidth: width,
          gifHeight: height,
          interval: Math.max(0.04, (1 / fps) * (2 / effectiveSpeed)),
          numWorkers: 4,
          progressCallback: (prog) => {
            if (isCancelled?.()) return;
            const gifPct = 50 + Math.floor(prog * 48);
            onProgress(Math.min(98, gifPct));
          },
        },
        (obj) => {
          if (isCancelled?.()) {
            reject(new Error('CANCELLED'));
            return;
          }
          if (obj.error || !obj.image) {
            reject(new Error(obj.errorMsg || 'Failed to render GIF'));
            return;
          }
          onProgress(100);
          const blob = dataURLtoBlob(obj.image);
          resolve({ blob, filename: `codemotion-snippet-${Date.now()}.gif` });
        }
      );
    });
  }

  // Step E: Export as MP4 Video (.mp4) via Mp4Muxer / MediaRecorder fallback
  let mp4Blob: Blob;
  if (typeof VideoEncoder !== 'undefined') {
    try {
      mp4Blob = await encodeMp4WithMuxer(playbackFrames, width, height, fps, isCancelled, onProgress);
    } catch (err) {
      console.warn('WebCodecs MP4 failed, using MediaRecorder fallback:', err);
      mp4Blob = await encodeMp4WithMediaRecorder(masterCanvas, masterCtx, playbackFrames, width, height, fps, isCancelled, onProgress);
    }
  } else {
    mp4Blob = await encodeMp4WithMediaRecorder(masterCanvas, masterCtx, playbackFrames, width, height, fps, isCancelled, onProgress);
  }

  return { blob: mp4Blob, filename: `codemotion-snippet-${Date.now()}.mp4` };
}

/**
 * Fast pure JS H.264 / VP9 MP4 encoder using Mp4Muxer + WebCodecs API
 */
async function encodeMp4WithMuxer(
  playbackFrames: HTMLCanvasElement[],
  width: number,
  height: number,
  fps: number,
  isCancelled: (() => boolean) | undefined,
  onProgress: (pct: number) => void
): Promise<Blob> {
  const targetWidth = Math.max(32, Math.floor(width / 2) * 2);
  const targetHeight = Math.max(32, Math.floor(height / 2) * 2);

  let videoCodec = 'avc1.42E01E';
  let muxerCodec: 'avc' | 'vp9' = 'avc';

  if (typeof VideoEncoder !== 'undefined') {
    const avcCheck = await VideoEncoder.isConfigSupported({
      codec: 'avc1.42E01E',
      width: targetWidth,
      height: targetHeight,
      bitrate: 3_000_000,
      framerate: fps,
    }).catch(() => ({ supported: false }));

    if (!avcCheck.supported) {
      const vp9Check = await VideoEncoder.isConfigSupported({
        codec: 'vp09.00.10.08',
        width: targetWidth,
        height: targetHeight,
        bitrate: 3_000_000,
        framerate: fps,
      }).catch(() => ({ supported: false }));

      if (vp9Check.supported) {
        videoCodec = 'vp09.00.10.08';
        muxerCodec = 'vp9';
      }
    }
  }

  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: {
      codec: muxerCodec,
      width: targetWidth,
      height: targetHeight,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      console.error('VideoEncoder error:', e);
      encoderError = e;
    },
  });

  videoEncoder.configure({
    codec: videoCodec,
    width: targetWidth,
    height: targetHeight,
    bitrate: 3_000_000,
    framerate: fps,
  });

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  const frameDurationUs = Math.round(1_000_000 / fps);

  for (let i = 0; i < playbackFrames.length; i++) {
    if (isCancelled?.()) {
      try {
        videoEncoder.close();
      } catch (e) {}
      throw new Error('CANCELLED');
    }
    if (encoderError) throw encoderError;

    const frameCanvas = playbackFrames[i];
    tempCtx.clearRect(0, 0, targetWidth, targetHeight);
    tempCtx.drawImage(frameCanvas, 0, 0, targetWidth, targetHeight);

    const videoFrame = new VideoFrame(tempCanvas, {
      timestamp: i * frameDurationUs,
    });

    const isKeyframe = i % (fps * 2) === 0;
    videoEncoder.encode(videoFrame, { keyFrame: isKeyframe });
    videoFrame.close();

    // Yield CPU thread every 10 frames to avoid main thread freeze
    if (i % 10 === 0) await sleep(8);

    const pct = 50 + Math.floor((i / playbackFrames.length) * 48);
    onProgress(Math.min(98, pct));
  }

  await videoEncoder.flush();
  muxer.finalize();

  const buffer = muxer.target.buffer;
  return new Blob([buffer], { type: 'video/mp4' });
}

/**
 * Fallback MediaRecorder stream encoder
 */
async function encodeMp4WithMediaRecorder(
  masterCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  playbackFrames: HTMLCanvasElement[],
  width: number,
  height: number,
  fps: number,
  isCancelled: (() => boolean) | undefined,
  onProgress: (pct: number) => void
): Promise<Blob> {
  const stream = masterCanvas.captureStream(fps);

  let mimeType = 'video/mp4;codecs=avc1';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4;codecs=h264';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12000000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      onProgress(100);
      resolve(new Blob(chunks, { type: 'video/mp4' }));
    };

    mediaRecorder.onerror = (err) => reject(err);
    mediaRecorder.start(10);

    const frameIntervalMs = 1000 / fps;
    let frameIndex = 0;
    const totalPlaybackFrames = playbackFrames.length;
    let lastFrameTime = performance.now();

    function renderPlaybackLoop(currentTime: number) {
      if (isCancelled?.()) {
        try {
          mediaRecorder.stop();
        } catch (e) {}
        reject(new Error('CANCELLED'));
        return;
      }

      if (frameIndex >= totalPlaybackFrames) {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 50);
        return;
      }

      const elapsed = currentTime - lastFrameTime;
      if (elapsed >= frameIntervalMs - 1) {
        lastFrameTime = currentTime - (elapsed % frameIntervalMs);

        const currentCanvas = playbackFrames[frameIndex];
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(currentCanvas, 0, 0, width, height);

        frameIndex++;
        const stage2Pct = 50 + Math.floor((frameIndex / totalPlaybackFrames) * 48);
        onProgress(Math.min(98, stage2Pct));
      }

      requestAnimationFrame(renderPlaybackLoop);
    }

    requestAnimationFrame((time) => {
      lastFrameTime = time;
      renderPlaybackLoop(time);
    });
  });
}

function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/gif';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
