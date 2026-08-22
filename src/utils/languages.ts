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
  { id: 'c', name: 'C', extension: '.c' },
  { id: 'csharp', name: 'C#', extension: '.cs' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'kotlin', name: 'Kotlin', extension: '.kt' },
  { id: 'swift', name: 'Swift', extension: '.swift' },
  { id: 'ruby', name: 'Ruby', extension: '.rb' },
  { id: 'php', name: 'PHP', extension: '.php' },
  { id: 'scala', name: 'Scala', extension: '.scala' },
  { id: 'r', name: 'R', extension: '.r' },
  { id: 'dart', name: 'Dart', extension: '.dart' },
  { id: 'elixir', name: 'Elixir', extension: '.ex' },
  { id: 'vue', name: 'Vue', extension: '.vue' },
  { id: 'svelte', name: 'Svelte', extension: '.svelte' },
  { id: 'astro', name: 'Astro', extension: '.astro' },
  { id: 'graphql', name: 'GraphQL', extension: '.gql' },
  { id: 'dockerfile', name: 'Dockerfile', extension: 'Dockerfile' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
  { id: 'yaml', name: 'YAML', extension: '.yaml' },
];

/**
 * High-accuracy multi-rule language detection algorithm based on file extension, syntax patterns, and keywords.
 */
export function detectLanguageFromCode(code: string, fileName?: string): SupportedLanguage | null {
  const trimmed = code.trim();
  if (!trimmed) return null;

  // 2. Shebang / explicit file headers
  if (trimmed.startsWith('<?php')) return 'php';
  if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh') || trimmed.startsWith('#!/usr/bin/env bash')) return 'bash';
  if (trimmed.startsWith('<!DOCTYPE html>') || trimmed.startsWith('<html')) return 'html';
  if (trimmed.startsWith('apiVersion:') || trimmed.startsWith('kind:')) return 'yaml';
  if (trimmed.startsWith('FROM ') || trimmed.startsWith('RUN ') || trimmed.startsWith('CMD ')) return 'dockerfile';

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
    c: 0,
    csharp: 0,
    java: 0,
    kotlin: 0,
    swift: 0,
    ruby: 0,
    php: 0,
    scala: 0,
    r: 0,
    dart: 0,
    elixir: 0,
    vue: 0,
    svelte: 0,
    astro: 0,
    graphql: 0,
    dockerfile: 0,
    markdown: 0,
    yaml: 0,
  };

  // TypeScript / JavaScript
  if (/\b(interface|type|enum|readonly)\b/.test(trimmed)) scores.typescript += 5;
  if (/: (string|number|boolean|any|void|unknown|never|Promise<)/.test(trimmed)) scores.typescript += 4;
  if (/\b(import|export|const|let|var|function|async|await|return)\b/.test(trimmed)) {
    scores.typescript += 2;
    scores.javascript += 2;
  }

  // Swift / Kotlin
  if (/\b(import SwiftUI|import UIKit|var \w+: String|func \w+\()/.test(trimmed)) scores.swift += 5;
  if (/\b(fun main|val \w+: String|data class \w+|package \w+)/.test(trimmed)) scores.kotlin += 5;

  // Ruby / Elixir
  if (/\b(def \w+|puts|require '|\bdo\b|\bend\b)/.test(trimmed)) scores.ruby += 3;
  if (/\b(defmodule \w+|IO\.puts|fn \w+ ->)/.test(trimmed)) scores.elixir += 5;

  // Dart
  if (/\b(void main\(\)|Widget build|BuildContext|StatefulWidget)/.test(trimmed)) scores.dart += 5;

  // Vue / Svelte / Astro
  if (/<template>|<script setup>/.test(trimmed)) scores.vue += 5;
  if (/<script lang="ts">|<style>/.test(trimmed) && trimmed.includes('{')) scores.svelte += 3;

  // GraphQL
  if (/\b(query \w+|mutation \w+|type \w+ \{|schema \{)/.test(trimmed)) scores.graphql += 5;

  // Python
  if (/\b(def|class|import|from|elif|lambda|pass)\b/.test(trimmed)) scores.python += 3;
  if (/\bprint\(/.test(trimmed)) scores.python += 3;

  // Rust
  if (/\b(fn|let mut|pub fn|impl|struct|enum|match|use std::)\b/.test(trimmed)) scores.rust += 5;

  // Go
  if (/\b(package|func|fmt\.Println|type \w+ struct|import \()\b/.test(trimmed)) scores.go += 5;

  // HTML
  if (/<\/?(div|span|p|a|h1|h2|h3|button|input|form)\b/i.test(trimmed)) scores.html += 4;

  // CSS
  if (/[a-zA-Z0-9_-]+\s*\{[^}]*\}/.test(trimmed) && /\b(color|background|padding|margin):/.test(trimmed)) scores.css += 5;

  // SQL
  if (/\b(SELECT|FROM|WHERE|INSERT INTO|UPDATE|DELETE|JOIN)\b/i.test(trimmed)) scores.sql += 5;

  // C / C++
  if (/#include\s*<stdio\.h>/.test(trimmed)) scores.c += 5;
  if (/#include\s*<iostream>/.test(trimmed)) scores.cpp += 5;

  let bestLang: SupportedLanguage | null = null;
  let maxScore = 0;

  for (const [lang, score] of Object.entries(scores) as [SupportedLanguage, number][]) {
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }

  if (maxScore >= 2) return bestLang;

  // Fallback: If code pattern score is inconclusive, check file extension
  if (fileName) {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const matchedByExt = LANGUAGES.find((l) => l.extension.toLowerCase() === ext);
    if (matchedByExt) return matchedByExt.id;
    if (ext === '.yml') return 'yaml';
    if (ext === '.jsx' || ext === '.mjs' || ext === '.cjs') return 'javascript';
    if (ext === '.tsx') return 'typescript';
    if (ext === '.h' || ext === '.hpp') return 'cpp';
  }

  return bestLang;
}
