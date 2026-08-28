import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, RefreshCw, Image, ChevronDown, Check, Video, HelpCircle, Share2, Undo2, Redo2, Monitor, Home } from 'lucide-react';
import { encodeStateToHash } from '../utils/urlEncoder';
import { toast } from 'sonner';
import type { SnippetSettings } from '../types';
import { Logo } from './Logo';
import { LanguageSwitch } from './LanguageSwitch';
import { translations, type Language } from '../utils/i18n';

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
    toast.success(t.toastCopiedLink);
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-3 sm:px-6 flex justify-center select-none pointer-events-auto">
      <header className="w-full rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-xl px-3.5 py-2 flex items-center justify-between bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-black/60 transition-all duration-300">
        
        {/* Left: Brand Logo & Home Navigation */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 text-zinc-100 transition-all no-underline flex-shrink-0"
            title="Return to Home"
          >
            <Logo className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold tracking-tight font-sans">CodeMotion</span>
          </Link>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-800/60 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all no-underline text-[11px] font-medium"
            title="Return to Home"
          >
            <Home className="w-3 h-3 text-zinc-400" />
            <span>{t.navHome}</span>
          </Link>
        </div>

        {/* Right: Clean Editor Action Toolbar (Spacious, No Overcrowding) */}
        <div id="header-export-actions" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* Presentation Deck Button */}
          {onOpenPresentationDeck && (
            <button
              onClick={onOpenPresentationDeck}
              title="Presentation Slideshow"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-zinc-300" />
              <span>{t.btnPresent}</span>
            </button>
          )}

          {/* User Guide Tour */}
          <button
            onClick={onOpenUserTour}
            title="Interactive User Guide"
            className="hidden md:flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-zinc-300" />
            <span>{t.btnGuide}</span>
          </button>

          {/* Language Switcher Switch Side */}
          <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />

          {/* Reset Editor */}
          <button
            onClick={onReset}
            title={t.btnReset}
            className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Share Link */}
          <button
            onClick={handleShareLink}
            disabled={isExporting}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Share snippet link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.btnShare}</span>
          </button>

          {/* Copy Image */}
          <button
            onClick={onCopyImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.btnCopyImage}</span>
          </button>

          {/* Primary Export Dropdown */}
          <div id="header-export-btn" className="relative" ref={pngDropdownRef}>
            <div className="flex items-center rounded-xl border border-white bg-white text-black hover:bg-zinc-200 transition-all overflow-hidden shadow-sm">
              <button
                onClick={() => setShowPngDropdown((prev) => !prev)}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowPngDropdown((prev) => !prev)}
                disabled={isExporting}
                className="pr-2 py-1 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showPngDropdown && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl p-2 z-50 transition-all">
                <button
                  onClick={() => handleExportPng(2)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 opacity-60" />
                    <span>{t.btnDownloadPng} (2x)</span>
                  </div>
                  {selectedRatio === 2 && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                </button>

                <button
                  onClick={() => handleExportPng(3)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-zinc-900 font-semibold transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 opacity-80" />
                    <span>{t.btnDownloadPng} Retina (3x)</span>
                  </div>
                  {selectedRatio === 3 && <Check className="w-3.5 h-3.5 text-zinc-400" />}
                </button>

                <button
                  onClick={() => {
                    setShowPngDropdown(false);
                    onDownloadSvg();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 opacity-60" />
                    <span>{t.btnDownloadSvg}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowPngDropdown(false);
                    onRecordVideo();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{t.btnRecordVideo}</span>
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
