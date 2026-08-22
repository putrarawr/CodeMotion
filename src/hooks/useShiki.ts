import { useState, useEffect, useRef } from 'react';
import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';
import type { SupportedLanguage, SupportedTheme } from '../types';

let highlighterPromise: Promise<Highlighter> | null = null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getHighlighterInstance() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [
        'dracula',
        'nord',
        'one-dark-pro',
        'vitesse-dark',
        'tokyo-night',
        'catppuccin-mocha',
        'github-dark',
        'github-light',
        'vitesse-light',
        'catppuccin-latte',
      ],
      langs: [
        'typescript',
        'javascript',
        'python',
        'rust',
        'go',
        'html',
        'css',
        'json',
        'sql',
        'bash',
        'cpp',
        'markdown',
        'php',
        'java',
        'csharp',
        'yaml',
        'swift',
        'kotlin',
        'ruby',
        'c',
        'scala',
        'r',
        'dart',
        'graphql',
        'dockerfile',
        'vue',
        'svelte',
        'astro',
        'elixir',
        'jsx',
        'tsx',
      ],
    });
  }
  return highlighterPromise;
}

export function useShiki(code: string, language: SupportedLanguage, theme: SupportedTheme) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const highlighterRef = useRef<Highlighter | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function highlight() {
      if (!code) {
        setHighlightedHtml('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (!highlighterRef.current) {
          highlighterRef.current = await getHighlighterInstance();
        }
        const highlighter = highlighterRef.current;

        // Ensure language and theme are loaded safely
        const loadedLangs = highlighter.getLoadedLanguages();
        if (language && !loadedLangs.includes(language as any)) {
          try {
            await highlighter.loadLanguage(language as any);
          } catch (langErr) {
            console.warn(`Could not load Shiki language '${language}', falling back to txt`, langErr);
          }
        }

        const loadedThemes = highlighter.getLoadedThemes();
        if (theme && !loadedThemes.includes(theme as any)) {
          try {
            await highlighter.loadTheme(theme as any);
          } catch (themeErr) {
            console.warn(`Could not load Shiki theme '${theme}'`, themeErr);
          }
        }

        if (isMounted) {
          try {
            const html = highlighter.codeToHtml(code, {
              lang: language || 'typescript',
              theme: theme || 'vitesse-dark',
            });
            setHighlightedHtml(html);
          } catch (renderErr) {
            console.error('Shiki codeToHtml error:', renderErr);
            setHighlightedHtml(`<span style="color: #e4e4e7">${escapeHtml(code)}</span>`);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Shiki initialization error:', err);
        if (isMounted) {
          setHighlightedHtml(`<span style="color: #e4e4e7">${escapeHtml(code)}</span>`);
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      isMounted = false;
    };
  }, [code, language, theme]);

  return { highlightedHtml, isLoading };
}
