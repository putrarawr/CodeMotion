/**
 * Security & Sanitization Utility for CodeMotion
 * Protects against XSS, DOM-based script injection, malicious URL protocols, and invalid room parameters.
 */

// Regex for safe Alphanumeric Room IDs (4 to 64 chars)
const SAFE_ROOM_ID_REGEX = /^[a-zA-Z0-9_-]{4,64}$/;

/**
 * Sanitizes Room ID parameter from URL or user input.
 * Strips out dangerous characters and enforces strict length & regex bounds.
 */
export function sanitizeRoomId(roomId: string | null | undefined): string | null {
  if (!roomId || typeof roomId !== 'string') return null;
  
  const trimmed = roomId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (SAFE_ROOM_ID_REGEX.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Validates and sanitizes external URLs (e.g. for GitHub file imports or external links).
 * Blocks dangerous protocols like `javascript:`, `data:text/html`, `vbscript:`, `file:`.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  const cleanUrl = url.trim();

  // Block javascript:, data:, vbscript:, file: URLs
  const lowerUrl = cleanUrl.toLowerCase();
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('vbscript:') ||
    lowerUrl.startsWith('file:')
  ) {
    return null;
  }

  try {
    const parsed = new URL(cleanUrl);
    // Strictly enforce http or https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If not a full URL, check relative clean path
    if (!cleanUrl.includes(':')) {
      return cleanUrl;
    }
  }

  return null;
}

/**
 * Strips HTML tags and script tags from text inputs to prevent XSS.
 */
export function sanitizeText(text: string | null | undefined, maxLength = 50000): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove <style> tags
    .replace(/on\w+\s*=/gi, '')                                         // Remove inline event handlers like onerror=
    .slice(0, maxLength);
}
