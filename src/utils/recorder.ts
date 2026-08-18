import { toCanvas } from 'html-to-image';

export interface MotionRecordOptions {
  element: HTMLElement;
  totalChars: number;
  motionSpeed: number;
  onSetTypedLength: (len: number) => void;
  onProgress: (percent: number) => void;
}

export async function recordMotionVideo({
  element,
  totalChars,
  motionSpeed,
  onSetTypedLength,
  onProgress,
}: MotionRecordOptions): Promise<Blob> {
  // 1. Initial snapshot to capture master dimensions
  const initialCanvas = await toCanvas(element, { quality: 0.95, pixelRatio: 2 });
  const width = initialCanvas.width;
  const height = initialCanvas.height;

  // 2. Offscreen master canvas for MediaRecorder
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = width;
  masterCanvas.height = height;
  const ctx = masterCanvas.getContext('2d')!;
  ctx.drawImage(initialCanvas, 0, 0);

  // 3. MediaRecorder setup at 30 fps
  const fps = 30;
  const stream = masterCanvas.captureStream(fps);

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>(async (resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    mediaRecorder.onerror = (err) => reject(err);

    mediaRecorder.start(100);

    // Calculate frame steps according to speed setting
    const targetFrames = Math.min(45, Math.max(20, Math.floor(totalChars / (motionSpeed || 1))));
    const stepIncrement = Math.max(1, Math.ceil(totalChars / targetFrames));
    const frameDelayMs = Math.max(10, Math.floor(30 / (motionSpeed || 1)));

    // Reset to initial 0 characters
    onSetTypedLength(0);
    await nextTick(30);

    let currentLength = 0;

    while (currentLength < totalChars) {
      currentLength = Math.min(totalChars, currentLength + stepIncrement);
      onSetTypedLength(currentLength);

      const pct = Math.min(95, Math.floor((currentLength / totalChars) * 100));
      onProgress(pct);

      // Wait for DOM & React paint
      await nextTick(frameDelayMs);

      try {
        const frameCanvas = await toCanvas(element, { quality: 0.95, pixelRatio: 2 });
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frameCanvas, 0, 0);
      } catch (e) {
        console.warn('Frame render warning:', e);
      }
    }

    // Hold final full code frame for 15 frames (~0.5s)
    onProgress(99);
    for (let f = 0; f < 15; f++) {
      await nextTick(30);
      try {
        const frameCanvas = await toCanvas(element, { quality: 0.95, pixelRatio: 2 });
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frameCanvas, 0, 0);
      } catch (e) {}
    }

    onProgress(100);
    mediaRecorder.stop();
  });
}

function nextTick(ms: number = 30): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, ms);
    });
  });
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
