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
      className={`w-full max-w-3xl flex items-center justify-center gap-2 py-2 px-4 rounded-2xl border backdrop-blur-md shadow-lg overflow-x-auto no-scrollbar select-none transition-all duration-200 z-10 ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800/90 text-zinc-300'
          : 'bg-white/90 border-zinc-200 text-zinc-700'
      }`}
    >
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap mr-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Quick Styles:</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {AESTHETIC_PRESETS.map((preset) => {
          const isSelected = settings.background === preset.settings.background;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-white text-black font-bold border-white shadow-md scale-105'
                  : isDark
                  ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-800 hover:text-black hover:bg-zinc-100 shadow-xs'
              }`}
              title={preset.description}
            >
              {/* Color Gradient Dot Preview */}
              {preset.settings.background && (
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isSelected ? 'border border-black/40' : 'border border-white/30'
                  }`}
                  style={{ background: preset.settings.background }}
                />
              )}
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
