import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { SnippetSettings } from '../types';
import { detectLanguageFromCode } from '../utils/languages';

const MAX_IMPORT_BYTES = 200_000;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.closest('.cm-editor') !== null
  );
}

interface UseCodeImportOptions {
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}

export function useCodeImport({ setSettings }: UseCodeImportOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  const loadTextIntoActiveTab = useCallback(
    (text: string, title: string) => {
      const detected = detectLanguageFromCode(text);
      setSettings((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? { ...t, code: text, title, language: detected || t.language }
            : t
        ),
      }));
      return detected;
    },
    [setSettings]
  );

  const loadFile = useCallback(
    (file: File) => {
      if (file.type.startsWith('image/')) {
        if (file.size > MAX_IMPORT_BYTES) {
          toast.error('Image is too large. Maximum is 200 KB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result;
          if (typeof dataUrl === 'string') {
            setSettings((prev) => ({ ...prev, watermarkAvatar: dataUrl }));
            toast.success('Avatar / logo updated');
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      if (file.size > MAX_IMPORT_BYTES) {
        toast.error('File is too large. Maximum is 200 KB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content !== 'string') return;
        const detected = loadTextIntoActiveTab(content, file.name);
        const langLabel = detected ? detected.charAt(0).toUpperCase() + detected.slice(1) : 'Text';
        toast.success(`File "${file.name}" imported (Detected: ${langLabel})`);
      };
      reader.readAsText(file);
    },
    [loadTextIntoActiveTab, setSettings]
  );

  // Drag & drop import across the whole workspace
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current += 1;
      setIsDragging(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current -= 1;
      if (dragDepthRef.current <= 0) {
        dragDepthRef.current = 0;
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDragging(false);

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      loadFile(file);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [loadFile]);

  // Paste import when focus is outside any editable surface
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const files = Array.from(e.clipboardData?.files || []);
      if (files.length > 0) {
        e.preventDefault();
        loadFile(files[0]);
        return;
      }

      const text = e.clipboardData?.getData('text/plain');
      if (text && text.trim()) {
        e.preventDefault();
        const detected = loadTextIntoActiveTab(text, 'pasted-code.txt');
        const langLabel = detected
          ? detected.charAt(0).toUpperCase() + detected.slice(1)
          : 'Text';
        toast.success(`Code pasted into editor (Detected: ${langLabel})`);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadFile, loadTextIntoActiveTab]);

  return { isDragging };
}
