declare module 'gifshot' {
  export interface GifshotOptions {
    images?: (string | HTMLCanvasElement | ImageData)[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number; // frame duration in seconds (e.g. 0.05)
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (captureProgress: number) => void;
    completeCallback?: () => void;
  }

  export interface GifshotResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image: string; // base64 data URL
  }

  export function createGIF(
    options: GifshotOptions,
    callback: (result: GifshotResult) => void
  ): void;

  export function isSupported(): boolean;
}
