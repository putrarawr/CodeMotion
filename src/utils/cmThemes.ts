import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { EditorView } from '@codemirror/view';
import type { SupportedTheme } from '../types';

interface TokenPalette {
  bg: string;
  fg: string;
  keyword: string;
  string: string;
  comment: string;
  fn: string;
  number: string;
  type: string;
  variable: string;
  operator: string;
  punctuation: string;
  tag: string;
  attribute: string;
  constant: string;
}

const PALETTES: Record<SupportedTheme, TokenPalette> = {
  dracula: {
    bg: '#282a36', fg: '#f8f8f2',
    keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4', fn: '#50fa7b',
    number: '#bd93f9', type: '#8be9fd', variable: '#f8f8f2', operator: '#ff79c6',
    punctuation: '#f8f8f2', tag: '#ff79c6', attribute: '#50fa7b', constant: '#bd93f9',
  },
  nord: {
    bg: '#2e3440', fg: '#d8dee9',
    keyword: '#81a1c1', string: '#a3be8c', comment: '#616e88', fn: '#88c0d0',
    number: '#b48ead', type: '#8fbcbb', variable: '#d8dee9', operator: '#81a1c1',
    punctuation: '#eceff4', tag: '#81a1c1', attribute: '#8fbcbb', constant: '#b48ead',
  },
  'one-dark-pro': {
    bg: '#282c34', fg: '#abb2bf',
    keyword: '#c678dd', string: '#98c379', comment: '#5c6370', fn: '#61afef',
    number: '#d19a66', type: '#e5c07b', variable: '#e06c75', operator: '#56b6c2',
    punctuation: '#abb2bf', tag: '#e06c75', attribute: '#d19a66', constant: '#d19a66',
  },
  'vitesse-dark': {
    bg: '#121212', fg: '#dbd7ca',
    keyword: '#4d9375', string: '#c98a7d', comment: '#758575', fn: '#86b3c3',
    number: '#dec184', type: '#4d9375', variable: '#dbd7ca', operator: '#cb7676',
    punctuation: '#dbd7ca', tag: '#4d9375', attribute: '#86b3c3', constant: '#dec184',
  },
  'tokyo-night': {
    bg: '#1a1b26', fg: '#a9b1d6',
    keyword: '#bb9af7', string: '#9ece6a', comment: '#565f89', fn: '#7aa2f7',
    number: '#ff9e64', type: '#2ac3de', variable: '#c0caf5', operator: '#89ddff',
    punctuation: '#a9b1d6', tag: '#bb9af7', attribute: '#73daca', constant: '#ff9e64',
  },
  'catppuccin-mocha': {
    bg: '#1e1e2e', fg: '#cdd6f4',
    keyword: '#cba6f7', string: '#a6e3a1', comment: '#6c7086', fn: '#89b4fa',
    number: '#fab387', type: '#f9e2af', variable: '#cdd6f4', operator: '#89dceb',
    punctuation: '#9399b2', tag: '#cba6f7', attribute: '#89b4fa', constant: '#f38ba8',
  },
  'github-dark': {
    bg: '#24292e', fg: '#e1e4e8',
    keyword: '#f97583', string: '#9ecbff', comment: '#6a737d', fn: '#b392f0',
    number: '#79b8ff', type: '#79b8ff', variable: '#ffab70', operator: '#d1d5da',
    punctuation: '#d1d5da', tag: '#85e89d', attribute: '#b392f0', constant: '#79b8ff',
  },
  'github-light': {
    bg: '#ffffff', fg: '#24292f',
    keyword: '#cf222e', string: '#0a3069', comment: '#6e7781', fn: '#8250df',
    number: '#0550ae', type: '#116329', variable: '#24292f', operator: '#cf222e',
    punctuation: '#24292f', tag: '#116329', attribute: '#0550ae', constant: '#0550ae',
  },
  'vitesse-light': {
    bg: '#ffffff', fg: '#393a34',
    keyword: '#2f798a', string: '#b56959', comment: '#a0ada0', fn: '#5985a8',
    number: '#c18401', type: '#2f798a', variable: '#393a34', operator: '#999999',
    punctuation: '#393a34', tag: '#2f798a', attribute: '#b56959', constant: '#c18401',
  },
  'catppuccin-latte': {
    bg: '#eff1f5', fg: '#4c4f69',
    keyword: '#8839ef', string: '#40a02b', comment: '#9ca0b0', fn: '#1e66f5',
    number: '#fe640b', type: '#df8e1d', variable: '#4c4f69', operator: '#04a5e5',
    punctuation: '#6c6f85', tag: '#8839ef', attribute: '#1e66f5', constant: '#d20f39',
  },
};

const highlightStyleFor = (p: TokenPalette) =>
  HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword], color: p.keyword },
    { tag: [t.string, t.regexp], color: p.string },
    { tag: [t.number, t.bool, t.null], color: p.number },
    { tag: [t.atom, t.self], color: p.constant },
    { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: p.comment, fontStyle: 'italic' },
    { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: p.fn },
    { tag: [t.typeName, t.className, t.namespace], color: p.type },
    { tag: [t.tagName], color: p.tag },
    { tag: [t.attributeName], color: p.attribute },
    { tag: [t.propertyName, t.definition(t.variableName)], color: p.attribute },
    { tag: [t.operator, t.operatorKeyword, t.definitionKeyword], color: p.operator },
    { tag: [t.punctuation, t.separator, t.bracket], color: p.punctuation },
    { tag: [t.variableName, t.labelName], color: p.variable },
    { tag: [t.meta, t.processingInstruction], color: p.comment },
  ]);

const themeCache = new Map<SupportedTheme, ReturnType<typeof buildThemeExtensions>>();

function buildThemeExtensions(theme: SupportedTheme) {
  const palette = PALETTES[theme];
  return [
    syntaxHighlighting(highlightStyleFor(palette), { fallback: true }),
    EditorView.theme({
      '&': { color: palette.fg },
    }),
  ];
}

export function getCmThemeExtensions(theme: SupportedTheme) {
  if (!themeCache.has(theme)) {
    themeCache.set(theme, buildThemeExtensions(theme));
  }
  return themeCache.get(theme)!;
}

export const cmBaseTheme = EditorView.theme({
  '&': {
    height: 'auto',
    backgroundColor: 'transparent',
    fontSize: 'var(--cm-font-size)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    overflow: 'visible',
    fontFamily: 'var(--cm-font-family)',
    lineHeight: 'var(--cm-line-height)',
  },
  '.cm-content': {
    caretColor: '#818cf8',
    padding: '0',
    margin: '0',
    whiteSpace: 'pre',
  },
  '.cm-line': {
    padding: '0',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(129, 140, 248, 0.28) !important',
  },
  '.cm-cursor, &.cm-focused .cm-cursor': {
    borderLeftColor: '#818cf8',
  },
});
