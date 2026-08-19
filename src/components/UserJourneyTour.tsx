import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, CheckCircle2, Focus } from 'lucide-react';

interface UserJourneyTourProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

interface StepItem {
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  dialogPosition: 'bottom-right' | 'bottom-left' | 'top-left' | 'center';
}

export const UserJourneyTour: React.FC<UserJourneyTourProps> = ({ isOpen, onClose, isDark }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: StepItem[] = [
    {
      targetId: 'export-container',
      title: 'Interactive Canvas & Resizing',
      subtitle: 'Step 1 of 3',
      description: 'Type code, add tabs, and drag the side handles or slider to dynamically resize your code snippet canvas width.',
      tip: 'Double-click any tab title to rename file extensions.',
      dialogPosition: 'bottom-right',
    },
    {
      targetId: 'editor-sidebar',
      title: 'Control Panel & Social Templates',
      subtitle: 'Step 2 of 3',
      description: 'Switch tabs in the sidebar for VS Code syntax themes, Motion typing animation speed, Social Media templates, and Watermark Logo upload.',
      tip: 'Upload custom company logos or Twitter avatars to overlay on the watermark badge.',
      dialogPosition: 'bottom-left',
    },
    {
      targetId: 'header-actions',
      title: 'High-Res Export & Download',
      subtitle: 'Step 3 of 3',
      description: 'Export 2x/3x Retina PNGs, vector SVG graphics, or record WebM video files.',
      tip: 'Press Cmd/Ctrl + S to quickly download 3x Retina PNGs.',
      dialogPosition: 'bottom-left',
    },
  ];

  const step = steps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timeout = setTimeout(updateRect, 100);
    window.addEventListener('resize', updateRect);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateRect);
    };
  }, [isOpen, currentStep, step.targetId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getDialogPositionClass = () => {
    switch (step.dialogPosition) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-left':
        return 'top-20 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
        {/* Subtle Semi-Transparent Overlay Mask */}
        <div className="absolute inset-0 bg-black/35 transition-all duration-300" onClick={onClose} />

        {/* Highlight Ring around Active Element */}
        {targetRect && (
          <motion.div
            initial={false}
            animate={{
              top: Math.max(10, targetRect.top - 6),
              left: Math.max(10, targetRect.left - 6),
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="absolute rounded-2xl border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] pointer-events-none z-10"
          />
        )}

        {/* Floating Tooltip Guide Card */}
        <div className={`absolute ${getDialogPositionClass()} z-20 pointer-events-none p-2`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col pointer-events-auto ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Focus className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Guide</span>
                <span className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>•</span>
                <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{step.subtitle}</span>
              </div>

              <button
                onClick={onClose}
                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-black'
                }`}
                title="Close Tour"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 flex flex-col gap-3">
              <h2 className="text-xs font-bold tracking-tight m-0">{step.title}</h2>

              <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {step.description}
              </p>

              <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
                <span>{step.tip}</span>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentStep === idx
                        ? 'w-5 bg-sky-400'
                        : isDark
                        ? 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
                        : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className={`p-3 border-t flex items-center justify-between ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className={`px-2 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
                  }`}
                >
                  Skip
                </button>

                <button
                  onClick={handleNext}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStep < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
