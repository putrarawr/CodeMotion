import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, RefreshCw, FileCode2, Image, ChevronDown, Check, Home, Video, HelpCircle, Share2, Coffee, Undo2, Redo2 } from 'lucide-react';
import { encodeStateToHash } from '../utils/urlEncoder';
import { toast } from 'sonner';
import type { SnippetSettings } from '../types';
import { Logo } from './Logo';

import { LanguageSwitch } from './LanguageSwitch';
import { translations, type Language } from '../utils/i18n';

import { Monitor } from 'lucide-react';

interface HeaderProps {
  settings: SnippetSettings;
  setSettings?: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onCopyImage: () => void;
  onDownloadPng: (ratio: number) => void;
  onDownloadSvg: () => void;
  onRecordVideo: () => void;
  onReset: () => void;
  onOpenUserTour: () => void;
  onOpenPresentationDeck?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  language,
  onLanguageChange,
  onCopyImage,
  onDownloadPng,
  onDownloadSvg,
  onRecordVideo,
  onReset,
  onOpenUserTour,
  onOpenPresentationDeck,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isExporting,
}) => {
  const t = translations[language];
  const [showPngDropdown, setShowPngDropdown] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<number>(3);

  const pngDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = true;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pngDropdownRef.current && !pngDropdownRef.current.contains(event.target as Node)) {
        setShowPngDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPng = (ratio: number) => {
    setSelectedRatio(ratio);
    setShowPngDropdown(false);
    onDownloadPng(ratio);
  };

  const handleShareLink = () => {
    const hash = encodeStateToHash(settings);
    if (!hash) {
      toast.error('Failed to create share link.');
      return;
    }
    const shareUrl = `${window.location.origin}/editor#code=${hash}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-3 sm:px-6 flex justify-center select-none pointer-events-auto">
      <header
        className="w-full rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-xl px-4 py-2 flex items-center justify-between relative bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-black/60 transition-all duration-300"
      >
        {/* Left: Brand Logo & Title */}
        <Link
          to="/"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 text-zinc-100 transition-all no-underline flex-shrink-0 z-10"
        >
          <Logo className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold tracking-tight font-sans">CodeMotion</span>
        </Link>

        {/* Center Nav Links (Dynamic Island Style) */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 sm:gap-2 text-[11px] font-semibold">
          <Link
            to="/"
            className="px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-950/80 transition-all no-underline"
          >
            {t.navHome}
          </Link>
          <Link
            to="/editor"
            className="px-2.5 py-1 rounded-lg text-white font-bold bg-zinc-800 transition-all no-underline"
          >
            {t.navEditor}
          </Link>
          <Link
            to="/templates"
            className="px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-950/80 transition-all no-underline"
          >
            {t.navTemplates}
          </Link>
          <Link
            to="/live"
            className="px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-950/80 transition-all no-underline"
          >
            {t.navLivePair}
          </Link>
        </nav>

        {/* Right Obsidian Section: All Actions & Controls (Clean Flex Row, 0 Overlap) */}
        <div id="header-export-actions" className="flex items-center gap-1.5 sm:gap-2">

          {/* Presentation Deck Mode Button */}
          {onOpenPresentationDeck && (
            <button
              onClick={onOpenPresentationDeck}
              title="Open Code Presentation Deck (Fullscreen Slideshow)"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Present</span>
            </button>
          )}
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

          {/* Language Switcher Pill (Indonesian ID vs English EN) */}
          <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />

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

          {/* Undo Settings Pill */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo settings change (Cmd/Ctrl + Z)"
            className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          {/* Redo Settings Pill */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo settings change (Cmd/Ctrl + Shift + Z)"
            className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Saweria Donation Button */}
          <a
            href="https://saweria.co/codemotion"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all no-underline cursor-pointer whitespace-nowrap flex-shrink-0 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-amber-300 hover:bg-zinc-800 hover:text-amber-200'
                : 'bg-zinc-100 border-zinc-300 text-amber-700 hover:bg-zinc-200'
            }`}
            title="Support CodeMotion development via Saweria"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="whitespace-nowrap">Buy me a coffee</span>
          </a>

          {/* Share Link Button */}
          <button
            onClick={handleShareLink}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap flex-shrink-0 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
            title="Share snippet via URL hash link"
          >
            <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Share</span>
          </button>

          {/* Copy Image Button */}
          <button
            onClick={onCopyImage}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap flex-shrink-0 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Copy</span>
          </button>

          {/* Export Pill Dropdown */}
          <div id="header-export-btn" className="relative" ref={pngDropdownRef}>
            <div
              className={`flex items-center rounded-xl border shadow-xs transition-all overflow-hidden ${
                isDark
                  ? 'bg-white text-black border-white hover:bg-zinc-200'
                  : 'bg-black text-white border-black hover:bg-zinc-800'
              }`}
            >
              <button
                onClick={() => setShowPngDropdown((prev) => !prev)}
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
                  {selectedRatio === 2 && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                </button>

                <button
                  onClick={() => handleExportPng(3)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-zinc-900 font-semibold' : 'hover:bg-zinc-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 opacity-80" />
                    <span>PNG Retina High (3x DPI)</span>
                  </div>
                  {selectedRatio === 3 && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                </button>

                {/* Record Video Option */}
                <button
                  onClick={() => {
                    onRecordVideo();
                    setShowPngDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between border-t mt-1 pt-2 transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-zinc-900 border-zinc-800/80 text-zinc-100 font-semibold'
                      : 'hover:bg-zinc-100 border-zinc-200 text-zinc-900 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 opacity-80" />
                    <span>Record Motion (MP4 / GIF)</span>
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
