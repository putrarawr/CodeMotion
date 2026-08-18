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
    theme,
    fontFamily,
    fontSize,
    lineHeight,
    lineNumbers,
    padding,
    background,
    windowStyle,
    dropShadow,
    shadowBlur,
    watermark,
    watermarkText,
    aspectRatio,
    borderRadius,
  } = settings;

  // Active tab resolution with fallback
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
      code: `// New file tab\nexport function example() {\n  console.log("Hello CodeSnap");\n}`,
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
    }));
  };

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square justify-center';
      case '4:3':
        return 'aspect-[4/3] justify-center';
      case '16:9':
        return 'aspect-[16/9] justify-center';
      default:
        return 'h-auto';
    }
  };

  const isTransparent = background === 'transparent';

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-6 min-h-[460px]">
      <div
        className={`relative w-full max-w-4xl transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl ${
          isTransparent ? 'bg-checkerboard border border-zinc-800' : ''
        }`}
      >
        {/* Export Target Container */}
        <div
          id="export-container"
          className={`w-full flex flex-col items-center transition-all duration-200 ${getAspectRatioStyle()}`}
          style={{
            background: background,
            padding: `${padding}px`,
            borderRadius: `${borderRadius}px`,
          }}
        >
          <div
            className="w-full transition-all duration-200"
            style={{
              boxShadow: dropShadow
                ? `0 ${shadowBlur / 2}px ${shadowBlur}px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)`
                : '0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            <WindowFrame
              windowStyle={windowStyle}
              tabs={tabs}
              activeTabId={activeTab.id}
              onSelectTab={handleSelectTab}
              onUpdateTabTitle={handleUpdateTabTitle}
              onAddTab={handleAddTab}
              onRemoveTab={handleRemoveTab}
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
              />
            </WindowFrame>
          </div>

          {watermark && watermarkText && (
            <div className="w-full flex justify-end mt-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-[11px] font-medium font-sans text-zinc-300 tracking-wider bg-zinc-950/40 px-2.5 py-0.5 rounded-full border border-white/10 select-none">
                {watermarkText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
