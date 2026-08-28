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
        <filter id="cm-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Option 2: Left Code Bracket < */}
      <path
        d="M9.5 9.5L4 16L9.5 22.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#cm-logo-glow)"
      />

      {/* Option 2: Right Code Bracket > */}
      <path
        d="M22.5 9.5L28 16L22.5 22.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#cm-logo-glow)"
      />

      {/* Option 2: Center Monochromatic Lightning Bolt ⚡ */}
      <path
        d="M17.5 6L11.5 16.5H16L14.5 26L20.5 15.5H16L17.5 6Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
        filter="url(#cm-logo-glow)"
      />
    </svg>
  );
};
