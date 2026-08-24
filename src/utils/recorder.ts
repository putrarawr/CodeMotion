import { toCanvas } from 'html-to-image';
import gifshot from 'gifshot';
import * as Mp4Muxer from 'mp4-muxer';
import { syncEditorDocument, setImperativeSyncing } from './editorBridge';

export interface MotionRecordOptions {
  element: HTMLElement;
  code: string;
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
 * Ensures browser DOM layout & CodeMirror document have painted before taking snapshot.
 */
async function forceDomPaint(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
  await sleep(10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Filter out temporary CodeMirror widgets/tooltips/images during capture.
 */
function filterCmWidgetBuffer(node: HTMLElement): boolean {
  if (!node) return true;
  if (
    node.tagName === 'IMG' &&
    (node.classList?.contains('cm-widgetBuffer') || (node as HTMLImageElement).src?.startsWith('blob:'))
  ) {
    return false;
  }
  if (node.classList?.contains('cm-tooltip')) {
    return false;
  }
  return true;
}

/**
 * Free canvas memory explicitly to prevent RAM spikes / browser memory leaks.
 */
function releaseCanvases(canvases: HTMLCanvasElement[]) {
  for (const c of canvases) {
    try {
      c.width = 0;
      c.height = 0;
    } catch {}
  }
  canvases.length = 0;
}

/**
 * Low-RAM, Multi-Speed Motion Exporter
 * - Accurate 0.5x / 1x / 2x speed scaling.
 * - Smooth monotonic progress bar (zero stuck 97% delay).
 * - Silent clean console logging.
 */
export async function recordMotionVideo(options: MotionRecordOptions): Promise<{ blob: Blob; filename: string }> {
  setImperativeSyncing(true);
  try {
    return await doRecordMotionVideo(options);
  } finally {
    setImperativeSyncing(false);
  }
}

async function doRecordMotionVideo({
  element,
  code,
  totalChars,
  motionSpeed,
  fps = 60,
  motionStyle = 'typewriter',
  exportFormat = 'mp4',
  isCancelled,
  onSetTypedLength,
  onProgress,
}: MotionRecordOptions): Promise<{ blob: Blob; filename: string }> {
  const isGif = exportFormat === 'gif';

  // Guarantee monotonic progress bar
  let highestProgress = 0;
  const safeProgress = (pct: number) => {
    const p = Math.min(100, Math.max(0, Math.floor(pct)));
    if (p > highestProgress) {
      highestProgress = p;
      onProgress(p);
    }
  };

  safeProgress(2);

  // Step A: Force FULL code length first so element expands to full dimensions
  if (onSetTypedLength) onSetTypedLength(totalChars);
  syncEditorDocument(code, element);
  await forceDomPaint();

  // Measure master dimensions at 1.5x pixel ratio for sharp HD canvas
  const fullCanvas = await toCanvas(element, {
    quality: 0.95,
    pixelRatio: 1.5,
    cacheBust: true,
    skipFonts: true,
    fontEmbedCSS: '',
    filter: filterCmWidgetBuffer,
  });
  const width = Math.max(32, Math.floor(fullCanvas.width / 2) * 2);
  const height = Math.max(32, Math.floor(fullCanvas.height / 2) * 2);

  const effectiveSpeed = Math.max(0.25, motionSpeed || 1);
  const keyframeCanvases: HTMLCanvasElement[] = [];

  try {
    // Reset to 0
    if (onSetTypedLength) onSetTypedLength(0);
    syncEditorDocument('', element);
    await forceDomPaint();

    if (motionStyle === 'lineByLine') {
      const textContent = code || element.innerText || '';
      const lines = textContent.split('\n');

      const maxLineSteps = isGif ? 24 : 60;
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
        syncEditorDocument(code.slice(0, charLen), element);
        await forceDomPaint();

        try {
          const snapCanvas = await toCanvas(element, {
            quality: 0.95,
            pixelRatio: 1.5,
            cacheBust: true,
            skipFonts: true,
            fontEmbedCSS: '',
            width,
            height,
            filter: filterCmWidgetBuffer,
          });
          keyframeCanvases.push(snapCanvas);
        } catch {}

        if (l % 5 === 0) await sleep(8);
        safeProgress(5 + Math.floor(((l + 1) / lineEndIndices.length) * 40));
      }
    } else {
      // Typewriter mode — 1 to 2 characters per step for 100% FLUID typing motion
      const charStep = isGif
        ? Math.max(1, Math.ceil(totalChars / 35))
        : Math.max(1, Math.ceil(totalChars / 120));
      let currentLen = 0;
      let snapIndex = 0;

      while (currentLen < totalChars) {
        if (isCancelled?.()) throw new Error('CANCELLED');
        currentLen = Math.min(totalChars, currentLen + charStep);
        snapIndex++;
        if (onSetTypedLength) onSetTypedLength(currentLen);
        syncEditorDocument(code.slice(0, currentLen), element);
        await forceDomPaint();

        try {
          const snapCanvas = await toCanvas(element, {
            quality: 0.95,
            pixelRatio: 1.5,
            cacheBust: true,
            skipFonts: true,
            fontEmbedCSS: '',
            width,
            height,
            filter: filterCmWidgetBuffer,
          });
          keyframeCanvases.push(snapCanvas);
        } catch {}

        if (snapIndex % 5 === 0) await sleep(8);

        safeProgress(5 + Math.floor((currentLen / totalChars) * 40));
      }
    }

    // Final full code frame snapshot
    if (isCancelled?.()) throw new Error('CANCELLED');
    if (onSetTypedLength) onSetTypedLength(totalChars);
    syncEditorDocument(code, element);
    await forceDomPaint();
    try {
      const finalSnap = await toCanvas(element, {
        quality: 0.95,
        pixelRatio: 1.5,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        width,
        height,
        filter: filterCmWidgetBuffer,
      });
      keyframeCanvases.push(finalSnap);
    } catch {}

    safeProgress(48);

    // Calculate frame timings with ACCURATE 0.5x / 1x / 2x speed scaling:
    // 0.5x speed -> 8-18 seconds (slow, relaxing typing)
    // 1.0x speed -> 4-8 seconds (standard normal typing)
    // 2.0x speed -> 2-4 seconds (fast preview typing)
    const maxTypingSec = effectiveSpeed <= 0.6 ? 18 : effectiveSpeed >= 1.8 ? 4.5 : 9;
    const minTypingSec = effectiveSpeed <= 0.6 ? 7 : effectiveSpeed >= 1.8 ? 1.8 : 3.5;
    const totalTypingDurationSec = Math.min(
      maxTypingSec,
      Math.max(minTypingSec, totalChars / (15 * effectiveSpeed))
    );

    const snapshotCount = Math.max(1, keyframeCanvases.length);
    const framesPerSnapshot = Math.max(
      1,
      Math.round((totalTypingDurationSec * fps) / snapshotCount)
    );

    const typingFramesCount = snapshotCount * framesPerSnapshot;
    const holdFramesCount = Math.round(fps * 1.2);
    const totalVideoFrames = typingFramesCount + holdFramesCount;
    const finalCanvas = keyframeCanvases[keyframeCanvases.length - 1] || fullCanvas;

    // Direct streaming getter function (0 RAM overhead)
    const getFrameCanvas = (frameIdx: number): HTMLCanvasElement => {
      if (frameIdx < typingFramesCount) {
        const snapIdx = Math.min(keyframeCanvases.length - 1, Math.floor(frameIdx / framesPerSnapshot));
        return keyframeCanvases[snapIdx];
      }
      return finalCanvas;
    };

    // Step D: Export as Animated GIF (.gif)
    if (isGif) {
      safeProgress(50);
      const canvasDataUrls = keyframeCanvases.map((c) => c.toDataURL('image/png', 0.9));
      for (let i = 0; i < 4; i++) {
        canvasDataUrls.push(finalCanvas.toDataURL('image/png', 0.9));
      }

      const gifInterval = Math.max(0.04, totalTypingDurationSec / snapshotCount);

      return await new Promise<{ blob: Blob; filename: string }>((resolve, reject) => {
        gifshot.createGIF(
          {
            images: canvasDataUrls,
            gifWidth: width,
            gifHeight: height,
            interval: gifInterval,
            numWorkers: 2,
            progressCallback: (prog) => {
              if (isCancelled?.()) return;
              safeProgress(50 + Math.floor(prog * 48));
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
            safeProgress(100);
            const blob = dataURLtoBlob(obj.image);
            resolve({ blob, filename: `codemotion-snippet-${Date.now()}.gif` });
          }
        );
      });
    }

    // Step E: Export as MP4 Video (.mp4)
    let result: { blob: Blob; extension: string };

    if (typeof VideoEncoder !== 'undefined') {
      try {
        const blob = await encodeMp4WithMuxerStream(
          getFrameCanvas,
          totalVideoFrames,
          width,
          height,
          fps,
          isCancelled,
          safeProgress
        );
        result = { blob, extension: 'mp4' };
      } catch (err) {
        if (err instanceof Error && err.message === 'CANCELLED') throw err;
        result = await encodeMp4WithWasmStream(
          getFrameCanvas,
          totalVideoFrames,
          width,
          height,
          fps,
          isCancelled,
          safeProgress
        );
      }
    } else {
      result = await encodeMp4WithWasmStream(
        getFrameCanvas,
        totalVideoFrames,
        width,
        height,
        fps,
        isCancelled,
        safeProgress
      );
    }

    safeProgress(100);
    return { blob: result.blob, filename: `codemotion-snippet-${Date.now()}.${result.extension}` };
  } finally {
    // Explicitly release all canvas VRAM / memory to keep browser light!
    releaseCanvases(keyframeCanvases);
    if (fullCanvas) releaseCanvases([fullCanvas]);
  }
}

/**
 * Low-RAM Streaming MP4 encoder using WebCodecs
 */
async function encodeMp4WithMuxerStream(
  getFrameCanvas: (idx: number) => HTMLCanvasElement,
  totalFrames: number,
  width: number,
  height: number,
  fps: number,
  isCancelled: (() => boolean) | undefined,
  onProgress: (pct: number) => void
): Promise<Blob> {
  const targetWidth = width;
  const targetHeight = height;

  let videoCodec = 'avc1.4D4028';
  let muxerCodec: 'avc' | 'vp9' = 'avc';

  const codecsToTest = [
    { codec: 'avc1.4D4028', muxer: 'avc' as const },
    { codec: 'avc1.640028', muxer: 'avc' as const },
    { codec: 'avc1.42E028', muxer: 'avc' as const },
    { codec: 'vp09.00.10.08', muxer: 'vp9' as const },
  ];

  if (typeof VideoEncoder !== 'undefined') {
    for (const test of codecsToTest) {
      try {
        const check = await VideoEncoder.isConfigSupported({
          codec: test.codec,
          width: targetWidth,
          height: targetHeight,
          bitrate: 8_000_000,
          framerate: fps,
        });

        if (check.supported) {
          videoCodec = test.codec;
          muxerCodec = test.muxer;
          break;
        }
      } catch {}
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
  const frameDurationUs = Math.round(1_000_000 / fps);

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      encoderError = e;
    },
  });

  videoEncoder.configure({
    codec: videoCodec,
    width: targetWidth,
    height: targetHeight,
    bitrate: 8_000_000,
    framerate: fps,
  });

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  try {
    for (let i = 0; i < totalFrames; i++) {
      if (isCancelled?.()) {
        try {
          videoEncoder.close();
        } catch {}
        throw new Error('CANCELLED');
      }
      if (encoderError) throw encoderError;

      const frameCanvas = getFrameCanvas(i);
      tempCtx.clearRect(0, 0, targetWidth, targetHeight);
      tempCtx.drawImage(frameCanvas, 0, 0, targetWidth, targetHeight);

      const videoFrame = new VideoFrame(tempCanvas, {
        timestamp: i * frameDurationUs,
        duration: frameDurationUs,
      });

      const isKeyframe = i % 15 === 0;
      videoEncoder.encode(videoFrame, { keyFrame: isKeyframe });
      videoFrame.close();

      if (i % 8 === 0) await sleep(4);

      // Smooth progress scaling up to 92% during frame encoding
      const pct = 50 + Math.floor((i / totalFrames) * 42);
      onProgress(pct);
    }

    onProgress(94);
    await videoEncoder.flush();
    onProgress(97);
    muxer.finalize();
    onProgress(99);

    const buffer = muxer.target.buffer;
    return new Blob([buffer], { type: 'video/mp4' });
  } finally {
    releaseCanvases([tempCanvas]);
  }
}

/**
 * Low-RAM Streaming MP4 encoder fallback using WASM x264
 */
async function encodeMp4WithWasmStream(
  getFrameCanvas: (idx: number) => HTMLCanvasElement,
  totalFrames: number,
  width: number,
  height: number,
  fps: number,
  isCancelled: (() => boolean) | undefined,
  onProgress: (pct: number) => void
): Promise<{ blob: Blob; extension: string }> {
  const targetWidth = width;
  const targetHeight = height;

  const wasmFps = Math.min(fps, 30);
  const rateStep = Math.max(1, Math.round(fps / wasmFps));
  const effectiveFrames = Math.floor(totalFrames / rateStep);

  const HME = await import('h264-mp4-encoder');
  const encoder = await HME.createH264MP4Encoder();

  encoder.width = targetWidth;
  encoder.height = targetHeight;
  encoder.frameRate = wasmFps;
  encoder.kbps = 8000;
  encoder.speed = 10;
  encoder.outputFilename = 'codemotion.mp4';
  encoder.initialize();

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  try {
    for (let i = 0; i < effectiveFrames; i++) {
      if (isCancelled?.()) throw new Error('CANCELLED');

      const frameIdx = i * rateStep;
      const frameCanvas = getFrameCanvas(frameIdx);
      tempCtx.clearRect(0, 0, targetWidth, targetHeight);
      tempCtx.drawImage(frameCanvas, 0, 0, targetWidth, targetHeight);

      const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
      encoder.addFrameRgba(imageData.data);

      if (i % 4 === 0) await sleep(2);

      const pct = 50 + Math.floor(((i + 1) / effectiveFrames) * 44);
      onProgress(pct);
    }

    onProgress(96);
    encoder.finalize();
    onProgress(98);

    const fileFs = typeof encoder.getFS === 'function' ? encoder.getFS() : (encoder as any).FS;
    const bytes = fileFs.readFile(encoder.outputFilename);
    onProgress(100);
    return { blob: new Blob([bytes as unknown as BlobPart], { type: 'video/mp4' }), extension: 'mp4' };
  } finally {
    releaseCanvases([tempCanvas]);
    encoder.delete();
  }
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
