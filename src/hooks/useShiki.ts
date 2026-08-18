import { useState, useEffect, useRef } from 'react';
import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';
import type { SupportedLanguage, SupportedTheme } from '../types';

let highlighterPromise: Promise<Highlighter> | null = null;

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
      setIsLoading(true);
      try {
        if (!highlighterRef.current) {
          highlighterRef.current = await getHighlighterInstance();
        }
        const highlighter = highlighterRef.current;

        // Ensure language and theme are loaded
        const loadedLangs = highlighter.getLoadedLanguages();
        if (!loadedLangs.includes(language)) {
          await highlighter.loadLanguage(language as any);
        }

        const loadedThemes = highlighter.getLoadedThemes();
        if (!loadedThemes.includes(theme)) {
          await highlighter.loadTheme(theme as any);
        }

        if (isMounted) {
          const html = highlighter.codeToHtml(code, {
            lang: language,
            theme: theme,
          });
          setHighlightedHtml(html);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Shiki highlighting error:', err);
        if (isMounted) {
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
