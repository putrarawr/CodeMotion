export interface ImportedCode {
  code: string;
  title: string;
}

const MAX_IMPORT_BYTES = 200_000;

/**
 * Resolve a user-supplied URL into a direct raw text URL.
 * Supports GitHub blob URLs, GitHub gists, and any direct text URL.
 */
function resolveRawUrl(url: string): { kind: 'raw' | 'gist'; url: string } {
  const trimmed = url.trim();

  // github.com/{user}/{repo}/blob/{branch}/{path...}
  const blobMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/
  );
  if (blobMatch) {
    return {
      kind: 'raw',
      url: `https://raw.githubusercontent.com/${blobMatch[1]}/${blobMatch[2]}/${blobMatch[3]}`,
    };
  }

  // gist.github.com/{user}/{id} or gist.github.com/{id}
  const gistMatch = trimmed.match(
    /^https?:\/\/(?:www\.)?gist\.github\.com\/(?:[^/]+\/)?([0-9a-f]+)$/i
  );
  if (gistMatch) {
    return { kind: 'gist', url: `https://api.github.com/gists/${gistMatch[1]}` };
  }

  return { kind: 'raw', url: trimmed };
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('URL not found (404). Check the link and try again.');
    }
    throw new Error(`Could not fetch from URL (HTTP ${response.status}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  const isHtml = contentType.includes('text/html');
  const isText =
    contentType.includes('text/') ||
    contentType.includes('json') ||
    contentType.includes('javascript') ||
    contentType.includes('xml') ||
    contentType === '';

  if (isHtml && !url.includes('raw.githubusercontent')) {
    throw new Error('The URL returned an HTML page, not a raw code file.');
  }
  if (!isText) {
    throw new Error('The URL did not return a plain text file.');
  }

  const text = await response.text();
  if (text.length > MAX_IMPORT_BYTES) {
    throw new Error('File is too large. Maximum is 200 KB.');
  }
  return text;
}

export async function fetchCodeFromUrl(rawInput: string): Promise<ImportedCode> {
  let resolved: { kind: 'raw' | 'gist'; url: string };
  try {
    resolved = resolveRawUrl(rawInput);
  } catch {
    throw new Error('Invalid URL.');
  }

  let code: string;
  let title: string;

  try {
    if (resolved.kind === 'gist') {
      const response = await fetch(resolved.url);
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Gist not found (404). Check the link and try again.'
            : `Could not fetch gist (HTTP ${response.status}).`
        );
      }
      const gist = await response.json();
      const files = Object.values<{ raw_url?: string; filename?: string }>(gist.files || {});
      const firstFile = files.find((f) => f.raw_url);
      if (!firstFile?.raw_url) {
        throw new Error('No files found in gist.');
      }
      code = await fetchText(firstFile.raw_url);
      title = firstFile.filename || 'gist.txt';
    } else {
      code = await fetchText(resolved.url);
      const pathSegment = resolved.url.split('/').pop() || 'imported.txt';
      title = decodeURIComponent(pathSegment.split('?')[0]) || 'imported.txt';
    }
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Could not fetch from URL (network or CORS error).');
    }
    throw err instanceof Error ? err : new Error('Could not fetch from URL.');
  }

  return { code, title };
}
