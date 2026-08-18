import type { LanguageOption, SupportedLanguage } from '../types';

export const LANGUAGES: LanguageOption[] = [
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'sql', name: 'SQL', extension: '.sql' },
  { id: 'bash', name: 'Shell / Bash', extension: '.sh' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
  { id: 'php', name: 'PHP', extension: '.php' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'csharp', name: 'C#', extension: '.cs' },
  { id: 'yaml', name: 'YAML', extension: '.yaml' },
];

export function detectLanguageFromCode(code: string): SupportedLanguage | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {}
  }
  if (trimmed.startsWith('<!DOCTYPE html>') || trimmed.startsWith('<html') || trimmed.startsWith('<div')) {
    return 'html';
  }
  if (trimmed.includes('import ') && (trimmed.includes('from \'') || trimmed.includes('from "')) && trimmed.includes(': ')) {
    return 'typescript';
  }
  if (trimmed.includes('def ') && trimmed.includes(':') && (trimmed.includes('self') || trimmed.includes('print('))) {
    return 'python';
  }
  if (trimmed.includes('fn main()') || (trimmed.includes('let mut ') || trimmed.includes('impl '))) {
    return 'rust';
  }
  if (trimmed.includes('package main') || trimmed.includes('func ')) {
    return 'go';
  }
  if (trimmed.includes('SELECT ') || trimmed.includes('FROM ') || trimmed.includes('WHERE ')) {
    return 'sql';
  }
  return null;
}
