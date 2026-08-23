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
  dialogPosition: 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right' | 'center';
}

export const UserJourneyTour: React.FC<UserJourneyTourProps> = ({ isOpen, onClose, isDark }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: StepItem[] = [
    {
      targetId: 'export-container',
      title: 'Interactive Code Canvas & Multi-Tabs',
      subtitle: 'Step 1 of 5',
      description: 'Type or paste code directly into the editor frame. Double-click any tab title to rename file extensions, or click + to add multi-file tabs.',
      tip: 'Drag the side handles on the canvas frame to dynamically resize width.',
      dialogPosition: 'bottom-right',
    },
    {
      targetId: 'editor-sidebar',
      title: 'Scrollable Sidebar Control Panel',
      subtitle: 'Step 2 of 5',
      description: 'The control panel on the right is scrollable! Scroll down inside the sidebar using your mouse or touchpad to customize backgrounds, fonts, and padding.',
      tip: 'Scroll down inside the right sidebar to access all canvas styling options.',
      dialogPosition: 'bottom-left',
    },
    {
      targetId: 'sidebar-category-tabs',
      title: '5 Category Navigation Tabs',
      subtitle: 'Step 3 of 5',
      description: 'Use the 5 top category tabs: Theme (syntax & fonts), Motion (typing speed), Notes (line spotlights), Layout (social presets), and Author (username handle).',
      tip: 'Enter your handle in the Author tab to stamp your name on shared snippet links.',
      dialogPosition: 'bottom-left',
    },
    {
      targetId: 'preset-action-bar',
      title: 'Format Code & Auto Language Detect',
      subtitle: 'Step 4 of 5',
      description: 'Use the action bar above the canvas to auto-format bracket indents or detect the code language instantly.',
      tip: 'Format Code supports JS/TS, Python, JSON, CSS, and SQL.',
      dialogPosition: 'bottom-left',
    },
    {
      targetId: 'header-export-actions',
      title: 'High-Res PNG, SVG, Video & Share Link',
      subtitle: 'Step 5 of 5',
      description: 'Export 2x/3x Retina PNGs, vector SVG graphics, record MP4 videos, or export animated GIFs with custom typing styles.',
      tip: 'Press Cmd/Ctrl + S to instantly download 3x Retina PNG images.',
      dialogPosition: 'top-right',
    },
  ];

  const step = steps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      let el = document.getElementById(step.targetId);
      if (!el && (step.targetId === 'header-export-actions' || step.targetId === 'header-actions')) {
        el = document.getElementById('header-export-btn');
      }
      if (!el) {
        el = document.getElementById('export-container');
      }

      if (el) {
        const rect = el.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const style = window.getComputedStyle(el);
          if (style.position !== 'fixed' && style.position !== 'sticky' && (rect.top < 0 || rect.bottom > window.innerHeight)) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          return;
        }
      }

      setTargetRect(null);
    };

    updateRect();
    const interval = setInterval(updateRect, 100);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
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
      case 'top-right':
        return 'top-20 right-4 sm:right-8';
      case 'center':
        return 'bottom-6 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-hidden pointer-events-auto">
        {/* Subtle Semi-Transparent Overlay Mask */}
        <div className="absolute inset-0 bg-black/50 transition-all duration-300" onClick={onClose} />

        {/* Highlight Ring around Active Element */}
        {targetRect && (
          <>
            <motion.div
              initial={false}
              animate={{
                top: Math.max(8, targetRect.top - 6),
                left: Math.max(8, targetRect.left - 6),
                width: targetRect.width + 12,
                height: targetRect.height + 12,
              }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="absolute rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] pointer-events-none z-10"
            />

            {/* Directional Beacon Badge on Highlight Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                top: Math.max(4, targetRect.top - 14),
                left: Math.max(4, targetRect.left + 16),
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-extrabold shadow-2xl border border-black/20 select-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="uppercase tracking-wider">Highlighting Target</span>
            </motion.div>
          </>
        )}

        {/* Floating Tooltip Guide Card */}
        <div className={`absolute ${getDialogPositionClass()} z-20 pointer-events-none p-2`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col pointer-events-auto ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/80' : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-300/50'
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Focus className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Guide</span>
                <span className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>•</span>
                <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{step.subtitle}</span>
              </div>

              <button
                onClick={onClose}
                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-black'
                }`}
                title="Close Guide"
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
                <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`} />
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
                        ? isDark ? 'w-5 bg-white' : 'w-5 bg-black'
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
