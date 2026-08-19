import React, { useState } from 'react';
import { toast } from 'sonner';
import type {
  SnippetSettings,
  SupportedLanguage,
  SupportedTheme,
  WindowStyle,
  SocialPreset,
} from '../types';
import { LANGUAGES, detectLanguageFromCode } from '../utils/languages';
import { THEMES } from '../utils/themes';
import { BACKGROUND_PRESETS } from '../utils/gradients';
import { FONTS } from '../utils/fonts';
import { SOCIAL_PRESETS } from '../utils/socialPresets';
import {
  Code,
  Palette,
  Type,
  Layout,
  Maximize2,
  Check,
  Wand2,
  GitCompare,
  Play,
  Pause,
  Zap,
  Video,
  Upload,
  User,
  Share,
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

  // Section Expansion Collapsible State for neat organization
  const [activeTabSection, setActiveTabSection] = useState<'style' | 'motion' | 'layout' | 'watermark'>('style');

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  const updateSetting = <K extends keyof SnippetSettings>(key: K, value: SnippetSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAutoDetectLanguage = () => {
    if (!activeTab) return;
    const detected = detectLanguageFromCode(activeTab.code, activeTab.title);
    if (detected) {
      const langObj = LANGUAGES.find((l) => l.id === detected);
      if (activeTab.language === detected) {
        toast.info(`Language is already set to ${langObj?.name || detected}`);
      } else {
        handleLanguageChange(detected);
        toast.success(`Auto-detected language: ${langObj?.name || detected} (${langObj?.extension})`);
      }
    } else {
      toast.info('Could not auto-detect language. Please select manually.');
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (!activeTab) return;
    setSettings((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId ? { ...t, language: lang } : t
      ),
    }));
  };

  const applySocialPreset = (preset: SocialPreset) => {
    setSettings((prev) => ({
      ...prev,
      aspectRatio: preset.aspectRatio,
      activeSocialPresetId: preset.id,
      padding: preset.padding,
      background: preset.background,
      fontSize: preset.fontSize,
    }));
  };

  return (
    <div id="editor-sidebar" className="w-full h-full flex flex-col p-4 sm:p-5 gap-4 overflow-y-auto">
      {/* Category Tab Selector Navigation Bar */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <button
          onClick={() => setActiveTabSection('style')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'style'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Themes, Fonts & Code Diff"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Theme</span>
        </button>

        <button
          onClick={() => setActiveTabSection('motion')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'motion'
              ? 'bg-sky-500 text-white shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Motion Code Typing & Video"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Motion</span>
        </button>

        <button
          onClick={() => setActiveTabSection('layout')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'layout'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Social Templates & Canvas Background"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Layout</span>
        </button>

        <button
          onClick={() => setActiveTabSection('watermark')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'watermark'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Branding Watermark & Logo"
        >
          <User className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logo</span>
        </button>
      </div>

      {/* SECTION 1: Theme, Code Diff & Fonts */}
      {activeTabSection === 'style' && (
        <div className="flex flex-col gap-5">
          {/* Code Diff Mode Toggle */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              settings.diffMode
                ? 'bg-emerald-500/10 border-emerald-500/30'
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
                  Highlight + (green) and - (red) refactor lines
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

          {/* Active Tab Language Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Code className="w-3.5 h-3.5" />
                <span>Active Language</span>
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
              className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer ${
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

          {/* Syntax Theme Selector */}
          <div className="flex flex-col gap-2">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Palette className="w-3.5 h-3.5" />
              <span>VS Code Syntax Theme</span>
            </label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value as SupportedTheme)}
              className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer ${
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

          {/* Font Family & Typography Size */}
          <div className="flex flex-col gap-3">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Type className="w-3.5 h-3.5" />
              <span>Font & Typography</span>
            </label>

            <select
              value={settings.fontFamily}
              onChange={(e) => updateSetting('fontFamily', e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer ${
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
        </div>
      )}

      {/* SECTION 2: Motion Code Simulator Controls */}
      {activeTabSection === 'motion' && (
        <div
          id="motion-card"
          className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                settings.isPlayingMotion
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              {settings.isPlayingMotion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{settings.isPlayingMotion ? 'Pause' : 'Play Motion'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800/40">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Typing Speed</span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSetting('motionSpeed', s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
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

            {/* Video Frame Rate (FPS) Selector */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Video Frame Rate</span>
              <div className="flex items-center gap-1">
                {([30, 60] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => updateSetting('motionFps', f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      (settings.motionFps || 60) === f
                        ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            {onRecordVideo && (
              <button
                onClick={onRecordVideo}
                disabled={recordingProgress !== null && recordingProgress !== undefined}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 hover:bg-sky-500/30 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
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
      )}

      {/* SECTION 3: Social Media Canvas Presets & Layout */}
      {activeTabSection === 'layout' && (
        <div id="customization-card" className="flex flex-col gap-5">
          {/* Social Media Templates Bar */}
          <div className="flex flex-col gap-2">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Share className="w-3.5 h-3.5 text-sky-400" />
              <span>Social Media Canvas Templates</span>
            </label>

            <div className="flex flex-col gap-2">
              {SOCIAL_PRESETS.map((preset) => {
                const isCurrent = settings.activeSocialPresetId
                  ? settings.activeSocialPresetId === preset.id
                  : settings.aspectRatio === preset.aspectRatio;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applySocialPreset(preset)}
                    className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                        : isDark
                        ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-200'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                        <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{preset.name}</span>
                        <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {preset.platform} • {preset.aspectRatio} Aspect Ratio
                        </span>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Window Frame Style */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/40 pt-3">
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

          {/* Canvas Resizing Control */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/40 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Canvas Width</span>
              </label>
              <span className="font-mono font-bold text-xs">{settings.canvasWidth || 800}px</span>
            </div>
            <input
              type="range"
              min="420"
              max="1080"
              step="10"
              value={settings.canvasWidth || 800}
              onChange={(e) => updateSetting('canvasWidth', Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Canvas Background Gradients */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/40 pt-3">
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
        </div>
      )}

      {/* SECTION 4: Branding Watermark & Logo Upload */}
      {activeTabSection === 'watermark' && (
        <div className="flex flex-col gap-4 p-4 rounded-2xl border bg-zinc-900/60 border-zinc-800/80">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Branding Watermark & Logo</span>
            </label>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.watermark}
                onChange={(e) => updateSetting('watermark', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-sky-500" />
            </label>
          </div>

          {settings.watermark && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Handle Text</span>
                <input
                  type="text"
                  value={settings.watermarkText}
                  onChange={(e) => updateSetting('watermarkText', e.target.value)}
                  placeholder="e.g. @username or codemotion.biz.id"
                  className={`w-full text-xs font-mono rounded-xl border p-2.5 outline-none transition-colors ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Custom Avatar / Company Logo</span>
                <div className="flex items-center gap-2">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed text-xs font-semibold cursor-pointer transition-all ${
                      isDark
                        ? 'bg-zinc-950/80 border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-500'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>{settings.watermarkAvatar ? 'Change Logo / Avatar' : 'Upload Logo / Avatar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            updateSetting('watermarkAvatar', evt.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {settings.watermarkAvatar && (
                    <button
                      onClick={() => updateSetting('watermarkAvatar', '')}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer ${
                        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-300'
                      }`}
                      title="Remove Logo Avatar"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
