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
  SiGit,
  SiGithub,
  SiInstagram,
  SiTelegram,
} from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';
import {
  Layers,
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
  Sparkles,
  FileCode,
  ArrowUpRight,
  ArrowUp,
  Coffee,
} from 'lucide-react';
import type { SnippetSettings } from '../types';
import { SNIPPET_TEMPLATES, TEMPLATE_CATEGORIES, type SnippetTemplate } from '../utils/snippetTemplates';
import { Logo } from './Logo';
import { WhatsNewModal } from './WhatsNewModal';

interface LandingPageProps {
  settings: SnippetSettings;
  onToggleAppTheme: () => void;
  onSelectTemplate?: (template: SnippetTemplate) => void;
}

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
  { text: 'exportMP4', type: 'function' },
  { text: '();\n', type: 'plain' },
  { text: '}', type: 'plain' },
];

const TOTAL_MOTION_CHARS = MOTION_PREVIEW_TOKENS.reduce((acc, t) => acc + t.text.length, 0);

export const LandingPage: React.FC<LandingPageProps> = ({ settings, onToggleAppTheme, onSelectTemplate }) => {
  const isDark = settings.appTheme === 'dark';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [landingTemplateCategory, setLandingTemplateCategory] = useState<string>('all');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [motionTypedIndex, setMotionTypedIndex] = useState(0);
  const [isMotionPlaying, setIsMotionPlaying] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState<0.5 | 1 | 2>(1);

  useEffect(() => {
    if (!isMotionPlaying) return;

    const baseDelay = 40;
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
      q: 'Is CodeMotion free to use?',
      a: 'Yes. CodeMotion runs directly in your browser without subscription fees, paywalls, or export limits.',
    },
    {
      q: 'How does syntax highlighting work?',
      a: 'CodeMotion uses Shiki, the exact syntax engine used inside VS Code with official TextMate grammars.',
    },
    {
      q: 'Where is my source code processed?',
      a: 'All rendering happens locally on your device via HTML5 Canvas. Your code is never sent to external servers.',
    },
    {
      q: 'What formats can I export?',
      a: 'You can export high-resolution PNG images at 2x or 3x DPI, vector SVG files, HD MP4 videos, or smooth Animated GIFs.',
    },
  ];

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

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

  // Hero Section Dynamic Typing Effect
  const HERO_TYPING_PHRASES = [
    'coding tutorial videos.',
    'animated Shorts & Reels.',
    'high-res code graphics.',
    'beautiful social posts.',
  ];

  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [heroDisplayedText, setHeroDisplayedText] = useState('');
  const [heroIsDeleting, setHeroIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = HERO_TYPING_PHRASES[heroPhraseIndex];
    const speed = heroIsDeleting ? 30 : 65;

    const timer = setTimeout(() => {
      if (!heroIsDeleting) {
        setHeroDisplayedText(currentPhrase.slice(0, heroDisplayedText.length + 1));
        if (heroDisplayedText === currentPhrase) {
          setTimeout(() => setHeroIsDeleting(true), 2000);
        }
      } else {
        setHeroDisplayedText(heroDisplayedText.slice(0, heroDisplayedText.length - 1));
        if (heroDisplayedText === '') {
          setHeroIsDeleting(false);
          setHeroPhraseIndex((prev) => (prev + 1) % HERO_TYPING_PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [heroDisplayedText, heroIsDeleting, heroPhraseIndex]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
        isDark={isDark}
      />

      {/* 1. Header Navigation - Clean Dead-Centered Layout */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-3 sm:px-6 flex justify-center select-none pointer-events-auto">
        <header
          className={`w-full rounded-2xl sm:rounded-3xl border shadow-2xl backdrop-blur-xl px-4 py-2 flex items-center justify-between relative transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 text-white shadow-black/60'
              : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-200/50'
          }`}
        >
          {/* Left: Brand Logo */}
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all no-underline flex-shrink-0 z-10 ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-100'
                : 'bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-zinc-900'
            }`}
          >
            <Logo className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold tracking-tight font-sans">CodeMotion</span>
          </Link>

          {/* Center Nav: Shifted Slightly Left */}
          <nav className="absolute left-1/2 -translate-x-1/2 -ml-6 md:-ml-10 lg:-ml-12 hidden md:flex items-center gap-1 sm:gap-2 text-[11px] font-semibold">
            <a
              href="#hero-preview"
              onClick={(e) => scrollToSection(e, 'hero-preview')}
              className={`px-2.5 py-1 rounded-lg transition-all no-underline ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-950/80' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              Motion Demo
            </a>
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className={`px-2.5 py-1 rounded-lg transition-all no-underline ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-950/80' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              Features
            </a>
            <a
              href="#templates"
              onClick={(e) => scrollToSection(e, 'templates')}
              className={`px-2.5 py-1 rounded-lg transition-all no-underline ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-950/80' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              Templates
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className={`px-2.5 py-1 rounded-lg transition-all no-underline ${
                isDark ? 'text-zinc-300 hover:text-white hover:bg-zinc-950/80' : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              FAQ
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 z-10">
            <button
              onClick={() => setIsWhatsNewOpen(true)}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
              title="View Product Updates"
            >
              <Sparkles className="w-3 h-3 text-zinc-300" />
              <span>What's New</span>
            </button>

            <button
              onClick={onToggleAppTheme}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            >
              {isDark ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-zinc-800" />}
            </button>

            <Link
              to="/editor"
              className={`flex items-center gap-1 px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all shadow-md transform hover:scale-105 no-underline ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              <span>Open Editor</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </header>
      </div>

      {/* 2. Hero Section - Clean First Viewport Fold */}
      <section className="min-h-screen flex flex-col justify-between items-center text-center px-6 lg:px-12 pt-28 sm:pt-32 pb-8 max-w-5xl mx-auto w-full relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center justify-center my-auto w-full max-w-4xl"
        >
          <motion.h1
            variants={fadeInUp}
            className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 font-sans text-center mx-auto ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            Turn code snippets into{' '}
            <span className={`inline-block border-b-2 pb-0.5 min-h-[1.2em] ${
              isDark ? 'text-zinc-100 border-zinc-500/80' : 'text-zinc-900 border-zinc-400/80'
            }`}>
              {heroDisplayedText}
              <span className={`animate-pulse font-normal ml-0.5 inline-block ${
                isDark ? 'text-zinc-200' : 'text-zinc-900'
              }`}>|</span>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className={`text-base sm:text-lg max-w-2xl font-normal leading-relaxed mb-10 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Paste code, select an animation style, and export studio-quality typing videos (MP4/GIF) for coding tutorials, YouTube Shorts, Reels, and social posts | zero video editing required.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/editor"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-xl transform hover:scale-105 no-underline"
            >
              <Logo className="w-5 h-5 text-black" />
              <span>Open Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer pt-4"
          onClick={(e) => scrollToSection(e as any, 'hero-preview')}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" />
        </motion.div>
      </section>

      {/* 3. Hero Code Window Preview Section */}
      <section id="hero-preview" className="py-12 px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left text-white">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono text-zinc-400 font-semibold">App.tsx</span>
            <div className="w-12" />
          </div>

          <div className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-200 overflow-x-auto p-2">
            <div>
              <span className="text-purple-400 font-semibold">import</span> &#123; playMotion &#125; <span className="text-purple-400 font-semibold">from</span> <span className="text-emerald-400">'@codemotion/core'</span>;
            </div>
            <br />
            <div>
              <span className="text-purple-400 font-semibold">const</span> snippet = <span className="text-purple-400 font-semibold">await</span> <span className="text-yellow-400 font-semibold">playMotion</span>(&#123;
            </div>
            <div>&nbsp;&nbsp;language: <span className="text-emerald-400">'typescript'</span>,</div>
            <div>&nbsp;&nbsp;motionSpeed: <span className="text-amber-400 font-mono">2.0</span>,</div>
            <div>&nbsp;&nbsp;pixelRatio: <span className="text-amber-400 font-mono">3</span>,</div>
            <div>&#125;);</div>
          </div>

          <div className="flex justify-end mt-4">
            <div className="px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              codemotion.biz.id
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dedicated Motion Code Interactive Preview Section */}
      <section id="motion-preview" className={`py-16 px-6 lg:px-12 border-t ${isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Character-by-Character Typing Motion
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Real-time interactive code typing simulation.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left text-white">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>

              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-mono text-zinc-400 font-semibold">MotionRecorder.ts</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMotionPlaying(!isMotionPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  {isMotionPlaying ? <Pause className="w-3 h-3 text-zinc-300" /> : <Play className="w-3 h-3 text-zinc-100 fill-current" />}
                  <span>{isMotionPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => {
                    setMotionTypedIndex(0);
                    setIsMotionPlaying(true);
                  }}
                  className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
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
                          ? 'bg-zinc-100 text-black border-zinc-100 shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto p-2 min-h-[150px] text-zinc-200">
              <pre className="m-0 font-mono whitespace-pre-wrap">
                {renderTypedTokens()}
                <span className="inline-block w-2 h-4 bg-zinc-200 animate-pulse ml-0.5 align-middle" />
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-4">
              <div className="flex-1 max-w-xs h-1.5 rounded-full overflow-hidden border border-zinc-800 bg-zinc-950">
                <div
                  className="h-full bg-zinc-200 transition-all duration-75"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {progressPercent}%
                </span>
                <div className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/80 text-[10px] font-mono text-zinc-400">
                  codemotion.biz.id
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto w-full border-t border-zinc-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Built for Modern Developers
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Essential tools for rendering code snippet images and motion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden text-left transition-all ${
            isDark
              ? 'border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl hover:border-zinc-700'
              : 'border-zinc-200 bg-white text-zinc-900 shadow-xl hover:shadow-2xl'
          }`}>
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-4 border shadow-xs ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}>
              <VscCode className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>VS Code Shiki Engine</h3>
            <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Powered by Shiki and official TextMate grammars for accurate syntax highlighting.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden text-left transition-all ${
            isDark
              ? 'border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl hover:border-zinc-700'
              : 'border-zinc-200 bg-white text-zinc-900 shadow-xl hover:shadow-2xl'
          }`}>
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-4 border shadow-xs ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Multi-Tab File Navigation</h3>
            <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Organize multiple file tabs inside a single window frame with custom titles.
            </p>
          </div>

          <div className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden text-left transition-all ${
            isDark
              ? 'border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl hover:border-zinc-700'
              : 'border-zinc-200 bg-white text-zinc-900 shadow-xl hover:shadow-2xl'
          }`}>
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-4 border shadow-xs ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
            }`}>
              <SiGit className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Code Diff Mode</h3>
            <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Highlight line additions (+) and deletions (-) for code reviews and refactoring.
            </p>
          </div>
        </div>
      </section>

      {/* 4.5. Dedicated Tutorial Video Slogan & Showcase Section */}
      <section className={`py-16 px-6 lg:px-12 border-t ${isDark ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-zinc-200 bg-white'}`}>
        <div className="max-w-5xl mx-auto w-full text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 font-sans">
            Creating Coding Tutorial Videos Made Effortless
          </h2>
          <p className={`text-base max-w-2xl mx-auto leading-relaxed mb-12 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            No complex video editor needed. Just paste your code, pick an animation style, and get studio-quality 60FPS MP4 videos in seconds for YouTube Shorts, Instagram Reels, TikTok, and video courses.
          </p>

          {/* 3 Simple Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden text-left transition-all ${
              isDark
                ? 'border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl hover:border-zinc-700'
                : 'border-zinc-200 bg-white text-zinc-900 shadow-xl hover:shadow-2xl'
            }`}>
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-4 border shadow-xs font-mono font-extrabold text-sm ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
              }`}>
                01
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Paste & Highlight</h3>
              <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Paste code in any language. Shiki auto-detects syntax and highlights keywords with VS Code accuracy.
              </p>
            </div>

            <div className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden text-left transition-all ${
              isDark
                ? 'border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl hover:border-zinc-700'
                : 'border-zinc-200 bg-white text-zinc-900 shadow-xl hover:shadow-2xl'
            }`}>
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-4 border shadow-xs font-mono font-extrabold text-sm ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
              }`}>
                02
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Select Motion Style</h3>
              <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Choose Typewriter or Line-by-Line motion to simulate realistic typing for your tutorial audience.
              </p>
            </div>

            <div className={`rounded-3xl border p-6 sm:p-8 relative overflow-hidden text-left transition-all ${
              isDark
                ? 'border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl hover:border-zinc-700'
                : 'border-zinc-200 bg-white text-zinc-900 shadow-xl hover:shadow-2xl'
            }`}>
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center mb-4 border shadow-xs font-mono font-extrabold text-sm ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
              }`}>
                03
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Export Pure MP4</h3>
              <p className={`text-xs leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Export 100% pure 60FPS MP4 video files in 2 seconds. Ready to upload directly to social media or courses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Production Code Snippet Templates Gallery */}
      <section id="templates" className={`py-16 px-6 lg:px-12 border-t ${isDark ? 'border-zinc-800/80 bg-zinc-950/30' : 'border-zinc-200 bg-zinc-50/50'}`}>
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Production Code Templates
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Jumpstart your graphics creation with curated, production-ready code snippets.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setLandingTemplateCategory('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                landingTemplateCategory === 'all'
                  ? 'bg-white text-black border-white shadow-md'
                  : isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  : 'bg-white border-zinc-300 text-zinc-600 hover:text-black shadow-xs'
              }`}
            >
              All Templates
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setLandingTemplateCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  landingTemplateCategory === cat
                    ? 'bg-white text-black border-white shadow-md'
                    : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'bg-white border-zinc-300 text-zinc-600 hover:text-black shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Cards Grid (10 Cards - Balanced Grid Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {SNIPPET_TEMPLATES
              .filter((t) => landingTemplateCategory === 'all' || t.category === landingTemplateCategory)
              .map((template) => (
                <div
                  key={template.id}
                  className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between text-left group hover:scale-[1.01] hover:shadow-2xl ${
                    isDark
                      ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                      : 'bg-white border-zinc-200 shadow-md hover:shadow-xl'
                  }`}
                >
                  {/* Card Header Info */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl border flex-shrink-0 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800'}`}>
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold m-0 truncate">{template.name}</h3>
                          <span className={`text-[11px] font-mono truncate block ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {template.fileName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}>
                          {template.language}
                        </span>
                      </div>
                    </div>

                    {/* Theme & Background Showcase Banner */}
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-semibold mb-3 px-1">
                      <span className={`flex items-center gap-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        <Palette className="w-3 h-3 text-zinc-400" />
                        <span>{template.themeName}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] ${
                        isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                      }`}>
                        {template.bgLabel}
                      </span>
                    </div>

                    {/* Visual Code Canvas Preview Box showcasing custom background gradient */}
                    <div
                      className="rounded-2xl p-4 sm:p-5 shadow-inner transition-all relative overflow-hidden"
                      style={{ background: template.background }}
                    >
                      {/* Window Dots Frame Mockup */}
                      <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-3.5 shadow-lg">
                        <div className="flex items-center gap-1.5 mb-3 opacity-70">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                          <span className="text-[10px] font-mono text-zinc-400 ml-2">{template.fileName}</span>
                        </div>

                        <div className="font-mono text-[11px] leading-relaxed text-zinc-200 overflow-hidden max-h-28 relative">
                          <pre className="m-0 font-mono whitespace-pre-wrap">{template.code.split('\n').slice(0, 5).join('\n')}</pre>
                          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className={`p-3.5 px-5 border-t flex items-center justify-between ${isDark ? 'border-zinc-800/80 bg-zinc-950/60' : 'border-zinc-100 bg-zinc-50/60'}`}>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {template.code.split('\n').length} lines
                    </span>

                    <button
                      onClick={() => onSelectTemplate?.(template)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isDark
                          ? 'bg-white text-black border-white hover:bg-zinc-200 shadow-sm'
                          : 'bg-black text-white border-black hover:bg-zinc-800 shadow-sm'
                      }`}
                    >
                      <span>Use Template</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Languages & Themes</h2>
          <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Out-of-the-box support for major programming stacks and color themes.
          </p>
        </div>

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
                {openFaqIndex === index ? <ChevronUp className="w-4 h-4 text-zinc-200" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
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

      {/* 7. Final Call to Action (Screenshot Card Styling) */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl border border-zinc-800 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 text-white shadow-2xl relative overflow-hidden text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to create code snippet graphics?</h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto mb-8">
            No account required. Start creating code graphics instantly in your browser.
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all transform hover:scale-105 no-underline shadow-lg"
          >
            <Logo className="w-5 h-5 text-black" />
            <span>Open Editor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer with Social Links & Buy Me a Coffee */}
      <footer className={`mt-auto border-t py-10 px-6 text-xs ${isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-400' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Logo className="w-4 h-4" />
            <span className={`font-bold text-sm tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>CodeMotion</span>
            <span className="opacity-50">
              by{' '}
              <a
                href="https://github.com/putrarawr"
                target="_blank"
                rel="noopener noreferrer"
                className={`underline decoration-dotted underline-offset-2 hover:opacity-100 transition-opacity ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
                title="Septiyan Bintang Ramadhan Putra on GitHub"
              >
                Septiyan Bintang Ramadhan Putra
              </a>
              {' '}© 2026. All rights reserved.
            </span>
          </div>

          {/* Social Media & Support Links */}
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <a
              href="https://saweria.co/codemotion"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all no-underline ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-amber-300 hover:bg-zinc-800 hover:text-amber-200'
                  : 'bg-white border-zinc-300 text-amber-700 hover:bg-zinc-100 shadow-xs'
              }`}
              title="Support CodeMotion development via Saweria"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span>Buy me a coffee</span>
            </a>

            <a
              href="https://github.com/putrarawr/CodeMotion"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-white border-zinc-300 text-zinc-700 hover:text-black shadow-xs'
              }`}
              title="GitHub Repository (putrarawr/CodeMotion)"
            >
              <SiGithub className="w-4 h-4" />
            </a>

            <a
              href="https://instagram.com/rexxkielll"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-pink-400 hover:bg-zinc-800' : 'bg-white border-zinc-300 text-zinc-700 hover:text-pink-600 shadow-xs'
              }`}
              title="Instagram (@rexxkielll)"
            >
              <SiInstagram className="w-4 h-4" />
            </a>

            <a
              href="https://t.me/putrarawr"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-xl border transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-sky-400 hover:bg-zinc-800' : 'bg-white border-zinc-300 text-zinc-700 hover:text-sky-600 shadow-xs'
              }`}
              title="Telegram (@putrarawr)"
            >
              <SiTelegram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button - Minimal Circular Design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0.85 }}
        transition={{ duration: 0.2 }}
        className={`fixed bottom-6 right-6 z-40 ${showBackToTop ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button
          onClick={scrollToTop}
          className={`w-11 h-11 rounded-full border shadow-2xl backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer ${
            isDark
              ? 'bg-zinc-950/90 border-zinc-800 text-white hover:bg-zinc-900 shadow-black/80'
              : 'bg-white/95 border-zinc-200 text-black hover:bg-zinc-100 shadow-zinc-300/60'
          }`}
          title="Back to top"
        >
          <ArrowUp className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
        </button>
      </motion.div>
    </motion.div>
  );
};
