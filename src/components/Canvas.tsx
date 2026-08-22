import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { SnippetSettings, SnippetTab } from '../types';
import { WindowFrame } from './WindowFrame';
import { CodeEditor } from './CodeEditor';
import { INITIAL_CODE_SAMPLES } from '../utils/defaults';
import { detectLanguageFromCode } from '../utils/languages';
import { GripVertical, FileUp, User } from 'lucide-react';

interface CanvasProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}

export const Canvas: React.FC<CanvasProps> = ({ settings, setSettings }) => {
  const {
    tabs,
    activeTabId,
    diffMode,
    motionSpeed,
    isPlayingMotion,
    controlledTypedLength,
    theme,
    fontFamily,
    fontSize,
    lineHeight,
    lineNumbers,
    padding,
    background,
    windowStyle,
    watermark,
    watermarkText,
    aspectRatio,
    borderRadius,
    canvasWidth = 800,
  } = settings;

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTab: SnippetTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || {
    id: 'tab-1',
    title: 'App.tsx',
    language: 'typescript',
    code: INITIAL_CODE_SAMPLES.typescript,
  };

  const handleCodeChange = (newCode: string) => {
    setSettings((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === activeTab.id ? { ...t, code: newCode } : t)),
    }));
  };

  const handleSelectTab = (tabId: string) => {
    setSettings((prev) => ({ ...prev, activeTabId: tabId }));
  };

  const handleUpdateTabTitle = (tabId: string, newTitle: string) => {
    setSettings((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, title: newTitle } : t)),
    }));
  };

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: SnippetTab = {
      id: newId,
      title: `file-${tabs.length + 1}.tsx`,
      language: 'typescript',
      code: '// Type code here...',
    };
    setSettings((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newId,
    }));
  };

  const handleRemoveTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    const nextActive = activeTabId === tabId ? remaining[0].id : activeTabId;
    setSettings((prev) => ({
      ...prev,
      tabs: remaining,
      activeTabId: nextActive,
    }));
  };

  const handleMotionFinish = () => {
    setSettings((prev) => ({ ...prev, isPlayingMotion: false }));
  };

  // Interactive Drag-to-Resize Canvas Logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = canvasWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) * 2; // dual-directional resize expand
      const newWidth = Math.min(Math.max(startWidth + deltaX, 420), 1080);
      setSettings((prev) => ({ ...prev, canvasWidth: Math.round(newWidth) }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square justify-center';
      case '4:3':
        return 'aspect-[4/3] justify-center';
      case '16:9':
        return 'aspect-[16/9] justify-center';
      case '9:16':
        return 'aspect-[9/16] justify-center';
      default:
        return 'h-auto';
    }
  };

  const handleToggleFocusedLine = (lineNum: number) => {
    setSettings((prev) => {
      const current = prev.focusedLines || [];
      const exists = current.includes(lineNum);
      const updated = exists ? current.filter((l) => l !== lineNum) : [...current, lineNum];
      return { ...prev, focusedLines: updated };
    });
  };

  // --- Drag & Drop File Import ---
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (file.size > 100_000) {
      toast.error('File terlalu besar. Maksimum 100 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;

      // Detect language strictly from actual code content
      const detected = detectLanguageFromCode(content);

      setSettings((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? { ...t, code: content, title: file.name, language: detected || t.language }
            : t
        ),
      }));

      toast.success(`File "${file.name}" berhasil di-import ke editor`);
    };
    reader.readAsText(file);
  }, [setSettings]);

  return (
    <div
      className="w-full flex items-center justify-center p-2 sm:p-4 my-auto relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-zinc-400 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-zinc-200">
            <FileUp className="w-8 h-8" />
            <span className="text-sm font-bold tracking-tight">Drop file to import code</span>
            <span className="text-xs text-zinc-400">Supports .ts, .py, .rs, .go, .js, .html, .css, and more</span>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col items-center relative">
        {/* Outer Export Container Target Element */}
        <div
          ref={containerRef}
          id="export-container"
          className={`w-full relative flex flex-col items-center overflow-hidden transition-all duration-150 ${
            isResizing ? 'select-none ring-2 ring-sky-500/50' : ''
          } ${getAspectRatioStyle()}`}
          style={{
            maxWidth: `${canvasWidth}px`,
            background: background,
            borderRadius: `${borderRadius}px`,
            padding: `clamp(12px, 4vw, ${padding}px)`,
          }}
        >
          {/* Left & Right Drag Handles */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-12 rounded-full bg-black/40 hover:bg-sky-500/80 border border-white/20 flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all z-30 shadow-lg"
            title="Drag to resize canvas width"
          >
            <GripVertical className="w-3 h-3 text-white" />
          </div>

          <div
            onMouseDown={handleResizeStart}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-12 rounded-full bg-black/40 hover:bg-sky-500/80 border border-white/20 flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all z-30 shadow-lg"
            title="Drag to resize canvas width"
          >
            <GripVertical className="w-3 h-3 text-white" />
          </div>

          {/* Inner Code Window Frame */}
          <div className="w-full my-auto transition-all duration-300">
            <WindowFrame
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={handleSelectTab}
              onUpdateTabTitle={handleUpdateTabTitle}
              onAddTab={handleAddTab}
              onRemoveTab={handleRemoveTab}
              windowStyle={windowStyle}
              language={activeTab.language}
            >
              <CodeEditor
                code={activeTab.code}
                onChange={handleCodeChange}
                language={activeTab.language}
                theme={theme}
                fontFamily={fontFamily}
                fontSize={fontSize}
                lineHeight={lineHeight}
                showLineNumbers={lineNumbers}
                diffMode={diffMode}
                focusedLines={settings.focusedLines}
                annotations={settings.annotations}
                onToggleFocusedLine={handleToggleFocusedLine}
                motionSpeed={motionSpeed}
                isPlayingMotion={isPlayingMotion}
                controlledTypedLength={controlledTypedLength}
                onMotionFinish={handleMotionFinish}
              />
            </WindowFrame>
          </div>

          {/* Branding & Author Watermark Badge */}
          {watermark && (watermarkText || settings.watermarkAvatar) && (
            <div className="w-full flex justify-end mt-3 px-1 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium tracking-wide text-zinc-300 backdrop-blur-md bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800/80 shadow-md">
                {settings.watermarkAvatar ? (
                  <img
                    src={settings.watermarkAvatar}
                    alt="Custom Avatar/Logo"
                    className="w-3.5 h-3.5 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <User className="w-3 h-3 text-zinc-400" />
                )}
                {watermarkText && <span>{watermarkText}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Canvas Dimension Indicator Label */}
        <div className="mt-2 text-[11px] font-mono font-medium text-zinc-500 flex items-center gap-2">
          <span>Width: {canvasWidth}px</span>
          <span>•</span>
          <span>Aspect Ratio: {aspectRatio}</span>
        </div>
      </div>
    </div>
  );
};
