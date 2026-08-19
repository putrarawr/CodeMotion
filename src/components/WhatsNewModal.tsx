import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Share2, Video, GitCompare, Layers, ShieldCheck, X, ArrowRight } from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  const updates = [
    {
      icon: <Zap className="w-3.5 h-3.5 text-sky-400" />,
      title: 'Motion Code Typing Simulator',
      description: 'Simulate character typing live & export smooth WebM videos.',
      tag: 'Popular',
    },
    {
      icon: <Share2 className="w-3.5 h-3.5 text-indigo-400" />,
      title: 'Instant Code Share Links',
      description: 'Share live code snippets via shareable URL hash.',
      tag: 'New',
    },
    {
      icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
      title: '9:16 Reel & Story Ratio',
      description: 'Vertical canvas presets for Shorts, TikTok, and Stories.',
      tag: 'New',
    },
    {
      icon: <GitCompare className="w-3.5 h-3.5 text-emerald-400" />,
      title: 'Code Diff Refactor Mode',
      description: 'Highlight line additions (+) and deletions (-).',
    },
    {
      icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
      title: 'Multi-File Tabbed Snippets',
      description: 'Organize file tabs inside a single window frame.',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />,
      title: '100% Client-Side Privacy',
      description: 'Zero server uploads. Processed locally in your browser.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {/* Compact Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${
              isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-sky-400' : 'bg-zinc-100 border-zinc-300 text-sky-600'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-bold tracking-tight m-0">What's New in CodeMotion</h2>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold border ${
                    isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                  }`}>
                    v2.4
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-black'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact Grid List */}
          <div className="p-3.5 overflow-y-auto flex flex-col gap-2 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {updates.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1 ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800/70 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        {item.icon}
                      </div>
                      <h3 className="text-[11px] font-bold m-0 leading-tight">{item.title}</h3>
                    </div>
                    {item.tag && (
                      <span className={`text-[8px] font-mono font-semibold uppercase tracking-wider px-1 py-0.2 rounded border ${
                        isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-200 text-zinc-700 border-zinc-300'
                      }`}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] leading-relaxed m-0 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Footer Action */}
          <div className={`p-3 border-t flex items-center justify-between ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              v2.4.0 Release
            </span>
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <span>Got it, Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
