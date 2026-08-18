import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { Loader2 } from 'lucide-react';

interface VideoLoadingOverlayProps {
  progress: number;
  isDark: boolean;
}

export const VideoLoadingOverlay: React.FC<VideoLoadingOverlayProps> = ({ progress, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none"
    >
      <div
        className={`w-full max-w-sm rounded-3xl p-8 border shadow-2xl flex flex-col items-center text-center transition-all ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800 text-zinc-100'
            : 'bg-white/95 border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Animated Brand Logo & Spinner */}
        <div className="relative mb-6">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-inner flex items-center justify-center">
            <Logo className="w-10 h-10 animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin absolute -top-2 -right-2" />
        </div>

        <h3 className="text-base font-bold tracking-tight mb-1 font-sans">
          Rendering Motion Video
        </h3>
        <p className={`text-xs mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Generating smooth high-resolution WebM animation...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-[11px] opacity-70">Progress</span>
            <span className="text-sky-400">{progress}%</span>
          </div>

          <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 rounded-full"
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
