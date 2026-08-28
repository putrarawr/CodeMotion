import { useState, useCallback } from 'react';
import { toPng, toSvg, toBlob } from 'html-to-image';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import type { SnippetSettings, LibrarySnapshot } from '../types';

function filterExportNodes(node: HTMLElement): boolean {
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

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a'],
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
          skipFonts: true,
          filter: filterExportNodes,
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
          skipFonts: true,
          filter: filterExportNodes,
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
      const toastId = toast.loading('Copying image to clipboard...');

      try {
        await new Promise((res) => setTimeout(res, 100));

        const blob = await toBlob(element, {
          pixelRatio,
          cacheBust: true,
          skipFonts: true,
          filter: filterExportNodes,
        });

        if (!blob) {
          throw new Error('Failed to generate image blob');
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);

        toast.success('Image copied to clipboard!', { id: toastId });
        triggerConfetti();
      } catch (err) {
        console.error('Failed to copy image:', err);
        toast.error('Failed to copy image to clipboard.', { id: toastId });
      } finally {
        setIsExporting(false);
      }
    },
    [triggerConfetti]
  );

  const batchExportZip = useCallback(
    async (
      snapshots: LibrarySnapshot[],
      currentSettings: SnippetSettings,
      setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>,
      onProgress: (pct: number) => void,
      targetId: string = 'export-container'
    ) => {
      if (snapshots.length === 0) {
        toast.info('No snapshots available to export.');
        return;
      }

      const element = document.getElementById(targetId);
      if (!element) {
        toast.error('Container element not found');
        return;
      }

      setIsExporting(true);
      onProgress(1);
      const zip = new JSZip();

      try {
        for (let i = 0; i < snapshots.length; i++) {
          const snap = snapshots[i];
          // Temporarily apply snapshot settings
          setSettings((prev) => ({
            ...snap.settings,
            appTheme: prev.appTheme,
            isPlayingMotion: false,
            controlledTypedLength: null,
          }));

          // Wait for DOM paint and CodeMirror re-render
          await new Promise((res) => setTimeout(res, 200));

          const dataUrl = await toPng(element, {
            pixelRatio: 2,
            cacheBust: true,
            skipFonts: true,
            filter: filterExportNodes,
          });

          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const cleanName = (snap.name || `snapshot-${i + 1}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          zip.file(`codemotion-${cleanName}.png`, base64Data, { base64: true });

          onProgress(Math.floor(((i + 1) / snapshots.length) * 90));
        }

        onProgress(92);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        onProgress(98);

        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codemotion-snapshots-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        onProgress(100);
        toast.success(`Successfully exported ${snapshots.length} snapshots as ZIP!`);
        triggerConfetti();
      } catch (err) {
        console.error('Failed batch export:', err);
        toast.error('Batch export failed.');
      } finally {
        // Restore original settings
        setSettings((prev) => ({
          ...currentSettings,
          appTheme: prev.appTheme,
          isPlayingMotion: false,
          controlledTypedLength: null,
        }));
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
    batchExportZip,
  };
}
