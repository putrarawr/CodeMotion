import React from 'react';
import type { Language } from '../utils/i18n';

interface LanguageSwitchProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  language,
  onLanguageChange,
}) => {
  return (
    <div className="relative inline-flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-full shadow-inner select-none font-sans text-xs font-semibold">
      {/* Sliding Active White Highlight Indicator */}
      <div
        className={`absolute top-1 bottom-1 w-[46px] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
          language === 'id' ? 'left-1' : 'left-[51px]'
        }`}
      />

      {/* ID Flag Button */}
      <button
        type="button"
        onClick={() => onLanguageChange('id')}
        className={`relative z-10 flex items-center justify-center gap-1.5 w-[46px] py-1 rounded-full transition-colors duration-200 ${
          language === 'id' ? 'text-black font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="Bahasa Indonesia"
      >
        {/* Clean SVG Indonesian Flag */}
        <svg className="w-4 h-3 rounded-[2px] shadow-xs overflow-hidden border border-black/20" viewBox="0 0 640 480">
          <rect width="640" height="240" fill="#E70011" />
          <rect y="240" width="640" height="240" fill="#FFFFFF" />
        </svg>
        <span className="text-[10px] uppercase font-extrabold tracking-tight">ID</span>
      </button>

      {/* EN Flag Button */}
      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        className={`relative z-10 flex items-center justify-center gap-1.5 w-[46px] py-1 rounded-full transition-colors duration-200 ${
          language === 'en' ? 'text-black font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="English"
      >
        {/* Clean SVG UK Flag */}
        <svg className="w-4 h-3 rounded-[2px] shadow-xs overflow-hidden border border-black/20" viewBox="0 0 60 30">
          <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
          <clipPath id="t"><path d="M30,15 h30 v15 z v-30 h-30 z h-30 v-15 z v30 h30 z"/></clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#t)"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
        <span className="text-[10px] uppercase font-extrabold tracking-tight">EN</span>
      </button>
    </div>
  );
};
