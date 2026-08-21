import React, { useState, useRef } from 'react';
import type { SnippetSettings, SnippetTab } from '../types';
import { WindowFrame } from './WindowFrame';
import { CodeEditor } from './CodeEditor';
import { INITIAL_CODE_SAMPLES } from '../utils/defaults';
import { GripVertical } from 'lucide-react';

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

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 my-auto relative">
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

          {/* Optional Branding Watermark Badge */}
          {watermark && (watermarkText || settings.watermarkAvatar) && (
            <div className="w-full flex justify-end mt-3 px-1 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium tracking-wide text-white/70 backdrop-blur-md bg-black/40 px-3 py-1 rounded-full border border-white/10 shadow-xs">
                {settings.watermarkAvatar && (
                  <img
                    src={settings.watermarkAvatar}
                    alt="Custom Avatar/Logo"
                    className="w-4 h-4 rounded-full object-cover border border-white/20"
                  />
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
