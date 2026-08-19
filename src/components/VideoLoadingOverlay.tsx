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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none"
    >
      <div
        className={`w-full max-w-xs rounded-2xl p-6 border shadow-2xl flex flex-col items-center text-center transition-all relative ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Top Right Close / Cancel Icon Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className={`absolute top-3 right-3 p-1 rounded-lg border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
            title="Cancel Recording"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Animated Brand Logo & Spinner */}
        <div className="relative mb-3 mt-1">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 shadow-inner flex items-center justify-center">
            <Logo className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="w-5 h-5 text-sky-400 animate-spin absolute -top-1 -right-1" />
        </div>

        <h3 className="text-xs font-bold tracking-tight mb-0.5 font-sans">
          Rendering Motion Video
        </h3>
        <p className={`text-[11px] mb-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Exporting 60 FPS WebM animation...
        </p>

        {/* Progress Bar Container with Solid Color */}
        <div className="w-full flex flex-col gap-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-[10px] opacity-70">Progress</span>
            <span className="text-sky-400">{progress}%</span>
          </div>

          <div className={`w-full h-2 rounded-full overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'}`}>
            <motion.div
              className="h-full bg-sky-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200 hover:text-black'
            }`}
          >
            Cancel Render
          </button>
        )}
      </div>
    </motion.div>
  );
};
