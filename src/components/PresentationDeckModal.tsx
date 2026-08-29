import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Monitor } from 'lucide-react';
import type { LibrarySnapshot, SnippetSettings } from '../types';
import { Canvas } from './Canvas';

interface PresentationDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  librarySnapshots: LibrarySnapshot[];
  currentSettings: SnippetSettings;
}

export const PresentationDeckModal: React.FC<PresentationDeckModalProps> = ({
  isOpen,
  onClose,
  librarySnapshots,
  currentSettings,
}) => {
  // Use library snapshots as presentation slides; fallback to active tab snippet
  const slides: LibrarySnapshot[] =
    librarySnapshots.length > 0
      ? [
          // Always include current editor content as first slide
          {
            id: 'current-slide',
            name: currentSettings.tabs[0]?.title || 'Current Code',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            settings: currentSettings,
          },
          ...librarySnapshots,
        ]
      : [
          {
            id: 'current-slide',
            name: currentSettings.tabs[0]?.title || 'Code Slide 1',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            settings: currentSettings,
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = slides[activeIndex] || slides[0];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Keyboard Arrow Navigation (Left / Right Arrow Keys)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 text-white flex flex-col justify-between p-4 sm:p-8 select-none pointer-events-auto overflow-hidden">
      {/* Top Header Deck Toolbar */}
      <div className="w-full flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold m-0 font-sans tracking-tight">
              Code Presentation Deck
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Slide {activeIndex + 1} of {slides.length} • {activeSlide.name}
            </span>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
            <span>Use Left/Right arrow keys to navigate</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Exit Presentation Deck (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Viewer Canvas Stage */}
      <div className="flex-1 flex items-center justify-center relative w-full my-4 overflow-hidden">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-black/60 hover:bg-zinc-800 border border-white/20 text-white transition-all cursor-pointer shadow-2xl backdrop-blur-md"
          title="Previous Slide (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Slide Stage Container with Smooth Non-Glitching Fade Transition */}
        <div className="w-full h-full flex items-center justify-center relative max-w-5xl px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="w-full flex items-center justify-center"
            >
              <Canvas
                settings={activeSlide.settings}
                setSettings={() => {}}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-black/60 hover:bg-zinc-800 border border-white/20 text-white transition-all cursor-pointer shadow-2xl backdrop-blur-md"
          title="Next Slide (Right Arrow or Space)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Progress Bar & Slide Dots */}
      <div className="w-full flex flex-col items-center gap-3 z-20">
        <div className="flex items-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? 'w-8 bg-white shadow-glow' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={`Jump to slide ${idx + 1}: ${slide.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
