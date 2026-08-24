import { StreamLanguage } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import type { SupportedLanguage } from '../types';

const cache = new Map<SupportedLanguage, Promise<Extension>>();

async function loadExtension(lang: SupportedLanguage): Promise<Extension> {
  switch (lang) {
    case 'typescript':
      return (await import('@codemirror/lang-javascript')).javascript({ typescript: true, jsx: true });
    case 'javascript':
      return (await import('@codemirror/lang-javascript')).javascript({ jsx: true });
    case 'python':
      return (await import('@codemirror/lang-python')).python();
    case 'rust':
      return (await import('@codemirror/lang-rust')).rust();
    case 'go':
      return (await import('@codemirror/lang-go')).go();
    case 'cpp':
      return (await import('@codemirror/lang-cpp')).cpp();
    case 'java':
      return (await import('@codemirror/lang-java')).java();
    case 'html':
      return (await import('@codemirror/lang-html')).html();
    case 'css':
      return (await import('@codemirror/lang-css')).css();
    case 'json':
      return (await import('@codemirror/lang-json')).json();
    case 'sql':
      return (await import('@codemirror/lang-sql')).sql();
    case 'markdown':
      return (await import('@codemirror/lang-markdown')).markdown();
    case 'php':
      return (await import('@codemirror/lang-php')).php();
    case 'yaml':
      return (await import('@codemirror/lang-yaml')).yaml();
    case 'vue':
      return (await import('@codemirror/lang-vue')).vue();
    case 'svelte':
    case 'astro':
      return (await import('@codemirror/lang-html')).html();
    case 'c': {
      const { c } = await import('@codemirror/legacy-modes/mode/clike');
      return StreamLanguage.define(c);
    }
    case 'csharp': {
      const { csharp } = await import('@codemirror/legacy-modes/mode/clike');
      return StreamLanguage.define(csharp);
    }
    case 'kotlin': {
      const { kotlin } = await import('@codemirror/legacy-modes/mode/clike');
      return StreamLanguage.define(kotlin);
    }
    case 'scala': {
      const { scala } = await import('@codemirror/legacy-modes/mode/clike');
      return StreamLanguage.define(scala);
    }
    case 'dart': {
      const { dart } = await import('@codemirror/legacy-modes/mode/clike');
      return StreamLanguage.define(dart);
    }
    case 'swift': {
      const { swift } = await import('@codemirror/legacy-modes/mode/swift');
      return StreamLanguage.define(swift);
    }
    case 'ruby': {
      const { ruby } = await import('@codemirror/legacy-modes/mode/ruby');
      return StreamLanguage.define(ruby);
    }
    case 'bash': {
      const { shell } = await import('@codemirror/legacy-modes/mode/shell');
      return StreamLanguage.define(shell);
    }
    case 'r': {
      const { r } = await import('@codemirror/legacy-modes/mode/r');
      return StreamLanguage.define(r);
    }
    case 'dockerfile': {
      const { dockerFile } = await import('@codemirror/legacy-modes/mode/dockerfile');
      return StreamLanguage.define(dockerFile);
    }
    default:
      return [];
  }
}

export function getLanguageExtension(lang: SupportedLanguage): Promise<Extension> {
  if (!cache.has(lang)) {
    cache.set(
      lang,
      loadExtension(lang).catch(() => [] as readonly Extension[])
    );
  }
  return cache.get(lang)!;
}
