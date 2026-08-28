import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Loader2, X } from 'lucide-react';

interface VideoLoadingOverlayProps {
  progress: number;
  isDark: boolean;
  onCancel?: () => void;
}

export const VideoLoadingOverlay: React.FC<VideoLoadingOverlayProps> = ({
  progress,
  isDark,
  onCancel,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed bottom-6 right-6 z-[9999] pointer-events-auto select-none"
    >
      <div
        className={`w-72 sm:w-80 rounded-2xl p-4 border shadow-2xl flex flex-col gap-3 backdrop-blur-md transition-all ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800 text-zinc-100'
            : 'bg-white/95 border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
              <Logo className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 text-zinc-300 animate-spin" />
                <h3 className="text-xs font-bold tracking-tight font-sans m-0">
                  Background Render
                </h3>
              </div>
              <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Generating MP4 / GIF video...
              </span>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
              }`}
              title="Cancel Render"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress Bar Container */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold">
            <span className="opacity-70">Processing frames</span>
            <span className="text-zinc-200">{progress}%</span>
          </div>

          <div className={`w-full h-1.5 rounded-full overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'}`}>
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
