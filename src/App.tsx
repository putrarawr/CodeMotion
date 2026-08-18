import { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useExport } from './hooks/useExport';
import type { SnippetSettings } from './types';
import { DEFAULT_SETTINGS } from './utils/defaults';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { PresetBar } from './components/PresetBar';
import { Toaster } from 'sonner';

export default function App() {
  const [settings, setSettings] = useLocalStorage<SnippetSettings>('codesnap_settings', DEFAULT_SETTINGS);

  const { isExporting, downloadPng, downloadSvg, copyToClipboard } = useExport();

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const isDark = settings.appTheme === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadPng(3, settings.title || 'codesnap.png', 'export-container');
      }
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyToClipboard(3, 'export-container');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [downloadPng, copyToClipboard, settings.title]);

  return (
    <div
      className={`min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      <Toaster position="bottom-right" theme={isDark ? 'dark' : 'light'} closeButton />

      {/* Top Header */}
      <Header
        settings={settings}
        setSettings={setSettings}
        onCopyImage={() => copyToClipboard(3, 'export-container')}
        onDownloadPng={(ratio) => downloadPng(ratio, settings.title || 'codesnap.png', 'export-container')}
        onDownloadSvg={() => downloadSvg(settings.title || 'codesnap.svg', 'export-container')}
        onReset={handleReset}
        isExporting={isExporting}
      />

      {/* Workspace & Control Panel Grid */}
      <main className="flex-1 lg:h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
        {/* Left Column: Canvas Preview Area */}
        <div
          className={`lg:col-span-8 flex flex-col justify-between h-full overflow-y-auto min-h-0 ${
            isDark ? 'bg-zinc-950/40' : 'bg-zinc-100/40'
          }`}
        >
          <Canvas settings={settings} setSettings={setSettings} />
          <PresetBar settings={settings} setSettings={setSettings} />
        </div>

        {/* Right Column: Customization Sidebar */}
        <div className="lg:col-span-4 h-full overflow-y-auto min-h-0">
          <ControlPanel settings={settings} setSettings={setSettings} />
        </div>
      </main>
    </div>
  );
}
