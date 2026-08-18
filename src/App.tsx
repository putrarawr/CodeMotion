import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useExport } from './hooks/useExport';
import type { SnippetSettings } from './types';
import { DEFAULT_SETTINGS } from './utils/defaults';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { PresetBar } from './components/PresetBar';
import { LandingPage } from './components/LandingPage';
import { Toaster } from 'sonner';

function EditorWorkspace({
  settings,
  setSettings,
}: {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}) {
  const { isExporting, downloadPng, downloadSvg, copyToClipboard } = useExport();
  const isDark = settings.appTheme === 'dark';

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadPng(3, activeTab?.title || 'codesnap.png', 'export-container');
      }
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyToClipboard(3, 'export-container');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [downloadPng, copyToClipboard, activeTab?.title]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`min-h-screen lg:h-screen lg:overflow-hidden flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      <Toaster position="bottom-right" theme={isDark ? 'dark' : 'light'} closeButton />

      {/* Editor Header Bar */}
      <Header
        settings={settings}
        setSettings={setSettings}
        onCopyImage={() => copyToClipboard(3, 'export-container')}
        onDownloadPng={(ratio) => downloadPng(ratio, activeTab?.title || 'codesnap.png', 'export-container')}
        onDownloadSvg={() => downloadSvg(activeTab?.title || 'codesnap.svg', 'export-container')}
        onReset={handleReset}
        isExporting={isExporting}
      />

      {/* Main Workspace Layout (Canvas & Sidebar) */}
      <div className="flex-1 w-full flex flex-col min-h-0">
        <main className="flex-1 lg:h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Preview Area: Centered Canvas & Preset Bar (Independent Scroll) */}
          <div
            className={`lg:col-span-8 h-full overflow-y-auto min-h-0 flex flex-col items-center justify-between p-4 sm:p-6 relative ${
              isDark ? 'bg-zinc-950/40' : 'bg-zinc-100/40'
            }`}
          >
            <div className="w-full flex-1 flex items-center justify-center my-auto py-4">
              <Canvas settings={settings} setSettings={setSettings} />
            </div>

            <div className="w-full max-w-4xl mt-4">
              <PresetBar settings={settings} setSettings={setSettings} />
            </div>
          </div>

          {/* Right Customization Sidebar (Independent Scroll) */}
          <div className="lg:col-span-4 h-full overflow-y-auto min-h-0">
            <ControlPanel settings={settings} setSettings={setSettings} />
          </div>
        </main>
      </div>
    </motion.div>
  );
}

function AnimatedRoutes({
  settings,
  setSettings,
  toggleAppTheme,
}: {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  toggleAppTheme: () => void;
}) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<LandingPage settings={settings} onToggleAppTheme={toggleAppTheme} />}
        />
        <Route
          path="/editor"
          element={<EditorWorkspace settings={settings} setSettings={setSettings} />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [settings, setSettings] = useLocalStorage<SnippetSettings>('codesnap_settings', DEFAULT_SETTINGS);

  const toggleAppTheme = () => {
    setSettings((prev) => ({
      ...prev,
      appTheme: prev.appTheme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <BrowserRouter>
      <AnimatedRoutes
        settings={settings}
        setSettings={setSettings}
        toggleAppTheme={toggleAppTheme}
      />
    </BrowserRouter>
  );
}
