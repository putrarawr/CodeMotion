import type { SupportedLanguage, SupportedTheme } from '../types';

export interface PublicCommunityTemplate {
  id: string;
  title: string;
  description: string;
  fileName: string;
  language: SupportedLanguage;
  theme: SupportedTheme;
  themeName: string;
  background: string;
  bgLabel: string;
  code: string;
  author: string;
  github: string; // GitHub username or profile handle (e.g. "putrarawr")
  createdAt: number;
  likes: number;
  category: string;
}

// Data dummy/hardcoded dihapus penuh — galeri publik murni diisi oleh template publikasi pengguna
export const INITIAL_PUBLIC_TEMPLATES: PublicCommunityTemplate[] = [];
