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
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export const UserJourneyTour: React.FC<UserJourneyTourProps> = ({ isOpen, onClose, isDark }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: StepItem[] = [
    {
      targetId: 'export-container',
      title: 'Code Editor Canvas and Multi-File Tabs',
      subtitle: 'Step 1 of 4',
      description: 'Type or paste code here. Create multiple tabs, switch tabs, or double-click any tab title to rename it.',
      tip: 'Double-click any tab title to rename file extensions.',
      arrowPosition: 'bottom',
    },
    {
      targetId: 'motion-card',
      title: 'Motion Code Typing Simulator',
      subtitle: 'Step 2 of 4',
      description: 'Use the sidebar controls to simulate character-by-character typing animations and record WebM videos.',
      tip: 'Adjust speed between 0.5x, 1x, and 2x.',
      arrowPosition: 'left',
    },
    {
      targetId: 'customization-card',
      title: 'Themes and Canvas Aspect Ratios',
      subtitle: 'Step 3 of 4',
      description: 'Select from 16+ programming languages, 10+ VS Code syntax themes, and canvas aspect ratios including 9:16.',
      tip: 'Toggle Code Diff Mode to highlight additions (+) and deletions (-).',
      arrowPosition: 'left',
    },
    {
      targetId: 'header-actions',
      title: 'Exporting and Shareable Live Links',
      subtitle: 'Step 4 of 4',
      description: 'Export 3x Retina PNGs, SVGs, or click Share in the header to generate a live link with your code.',
      tip: 'Press Cmd/Ctrl + S to quickly download high-res PNGs.',
      arrowPosition: 'top',
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
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
        {/* Semi-Transparent Mask Without Blur so Workspace Elements Behind Remain 100% Readable */}
        <div className="absolute inset-0 bg-black/40 transition-all duration-300" />

        {/* Highlight Ring around Active Element */}
        {targetRect && (
          <motion.div
            initial={false}
            animate={{
              top: Math.max(10, targetRect.top - 8),
              left: Math.max(10, targetRect.left - 8),
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="absolute rounded-2xl border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] pointer-events-none z-10"
          />
        )}

        {/* Dynamic Tooltip Dialog Card with Pointing Pointer Arrow */}
        <div className="absolute inset-0 flex items-center justify-center p-4 z-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden flex flex-col relative pointer-events-auto ${
              isDark ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100' : 'bg-white/95 border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Pointer Arrow Connector */}
            {step.arrowPosition === 'top' && (
              <div className={`absolute -top-2 right-12 w-4 h-4 rotate-45 border-t border-l ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`} />
            )}
            {step.arrowPosition === 'bottom' && (
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-b border-r ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`} />
            )}

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
