import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiRust,
  SiGo,
  SiCplusplus,
  SiReact,
  SiPostgresql,
  SiGnubash,
  SiPhp,
  SiHtml5,
  SiCss,
  SiJson,
  SiMarkdown,
} from 'react-icons/si';
import {
  Sparkles,
  Layers,
  GitCompare,
  Zap,
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Palette,
  Play,
  Pause,
  RotateCcw,
  Video,
} from 'lucide-react';
import type { SnippetSettings } from '../types';
import { Logo } from './Logo';
import { WhatsNewModal } from './WhatsNewModal';

interface LandingPageProps {
  settings: SnippetSettings;
  onToggleAppTheme: () => void;
}

// Tokenized code tokens for colorful syntax highlighting during motion typing
interface CodeToken {
  text: string;
  type: 'keyword' | 'function' | 'string' | 'number' | 'comment' | 'class' | 'property' | 'plain';
}

const MOTION_PREVIEW_TOKENS: CodeToken[] = [
  { text: '// Motion Code Typing Simulator\n', type: 'comment' },
  { text: 'async ', type: 'keyword' },
  { text: 'function ', type: 'keyword' },
  { text: 'renderMotionVideo', type: 'function' },
  { text: '() {\n', type: 'plain' },
  { text: '  const ', type: 'keyword' },
  { text: 'recorder = ', type: 'plain' },
  { text: 'new ', type: 'keyword' },
  { text: 'MotionRecorder', type: 'class' },
  { text: '();\n', type: 'plain' },
  { text: '  await ', type: 'keyword' },
  { text: 'recorder.', type: 'plain' },
  { text: 'typeCode', type: 'function' },
  { text: '({ ', type: 'plain' },
  { text: 'speed', type: 'property' },
  { text: ': ', type: 'plain' },
  { text: '2.0', type: 'number' },
  { text: ' });\n', type: 'plain' },
  { text: '  return ', type: 'keyword' },
  { text: 'recorder.', type: 'plain' },
  { text: 'exportWebM', type: 'function' },
  { text: '();\n', type: 'plain' },
  { text: '}', type: 'plain' },
];

const TOTAL_MOTION_CHARS = MOTION_PREVIEW_TOKENS.reduce((acc, t) => acc + t.text.length, 0);

