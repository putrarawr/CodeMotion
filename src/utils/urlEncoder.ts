import type { SnippetSettings } from '../types';

interface CompactSharePayload {
  t: string; // active tab title
  l: string; // language
  c: string; // code content
  th: string; // theme
  bg: string; // background gradient
  f: string; // font family
  fs: number; // font size
  diff: boolean; // diff mode
}

export function encodeStateToHash(settings: SnippetSettings): string {
  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];
  if (!activeTab) return '';

  const payload: CompactSharePayload = {
    t: activeTab.title,
    l: activeTab.language,
    c: activeTab.code,
    th: settings.theme,
    bg: settings.background,
    f: settings.fontFamily,
    fs: settings.fontSize,
    diff: settings.diffMode,
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(jsonStr);
    const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    // URL-safe Base64
    const b64 = btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return b64;
  } catch (err) {
    console.error('Failed to encode share link payload:', err);
    return '';
  }
}

export function decodeStateFromHash(hashOrUrl: string): Partial<SnippetSettings> | null {
  if (!hashOrUrl) return null;

  // Extract payload string from hash, query param, or raw base64
  let raw = hashOrUrl.trim();
  if (raw.includes('#')) raw = raw.substring(raw.indexOf('#') + 1);
  if (raw.includes('?')) raw = raw.substring(raw.indexOf('?') + 1);
  if (raw.startsWith('code=')) raw = raw.slice(5);

  try {
    raw = decodeURIComponent(raw);
  } catch (e) {
    // raw was already decoded
  }

  if (!raw) return null;

  try {
    let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    const payload = JSON.parse(jsonStr) as CompactSharePayload;

    if (!payload || !payload.c) return null;

    return {
      tabs: [
        {
          id: 'shared-tab',
          title: payload.t || 'shared.tsx',
          language: (payload.l as any) || 'typescript',
          code: payload.c,
        },
      ],
      activeTabId: 'shared-tab',
      theme: (payload.th as any) || 'vitesse-dark',
      background: payload.bg || 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
      fontFamily: payload.f || '"JetBrains Mono", monospace',
      fontSize: payload.fs || 14,
      diffMode: Boolean(payload.diff),
    };
  } catch (err) {
    console.error('Failed to decode share link hash:', err);
    return null;
  }
}
