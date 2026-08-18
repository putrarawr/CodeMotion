import React from 'react';
import type {
  SnippetSettings,
  SupportedLanguage,
  SupportedTheme,
  WindowStyle,
  AspectRatio,
} from '../types';
import { LANGUAGES, detectLanguageFromCode } from '../utils/languages';
import { THEMES } from '../utils/themes';
import { BACKGROUND_PRESETS } from '../utils/gradients';
import { FONTS } from '../utils/fonts';
import { INITIAL_CODE_SAMPLES } from '../utils/defaults';
import {
  Code,
  Palette,
  Type,
  Layout,
  Maximize2,
  Sliders,
  Check,
  Wand2,
  GitCompare,
  Play,
  Pause,
  Zap,
  Video,
} from 'lucide-react';

interface ControlPanelProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  onRecordVideo?: () => void;
  recordingProgress?: number | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  setSettings,
  onRecordVideo,
  recordingProgress,
}) => {
  const isDark = settings.appTheme === 'dark';

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  const updateSetting = <K extends keyof SnippetSettings>(key: K, value: SnippetSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAutoDetectLanguage = () => {
    if (!activeTab) return;
    const detected = detectLanguageFromCode(activeTab.code);
    if (detected) {
      handleLanguageChange(detected);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (!activeTab) return;
    setSettings((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === activeTab.id
          ? {
              ...t,
              language: lang,
              // Only load default sample code if tab code is empty
              code: t.code.trim() ? t.code : INITIAL_CODE_SAMPLES[lang] || t.code,
            }
          : t
      ),
    }));
  };

  return (
    <div
      className={`w-full h-full border-t lg:border-t-0 lg:border-l p-5 pb-16 flex flex-col gap-6 overflow-y-auto transition-colors duration-200 ${
        isDark
          ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-200'
          : 'bg-zinc-50/90 border-zinc-200 text-zinc-800'
      }`}
    >
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 opacity-70" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-sans m-0">Customization</h2>
        </div>
      </div>

      {/* Feature 1: Code Diff Mode Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
          settings.diffMode
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30'
            : isDark
            ? 'bg-zinc-900/60 border-zinc-800/80'
            : 'bg-white border-zinc-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              settings.diffMode
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isDark
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                : 'bg-zinc-100 text-zinc-600 border-zinc-300'
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold m-0 font-sans">Code Diff Mode</h3>
            <p className={`text-[11px] m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Highlight + and - lines for refactoring
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.diffMode}
            onChange={(e) => updateSetting('diffMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
        </label>
      </div>

      {/* Feature 2: Code Motion (Animated Typing Simulator) Card */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
          settings.isPlayingMotion
            ? 'bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/30'
            : isDark
            ? 'bg-zinc-900/60 border-zinc-800/80'
            : 'bg-white border-zinc-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                settings.isPlayingMotion
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 animate-pulse'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-300'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold m-0 font-sans">Motion Code Animation</h3>
              <p className={`text-[11px] m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Simulate real-time character typing
              </p>
            </div>
          </div>

          <button
            onClick={() => updateSetting('isPlayingMotion', !settings.isPlayingMotion)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              settings.isPlayingMotion
                ? 'bg-sky-500 text-white shadow-md'
                : isDark
                ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            {settings.isPlayingMotion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{settings.isPlayingMotion ? 'Pause' : 'Play Motion'}</span>
          </button>
        </div>

        {/* Speed presets & Video Export Button */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/30">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Typing Speed</span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => updateSetting('motionSpeed', s)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    settings.motionSpeed === s
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {onRecordVideo && (
            <button
              onClick={onRecordVideo}
              disabled={recordingProgress !== null && recordingProgress !== undefined}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 hover:bg-sky-500/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>
                {recordingProgress !== null && recordingProgress !== undefined
                  ? `Recording... ${recordingProgress}%`
                  : 'Record Video (WebM / GIF Motion)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Active Tab Language Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Code className="w-3.5 h-3.5" />
            <span>Active Tab Language</span>
          </label>
          <button
            onClick={handleAutoDetectLanguage}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
              isDark
                ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
            }`}
            title="Auto detect language from current code"
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            <span>Auto Detect</span>
          </button>
        </div>

        <select
          value={activeTab?.language || 'typescript'}
          onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
          className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer relative z-10 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
          }`}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name} ({lang.extension})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Syntax Theme Selector */}
      <div className="flex flex-col gap-2">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Palette className="w-3.5 h-3.5" />
          <span>Syntax Theme</span>
        </label>
        <select
          value={settings.theme}
          onChange={(e) => updateSetting('theme', e.target.value as SupportedTheme)}
          className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer relative z-10 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
          }`}
        >
          {THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name} ({theme.type})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Font & Typography */}
      <div className="flex flex-col gap-3">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Type className="w-3.5 h-3.5" />
          <span>Font & Typography</span>
        </label>

        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value)}
          className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer relative z-10 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
          }`}
        >
          {FONTS.map((font) => (
            <option key={font.id} value={font.family}>
              {font.name}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Font Size</span>
            <span className="font-mono font-bold text-xs">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="24"
            step="1"
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Window Frame Style */}
      <div className="flex flex-col gap-2">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Layout className="w-3.5 h-3.5" />
          <span>Window Frame</span>
        </label>
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          {(['macos', 'windows', 'minimal', 'none'] as WindowStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => updateSetting('windowStyle', style)}
              className={`py-1.5 text-[11px] font-semibold capitalize rounded-lg transition-colors cursor-pointer ${
                settings.windowStyle === style
                  ? 'bg-white text-black shadow-xs font-bold'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Canvas Background Presets */}
      <div className="flex flex-col gap-2">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Palette className="w-3.5 h-3.5" />
          <span>Canvas Background</span>
        </label>

        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_PRESETS.map((bg) => {
            const isSelected = settings.background === bg.value;
            return (
              <button
                key={bg.id}
                onClick={() => updateSetting('background', bg.value)}
                className={`h-10 rounded-xl border relative overflow-hidden transition-transform transform active:scale-95 cursor-pointer ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950 border-white' : 'border-zinc-800'
                }`}
                style={{ background: bg.value }}
                title={bg.name}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Layout, Padding & Shadow Settings */}
      <div className="flex flex-col gap-4 border-t border-zinc-800/40 pt-4">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Canvas Padding & Aspect Ratio</span>
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Outer Padding</span>
            <span className="font-mono font-bold text-xs">{settings.padding}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="80"
            step="8"
            value={settings.padding}
            onChange={(e) => updateSetting('padding', Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Aspect Ratio Lock</span>
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            {(['auto', '1:1', '4:3', '16:9'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                onClick={() => updateSetting('aspectRatio', ratio)}
                className={`py-1.5 text-[11px] font-semibold uppercase rounded-lg transition-colors cursor-pointer ${
                  settings.aspectRatio === ratio
                    ? 'bg-white text-black shadow-xs font-bold'
                    : isDark
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
