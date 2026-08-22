import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, RefreshCw, FileCode2, Image, ChevronDown, Sun, Moon, Check, Home, Video, HelpCircle, Share2 } from 'lucide-react';
import { encodeStateToHash } from '../utils/urlEncoder';
import { toast } from 'sonner';
import type { SnippetSettings } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  onCopyImage: () => void;
  onDownloadPng: (ratio: number) => void;
  onDownloadSvg: () => void;
  onRecordVideo: () => void;
  onReset: () => void;
  onOpenUserTour: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  setSettings,
  onCopyImage,
  onDownloadPng,
  onDownloadSvg,
  onRecordVideo,
  onReset,
  onOpenUserTour,
  isExporting,
}) => {
  const [showPngDropdown, setShowPngDropdown] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<number>(3);

  const pngDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = settings.appTheme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pngDropdownRef.current && !pngDropdownRef.current.contains(event.target as Node)) {
        setShowPngDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAppTheme = () => {
    setSettings((prev) => ({
      ...prev,
      appTheme: prev.appTheme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleExportPng = (ratio: number) => {
    setSelectedRatio(ratio);
    onDownloadPng(ratio);
    setShowPngDropdown(false);
  };

  const handleShareLink = () => {
    const hash = encodeStateToHash(settings);
    if (!hash) {
      toast.error('Gagal membuat share link.');
      return;
    }
    const shareUrl = `${window.location.origin}/editor#code=${hash}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link disalin ke clipboard!');
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-3 sm:px-6 flex justify-center select-none pointer-events-auto">
      <header
        className={`w-full rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-xl px-4 py-2.5 flex items-center justify-between relative transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 text-white shadow-black/60'
            : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-200/50'
        }`}
      >
        {/* Left Obsidian Section: Logo & Brand Capsule */}
        <Link
          to="/"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all no-underline ${
            isDark
              ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-100'
              : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-zinc-900'
          }`}
          title="Return to Landing Page"
        >
          <div className="flex items-center gap-1.5">
            <Logo className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-tight font-sans">CodeMotion</span>
        </Link>

        {/* Center Obsidian Section: Navigation & Tools (Dead-Centered) */}
        <div id="header-actions" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
          {/* User Guide Tour Pill */}
          <button
            onClick={onOpenUserTour}
            title="Open Interactive User Guide"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Home / Landing Link Pill */}
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all no-underline ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
            }`}
            title="Return to Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Landing</span>
          </Link>

          {/* UI Theme Switcher Pill */}
          <button
            onClick={toggleAppTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-zinc-300" /> : <Moon className="w-3.5 h-3.5 text-zinc-800" />}
          </button>

          {/* Reset Pill */}
          <button
            onClick={onReset}
            title="Reset to default settings"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Obsidian Section: Copy & Export Capsules */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Share Link Button */}
          <button
            onClick={handleShareLink}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
            title="Share snippet via URL hash link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Copy Image Button */}
          <button
            onClick={onCopyImage}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Copy</span>
          </button>

          {/* Export Pill Dropdown */}
          <div className="relative" ref={pngDropdownRef}>
            <div
              className={`flex items-center rounded-xl border shadow-xs transition-all overflow-hidden ${
                isDark
                  ? 'bg-white text-black border-white hover:bg-zinc-200'
                  : 'bg-black text-white border-black hover:bg-zinc-800'
              }`}
            >
              <button
                onClick={() => onDownloadPng(selectedRatio)}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-extrabold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowPngDropdown((prev) => !prev)}
                disabled={isExporting}
                className={`pr-2.5 py-1 transition-colors cursor-pointer ${
                  isDark ? 'hover:text-zinc-700' : 'hover:text-zinc-300'
                }`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showPngDropdown && (
              <div
                className={`absolute right-0 mt-3 w-56 rounded-2xl border shadow-2xl p-2 z-50 transition-all ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                }`}
              >
                <button
                  onClick={() => handleExportPng(2)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 opacity-60" />
                    <span>PNG Standard (2x DPI)</span>
                  </div>
                  {selectedRatio === 2 && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>

                <button
                  onClick={() => handleExportPng(3)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-zinc-900 font-semibold' : 'hover:bg-zinc-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 text-sky-400" />
                    <span>PNG Retina High (3x DPI)</span>
                  </div>
                  {selectedRatio === 3 && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </button>

                {/* Record Video Option */}
                <button
                  onClick={() => {
                    onRecordVideo();
                    setShowPngDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border-t mt-1 pt-2 transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-zinc-900 border-zinc-800/80 text-sky-400 font-bold' : 'hover:bg-zinc-100 border-zinc-200 text-sky-600 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5" />
                    <span>Record Motion Video (WebM)</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onDownloadSvg();
                    setShowPngDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 opacity-70" />
                    <span>Export as SVG</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
