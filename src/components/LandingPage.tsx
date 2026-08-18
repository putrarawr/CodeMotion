import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  Camera,
  Sparkles,
  Layers,
  GitCompare,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Download,
  Keyboard,
  Palette,
} from 'lucide-react';
import type { SnippetSettings } from '../types';

interface LandingPageProps {
  settings: SnippetSettings;
  onToggleAppTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ settings, onToggleAppTheme }) => {
  const isDark = settings.appTheme === 'dark';
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'Is CodeMotion completely free to use?',
      a: 'Yes, 100% free with no hidden paywalls, subscription fees, or export limits.',
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
      q: 'Can I export images with transparent backgrounds?',
      a: 'Yes! You can toggle transparent backgrounds or pick from curated monochrome and gradient presets.',
    },
    {
      q: 'What formats can I export my code snippets into?',
      a: 'You can export high-resolution PNG images at 2x or 3x DPI (Retina), vector SVG files, or write PNG blobs directly to your clipboard.',
    },
  ];

  const languages = [
    { name: 'TypeScript', icon: <SiTypescript className="w-4 h-4 text-[#3178C6]" /> },
    { name: 'JavaScript', icon: <SiJavascript className="w-4 h-4 text-[#F7DF1E]" /> },
    { name: 'Python', icon: <SiPython className="w-4 h-4 text-[#3776AB]" /> },
    { name: 'Rust', icon: <SiRust className="w-4 h-4 text-[#CE412B]" /> },
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
            <Camera className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">CodeMotion</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <a href="#features" className={`hover:underline ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            Features
          </a>
          <a href="#how-it-works" className={`hover:underline ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}>
            How It Works
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

      {/* 2. Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col items-center justify-center text-center px-6 lg:px-12 pt-16 pb-12 max-w-5xl mx-auto"
      >
        <motion.div
          variants={fadeInUp}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border ${
            isDark ? 'bg-zinc-900 text-zinc-300 border-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero-Friction Code Snippet Graphics</span>
        </motion.div>

        <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 font-sans">
          Turn Code Into High-Res <br className="hidden sm:block" />
          <span className={isDark ? 'text-white underline decoration-zinc-700' : 'text-black underline decoration-zinc-300'}>
            Production Images
          </span>
        </motion.h1>

        <motion.p variants={fadeInUp} className={`text-base sm:text-xl max-w-2xl font-sans mb-10 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Create aesthetic code snippet graphics for X (Twitter), LinkedIn, blogs, and presentations without login or setup.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link
            to="/editor"
            className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold shadow-xl transition-all transform hover:scale-105 no-underline ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
                : 'bg-black text-white hover:bg-zinc-800 shadow-black/10'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Launch CodeMotion Editor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.section>

      {/* 3. Live Preview Graphic Box */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="px-6 max-w-4xl mx-auto w-full mb-20"
      >
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden relative group">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono text-zinc-400">App.tsx</span>
            <div className="w-12" />
          </div>

          <pre className="font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed overflow-x-auto m-0">
            <code>
              <span className="text-purple-400">import</span> &#123; createSnippet &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'@codemotion/core'</span>;{'\n\n'}
              <span className="text-blue-400">const</span> snippet = <span className="text-purple-400">await</span> <span className="text-yellow-400">createSnippet</span>(&#123;{'\n'}
              {'  '}language: <span className="text-emerald-400">'typescript'</span>,{'\n'}
              {'  '}theme: <span className="text-emerald-400">'vitesse-dark'</span>,{'\n'}
              {'  '}pixelRatio: <span className="text-amber-400">3</span>,{'\n'}
              &#125;);
            </code>
          </pre>
          <div className="flex justify-end mt-4">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-zinc-800">codemotion.dev</span>
          </div>
        </div>
      </motion.section>

      {/* 4. Feature Cards Grid */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className="px-6 lg:px-12 py-16 max-w-6xl mx-auto w-full border-t border-zinc-800/40"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Designed for Developers & Creators</h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Everything you need to showcase beautiful code graphics on social media and documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              color: 'bg-indigo-500/10 text-indigo-400',
              title: 'Shiki Syntax Engine',
              desc: 'VS Code exact syntax rendering with TextMate grammars and support for 16+ top programming languages.',
            },
            {
              icon: <Layers className="w-6 h-6" />,
              color: 'bg-emerald-500/10 text-emerald-400',
              title: 'Multi-File Tabs',
              desc: 'Organize multiple file tabs in a single window frame to show structured components and types.',
            },
            {
              icon: <GitCompare className="w-6 h-6" />,
              color: 'bg-amber-500/10 text-amber-400',
              title: 'Code Diff Mode',
              desc: 'Highlight line additions (+) and deletions (-) to showcase refactoring and pull requests.',
            },
            {
              icon: <Download className="w-6 h-6" />,
              color: 'bg-purple-500/10 text-purple-400',
              title: 'High-DPI 3x Export',
              desc: 'Export crystal sharp PNGs at 2x/3x DPI, vector SVG graphics, or copy image blob directly to clipboard.',
            },
            {
              icon: <Keyboard className="w-6 h-6" />,
              color: 'bg-cyan-500/10 text-cyan-400',
              title: 'Hotkeys & Productivity',
              desc: 'Use Cmd + S for instant 3x PNG download and Cmd + Shift + C to write image blob to system clipboard.',
            },
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              color: 'bg-rose-500/10 text-rose-400',
              title: '100% Client-Side Privacy',
              desc: 'Zero server uploads. Your code stays strictly in your browser.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${
                isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
              }`}
            >
              <div className={`p-2.5 w-max rounded-xl mb-4 ${item.color}`}>{item.icon}</div>
              <h3 className="text-base font-bold mb-2">{item.title}</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 5. How It Works (3 Steps) */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`py-16 px-6 lg:px-12 border-t border-b ${
          isDark ? 'bg-zinc-950/60 border-zinc-800/40' : 'bg-zinc-100/60 border-zinc-200'
        }`}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">How CodeMotion Works</h2>
          <p className={`text-sm sm:text-base mb-12 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            3 simple steps to transform plain text code into beautiful graphics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { num: '1', title: 'Paste Your Code', desc: 'Paste or type code into the dual-layer live editor. Auto-detect language is supported.' },
              { num: '2', title: 'Customize Visuals', desc: 'Choose themes, background canvas, fonts, window frames, padding, and aspect ratio lock.' },
              { num: '3', title: 'Export & Share', desc: 'Export high-DPI 3x PNG, SVG, or copy image directly to system clipboard.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl font-bold text-lg flex items-center justify-center mb-4 border ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                  }`}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-bold mb-1">{step.title}</h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 6. Dynamic Infinite Marquee: Authentic Language Logos & Themes Showcase */}
      <motion.section
        id="languages"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-16 w-full overflow-hidden"
      >
        <div className="text-center mb-10 px-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Supported Languages & VS Code Themes</h2>
          <p className={`text-sm sm:text-base ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Full support for top programming languages with authentic brand icons & popular VS Code color palettes.
          </p>
        </div>

        {/* Infinite Moving Marquee Ticker Container */}
        <div className="relative w-full flex flex-col gap-5 py-4 overflow-hidden">
          {/* Left/Right Edge Fades */}
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

      {/* 7. FAQ Accordion */}
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`py-16 px-6 lg:px-12 border-t ${
          isDark ? 'bg-zinc-950/40 border-zinc-800/40' : 'bg-zinc-50 border-zinc-200'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Got questions? We've got answers.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`text-xs mt-3 leading-relaxed overflow-hidden ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 8. Final Call to Action */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 text-white shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Ready to Create Code Snippet Images?</h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            No signup, no login required. Transform plain text code into stunning production graphics in seconds.
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all transform hover:scale-105 no-underline shadow-xl"
          >
            <Camera className="w-4 h-4" />
            <span>Open CodeMotion Editor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className={`py-6 border-t text-center text-xs ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-600'}`}>
        <p>CodeMotion 2.0 • Zero-Friction Client-Side Code Snippet Generator</p>
      </footer>
    </motion.div>
  );
};
