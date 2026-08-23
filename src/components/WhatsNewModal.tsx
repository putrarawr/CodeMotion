import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Share,
  FileCode,
  Video,
  Palette,
  Layers,
  X,
  ArrowRight,
} from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  const updates = [
    {
      icon: <Video className="w-3.5 h-3.5 text-zinc-200" />,
      title: '60FPS Motion Recording (MP4 & GIF)',
      description: 'Record typewriter & line-by-line code animation videos with zero CPU freeze.',
    },
    {
      icon: <FileCode className="w-3.5 h-3.5 text-zinc-200" />,
      title: 'ISO Standard MP4 Container',
      description: 'Outputs pure ISO MP4 video files with instant browser downloads across all platforms.',
    },
    {
      icon: <Sparkles className="w-3.5 h-3.5 text-zinc-200" />,
      title: 'Export Appreciation Modal',
      description: 'Instant export thank-you dialog with Saweria support & 1-click GitHub star actions.',
    },
    {
      icon: <Share className="w-3.5 h-3.5 text-zinc-200" />,
      title: 'LZ Hash URL Compression',
      description: 'Share complete code, settings, and themes using ultra-short URL hash links.',
    },
    {
      icon: <Layers className="w-3.5 h-3.5 text-zinc-200" />,
      title: 'Monochrome Obsidian Layout',
      description: 'Vercel-inspired monochrome dark theme with responsive non-overlapping header controls.',
    },
    {
      icon: <Palette className="w-3.5 h-3.5 text-zinc-200" />,
      title: 'Guided Tour & Shortcuts',
      description: 'Step-by-step interactive onboarding tour and Cmd/Ctrl + S instant export shortcuts.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 py-3.5 border-b flex items-center justify-between ${
              isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center border ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold tracking-tight m-0">What's New in CodeMotion</h2>
            </div>

            <button
              onClick={onClose}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-black'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid List */}
          <div className="p-4 overflow-y-auto flex flex-col gap-2 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {updates.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                    isDark
                      ? 'bg-zinc-900/40 border-zinc-800/70 hover:border-zinc-700'
                      : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1 rounded-md border flex-shrink-0 ${
                        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-[11px] font-bold m-0 leading-tight truncate">{item.title}</h3>
                  </div>
                  <p className={`text-[10px] leading-relaxed m-0 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div
            className={`p-3.5 border-t flex items-center justify-end ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <span>Explore Features</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
