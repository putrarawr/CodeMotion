export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'go'
  | 'html'
  | 'css'
  | 'json'
  | 'sql'
  | 'bash'
  | 'cpp'
  | 'markdown'
  | 'php'
  | 'java'
  | 'csharp'
  | 'yaml'
  | 'swift'
  | 'kotlin'
  | 'ruby'
  | 'c'
  | 'scala'
  | 'r'
  | 'dart'
  | 'graphql'
  | 'dockerfile'
  | 'vue'
  | 'svelte'
  | 'astro'
  | 'elixir';

export type SupportedTheme =
  | 'dracula'
  | 'nord'
  | 'one-dark-pro'
  | 'vitesse-dark'
  | 'tokyo-night'
  | 'catppuccin-mocha'
  | 'github-dark'
  | 'github-light'
  | 'vitesse-light'
  | 'catppuccin-latte';

export type WindowStyle = 'macos' | 'windows' | 'minimal' | 'none';

export type AspectRatio = 'auto' | '1:1' | '4:3' | '16:9' | '9:16';

export type AppTheme = 'dark' | 'light';

export interface SnippetTab {
  id: string;
  title: string;
  code: string;
  language: SupportedLanguage;
}

export interface LineAnnotation {
  id: string;
  line: number;
  text: string;
  color?: 'zinc' | 'sky' | 'emerald' | 'amber' | 'purple';
}

export interface SnippetSettings {
  // Multi-file tabs
  tabs: SnippetTab[];
  activeTabId: string;
  
  // Diff Mode & Motion Mode
  diffMode: boolean;
  motionMode: boolean;
  motionSpeed: number; // 1 = 1x, 2 = 2x, 0.5 = 0.5x
  motionFps: 30 | 60; // 30 FPS or 60 FPS ultra smooth
  isPlayingMotion: boolean;
  controlledTypedLength?: number | null;

  // Line Spotlight & Callouts
  focusedLines?: number[];
  annotations?: LineAnnotation[];

  // Styling & Customization
  theme: SupportedTheme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  lineNumbers: boolean;
  padding: number;
  background: string;
  customBgType?: 'solid' | 'gradient';
  customColor1?: string;
  customColor2?: string;
  customGradientAngle?: number;
  windowStyle: WindowStyle;
  dropShadow: boolean;
  shadowBlur: number;
  watermark: boolean;
  watermarkText: string;
  watermarkAvatar?: string;
  aspectRatio: AspectRatio;
  activeSocialPresetId?: string;
  canvasWidth?: number;
  borderRadius: number;
  appTheme: AppTheme;
}

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  extension: string;
}

export interface ThemeOption {
  id: SupportedTheme;
  name: string;
  type: 'dark' | 'light';
  bgPreview: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string;
  previewClass?: string;
  type: 'mesh' | 'gradient' | 'solid' | 'glass';
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  googleFontName?: string;
}

export interface AestheticPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<SnippetSettings>;
}

export interface SocialPreset {
  id: string;
  platform: 'Twitter / X' | 'LinkedIn' | 'Instagram Reel' | 'Instagram Post' | 'Blog / Banner';
  name: string;
  aspectRatio: AspectRatio;
  padding: number;
  background: string;
  fontSize: number;
  iconName: string;
}
