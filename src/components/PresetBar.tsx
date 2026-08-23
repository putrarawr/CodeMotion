import React from 'react';
import { toast } from 'sonner';
import type { SnippetSettings } from '../types';
import { formatCode } from '../utils/formatter';
import { detectLanguageFromCode, LANGUAGES } from '../utils/languages';
import { Wand2, Code2, FileText } from 'lucide-react';

interface PresetBarProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}

export const PresetBar: React.FC<PresetBarProps> = ({ settings, setSettings }) => {
  const isDark = settings.appTheme === 'dark';
  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  const handleFormatCode = () => {
    if (!activeTab) return;
    const formatted = formatCode(activeTab.code, activeTab.language);
    if (formatted === activeTab.code) {
      toast.info('Kode sudah rapi!');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId ? { ...t, code: formatted } : t
      ),
    }));
    toast.success('Kode berhasil dirapikan & di-format!');
  };

  const handleAutoDetect = () => {
    if (!activeTab) return;
    const detected = detectLanguageFromCode(activeTab.code);
    if (detected) {
      const langObj = LANGUAGES.find((l) => l.id === detected);
      setSettings((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId ? { ...t, language: detected } : t
        ),
      }));
      toast.success(`Bahasa terdeteksi: ${langObj?.name || detected}`);
    } else {
      toast.info('Tidak dapat mendeteksi bahasa.');
    }
  };

  const currentLangObj = LANGUAGES.find((l) => l.id === activeTab?.language);

  return (
    <div
      id="preset-action-bar"
      className={`w-full max-w-xl flex items-center justify-between gap-3 py-2 px-4 rounded-2xl border backdrop-blur-md shadow-lg select-none transition-all duration-200 z-10 ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800/90 text-zinc-300'
          : 'bg-white/90 border-zinc-200 text-zinc-700'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-1.5 rounded-xl border flex-shrink-0 ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'}`}>
          <FileText className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold truncate max-w-[120px] sm:max-w-[180px]">{activeTab?.title || 'App.tsx'}</span>
          <span className={`text-[10px] font-mono truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {currentLangObj?.name || activeTab?.language || 'TypeScript'} • {activeTab?.code?.split('\n').length || 0} lines
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleAutoDetect}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
            isDark
              ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
          }`}
          title="Auto Detect Language from Code Syntax"
        >
          <Code2 className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Detect</span>
        </button>

        <button
          onClick={handleFormatCode}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            isDark
              ? 'bg-white text-black border-white hover:bg-zinc-200'
              : 'bg-black text-white border-black hover:bg-zinc-800'
          }`}
          title="Format Code Indentation & Brackets"
        >
          <Wand2 className="w-3.5 h-3.5 text-current" />
          <span>Format Code</span>
        </button>
      </div>
    </div>
  );
};
