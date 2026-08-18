import React from 'react';
import type { SnippetSettings, AestheticPreset } from '../types';
import { AESTHETIC_PRESETS } from '../utils/presets';
import { Sparkles } from 'lucide-react';

interface PresetBarProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
}

export const PresetBar: React.FC<PresetBarProps> = ({ settings, setSettings }) => {
  const isDark = settings.appTheme === 'dark';

  const applyPreset = (preset: AestheticPreset) => {
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
  };

  return (
    <div
      className={`w-full flex items-center justify-center gap-2 py-3 px-4 border-t overflow-x-auto select-none transition-colors duration-200 ${
        isDark
          ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-300'
          : 'bg-zinc-100/80 border-zinc-200 text-zinc-700'
      }`}
    >
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mr-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        <Sparkles className="w-3.5 h-3.5 opacity-75" />
        <span>Quick Styles:</span>
      </div>

      <div className="flex items-center gap-2">
        {AESTHETIC_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                : 'bg-white border-zinc-300 text-zinc-800 hover:text-black hover:border-zinc-400 shadow-xs'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};