export const LandingPage: React.FC<LandingPageProps> = ({ settings, onToggleAppTheme }) => {
  const isDark = settings.appTheme === 'dark';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(true);

  // Motion Code Simulator Interactive Demo State
  const [motionTypedIndex, setMotionTypedIndex] = useState(0);
  const [isMotionPlaying, setIsMotionPlaying] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState<0.5 | 1 | 2>(1);

  useEffect(() => {
    setIsWhatsNewOpen(true);
  }, []);

  // Motion Code Character Typing Interval Effect
  useEffect(() => {
    if (!isMotionPlaying) return;

    const baseDelay = 40; // ms per character
    const intervalTime = baseDelay / motionSpeed;

    const interval = setInterval(() => {
      setMotionTypedIndex((prev) => {
        if (prev >= TOTAL_MOTION_CHARS) {
          return 0;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isMotionPlaying, motionSpeed]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const languages = [
    { name: 'TypeScript', icon: <SiTypescript className="w-4 h-4 text-[#3178C6]" /> },
    { name: 'JavaScript', icon: <SiJavascript className="w-4 h-4 text-[#F7DF1E]" /> },
    { name: 'Python', icon: <SiPython className="w-4 h-4 text-[#3776AB]" /> },
    { name: 'Rust', icon: <SiRust className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" /> },
    { name: 'Go', icon: <SiGo className="w-4 h-4 text-[#00ADD8]" /> },
    { name: 'C++', icon: <SiCplusplus className="w-4 h-4 text-[#00599C]" /> },
    { name: 'React TSX', icon: <SiReact className="w-4 h-4 text-[#61DAFB]" /> },
    { name: 'PostgreSQL', icon: <SiPostgresql className="w-4 h-4 text-[#4169E1]" /> },
    { name: 'Bash Shell', icon: <SiGnubash className="w-4 h-4 text-[#4EAA25]" /> },
    { name: 'PHP', icon: <SiPhp className="w-4 h-4 text-[#777BB4]" /> },
    { name: 'HTML5', icon: <SiHtml5 className="w-4 h-4 text-[#E34F26]" /> },
    { name: 'CSS3', icon: <SiCss className="w-4 h-4 text-[#1572B6]" /> },
    { name: 'JSON', icon: <SiJson className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" /> },
    { name: 'Markdown', icon: <SiMarkdown className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" /> },
  ];

  const themes = [
    { name: 'Vitesse Dark', dot: 'bg-emerald-400' },
    { name: 'Dracula Official', dot: 'bg-purple-400' },
    { name: 'Nord Slate', dot: 'bg-cyan-400' },
    { name: 'One Dark Pro', dot: 'bg-blue-400' },
    { name: 'Tokyo Night', dot: 'bg-indigo-400' },
    { name: 'Catppuccin Mocha', dot: 'bg-rose-400' },
    { name: 'GitHub Dark', dot: 'bg-zinc-400' },
    { name: 'GitHub Light', dot: 'bg-amber-400' },
    { name: 'Ayu Dark', dot: 'bg-orange-400' },
    { name: 'Synthwave 84', dot: 'bg-pink-400' },
  ];

  const faqs = [
    {
      q: 'Is CodeMotion completely free to use?',
      a: 'Yes, 100% free with no hidden paywalls, subscription fees, or export limits.',
    },
    {
      q: 'What is the Motion Code feature?',
      a: 'Motion Code simulates a real-time typing animation for your code snippet, allowing you to showcase how code is written step by step.',
    },
    {
      q: 'Is my source code private and secure?',
      a: 'Absolutely. CodeMotion processes everything locally in your browser using Shiki and HTML5 Canvas API. Your code is never sent to any external server.',
    },
    {
      q: 'Why is the syntax highlighting so accurate?',
      a: 'CodeMotion utilizes Shiki, the exact same syntax highlighting engine used inside VS Code with official TextMate grammars.',
    },
    {
      q: 'What formats can I export my code snippets into?',
      a: 'You can export high-resolution PNG images at 2x or 3x DPI (Retina), vector SVG files, or write PNG blobs directly to your clipboard.',
    },
  ];

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Render colorful syntax highlighted tokens up to motionTypedIndex
  const renderTypedTokens = () => {
    let charCounter = 0;
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < MOTION_PREVIEW_TOKENS.length; i++) {
      const token = MOTION_PREVIEW_TOKENS[i];
      const remainingChars = motionTypedIndex - charCounter;

      if (remainingChars <= 0) break;

      const visibleText = token.text.slice(0, remainingChars);
      charCounter += token.text.length;

      let colorClass = 'text-zinc-200';
      if (token.type === 'keyword') colorClass = 'text-purple-400 font-semibold';
      else if (token.type === 'function') colorClass = 'text-yellow-300 font-semibold';
      else if (token.type === 'string') colorClass = 'text-emerald-400';
      else if (token.type === 'number') colorClass = 'text-amber-400 font-mono';
      else if (token.type === 'comment') colorClass = 'text-zinc-500 italic';
      else if (token.type === 'class') colorClass = 'text-sky-300 font-semibold';
      else if (token.type === 'property') colorClass = 'text-sky-400';

      elements.push(
        <span key={i} className={colorClass}>
          {visibleText}
        </span>
      );
    }

    return elements;
  };

  const progressPercent = Math.min(100, Math.round((motionTypedIndex / TOTAL_MOTION_CHARS) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 overflow-x-hidden ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* Release Notes Update Modal Popup on Landing Page */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
        isDark={isDark}
      />

      {/* 1. Header Navigation */}
      <header
        className={`h-16 w-full border-b px-6 lg:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md ${
          isDark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white/80 border-zinc-200'
        }`}
      >
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
            }`}
          >
            <Logo className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">CodeMotion</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <a href="#motion-preview" className={`hover:underline ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            Motion Demo
          </a>
          <a href="#features" className={`hover:underline ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            Features
          </a>
          <a href="#languages" className={`hover:underline ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            Languages & Themes
          </a>
          <a href="#faq" className={`hover:underline ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            FAQ
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAppTheme}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-800" />}
          </button>

          <Link
            to="/editor"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md transform hover:scale-105 no-underline ${
              isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            <span>Open App Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section (Matching Deployed Screenshot codemotion.biz.id) */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col items-center justify-center text-center px-6 lg:px-12 pt-16 pb-12 max-w-5xl mx-auto"
      >
        <motion.div
          variants={fadeInUp}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-8 uppercase border ${
            isDark ? 'bg-zinc-900 text-zinc-300 border-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>ZERO-FRICTION CODE GRAPHICS & TYPING MOTION</span>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6 font-sans"
        >
          Turn Code Into High-Res <br />
          <span className="underline decoration-zinc-700 underline-offset-8">Production & Motion</span> <br />
          <span className="underline decoration-zinc-700 underline-offset-8">Images</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className={`text-base sm:text-lg max-w-2xl font-normal leading-relaxed mb-8 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          Create aesthetic code snippet graphics and animated typing motions for X, LinkedIn, blogs, and presentations.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link
            to="/editor"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-xl transform hover:scale-105 no-underline"
          >
            <Logo className="w-5 h-5 text-black" />
            <span>Launch CodeMotion Editor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Hero Code Window Preview Box (Matching Deployed Screenshot) */}
        <motion.div variants={fadeInUp} className="w-full max-w-3xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e] p-6 shadow-2xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-zinc-400 font-semibold">App.tsx</span>
              <div className="w-12" />
            </div>

            <div className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-300 overflow-x-auto p-2">
              <div>
                <span className="text-purple-400 font-semibold">import</span> &#123; playMotion &#125; <span className="text-purple-400 font-semibold">from</span> <span className="text-emerald-400">'@codemotion/core'</span>;
              </div>
              <br />
              <div>
                <span className="text-purple-400 font-semibold">const</span> snippet = <span className="text-purple-400 font-semibold">await</span> <span className="text-yellow-300 font-semibold">playMotion</span>(&#123;
              </div>
              <div>&nbsp;&nbsp;language: <span className="text-emerald-400">'typescript'</span>,</div>
              <div>&nbsp;&nbsp;motionSpeed: <span className="text-amber-400 font-mono">2.0</span>,</div>
              <div>&nbsp;&nbsp;pixelRatio: <span className="text-amber-400 font-mono">3</span>,</div>
              <div>&#125;);</div>
            </div>

            <div className="flex justify-end mt-4">
              <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500">
                codemotion.dev
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* 3. Dedicated Motion Code Interactive Preview Section (Matching Top Hero Card Styling & Colorful Syntax) */}
      <section id="motion-preview" className={`py-16 px-6 lg:px-12 border-t ${isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border text-sky-400 bg-sky-500/10 border-sky-500/30">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>MOTION CODE SIMULATOR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Animate Typing Character by Character
            </h2>
            <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Real-time typing simulation with colorful VS Code syntax highlighting.
            </p>
          </div>

          {/* Harmonious Card Container (Same bg-[#0c0c0e] border border-zinc-800 rounded-2xl shadow-2xl p-6 as Top Hero Card) */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e] p-6 shadow-2xl relative overflow-hidden text-left">
            {/* Window Header Bar with Red/Yellow/Green Dots & Controls */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>

              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono text-zinc-400 font-semibold">MotionRecorder.ts</span>
              </div>

              {/* Playback Controls & Speed Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMotionPlaying(!isMotionPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-300 text-black hover:bg-zinc-200'
                  }`}
                >
                  {isMotionPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400 fill-current" />}
                  <span>{isMotionPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => {
                    setMotionTypedIndex(0);
                    setIsMotionPlaying(true);
                  }}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                  }`}
                  title="Restart Typing Animation"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
                  {([0.5, 1, 2] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setMotionSpeed(spd)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        motionSpeed === spd
                          ? 'bg-sky-500 text-white border-sky-400'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Text Body with Real-Time Colorful Syntax Highlighting & Cursor Caret */}
            <div className="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto p-2 min-h-[150px]">
              <pre className="m-0 font-mono whitespace-pre-wrap">
                {renderTypedTokens()}
                <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-0.5 align-middle" />
              </pre>
            </div>

            {/* Footer with Progress Bar & Watermark Pill */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-4">
              <div className="flex-1 max-w-xs h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-75"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-zinc-500">
                  {progressPercent}%
                </span>
                <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500">
                  codemotion.dev
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto w-full border-t border-zinc-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Built for Modern Developers & Content Creators
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Everything you need to showcase clean code snippets to the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all hover:border-zinc-600 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">VS Code Shiki Engine</h3>
            <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Uses the exact same syntax highlighting engine as VS Code with official TextMate grammars.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border transition-all hover:border-zinc-600 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Multi-Tab File Navigation</h3>
            <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Organize multiple file tabs inside a single window frame with inline tab renaming.
            </p>
          </div>

          <div className={`p-6 rounded-3xl border transition-all hover:border-zinc-600 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Code Diff Mode</h3>
            <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Highlight line additions (+) and deletions (-) to showcase refactoring and code reviews.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Dynamic Infinite Marquee Languages & Themes */}
      <motion.section
        id="languages"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`py-16 border-t overflow-hidden relative ${
          isDark ? 'bg-zinc-950/60 border-zinc-800/40' : 'bg-zinc-50 border-zinc-200'
        }`}
      >
        <div className="text-center mb-10 px-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Supported Languages & VS Code Themes</h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Out-of-the-box support for your favorite stacks and color schemes.
          </p>
        </div>

        {/* Infinite Moving Marquee Ticker Container */}
        <div className="relative w-full flex flex-col gap-5 py-4 overflow-hidden">
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-48 z-20 ${
              isDark
                ? 'bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent'
                : 'bg-gradient-to-r from-[#fafafa] via-[#fafafa]/80 to-transparent'
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-48 z-20 ${
              isDark
                ? 'bg-gradient-to-l from-[#09090b] via-[#09090b]/80 to-transparent'
                : 'bg-gradient-to-l from-[#fafafa] via-[#fafafa]/80 to-transparent'
            }`}
          />

          {/* Row 1: Languages with Official Tech Icons Moving Left */}
          <div className="flex w-max animate-marquee gap-3">
            {[...languages, ...languages].map((lang, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all hover:scale-105 ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-center p-1 rounded-lg bg-zinc-800/40">
                  {lang.icon}
                </div>
                <span>{lang.name}</span>
              </div>
            ))}
          </div>

          {/* Row 2: Themes Moving Right */}
          <div className="flex w-max animate-marquee-reverse gap-3">
            {[...themes, ...themes].map((t, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-sans font-semibold transition-all hover:scale-105 ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                <Palette className="w-3.5 h-3.5 opacity-60" />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-16 px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold">{faq.q}</span>
                {openFaqIndex === index ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>
              {openFaqIndex === index && (
                <div className={`px-4 pb-4 text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 text-white shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Ready to Create Code Snippet Images & Motion?</h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            No signup, no login required. Transform plain text code into stunning production graphics and motion in seconds.
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all transform hover:scale-105 no-underline shadow-xl"
          >
            <Logo className="w-5 h-5 text-black" />
            <span>Open CodeMotion Editor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-auto border-t py-8 px-6 text-center text-xs ${isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-500' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}`}>
        <p className="m-0">© 2026 CodeMotion : Zero-Friction Code Snippet & Motion Generator.</p>
      </footer>
    </motion.div>
  );
};
