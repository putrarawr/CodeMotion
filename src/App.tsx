import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useExport } from './hooks/useExport';
import { useSEO } from './hooks/useSEO';
import type { SnippetSettings } from './types';
import { DEFAULT_SETTINGS } from './utils/defaults';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ControlPanel } from './components/ControlPanel';
import { PresetBar } from './components/PresetBar';
import { LandingPage } from './components/LandingPage';
import { VideoLoadingOverlay } from './components/VideoLoadingOverlay';
import { UserJourneyTour } from './components/UserJourneyTour';
import { Toaster, toast } from 'sonner';
import { recordMotionVideo, downloadBlob } from './utils/recorder';
import { decodeStateFromHash } from './utils/urlEncoder';

function EditorWorkspace({
  settings,
  setSettings,
}: {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}) {
  const { isExporting, downloadPng, downloadSvg, copyToClipboard } = useExport();
  const [recordingProgress, setRecordingProgress] = useState<number | null>(null);

  // Modals state
  const [isUserTourOpen, setIsUserTourOpen] = useState(false);

  const isDark = settings.appTheme === 'dark';

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  const handleRecordVideo = async () => {
    const exportEl = document.getElementById('export-container');
    if (!exportEl) {
      toast.error('Export element not found');
      return;
    }

    try {
      setRecordingProgress(0);

      const totalChars = activeTab?.code?.length || 100;

      const videoBlob = await recordMotionVideo({
        element: exportEl,
        totalChars,
        motionSpeed: settings.motionSpeed || 1,
        onSetTypedLength: (len) => {
          setSettings((prev) => ({
            ...prev,
            controlledTypedLength: len,
            isPlayingMotion: true,
          }));
        },
        onProgress: (pct) => setRecordingProgress(pct),
      });

      const filename = `${activeTab?.title ? activeTab.title.replace(/\.[^/.]+$/, '') : 'codemotion'}-motion.webm`;
      downloadBlob(videoBlob, filename);
      toast.success('Motion Code Video exported successfully!');
    } catch (err) {
      console.error('Failed to record video:', err);
      toast.error('Failed to record Motion Video.');
    } finally {
      setRecordingProgress(null);
      setSettings((prev) => ({
        ...prev,
        controlledTypedLength: null,
        isPlayingMotion: false,
      }));
    }
  };

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

  // First time tour check for Editor
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('codemotion_tour_completed');
    if (!hasSeenTour) {
      setIsUserTourOpen(true);
      localStorage.setItem('codemotion_tour_completed', 'true');
    }
  }, []);

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

      {/* Full Screen Video Recording Overlay Spinner */}
      <AnimatePresence>
        {recordingProgress !== null && (
          <VideoLoadingOverlay progress={recordingProgress} isDark={isDark} />
        )}
      </AnimatePresence>

      {/* Interactive User Journey Tour Modal */}
      <UserJourneyTour
        isOpen={isUserTourOpen}
        onClose={() => setIsUserTourOpen(false)}
        isDark={isDark}
      />

      {/* Editor Header Bar */}
      <Header
        settings={settings}
        setSettings={setSettings}
        onCopyImage={() => copyToClipboard(3, 'export-container')}
        onDownloadPng={(ratio) => downloadPng(ratio, activeTab?.title || 'codesnap.png', 'export-container')}
        onDownloadSvg={() => downloadSvg(activeTab?.title || 'codesnap.svg', 'export-container')}
        onRecordVideo={handleRecordVideo}
        onReset={handleReset}
        onOpenUserTour={() => setIsUserTourOpen(true)}
        isExporting={isExporting || recordingProgress !== null}
      />

      {/* Main Workspace Layout (Canvas & Sidebar) */}
      <div className="flex-1 w-full flex flex-col min-h-0">
        <main className="flex-1 lg:h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Preview Area: Centered Canvas & Preset Bar (Independent Scroll) */}
          <div
            className={`lg:col-span-8 h-full overflow-y-auto min-h-0 flex flex-col items-center p-4 sm:p-6 relative ${
              isDark ? 'bg-zinc-950/40' : 'bg-zinc-100/40'
            }`}
          >
            {/* Quick Styles Bar Positioned Directly Above Canvas */}
            <div className="w-full flex justify-center mb-2 z-10">
              <PresetBar settings={settings} setSettings={setSettings} />
            </div>

            <div className="w-full flex-1 flex items-center justify-center my-auto">
              <Canvas settings={settings} setSettings={setSettings} />
            </div>
          </div>

          {/* Right Customization Sidebar (Independent Scroll) */}
          <div className="lg:col-span-4 h-full overflow-y-auto min-h-0">
            <ControlPanel
              settings={settings}
              setSettings={setSettings}
              onRecordVideo={handleRecordVideo}
              recordingProgress={recordingProgress}
            />
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
  const navigate = useNavigate();

  // Dynamic SEO Hook for route changes
  useSEO();

  // Check URL hash/search for share code on any route change or initial load
  useEffect(() => {
    const rawUrl = window.location.hash || window.location.search;
    if (rawUrl && (rawUrl.includes('code=') || rawUrl.includes('#'))) {
      const decodedSettings = decodeStateFromHash(rawUrl);
      if (decodedSettings) {
        setSettings((prev) => ({
          ...prev,
          ...decodedSettings,
          isPlayingMotion: false,
          controlledTypedLength: null,
        }));

        toast.success('Loaded shared code snippet from link!');

        if (location.pathname !== '/editor') {
          navigate('/editor', { replace: true });
        }
      }
    }
  }, [location.pathname, location.hash, location.search, navigate, setSettings]);

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
        {/* SPA Fallback route to prevent 404 on direct subroutes */}
        <Route path="*" element={<Navigate to="/editor" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [settings, setSettings] = useLocalStorage<SnippetSettings>(
    'codemotion_settings',
    DEFAULT_SETTINGS
  );

  useEffect(() => {
    if (settings.appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.appTheme]);

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
