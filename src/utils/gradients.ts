import type { BackgroundPreset } from '../types';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'pure-obsidian',
    name: 'Obsidian Black',
    value: '#09090b',
    type: 'solid',
  },
  {
    id: 'zinc-monochrome',
    name: 'Zinc Monochrome',
    value: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
    type: 'gradient',
  },
  {
    id: 'soft-slate',
    name: 'Soft Slate',
    value: 'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
    type: 'gradient',
  },
  {
    id: 'pure-white',
    name: 'Studio White',
    value: '#ffffff',
    type: 'solid',
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    value: 'linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%)',
    type: 'gradient',
  },
  {
    id: 'deep-charcoal',
    name: 'Deep Charcoal',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    type: 'gradient',
  },
  {
    id: 'silver-mist',
    name: 'Silver Mist',
    value: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    type: 'gradient',
  },
  {
    id: 'transparent',
    name: 'Transparent',
    value: 'transparent',
    type: 'glass',
  },
];
