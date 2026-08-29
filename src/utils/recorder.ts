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
 * Ultra-Fluid Character-by-Character Motion Exporter
 * - 1 to 2 characters per step for smooth 60FPS fluid typewriter motion.
 * - Queue-drained WebCodecs encoding (encodeQueueSize throttling guarantees zero browser crashes).
 * - Multi-speed scaling & monotonic progress reporting.
 * - Explicit VRAM canvas garbage collection.
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

  // Measure master dimensions at 1x pixel ratio (HD-sharp but 2.25x less VRAM vs 1.5x)
  const fullCanvas = await toCanvas(element, {
    quality: 0.85,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: true,
    fontEmbedCSS: '',
    filter: filterCmWidgetBuffer,
  });
  const width = Math.max(32, Math.floor(fullCanvas.width / 2) * 2);
  const height = Math.max(32, Math.floor(fullCanvas.height / 2) * 2);

  const effectiveSpeed = Math.max(0.25, motionSpeed || 1);

  // ---- GIF Path: still uses array (small # of frames) ----
  if (isGif) {
    const gifCanvases: HTMLCanvasElement[] = [];
    try {
      if (onSetTypedLength) onSetTypedLength(0);
      syncEditorDocument('', element);
      await forceDomPaint();

      const maxGifSteps = 25;
      const charStepGif = Math.max(1, Math.ceil(totalChars / maxGifSteps));
      let currentLen = 0;

      while (currentLen < totalChars) {
        if (isCancelled?.()) throw new Error('CANCELLED');
        currentLen = Math.min(totalChars, currentLen + charStepGif);
        if (onSetTypedLength) onSetTypedLength(currentLen);
        syncEditorDocument(code.slice(0, currentLen), element);
        await forceDomPaint();
        try {
          gifCanvases.push(await toCanvas(element, {
            quality: 0.85, pixelRatio: 1, cacheBust: true, skipFonts: true,
            fontEmbedCSS: '', width, height, filter: filterCmWidgetBuffer,
          }));
        } catch {}
        await sleep(5);
        safeProgress(5 + Math.floor((currentLen / totalChars) * 40));
      }

      // Final frame
      if (onSetTypedLength) onSetTypedLength(totalChars);
      syncEditorDocument(code, element);
      await forceDomPaint();
      try {
        const finalSnap = await toCanvas(element, {
          quality: 0.85, pixelRatio: 1, cacheBust: true, skipFonts: true,
          fontEmbedCSS: '', width, height, filter: filterCmWidgetBuffer,
        });
        gifCanvases.push(finalSnap);
      } catch {}

      safeProgress(48);

      const maxTypingSec = effectiveSpeed <= 0.6 ? 16 : effectiveSpeed >= 1.8 ? 4 : 8;
      const minTypingSec = effectiveSpeed <= 0.6 ? 6 : effectiveSpeed >= 1.8 ? 1.5 : 3;
      const totalTypingDurationSec = Math.min(maxTypingSec, Math.max(minTypingSec, totalChars / (15 * effectiveSpeed)));
      const snapshotCount = Math.max(1, gifCanvases.length);
      const gifInterval = Math.max(0.04, totalTypingDurationSec / snapshotCount);

      safeProgress(50);
      const canvasDataUrls = gifCanvases.map((c) => c.toDataURL('image/png', 0.85));
      const finalGifCanvas = gifCanvases[gifCanvases.length - 1] || fullCanvas;
      for (let i = 0; i < 4; i++) {
        canvasDataUrls.push(finalGifCanvas.toDataURL('image/png', 0.85));
      }

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
            if (isCancelled?.()) { reject(new Error('CANCELLED')); return; }
            if (obj.error || !obj.image) { reject(new Error(obj.errorMsg || 'Failed to render GIF')); return; }
            safeProgress(100);
            resolve({ blob: dataURLtoBlob(obj.image), filename: `codemotion-snippet-${Date.now()}.gif` });
          }
        );
      });
    } finally {
      releaseCanvases(gifCanvases);
      releaseCanvases([fullCanvas]);
    }
  }

  // ---- MP4 Path: Streaming encode per-snapshot (zero array storage) ----
  // Each snapshot is captured, encoded immediately, then released.
  // Only 1 canvas lives in RAM at any time.

  try {
    // Reset to 0
    if (onSetTypedLength) onSetTypedLength(0);
    syncEditorDocument('', element);
    await forceDomPaint();

    // Compute snapshot char positions
     const charPositions: number[] = [];
     if (motionStyle === 'lineByLine') {
       const lines = (code || element.innerText || '').split('\n');
       const maxLineSteps = 50;
       const lineGroupSize = Math.max(1, Math.ceil(lines.length / maxLineSteps));
       let cumulative = 0;
       for (let i = 0; i < lines.length; i++) {
         cumulative += lines[i].length + (i < lines.length - 1 ? 1 : 0);
         if ((i + 1) % lineGroupSize === 0 || i === lines.length - 1) {
           charPositions.push(Math.min(totalChars, cumulative));
         }
       }
      } else if (motionStyle === 'glitch') {
        // Glitch: chaotic jumps with frequent stutters and backtracking
        const glitchSteps = 80;
        const charStep = Math.max(1, Math.ceil(totalChars / glitchSteps));
        let cur = 0;
        while (cur < totalChars) {
          const nextPos = Math.min(totalChars, cur + charStep);
          charPositions.push(nextPos);
          
          // Frequent glitch stutters - 30% chance of backtrack
          if (Math.random() < 0.3 && charPositions.length > 2) {
            const glitchBack = Math.max(0, nextPos - Math.floor(charStep * 0.5));
            if (glitchBack < nextPos) {
              charPositions.push(glitchBack);
              // Sometimes jump forward aggressively
              if (Math.random() < 0.4) {
                const glitchJump = Math.min(totalChars, nextPos + Math.floor(charStep * 0.3));
                charPositions.push(glitchJump);
                cur = glitchJump - charStep;
              }
            }
          }
          cur = nextPos;
        }
      } else if (motionStyle === 'wave') {
        // Wave: oscillating motion - forward then slightly back
        const waveSteps = 60;
        const charStep = Math.max(1, Math.ceil(totalChars / waveSteps));
        let cur = 0;
        let lastPush = 0;
        
        while (cur < totalChars) {
          // Push forward
          cur = Math.min(totalChars, cur + charStep);
          charPositions.push(cur);
          lastPush = cur;
          
          // Wave back slightly if we haven't reached end
          if (cur < totalChars) {
            const backPos = Math.max(lastPush - Math.floor(charStep * 0.3), 0);
            if (backPos > 0 && backPos < lastPush) {
              charPositions.push(backPos);
              cur = backPos;
            }
          }
        }
     } else {
       // Typewriter: 50 keyframes (smooth enough, 2.8x less than 140)
       const charStep = Math.max(1, Math.ceil(totalChars / 50));
       let cur = 0;
       while (cur < totalChars) {
         cur = Math.min(totalChars, cur + charStep);
         charPositions.push(cur);
       }
     }
     // Ensure final position is totalChars
     if (charPositions[charPositions.length - 1] !== totalChars) {
       charPositions.push(totalChars);
     }

    const snapshotCount = charPositions.length;

    // Calculate timing
    const maxTypingSec = effectiveSpeed <= 0.6 ? 16 : effectiveSpeed >= 1.8 ? 4 : 8;
    const minTypingSec = effectiveSpeed <= 0.6 ? 6 : effectiveSpeed >= 1.8 ? 1.5 : 3;
    const totalTypingDurationSec = Math.min(maxTypingSec, Math.max(minTypingSec, totalChars / (15 * effectiveSpeed)));
    const framesPerSnapshot = Math.max(1, Math.round((totalTypingDurationSec * fps) / snapshotCount));
    const holdFramesCount = Math.round(fps * 1.0);

    safeProgress(5);

    // Determine encoder path
    let result: { blob: Blob; extension: string };

    if (typeof VideoEncoder !== 'undefined') {
      try {
        result = {
          blob: await streamEncodeMp4WebCodecs(
            element, code, charPositions, width, height, fps,
            framesPerSnapshot, holdFramesCount,
            isCancelled, onSetTypedLength, safeProgress
          ),
          extension: 'mp4',
        };
      } catch (err) {
        if (err instanceof Error && err.message === 'CANCELLED') throw err;
        result = await streamEncodeMp4Wasm(
          element, code, charPositions, width, height, fps,
          framesPerSnapshot, holdFramesCount,
          isCancelled, onSetTypedLength, safeProgress
        );
      }
    } else {
      result = await streamEncodeMp4Wasm(
        element, code, charPositions, width, height, fps,
        framesPerSnapshot, holdFramesCount,
        isCancelled, onSetTypedLength, safeProgress
      );
    }

    safeProgress(100);
    return { blob: result.blob, filename: `codemotion-snippet-${Date.now()}.${result.extension}` };
  } finally {
    releaseCanvases([fullCanvas]);
  }
}

