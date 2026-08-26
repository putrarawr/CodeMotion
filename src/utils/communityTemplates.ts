import type { SnippetSettings, LibrarySnapshot } from '../types';

export interface CommunityTemplate {
  format: 'codemotion-template-v1';
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  createdAt: number;
  settings: SnippetSettings;
}

/**
 * Creates a clean JSON string for sharing a template snippet.
 * Note: Avatar/logo base64 is stripped to keep file sizes lightweight.
 */
export function exportTemplateAsJson(
  snapshot: LibrarySnapshot,
  authorName: string = '',
  descriptionText: string = '',
  tagsList: string[] = []
): string {
  const cleanSettings: SnippetSettings = {
    ...snapshot.settings,
    watermarkAvatar: '',
    isPlayingMotion: false,
    controlledTypedLength: null,
  };

  const template: CommunityTemplate = {
    format: 'codemotion-template-v1',
    id: snapshot.id || `template-${Date.now()}`,
    name: snapshot.name || 'Untitled Template',
    author: authorName.trim() || 'Anonymous',
    description: descriptionText.trim(),
    tags: tagsList.filter(Boolean),
    createdAt: snapshot.createdAt || Date.now(),
    settings: cleanSettings,
  };

  return JSON.stringify(template, null, 2);
}

/**
 * Parses and validates an uploaded/pasted JSON string into a CommunityTemplate object.
 */
export function parseAndValidateTemplate(jsonStr: string): CommunityTemplate {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Invalid JSON format. Please provide a valid CodeMotion template file.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid template data structure.');
  }

  if (parsed.format !== 'codemotion-template-v1') {
    throw new Error('Unrecognized template format. Must be a CodeMotion template (v1).');
  }

  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('Template is missing a valid name.');
  }

  if (!parsed.settings || !Array.isArray(parsed.settings.tabs) || parsed.settings.tabs.length === 0) {
    throw new Error('Template is missing snippet code content or tabs.');
  }

  return {
    format: 'codemotion-template-v1',
    id: typeof parsed.id === 'string' ? parsed.id : `template-${Date.now()}`,
    name: String(parsed.name).slice(0, 80),
    author: typeof parsed.author === 'string' ? parsed.author.slice(0, 50) : 'Anonymous',
    description: typeof parsed.description === 'string' ? parsed.description.slice(0, 200) : '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 5) : [],
    createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    settings: {
      ...parsed.settings,
      watermarkAvatar: '',
      isPlayingMotion: false,
      controlledTypedLength: null,
    },
  };
}

/**
 * Utility to download JSON data as a file.
 */
export function downloadJsonFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
