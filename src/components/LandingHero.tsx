import React from 'react';
import { Camera, Sparkles, Layers, GitCompare, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import type { SnippetSettings } from '../types';

interface LandingHeroProps {
  settings: SnippetSettings;
  onScrollToEditor: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ settings, onScrollToEditor }) => {
  const isDark = settings.appTheme === 'dark';

  return (
    <div
      className={`w-full py-12 px-6 lg:px-12 flex flex-col items-center text-center border-b transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 border-zinc-800/80 text-zinc-100'
          : 'bg-gradient-to-b from-white via-zinc-50 to-white border-zinc-200 text-zinc-900'
      }`}
    >
      {/* Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border transition-all ${
          isDark
            ? 'bg-zinc-900 text-zinc-300 border-zinc-700/80'
            : 'bg-zinc-100 text-zinc-700 border-zinc-300'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>CodeSnap 2.0 • Zero Friction & Privacy-First</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl font-sans mb-4 leading-tight">
        Transform Raw Code Into <br className="hidden sm:block" />
        <span className={isDark ? 'text-white underline decoration-zinc-700' : 'text-black underline decoration-zinc-300'}>
          Beautiful Snippet Images
        </span>
      </h1>

      <p className={`text-base sm:text-lg max-w-2xl font-sans mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
        Create production-ready code snippet graphics for X (Twitter), LinkedIn, docs, and slides in seconds without login or signup.
      </p>

      {/* Primary CTA */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        <button
          onClick={onScrollToEditor}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:scale-105 ${
            isDark
              ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
              : 'bg-black text-white hover:bg-zinc-800 shadow-black/10'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Launch Editor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl text-left">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-xs'
          }`}
        >
          <div className="p-2 w-max rounded-lg bg-indigo-500/10 text-indigo-400 mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold mb-1">Shiki Highlighting</h3>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Pixel-perfect syntax highlighting identical to VS Code with TextMate grammars.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-xs'
          }`}
        >
          <div className="p-2 w-max rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold mb-1">Multi-File Tabs</h3>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Showcase multiple files in a single snippet window with instant tab switching.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-xs'
          }`}
        >
          <div className="p-2 w-max rounded-lg bg-amber-500/10 text-amber-400 mb-3">
            <GitCompare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold mb-1">Code Diff Mode</h3>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Highlight line additions (+) and deletions (-) for refactoring and PR updates.
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-xs'
          }`}
        >
          <div className="p-2 w-max rounded-lg bg-purple-500/10 text-purple-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold mb-1">100% Client-Side Privacy</h3>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Zero server uploads. All processing and high-DPI 3x image exports happen in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};
