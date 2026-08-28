import LZString from 'lz-string';
import type { SnippetSettings } from '../types';

interface CompactSharePayload {
  t?: string; // active tab title
  l?: string; // language
  c: string; // code content
  th?: string; // theme
  bg?: string; // background gradient
  f?: string; // font family
  fs?: number; // font size
  diff?: number; // 1 for true, 0 for false
  u?: string; // author username handle (e.g. "@putra")
}

/**
 * Encodes snippet settings and code into an ultra-short LZ-compressed URL-safe string.
 */
export function encodeStateToHash(settings: SnippetSettings): string {
  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];
  if (!activeTab || !activeTab.code) return '';

  const payload: CompactSharePayload = {
    c: activeTab.code,
    ...(activeTab.title !== 'App.tsx' ? { t: activeTab.title } : {}),
    ...(activeTab.language !== 'typescript' ? { l: activeTab.language } : {}),
    ...(settings.theme !== 'vitesse-dark' ? { th: settings.theme } : {}),
    ...(settings.background !== 'linear-gradient(135deg, #18181b 0%, #09090b 100%)' ? { bg: settings.background } : {}),
    ...(settings.fontFamily !== '"JetBrains Mono", monospace' ? { f: settings.fontFamily } : {}),
    ...(settings.fontSize !== 14 ? { fs: settings.fontSize } : {}),
    ...(settings.diffMode ? { diff: 1 } : {}),
    ...(settings.watermarkText ? { u: settings.watermarkText } : {}),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error('Failed to encode share link payload:', err);
    return '';
  }
}

/**
 * Decodes compressed LZ string or legacy Base64 string back into SnippetSettings.
 */
export function decodeStateFromHash(hashOrUrl: string): Partial<SnippetSettings> | null {
  if (!hashOrUrl) return null;

  let raw = hashOrUrl.trim();
  if (raw.includes('#')) raw = raw.substring(raw.indexOf('#') + 1);
  if (raw.includes('?')) raw = raw.substring(raw.indexOf('?') + 1);
  if (raw.startsWith('code=')) raw = raw.slice(5);

  try {
    raw = decodeURIComponent(raw);
  } catch {
    // raw was already decoded
  }

  if (!raw) return null;

  // 1. Try LZ-String decompression first
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(raw);
    if (decompressed) {
      const payload = JSON.parse(decompressed) as CompactSharePayload;
      if (payload && payload.c) {
        return buildSettingsFromPayload(payload);
      }
    }
  } catch {
    // Fall through to legacy Base64 decoding
  }

  // 2. Legacy Base64 fallback (for backwards compatibility with old links)
  try {
    let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    const payload = JSON.parse(jsonStr) as CompactSharePayload;

    if (payload && payload.c) {
      return buildSettingsFromPayload(payload);
    }
  } catch (err) {
    console.error('Failed to decode share link hash:', err);
  }

  return null;
}

import { sanitizeText } from './security';

function buildSettingsFromPayload(payload: CompactSharePayload): Partial<SnippetSettings> {
  const safeTitle = sanitizeText(payload.t || 'App.tsx', 100);
  const safeCode = sanitizeText(payload.c || '', 50000);
  const safeWatermark = sanitizeText(payload.u || '', 100);
  const safeBg = payload.bg && !payload.bg.toLowerCase().includes('javascript:') ? payload.bg : 'linear-gradient(135deg, #18181b 0%, #09090b 100%)';

  return {
    tabs: [
      {
        id: 'shared-tab',
        title: safeTitle,
        language: (payload.l as any) || 'typescript',
        code: safeCode,
      },
    ],
    activeTabId: 'shared-tab',
    theme: (payload.th as any) || 'vitesse-dark',
    background: safeBg,
    fontFamily: payload.f || '"JetBrains Mono", monospace',
    fontSize: payload.fs || 14,
    diffMode: Boolean(payload.diff),
    watermarkText: safeWatermark,
    watermark: Boolean(safeWatermark),
  };
}
