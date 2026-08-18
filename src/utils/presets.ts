import type { AestheticPreset } from '../types';

export const AESTHETIC_PRESETS: AestheticPreset[] = [
  {
    id: 'monochrome-dark',
    name: 'Obsidian Minimal',
    description: 'Sleek black & charcoal theme with crisp Vitesse syntax',
    settings: {
      theme: 'vitesse-dark',
      background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
      windowStyle: 'macos',
      fontFamily: '"JetBrains Mono", monospace',
      dropShadow: true,
      shadowBlur: 30,
      padding: 40,
      borderRadius: 16,
    },
  },
  {
    id: 'nordic-monochrome',
    name: 'Nordic Slate',
    description: 'Minimal slate monochrome with Nord syntax',
    settings: {
      theme: 'nord',
      background: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
      windowStyle: 'macos',
      fontFamily: '"JetBrains Mono", monospace',
      dropShadow: true,
      shadowBlur: 25,
      padding: 40,
      borderRadius: 14,
    },
  },
  {
    id: 'pure-studio-light',
    name: 'Pure Studio White',
    description: 'High-contrast clean light theme with GitHub Light syntax',
    settings: {
      theme: 'github-light',
      background: '#ffffff',
      windowStyle: 'minimal',
      fontFamily: '"JetBrains Mono", monospace',
      dropShadow: true,
      shadowBlur: 20,
      padding: 40,
      borderRadius: 12,
    },
  },
  {
    id: 'clean-transparent',
    name: 'Clean Transparent',
    description: 'Frameless snippet for docs and article embeds',
    settings: {
      theme: 'github-dark',
      background: 'transparent',
      windowStyle: 'none',
      fontFamily: '"JetBrains Mono", monospace',
      dropShadow: false,
      padding: 24,
      borderRadius: 12,
    },
  },
];
