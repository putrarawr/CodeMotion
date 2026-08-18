import { useState, useCallback } from 'react';
import { toPng, toSvg, toBlob } from 'html-to-image';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'],
      });
    } catch {
      // Ignore if canvas confetti isn't supported
    }
  }, []);

  const downloadPng = useCallback(
    async (pixelRatio: number = 3, filename: string = 'codesnap.png', targetId: string = 'export-container') => {
      const element = document.getElementById(targetId);
      if (!element) {
        toast.error('Container element not found');
        return;
      }

      setIsExporting(true);
      const toastId = toast.loading('Rendering high-DPI image...');

      try {
        await new Promise((res) => setTimeout(res, 100));

        const dataUrl = await toPng(element, {
          pixelRatio,
          cacheBust: true,
        });

        const link = document.createElement('a');
        link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        link.href = dataUrl;
        link.click();

        toast.success('PNG exported successfully!', { id: toastId });
        triggerConfetti();
      } catch (err) {
        console.error('Failed to export PNG:', err);
        toast.error('Export failed. Please try again.', { id: toastId });
      } finally {
        setIsExporting(false);
      }
    },
    [triggerConfetti]
  );

  const downloadSvg = useCallback(
    async (filename: string = 'codesnap.svg', targetId: string = 'export-container') => {
      const element = document.getElementById(targetId);
      if (!element) {
        toast.error('Container element not found');
        return;
      }

      setIsExporting(true);
      const toastId = toast.loading('Exporting SVG...');

      try {
        await new Promise((res) => setTimeout(res, 100));

        const dataUrl = await toSvg(element, {
          cacheBust: true,
        });

        const link = document.createElement('a');
        link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
        link.href = dataUrl;
        link.click();

        toast.success('SVG exported successfully!', { id: toastId });
        triggerConfetti();
      } catch (err) {
        console.error('Failed to export SVG:', err);
        toast.error('SVG export failed.', { id: toastId });
      } finally {
        setIsExporting(false);
      }
    },
    [triggerConfetti]
  );

  const copyToClipboard = useCallback(
    async (pixelRatio: number = 3, targetId: string = 'export-container') => {
      const element = document.getElementById(targetId);
      if (!element) {
        toast.error('Container element not found');
        return;
      }

      setIsExporting(true);
      const toastId = toast.loading('Generating image blob...');

      try {
        await new Promise((res) => setTimeout(res, 100));

        const blob = await toBlob(element, {
          pixelRatio,
          cacheBust: true,
        });

        if (!blob) {
          throw new Error('Failed to generate image blob');
        }

        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          toast.success('Copied image to clipboard!', { id: toastId });
          triggerConfetti();
        } else {
          toast.error('Clipboard API for images not supported by browser', { id: toastId });
        }
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        toast.error('Failed to copy image to clipboard.', { id: toastId });
      } finally {
        setIsExporting(false);
      }
    },
    [triggerConfetti]
  );

  return {
    isExporting,
    downloadPng,
    downloadSvg,
    copyToClipboard,
  };
}
