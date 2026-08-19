import { toCanvas } from 'html-to-image';

export interface MotionRecordOptions {
  element: HTMLElement;
  totalChars: number;
  motionSpeed: number;
  fps?: number; // 30 or 60 FPS
  isCancelled?: () => boolean;
  onSetTypedLength: (len: number) => void;
  onProgress: (percent: number) => void;
}

/**
 * Two-Stage Full-Height Character-by-Character Video Recorder:
 * 1. Measures FULL height at 100% code length first (prevents bottom cropping/truncation).
 * 2. Captures character-by-character snapshots (prevents word skipping/lag).
 * 3. Blits pre-rendered frames onto master Canvas at exact 60 FPS.
 */
export async function recordMotionVideo({
  element,
  totalChars,
  motionSpeed,
  fps = 60,
  isCancelled,
  onSetTypedLength,
  onProgress,
}: MotionRecordOptions): Promise<Blob> {
  // Step A: Force FULL code length first so element expands to full dimensions (prevents bottom cropping)
  onSetTypedLength(totalChars);
  await sleep(40);

  // Measure master dimensions at FULL content height
  const fullCanvas = await toCanvas(element, { quality: 0.98, pixelRatio: 2, cacheBust: false });
  const width = fullCanvas.width;
  const height = fullCanvas.height;

  // Offscreen master canvas for MediaRecorder stream with exact FULL dimensions
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = width;
  masterCanvas.height = height;
  const ctx = masterCanvas.getContext('2d')!;

  // Step B: Stage 1 - Character-by-Character Snapshot Generation
  const effectiveSpeed = motionSpeed || 1;
  
  // Step by 1 char for short snippets (< 120 chars) or 2 chars for longer snippets for authentic typing
  const charStep = totalChars <= 120 ? 1 : Math.min(3, Math.max(1, Math.floor(totalChars / 80)));
  const totalSnapshots = Math.ceil(totalChars / charStep);

  const keyframeCanvases: HTMLCanvasElement[] = [];

  // Reset to 0 characters
  onSetTypedLength(0);
  await sleep(20);

  let currentLen = 0;
  let snapIndex = 0;

  while (currentLen < totalChars) {
    if (isCancelled?.()) {
      throw new Error('CANCELLED');
    }

    currentLen = Math.min(totalChars, currentLen + charStep);
    snapIndex++;
    onSetTypedLength(currentLen);

    await nextTick();

    try {
      const snapCanvas = await toCanvas(element, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: false,
        width: Math.round(width / 2),
        height: Math.round(height / 2),
      });
      keyframeCanvases.push(snapCanvas);
    } catch (err) {
      console.warn('Snapshot render warning:', err);
    }

    const stage1Pct = Math.min(50, Math.floor((snapIndex / totalSnapshots) * 50));
    onProgress(stage1Pct);
  }

  // Final full code snapshot
  if (isCancelled?.()) {
    throw new Error('CANCELLED');
  }
  onSetTypedLength(totalChars);
  await nextTick();
  try {
    const finalSnap = await toCanvas(element, {
      quality: 0.98,
      pixelRatio: 2,
      cacheBust: false,
      width: Math.round(width / 2),
      height: Math.round(height / 2),
    });
    keyframeCanvases.push(finalSnap);
  } catch (err) {}

  // Step C: Build smooth 60 FPS playback sequence
  const playbackFrames: HTMLCanvasElement[] = [];
  
  // Allocate frames per character snapshot based on FPS & speed settings
  const framesPerSnapshot = Math.max(1, Math.round((fps / 30) * (2 / effectiveSpeed)));

  for (const snap of keyframeCanvases) {
    for (let k = 0; k < framesPerSnapshot; k++) {
      playbackFrames.push(snap);
    }
  }

  // Hold final full-code frame for ~1 second (fps frames) for a clean finish
  const finalCanvas = keyframeCanvases[keyframeCanvases.length - 1] || fullCanvas;
  const holdFramesCount = Math.round(fps * 1.0);
  for (let h = 0; h < holdFramesCount; h++) {
    playbackFrames.push(finalCanvas);
  }

  // Step D: Stage 2 - Constant 60 FPS MediaRecorder Stream Playback
  const stream = masterCanvas.captureStream(fps);

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 16000000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
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

        const stage2Pct = 50 + Math.floor((frameIndex / totalPlaybackFrames) * 50);
        onProgress(Math.min(99, stage2Pct));
      }

      requestAnimationFrame(renderPlaybackLoop);
    }

    requestAnimationFrame((time) => {
      lastFrameTime = time;
      renderPlaybackLoop(time);
    });
  });
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