/**
 * Streaming MP4 encoder using WebCodecs — captures and encodes per-snapshot.
 * Only 1 canvas active in RAM at any time. Zero array storage.
 */
async function streamEncodeMp4WebCodecs(
  element: HTMLElement,
  code: string,
  charPositions: number[],
  width: number,
  height: number,
  fps: number,
  framesPerSnapshot: number,
  holdFramesCount: number,
  isCancelled: (() => boolean) | undefined,
  onSetTypedLength: ((len: number) => void) | undefined,
  onProgress: (pct: number) => void
): Promise<Blob> {
  let videoCodec = 'avc1.4D4028';
  let muxerCodec: 'avc' | 'vp9' = 'avc';

  const codecsToTest = [
    { codec: 'avc1.4D4028', muxer: 'avc' as const },
    { codec: 'avc1.640028', muxer: 'avc' as const },
    { codec: 'avc1.42E028', muxer: 'avc' as const },
    { codec: 'vp09.00.10.08', muxer: 'vp9' as const },
  ];

  for (const test of codecsToTest) {
    try {
      const check = await VideoEncoder.isConfigSupported({
        codec: test.codec, width, height, bitrate: 6_000_000, framerate: fps,
      });
      if (check.supported) { videoCodec = test.codec; muxerCodec = test.muxer; break; }
    } catch {}
  }

  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: { codec: muxerCodec, width, height },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;
  const frameDurationUs = Math.round(1_000_000 / fps);

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => { muxer.addVideoChunk(chunk, meta); },
    error: (e) => { encoderError = e; },
  });

  videoEncoder.configure({
    codec: videoCodec, width, height, bitrate: 6_000_000, framerate: fps,
  });

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  let globalFrameIdx = 0;

  try {
    // Encode typing snapshots — capture, encode N frames, release immediately
    for (let s = 0; s < charPositions.length; s++) {
      if (isCancelled?.()) { try { videoEncoder.close(); } catch {} throw new Error('CANCELLED'); }
      if (encoderError) throw encoderError;

      const charLen = charPositions[s];
      if (onSetTypedLength) onSetTypedLength(charLen);
      syncEditorDocument(code.slice(0, charLen), element);
      await forceDomPaint();

      // Capture single snapshot
      const snapCanvas = await toCanvas(element, {
        quality: 0.85, pixelRatio: 1, cacheBust: true, skipFonts: true,
        fontEmbedCSS: '', width, height, filter: filterCmWidgetBuffer,
      });

      // Encode this snapshot as N repeated frames
      for (let f = 0; f < framesPerSnapshot; f++) {
        if (isCancelled?.()) { try { videoEncoder.close(); } catch {} throw new Error('CANCELLED'); }
        if (encoderError) throw encoderError;

        // Throttle WebCodecs queue to prevent browser crash
        while (videoEncoder.encodeQueueSize > 3) { await sleep(10); }

        tempCtx.clearRect(0, 0, width, height);
        tempCtx.drawImage(snapCanvas, 0, 0, width, height);

        const videoFrame = new VideoFrame(tempCanvas, {
          timestamp: globalFrameIdx * frameDurationUs,
          duration: frameDurationUs,
        });
        videoEncoder.encode(videoFrame, { keyFrame: globalFrameIdx % 30 === 0 });
        videoFrame.close();
        globalFrameIdx++;

        if (f % 4 === 0) await sleep(2);
      }

      // Release snapshot immediately — only 1 canvas alive at a time
      releaseCanvases([snapCanvas]);

      // Progress: 10% to 85% during snapshot encoding
      onProgress(10 + Math.floor(((s + 1) / charPositions.length) * 75));
    }

    // Encode hold frames (final frame held for 1 second)
    // Re-capture final state
    if (onSetTypedLength) onSetTypedLength(charPositions[charPositions.length - 1]);
    syncEditorDocument(code, element);
    await forceDomPaint();

    const holdCanvas = await toCanvas(element, {
      quality: 0.85, pixelRatio: 1, cacheBust: true, skipFonts: true,
      fontEmbedCSS: '', width, height, filter: filterCmWidgetBuffer,
    });

    for (let h = 0; h < holdFramesCount; h++) {
      if (isCancelled?.()) { try { videoEncoder.close(); } catch {} throw new Error('CANCELLED'); }
      while (videoEncoder.encodeQueueSize > 3) { await sleep(10); }

      tempCtx.clearRect(0, 0, width, height);
      tempCtx.drawImage(holdCanvas, 0, 0, width, height);

      const videoFrame = new VideoFrame(tempCanvas, {
        timestamp: globalFrameIdx * frameDurationUs,
        duration: frameDurationUs,
      });
      videoEncoder.encode(videoFrame, { keyFrame: globalFrameIdx % 30 === 0 });
      videoFrame.close();
      globalFrameIdx++;

      if (h % 4 === 0) await sleep(2);
    }

    releaseCanvases([holdCanvas]);

    onProgress(90);
    await videoEncoder.flush();
    onProgress(95);
    muxer.finalize();
    onProgress(99);

    const buffer = muxer.target.buffer;
    return new Blob([buffer], { type: 'video/mp4' });
  } finally {
    releaseCanvases([tempCanvas]);
  }
}

