import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Copy, Download, Sparkles, RefreshCw, FileCode2, Image, ChevronDown, Sun, Moon, Check, Home } from 'lucide-react';
import type { SnippetSettings, AestheticPreset } from '../types';
import { AESTHETIC_PRESETS } from '../utils/presets';

interface HeaderProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  onCopyImage: () => void;
  onDownloadPng: (ratio: number) => void;
  onDownloadSvg: () => void;
  onReset: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  setSettings,
  onCopyImage,
  onDownloadPng,
  onDownloadSvg,
  onReset,
  isExporting,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showPngDropdown, setShowPngDropdown] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<number>(3);

  const presetsRef = useRef<HTMLDivElement>(null);
  const pngDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = settings.appTheme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(event.target as Node)) {
        setShowPresetsMenu(false);
      }
      if (pngDropdownRef.current && !pngDropdownRef.current.contains(event.target as Node)) {
        setShowPngDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyPreset = (preset: AestheticPreset) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
    setShowPresetsMenu(false);
  };

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

  return (
    <header
      className={`h-14 flex-shrink-0 w-full border-b px-4 lg:px-6 flex items-center justify-between shadow-xs transition-colors duration-200 z-40 sticky top-0 ${
        isDark
          ? 'bg-zinc-950/90 backdrop-blur-md border-zinc-800/80 text-zinc-100'
          : 'bg-white/90 backdrop-blur-md border-zinc-200 text-zinc-900'
      }`}
    >
      {/* Brand & Logo - CodeMotion */}
      <Link to="/" className="flex items-center gap-3 no-underline group" title="Return to Landing Page">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100 group-hover:border-zinc-500'
              : 'bg-zinc-100 border-zinc-300 text-zinc-900 group-hover:border-zinc-400'
          }`}
        >
          <Camera className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold tracking-tight font-sans m-0">CodeMotion</h1>
        </div>
      </Link>

      {/* Quick Presets, Theme Toggle & Export Actions */}
      <div className="flex items-center gap-2">
        {/* Landing Page Route Link */}
        <Link
          to="/"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all no-underline ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
          }`}
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Landing Page</span>
        </Link>

        {/* Presets Dropdown */}
        <div className="relative" ref={presetsRef}>
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
            <span className="hidden sm:inline">Presets</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showPresetsMenu && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl p-1.5 z-50 transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              <div className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Aesthetic Presets
              </div>
              {AESTHETIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                    isDark ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <span className="font-semibold">{preset.name}</span>
                  <span className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{preset.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* UI Light / Dark Mode Toggle */}
        <button
          onClick={toggleAppTheme}
          title={isDark ? 'Switch to Light UI' : 'Switch to Dark UI'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-800" />}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          title="Reset to default settings"
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className={`h-4 w-[1px] mx-1 hidden sm:block ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />

        {/* Copy Image Button */}
        <button
          onClick={onCopyImage}
          disabled={isExporting}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-xs disabled:opacity-50 ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
              : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Copy Image</span>
        </button>

        {/* Download PNG Split Dropdown Button */}
        <div className="relative" ref={pngDropdownRef}>
          <div
            className={`flex items-center rounded-lg border shadow-xs transition-all overflow-hidden ${
              isDark
                ? 'bg-zinc-100 text-zinc-900 border-zinc-200 hover:bg-white'
                : 'bg-zinc-900 text-zinc-100 border-zinc-800 hover:bg-black'
            }`}
          >
            <button
              onClick={() => onDownloadPng(selectedRatio)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG ({selectedRatio}x DPI)</span>
            </button>
            <button
              onClick={() => setShowPngDropdown(!showPngDropdown)}
              disabled={isExporting}
              className={`px-2 py-1.5 border-l transition-colors ${
                isDark ? 'border-zinc-300 hover:bg-zinc-200' : 'border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {showPngDropdown && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl p-1.5 z-50 transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
              }`}
            >
              <button
                onClick={() => handleExportPng(2)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5 opacity-60" />
                  <span>Standard (2x DPI)</span>
                </div>
                {selectedRatio === 2 && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleExportPng(3)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  isDark ? 'hover:bg-zinc-800 font-semibold' : 'hover:bg-zinc-100 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5" />
                  <span>Retina High (3x DPI)</span>
                </div>
                {selectedRatio === 3 && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  onDownloadSvg();
                  setShowPngDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between border-t mt-1 pt-2 transition-colors ${
                  isDark ? 'hover:bg-zinc-800 border-zinc-800' : 'hover:bg-zinc-100 border-zinc-200'
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
  );
};
