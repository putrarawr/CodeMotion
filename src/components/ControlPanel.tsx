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
} from 'lucide-react';

interface ControlPanelProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, setSettings }) => {
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
      className={`w-full h-full border-t lg:border-t-0 lg:border-l p-5 pb-16 flex flex-col gap-6 overflow-y-auto select-none transition-colors duration-200 ${
        isDark
          ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-200'
          : 'bg-zinc-50/90 border-zinc-200 text-zinc-800'
      }`}
    >
      <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Sliders className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
          <h2 className={`text-xs font-bold tracking-wider uppercase m-0 ${isDark ? 'text-white' : 'text-black'}`}>
            Customization
          </h2>
        </div>
      </div>

      {/* Code Diff / Refactoring Mode Banner Switch */}
      <div
        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
          settings.diffMode
            ? isDark
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : isDark
            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
            : 'bg-white border-zinc-300 text-zinc-600 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold">Code Diff Mode</div>
            <div className="text-[10px] opacity-75">Highlight + and - lines for refactoring</div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={settings.diffMode}
          onChange={(e) => updateSetting('diffMode', e.target.checked)}
          className={`w-4 h-4 rounded cursor-pointer ${isDark ? 'accent-emerald-500' : 'accent-emerald-600'}`}
        />
      </div>

      {/* Language */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Code className="w-3.5 h-3.5 opacity-75" />
            Active Tab Language
          </label>
          <button
            onClick={handleAutoDetectLanguage}
            className={`text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
              isDark
                ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                : 'bg-zinc-200 text-zinc-700 border-zinc-300 hover:bg-zinc-300'
            }`}
          >
            <Wand2 className="w-3 h-3" />
            Auto Detect
          </button>
        </div>
        <select
          value={activeTab?.language || 'typescript'}
          onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
          className={`w-full rounded-xl px-3 py-2 text-xs font-medium focus:outline-none border transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-zinc-500'
              : 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400 shadow-xs'
          }`}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name} ({lang.extension})
            </option>
          ))}
        </select>
      </div>

      {/* Syntax Theme */}
      <div className="flex flex-col gap-3">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Palette className="w-3.5 h-3.5 opacity-75" />
          Syntax Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => updateSetting('theme', e.target.value as SupportedTheme)}
          className={`w-full rounded-xl px-3 py-2 text-xs font-medium focus:outline-none border transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-zinc-500'
              : 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400 shadow-xs'
          }`}
        >
          <optgroup label="Dark Themes">
            {THEMES.filter((t) => t.type === 'dark').map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Light Themes">
            {THEMES.filter((t) => t.type === 'light').map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Font Selection */}
      <div className="flex flex-col gap-3">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Type className="w-3.5 h-3.5 opacity-75" />
          Font & Typography
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value)}
          className={`w-full rounded-xl px-3 py-2 text-xs font-mono focus:outline-none border transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-zinc-500'
              : 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400 shadow-xs'
          }`}
        >
          {FONTS.map((font) => (
            <option key={font.id} value={font.family}>
              {font.name}
            </option>
          ))}
        </select>

        <div className={`flex items-center justify-between text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <span>Font Size</span>
          <span className="font-mono font-semibold">{settings.fontSize}px</span>
        </div>
        <input
          type="range"
          min={12}
          max={20}
          step={1}
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
          className={`w-full h-1.5 rounded-lg cursor-pointer ${isDark ? 'accent-white bg-zinc-800' : 'accent-black bg-zinc-300'}`}
        />
      </div>

      {/* Window Frame Style */}
      <div className="flex flex-col gap-3">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Layout className="w-3.5 h-3.5 opacity-75" />
          Window Frame
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['macos', 'windows', 'minimal', 'none'] as WindowStyle[]).map((style) => {
            const isSelected = settings.windowStyle === style;
            return (
              <button
                key={style}
                onClick={() => updateSetting('windowStyle', style)}
                className={`px-2 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-white text-black border-white shadow'
                      : 'bg-black text-white border-black shadow'
                    : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900 shadow-xs'
                }`}
              >
                <span>{style}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Background Presets */}
      <div className="flex flex-col gap-3">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Palette className="w-3.5 h-3.5 opacity-75" />
          Background Canvas
        </label>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_PRESETS.map((preset) => {
            const isSelected = settings.background === preset.value;
            const isTrans = preset.value === 'transparent';
            return (
              <button
                key={preset.id}
                onClick={() => updateSetting('background', preset.value)}
                title={preset.name}
                className={`relative h-9 rounded-xl border transition-all flex items-center justify-center overflow-hidden ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105 shadow'
                    : isDark
                    ? 'border-zinc-800 opacity-75 hover:opacity-100'
                    : 'border-zinc-300 opacity-80 hover:opacity-100'
                } ${isTrans ? 'bg-checkerboard' : ''}`}
                style={{ background: isTrans ? undefined : preset.value }}
              >
                {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Padding Slider */}
      <div className="flex flex-col gap-2">
        <div className={`flex items-center justify-between text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <span>Canvas Padding</span>
          <span className="font-mono">{settings.padding}px</span>
        </div>
        <input
          type="range"
          min={16}
          max={80}
          step={8}
          value={settings.padding}
          onChange={(e) => updateSetting('padding', Number(e.target.value))}
          className={`w-full h-1.5 rounded-lg cursor-pointer ${isDark ? 'accent-white bg-zinc-800' : 'accent-black bg-zinc-300'}`}
        />
      </div>

      {/* Aspect Ratio Lock */}
      <div className="flex flex-col gap-3">
        <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          <Maximize2 className="w-3.5 h-3.5 opacity-75" />
          Aspect Ratio Lock
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['auto', '1:1', '4:3', '16:9'] as AspectRatio[]).map((ratio) => {
            const isSelected = settings.aspectRatio === ratio;
            return (
              <button
                key={ratio}
                onClick={() => updateSetting('aspectRatio', ratio)}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold uppercase border transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-white border-black'
                    : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {ratio}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className={`flex flex-col gap-3 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <label className={`flex items-center justify-between cursor-pointer text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          <span>Line Numbers</span>
          <input
            type="checkbox"
            checked={settings.lineNumbers}
            onChange={(e) => updateSetting('lineNumbers', e.target.checked)}
            className={`w-4 h-4 rounded cursor-pointer ${isDark ? 'accent-white' : 'accent-black'}`}
          />
        </label>

        <label className={`flex items-center justify-between cursor-pointer text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          <span>Drop Shadow</span>
          <input
            type="checkbox"
            checked={settings.dropShadow}
            onChange={(e) => updateSetting('dropShadow', e.target.checked)}
            className={`w-4 h-4 rounded cursor-pointer ${isDark ? 'accent-white' : 'accent-black'}`}
          />
        </label>

        <div className="flex flex-col gap-2">
          <label className={`flex items-center justify-between cursor-pointer text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            <span>Watermark Badge</span>
            <input
              type="checkbox"
              checked={settings.watermark}
              onChange={(e) => updateSetting('watermark', e.target.checked)}
              className={`w-4 h-4 rounded cursor-pointer ${isDark ? 'accent-white' : 'accent-black'}`}
            />
          </label>
          {settings.watermark && (
            <input
              type="text"
              value={settings.watermarkText}
              onChange={(e) => updateSetting('watermarkText', e.target.value)}
              placeholder="e.g. @yourname"
              className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none border transition-colors ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-zinc-500'
                  : 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
