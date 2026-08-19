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

/**
 * High-accuracy multi-rule language detection algorithm based on file extension, syntax patterns, and keywords.
 */
export function detectLanguageFromCode(code: string, fileName?: string): SupportedLanguage | null {
  // 1. Extension matching from file title
  if (fileName) {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const matchedByExt = LANGUAGES.find((l) => l.extension === ext);
    if (matchedByExt) return matchedByExt.id;
    if (ext === '.yml') return 'yaml';
    if (ext === '.jsx' || ext === '.mjs' || ext === '.cjs') return 'javascript';
    if (ext === '.tsx') return 'typescript';
    if (ext === '.h' || ext === '.hpp' || ext === '.c') return 'cpp';
  }

  const trimmed = code.trim();
  if (!trimmed) return null;

  // 2. Shebang / explicit file headers
  if (trimmed.startsWith('<?php')) return 'php';
  if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh') || trimmed.startsWith('#!/usr/bin/env bash')) return 'bash';
  if (trimmed.startsWith('<!DOCTYPE html>') || trimmed.startsWith('<html')) return 'html';
  if (trimmed.startsWith('apiVersion:') || trimmed.startsWith('kind:')) return 'yaml';

  // 3. JSON check
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {}
  }

  // 4. Pattern scoring
  const scores: Record<SupportedLanguage, number> = {
    typescript: 0,
    javascript: 0,
    python: 0,
    rust: 0,
    go: 0,
    html: 0,
    css: 0,
    json: 0,
    sql: 0,
    bash: 0,
    cpp: 0,
    markdown: 0,
    php: 0,
    java: 0,
    csharp: 0,
    yaml: 0,
  };

  // TypeScript / JavaScript
  if (/\b(interface|type|enum|readonly)\b/.test(trimmed)) scores.typescript += 5;
  if (/: (string|number|boolean|any|void|unknown|never|Promise<)/.test(trimmed)) scores.typescript += 4;
  if (/\b(import|export|const|let|var|function|async|await|return)\b/.test(trimmed)) {
    scores.typescript += 2;
    scores.javascript += 2;
  }
  if (/\bconsole\.(log|error|warn)\b/.test(trimmed)) {
    scores.typescript += 2;
    scores.javascript += 2;
  }

  // Python
  if (/\b(def|class|import|from|elif|lambda|pass)\b/.test(trimmed)) scores.python += 3;
  if (/:\s*$/m.test(trimmed) && (trimmed.includes('def ') || trimmed.includes('if '))) scores.python += 3;
  if (/\bprint\(/.test(trimmed)) scores.python += 3;
  if (/\bself\b/.test(trimmed)) scores.python += 3;

  // Rust
  if (/\b(fn|let mut|pub fn|impl|struct|enum|match|use std::)\b/.test(trimmed)) scores.rust += 5;
  if (/\bprintln!/.test(trimmed)) scores.rust += 5;

  // Go
  if (/\b(package|func|fmt\.Println|type \w+ struct|import \()\b/.test(trimmed)) scores.go += 5;

  // HTML
  if (/<\/?(div|span|p|a|h1|h2|h3|button|input|form|header|footer|section|body|head|meta|link|script)\b/i.test(trimmed)) scores.html += 4;

  // CSS
  if (/[a-zA-Z0-9_-]+\s*\{[^}]*\}/.test(trimmed) && /\b(color|background|padding|margin|display|flex|grid|border|font-size):/.test(trimmed)) scores.css += 5;

  // SQL
  if (/\b(SELECT|FROM|WHERE|INSERT INTO|UPDATE|DELETE|CREATE TABLE|JOIN|GROUP BY|ORDER BY)\b/i.test(trimmed)) scores.sql += 5;

  // C++
  if (/#include\s*<[^>]+>/.test(trimmed)) scores.cpp += 5;
  if (/\b(std::cout|std::vector|std::string|namespace|int main)\b/.test(trimmed)) scores.cpp += 5;

  // PHP
  if (/\$this->|\$[a-zA-Z_]\w*/.test(trimmed)) scores.php += 3;
  if (/\becho\b/.test(trimmed)) scores.php += 2;

  // Java
  if (/\b(public class|public static void main|System\.out\.println|private final|import java\.)\b/.test(trimmed)) scores.java += 5;

  // C#
  if (/\b(using System;|Console\.WriteLine|namespace \w+|async Task|IEnumerable)\b/.test(trimmed)) scores.csharp += 5;

  // Markdown
  if (/^#{1,6}\s+/m.test(trimmed) || /```[a-z]*/.test(trimmed) || /^\s*[-*]\s+/m.test(trimmed)) scores.markdown += 4;

  // Bash
  if (/\b(echo|sudo|chmod|mkdir|grep|cat|cd|ls|curl|export)\b/.test(trimmed)) scores.bash += 2;

  let bestLang: SupportedLanguage | null = null;
  let maxScore = 0;

  for (const [lang, score] of Object.entries(scores) as [SupportedLanguage, number][]) {
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }

  // If score threshold met, return detected language
  return maxScore >= 2 ? bestLang : null;
}
