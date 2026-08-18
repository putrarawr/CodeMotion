import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cm-logo-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="cm-logo-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Frame Outer Glow Ring */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        className="stroke-zinc-800 dark:stroke-zinc-700"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.05"
      />

      {/* Left Code Bracket < */}
      <path
        d="M11 11L7 16L11 21"
        stroke="url(#cm-logo-grad1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right Code Bracket > */}
      <path
        d="M21 11L25 16L21 21"
        stroke="url(#cm-logo-grad1)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Motion Slash Streamer / Wave / */}
      <path
        d="M18 9L14 23"
        stroke="url(#cm-logo-grad2)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Motion Wave Dot Pulse */}
      <circle cx="16" cy="16" r="1.5" fill="#38BDF8" />
    </svg>
  );
};
