import { useEffect, useState, useRef } from 'react';
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
import { TemplateGalleryPage } from './components/TemplateGalleryPage';
import { VideoLoadingOverlay } from './components/VideoLoadingOverlay';
import { UserJourneyTour } from './components/UserJourneyTour';
import { ThankYouModal } from './components/ThankYouModal';
import { Toaster, toast } from 'sonner';
import { recordMotionVideo, downloadBlob } from './utils/recorder';
import { decodeStateFromHash } from './utils/urlEncoder';
import { useCodeImport } from './hooks/useCodeImport';
import { useSettingsHistory } from './hooks/useSettingsHistory';
import type { LibrarySnapshot } from './types';
import { FileUp } from 'lucide-react';

import { LivePairRoomPage } from './components/LivePairRoomPage';
import { PresentationDeckModal } from './components/PresentationDeckModal';
import { type Language } from './utils/i18n';

function EditorWorkspace({
  settings,
  setSettings,
  language,
  setLanguage,
}: {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  language: Language;
  setLanguage: (lang: Language) => void;
}) {
  const { isExporting, downloadPng, downloadSvg, copyToClipboard, batchExportZip } = useExport();
  const { undo, redo, canUndo, canRedo } = useSettingsHistory(settings, setSettings);

  const [recordingProgress, setRecordingProgress] = useState<number | null>(null);
  const [batchExportProgress, setBatchExportProgress] = useState<number | null>(null);
  const { isDragging } = useCodeImport({ setSettings });

  // Modals state
  const [isUserTourOpen, setIsUserTourOpen] = useState(() => {
    return localStorage.getItem('codemotion_tour_seen') !== 'true';
  });
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isPresentationDeckOpen, setIsPresentationDeckOpen] = useState(false);

  const handleCloseUserTour = () => {
    setIsUserTourOpen(false);
    localStorage.setItem('codemotion_tour_seen', 'true');
  };

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];
  const isDark = settings.appTheme === 'dark';

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const isCancelledRef = useRef(false);
  const isRecordingRef = useRef(false);

  const handleRecordVideo = async () => {
    const exportEl = document.getElementById('export-container');
    if (!exportEl) {
      toast.error('Export element not found');
      return;
    }
    if (isRecordingRef.current) return;
    isRecordingRef.current = true;

    try {
      isCancelledRef.current = false;
      setRecordingProgress(0);

      const totalChars = activeTab?.code?.length || 100;

      const { blob, filename } = await recordMotionVideo({
        element: exportEl,
        code: activeTab?.code || '',
        totalChars,
        motionSpeed: settings.motionSpeed || 1,
        fps: settings.motionFps || 60,
        motionStyle: settings.motionStyle || 'typewriter',
        exportFormat: settings.motionExportFormat || 'mp4',
        isCancelled: () => isCancelledRef.current,
        onSetTypedLength: (len) => {
          setSettings((prev) => ({
            ...prev,
            controlledTypedLength: len,
          }));
        },
        onProgress: (pct) => setRecordingProgress(pct),
      });

      const rawTitle = activeTab?.title || 'snippet';
      const titleWithoutExt = rawTitle.replace(/\.[^/.]+$/, '');
      const cleanTitle = titleWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-');
      const ext = filename.split('.').pop() || (settings.motionExportFormat === 'gif' ? 'gif' : 'mp4');
      const customFilename = `codemotion-${cleanTitle}.${ext}`;

      downloadBlob(blob, customFilename);
      const formatLabel = settings.motionExportFormat === 'gif' ? 'Animated GIF' : 'MP4 Video';
      toast.success(`Motion Code ${formatLabel} exported successfully!`);
      setIsThankYouOpen(true);
    } catch (err: any) {
      if (err?.message === 'CANCELLED') {
        toast.info('Export cancelled.');
      } else {
        console.error('Failed to record motion file:', err);
        toast.error('Failed to export Motion file.');
      }
    } finally {
      isRecordingRef.current = false;
      setRecordingProgress(null);
      setSettings((prev) => ({
        ...prev,
        controlledTypedLength: null,
      }));
    }
  };

  const handleBatchExportZip = async () => {
    let snapshots: LibrarySnapshot[] = [];
    try {
      snapshots = JSON.parse(localStorage.getItem('codemotion_library') || '[]');
    } catch {}

    if (snapshots.length === 0) {
      toast.info('No saved snapshots in library.');
      return;
    }

    setBatchExportProgress(0);
    await batchExportZip(snapshots, settings, setSettings, (pct) => setBatchExportProgress(pct));
    setBatchExportProgress(null);
    setIsThankYouOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const rawTitle = activeTab?.title || 'snippet';
        const titleWithoutExt = rawTitle.replace(/\.[^/.]+$/, '');
        const cleanTitle = titleWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-');
        downloadPng(3, `codemotion-${cleanTitle}.png`, 'export-container').then(() => setIsThankYouOpen(true));
      }
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyToClipboard(3, 'export-container').then(() => setIsThankYouOpen(true));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [downloadPng, copyToClipboard, activeTab?.title]);

  // Trigger User Guide Tour once when user enters /editor
  useEffect(() => {
    const hasSeenTour = sessionStorage.getItem('codemotion_tour_session_shown');
    if (!hasSeenTour) {
      setIsUserTourOpen(true);
      sessionStorage.setItem('codemotion_tour_session_shown', 'true');
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
      <Toaster position="bottom-right" theme={isDark ? 'dark' : 'light'} visibleToasts={2} duration={2500} closeButton />

      {/* Full Screen Video Recording Overlay Spinner */}
      <AnimatePresence>
        {recordingProgress !== null && (
          <VideoLoadingOverlay
            progress={recordingProgress}
            isDark={isDark}
            onCancel={() => {
              isCancelledRef.current = true;
            }}
          />
        )}
      </AnimatePresence>

      {/* Workspace-wide Drag & Drop Import Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-zinc-400" />
          <div className="relative flex flex-col items-center gap-2 text-zinc-200 select-none">
            <FileUp className="w-10 h-10" />
            <span className="text-sm font-bold tracking-tight">Drop file to import</span>
            <span className="text-xs text-zinc-400">
              Code files load into the editor — images become your avatar / logo
            </span>
          </div>
        </div>
      )}

      <UserJourneyTour
        isOpen={isUserTourOpen}
        onClose={handleCloseUserTour}
        isDark={isDark}
      />

      <ThankYouModal
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
        isDark={isDark}
      />

      <PresentationDeckModal
        isOpen={isPresentationDeckOpen}
        onClose={() => setIsPresentationDeckOpen(false)}
        isDark={isDark}
        librarySnapshots={(() => {
          try {
            return JSON.parse(localStorage.getItem('codemotion_library') || '[]');
          } catch {
            return [];
          }
        })()}
        currentSettings={settings}
      />

      <Header
        settings={settings}
        setSettings={setSettings}
        language={language}
        onLanguageChange={setLanguage}
        onCopyImage={async () => {
          await copyToClipboard(3, 'export-container');
          setIsThankYouOpen(true);
        }}
        onDownloadPng={async (ratio) => {
          const rawTitle = activeTab?.title || 'snippet';
          const titleWithoutExt = rawTitle.replace(/\.[^/.]+$/, '');
          const cleanTitle = titleWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-');
          await downloadPng(ratio, `codemotion-${cleanTitle}.png`, 'export-container');
          setIsThankYouOpen(true);
        }}
        onDownloadSvg={async () => {
          const rawTitle = activeTab?.title || 'snippet';
          const titleWithoutExt = rawTitle.replace(/\.[^/.]+$/, '');
          const cleanTitle = titleWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-');
          await downloadSvg(`codemotion-${cleanTitle}.svg`, 'export-container');
          setIsThankYouOpen(true);
        }}
        onRecordVideo={handleRecordVideo}
        onReset={handleReset}
        onOpenUserTour={() => setIsUserTourOpen(true)}
        onOpenPresentationDeck={() => setIsPresentationDeckOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isExporting={isExporting || recordingProgress !== null || batchExportProgress !== null}
      />

      <div className="flex-1 w-full flex flex-col min-h-0 pt-16 sm:pt-16">
        <main className="flex-1 lg:h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          <div
            className={`lg:col-span-8 h-full overflow-y-auto min-h-0 flex flex-col items-center p-4 sm:p-6 relative ${
              isDark ? 'bg-zinc-950/40' : 'bg-zinc-100/40'
            }`}
          >
            <div className="w-full flex justify-center mb-2 z-10">
              <PresetBar settings={settings} setSettings={setSettings} />
            </div>

            <div className="w-full flex-1 flex items-center justify-center my-auto">
              <Canvas settings={settings} setSettings={setSettings} />
            </div>
          </div>

          <div className="lg:col-span-4 h-full overflow-y-auto min-h-0">
            <ControlPanel
              settings={settings}
              setSettings={setSettings}
              onRecordVideo={handleRecordVideo}
              recordingProgress={recordingProgress}
              onBatchExportZip={handleBatchExportZip}
              batchExportProgress={batchExportProgress}
              onOpenPresentationDeck={() => setIsPresentationDeckOpen(true)}
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
  language,
  setLanguage,
}: {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  language: Language;
  setLanguage: (lang: Language) => void;
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

        if (decodedSettings.watermarkText) {
          toast.success(`Shared snippet by ${decodedSettings.watermarkText} loaded!`);
        } else {
          toast.success('Loaded shared code snippet from link!');
        }

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
          element={
            <LandingPage
              settings={settings}
              language={language}
              onLanguageChange={setLanguage}
              onSelectTemplate={(template) => {
                setSettings((prev) => ({
                  ...prev,
                  theme: template.theme || prev.theme,
                  background: template.background || prev.background,
                  tabs: prev.tabs.map((t) =>
                    t.id === prev.activeTabId
                      ? { ...t, code: template.code, title: template.fileName, language: template.language }
                      : t
                  ),
                }));
                navigate('/editor');
              }}
            />
          }
        />
        <Route
          path="/templates"
          element={
            <TemplateGalleryPage
              settings={settings}
              language={language}
              onLanguageChange={setLanguage}
              onSelectTemplate={(template) => {
                setSettings((prev) => ({
                  ...prev,
                  theme: template.theme || prev.theme,
                  background: template.background || prev.background,
                  tabs: prev.tabs.map((t) =>
                    t.id === prev.activeTabId
                      ? { ...t, code: template.code, title: template.fileName, language: template.language }
                      : t
                  ),
                }));
                navigate('/editor');
              }}
            />
          }
        />

        <Route
          path="/editor"
          element={<EditorWorkspace settings={settings} setSettings={setSettings} language={language} setLanguage={setLanguage} />}
        />
        <Route
          path="/live"
          element={<LivePairRoomPage settings={settings} setSettings={setSettings} language={language} onLanguageChange={setLanguage} />}
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
  const [language, setLanguage] = useLocalStorage<Language>('codemotion_language', 'en');

  useEffect(() => {
    // Force Obsidian Dark Mode permanently
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes
        settings={settings}
        setSettings={setSettings}
        language={language}
        setLanguage={setLanguage}
      />
    </BrowserRouter>
  );
}
