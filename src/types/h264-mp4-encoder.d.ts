declare module 'h264-mp4-encoder' {
  export interface H264Encoder {
    width: number;
    height: number;
    frameRate: number;
    kbps: number;
    speed: number;
    outputFilename: string;
    initialize(): void;
    addFrameRgba(rgbaData: Uint8Array | Uint8ClampedArray): void;
    finalize(): void;
    getFS(): {
      readFile(filename: string): Uint8Array;
    };
    delete(): void;
  }

  export function createH264MP4Encoder(): Promise<H264Encoder>;
  const encoder: {
    createH264MP4Encoder(): Promise<H264Encoder>;
  };
  export default encoder;
}
