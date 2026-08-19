import React from 'react';
import type { SnippetSettings, SnippetTab } from '../types';
import { WindowFrame } from './WindowFrame';
import { CodeEditor } from './CodeEditor';
import { INITIAL_CODE_SAMPLES } from '../utils/defaults';

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
  } = settings;

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
      title: `utils-${tabs.length + 1}.ts`,
      language: 'typescript',
      code: `// New file tab\nexport function example() {\n  console.log("Hello CodeMotion");\n}`,
    };
    setSettings((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newId,
    }));
  };

  const handleRemoveTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const filtered = tabs.filter((t) => t.id !== tabId);
    const nextActive = activeTabId === tabId ? filtered[0].id : activeTabId;
    setSettings((prev) => ({
      ...prev,
      tabs: filtered,
      activeTabId: nextActive,
      controlledTypedLength: null,
      isPlayingMotion: false,
    }));
  };

  const handleMotionFinish = () => {
    setSettings((prev) => ({ ...prev, isPlayingMotion: false }));
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

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 my-auto">
      {/* Outer Export Container Target Element */}
      <div
        id="export-container"
        className={`w-full max-w-4xl relative flex flex-col items-center overflow-hidden transition-all duration-300 ${getAspectRatioStyle()}`}
        style={{
          background: background,
          borderRadius: `${borderRadius}px`,
          padding: `clamp(12px, 4vw, ${padding}px)`,
        }}
      >
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
              motionSpeed={motionSpeed}
              isPlayingMotion={isPlayingMotion}
              controlledTypedLength={controlledTypedLength}
              onMotionFinish={handleMotionFinish}
            />
          </WindowFrame>
        </div>

        {/* Optional Branding Watermark Badge */}
        {watermark && watermarkText && (
          <div className="w-full flex justify-end mt-3 px-1 pointer-events-none select-none">
            <span className="text-[11px] font-mono font-medium tracking-wide text-white/50 backdrop-blur-md bg-black/30 px-2.5 py-1 rounded-full border border-white/10 shadow-xs">
              {watermarkText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