/**
 * Streaming WASM fallback encoder — captures and encodes per-snapshot.
 * Only 1 canvas active in RAM at any time.
 */
async function streamEncodeMp4Wasm(
  element: HTMLElement,
  code: string,
  charPositions: number[],
  width: number,
  height: number,
  fps: number,
  framesPerSnapshot: number,
  holdFramesCount: number,
  isCancelled: (() => boolean) | undefined,
  onSetTypedLength: ((len: number) => void) | undefined,
  onProgress: (pct: number) => void
): Promise<{ blob: Blob; extension: string }> {
  const wasmFps = Math.min(fps, 30);
  const rateStep = Math.max(1, Math.round(fps / wasmFps));
  const wasmFramesPerSnap = Math.max(1, Math.round(framesPerSnapshot / rateStep));
  const wasmHoldFrames = Math.max(1, Math.round(holdFramesCount / rateStep));

  const HME = await import('h264-mp4-encoder');
  const encoder = await HME.createH264MP4Encoder();

  encoder.width = width;
  encoder.height = height;
  encoder.frameRate = wasmFps;
  encoder.kbps = 6000;
  encoder.speed = 10;
  encoder.outputFilename = 'codemotion.mp4';
  encoder.initialize();

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
  tempCtx.imageSmoothingEnabled = true;
  tempCtx.imageSmoothingQuality = 'high';

  try {
    for (let s = 0; s < charPositions.length; s++) {
      if (isCancelled?.()) throw new Error('CANCELLED');

      const charLen = charPositions[s];
      if (onSetTypedLength) onSetTypedLength(charLen);
      syncEditorDocument(code.slice(0, charLen), element);
      await forceDomPaint();

      const snapCanvas = await toCanvas(element, {
        quality: 0.85, pixelRatio: 1, cacheBust: true, skipFonts: true,
        fontEmbedCSS: '', width, height, filter: filterCmWidgetBuffer,
      });

      tempCtx.clearRect(0, 0, width, height);
      tempCtx.drawImage(snapCanvas, 0, 0, width, height);
      const imageData = tempCtx.getImageData(0, 0, width, height);

      for (let f = 0; f < wasmFramesPerSnap; f++) {
        encoder.addFrameRgba(imageData.data);
        await sleep(2);
      }

      releaseCanvases([snapCanvas]);
      onProgress(10 + Math.floor(((s + 1) / charPositions.length) * 75));
    }

    // Hold frames
    if (onSetTypedLength) onSetTypedLength(charPositions[charPositions.length - 1]);
    syncEditorDocument(code, element);
    await forceDomPaint();

    const holdCanvas = await toCanvas(element, {
      quality: 0.85, pixelRatio: 1, cacheBust: true, skipFonts: true,
      fontEmbedCSS: '', width, height, filter: filterCmWidgetBuffer,
    });
    tempCtx.clearRect(0, 0, width, height);
    tempCtx.drawImage(holdCanvas, 0, 0, width, height);
    const holdData = tempCtx.getImageData(0, 0, width, height);

    for (let h = 0; h < wasmHoldFrames; h++) {
      encoder.addFrameRgba(holdData.data);
      await sleep(2);
    }
    releaseCanvases([holdCanvas]);

    onProgress(90);
    encoder.finalize();
    onProgress(95);

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
