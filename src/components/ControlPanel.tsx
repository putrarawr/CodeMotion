import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import type {
  SnippetSettings,
  SupportedLanguage,
  SupportedTheme,
  WindowStyle,
  SocialPreset,
  LibrarySnapshot,
} from '../types';
import { LANGUAGES, detectLanguageFromCode } from '../utils/languages';
import { THEMES } from '../utils/themes';
import { BACKGROUND_PRESETS } from '../utils/gradients';
import { FONTS } from '../utils/fonts';
import { SOCIAL_PRESETS } from '../utils/socialPresets';
import { SNIPPET_TEMPLATES } from '../utils/snippetTemplates';
import { fetchCodeFromUrl } from '../utils/urlImport';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  exportTemplateAsJson,
  parseAndValidateTemplate,
  downloadJsonFile,
} from '../utils/communityTemplates';
import { INITIAL_PUBLIC_TEMPLATES, type PublicCommunityTemplate } from '../utils/communityTemplatesData';
import {
  Code,
  Palette,
  Type,
  Layout,
  Maximize2,
  Check,
  Wand2,
  GitCompare,
  Play,
  Pause,
  Zap,
  Video,
  Upload,
  User,
  Share,
  Trash2,
  Search,
  FileCode,
  Film,
  Library,
  Pencil,
  Link2,
  Loader2,
  FileDown,
  FileUp,
  Package,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const LIBRARY_MAX_ITEMS = 50;

const formatRelativeTime = (timestamp: number): string => {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

import { Monitor } from 'lucide-react';

interface ControlPanelProps {
  settings: SnippetSettings;
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>;
  onRecordVideo?: () => void;
  recordingProgress?: number | null;
  onBatchExportZip?: (selectedSnapshots?: LibrarySnapshot[]) => void;
  batchExportProgress?: number | null;
  onOpenPresentationDeck?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  setSettings,
  onRecordVideo,
  recordingProgress,
  onBatchExportZip,
  batchExportProgress,
  onOpenPresentationDeck,
}) => {
  const isDark = settings.appTheme === 'dark';

  // Section Expansion Collapsible State for neat organization
  const [activeTabSection, setActiveTabSection] = useState<'style' | 'motion' | 'annotations' | 'layout' | 'watermark' | 'library'>('style');

  // Language search query state
  const [languageSearchQuery, setLanguageSearchQuery] = useState<string>('');

  // Ref for hidden file input upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateFileInputRef = useRef<HTMLInputElement>(null);

  // Snapshot Library state
  const [library, setLibrary] = useLocalStorage<LibrarySnapshot[]>('codemotion_library', []);
  const [snapshotNameInput, setSnapshotNameInput] = useState<string>('');
  const [renamingSnapshotId, setRenamingSnapshotId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState<string>('');
  const [selectedSnapshotsForExport, setSelectedSnapshotsForExport] = useState<Set<string>>(new Set());

  // Community Template Modal / State
  const [exportingTemplateSnapshot, setExportingTemplateSnapshot] = useState<LibrarySnapshot | null>(null);
  const [templateAuthor, setTemplateAuthor] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [templateGithubInput, setTemplateGithubInput] = useState<string>('');
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // URL Import popover state
  const [showUrlPopover, setShowUrlPopover] = useState<boolean>(false);
  const [importUrl, setImportUrl] = useState<string>('');

  const [isUrlImporting, setIsUrlImporting] = useState<boolean>(false);

  // Custom Color Picker Builder State
  const [customBgMode, setCustomBgMode] = useState<'gradient' | 'solid'>('gradient');
  const [customColor1, setCustomColor1] = useState<string>(settings.customColor1 || '#1e1b4b');
  const [customColor2, setCustomColor2] = useState<string>(settings.customColor2 || '#09090b');
  const [customAngle, setCustomAngle] = useState<number>(settings.customGradientAngle || 135);
  // Advanced Options Accordion Collapsible State
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Annotation form state
  const [newAnnotationLineInput, setNewAnnotationLineInput] = useState<string>('1');
  const [newAnnotationText, setNewAnnotationText] = useState<string>('');
  const [newAnnotationColor, setNewAnnotationColor] = useState<'zinc' | 'sky' | 'emerald' | 'amber' | 'purple'>('sky');

  const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];

  const updateSetting = <K extends keyof SnippetSettings>(key: K, value: SnippetSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    const totalEditorLines = activeTab?.code ? activeTab.code.split('\n').length : 1;
    const targetLine = parseInt(newAnnotationLineInput.trim(), 10);

    if (isNaN(targetLine) || targetLine <= 0) {
      toast.error('Invalid line number! Must be at least 1.');
      return;
    }

    if (targetLine > totalEditorLines) {
      toast.error(`Invalid line number! The editor only has ${totalEditorLines} lines.`);
      return;
    }

    if (!newAnnotationText.trim()) {
      toast.info('Please enter callout note text');
      return;
    }

    const newAnnotation = {
      id: `ann-${Date.now()}`,
      line: targetLine,
      text: newAnnotationText.trim(),
      color: newAnnotationColor,
    };

    setSettings((prev) => {
      const current = prev.annotations || [];
      const updated = [...current.filter((a) => a.line !== newAnnotation.line), newAnnotation];
      return { ...prev, annotations: updated };
    });

    setNewAnnotationText('');
    toast.success(`Callout note added to line ${targetLine}`);
  };

  const handleRemoveAnnotation = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      annotations: (prev.annotations || []).filter((a) => a.id !== id),
    }));
    toast.info('Annotation removed');
  };

  const handleClearAllAnnotations = () => {
    setSettings((prev) => ({
      ...prev,
      annotations: [],
    }));
    toast.info('All annotations cleared');
  };

  const handleSortAnnotationsByLine = () => {
    setSettings((prev) => ({
      ...prev,
      annotations: [...(prev.annotations || [])].sort((a, b) => a.line - b.line),
    }));
    toast.success('Annotations sorted by line number');
  };

  const handleClearSpotlight = () => {
    setSettings((prev) => ({ ...prev, focusedLines: [] }));
    toast.info('Spotlight focus cleared');
  };

  const handleAutoDetectLanguage = () => {
    if (!activeTab) return;
    const detected = detectLanguageFromCode(activeTab.code, activeTab.title);
    if (detected) {
      const langObj = LANGUAGES.find((l) => l.id === detected);
      if (activeTab.language === detected) {
        toast.info(`Language is already set to ${langObj?.name || detected}`);
      } else {
        handleLanguageChange(detected);
        toast.success(`Auto-detected language: ${langObj?.name || detected} (${langObj?.extension})`);
      }
    } else {
      toast.info('Could not auto-detect language. Please select manually.');
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    if (!activeTab) return;
    setSettings((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId ? { ...t, language: lang } : t
      ),
    }));
  };

  const applySnippetTemplate = (template: typeof SNIPPET_TEMPLATES[0]) => {
    setSettings((prev) => ({
      ...prev,
      theme: template.theme || prev.theme,
      background: template.background || prev.background,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId
          ? { ...t, code: template.code, title: template.fileName, language: template.language }
          : t
      ),
    }));
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleFileUploadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200_000) {
      toast.error('File is too large. Maximum is 200 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      // Detect language strictly from actual code content
      const detected = detectLanguageFromCode(text);

      setSettings((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? { ...t, code: text, title: file.name, language: detected || t.language }
            : t
        ),
      }));

      const langObj = LANGUAGES.find((l) => l.id === detected);
      toast.success(`File "${file.name}" loaded (Detected: ${langObj?.name || detected || 'Text'})`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveSnapshot = () => {
    const name = (snapshotNameInput.trim() || activeTab?.title || 'Untitled snippet').slice(0, 80);
    // Avatar / logo (base64) is intentionally stripped to keep localStorage quota healthy
    const cleanSettings: SnippetSettings = { ...settings, watermarkAvatar: '' };
    const now = Date.now();

    setLibrary((prev: LibrarySnapshot[]) => {
      let next = [
        { id: `snap-${now}`, name, createdAt: now, updatedAt: now, settings: cleanSettings },
        ...prev,
      ];
      if (next.length > LIBRARY_MAX_ITEMS) {
        next = next.slice(0, LIBRARY_MAX_ITEMS);
        toast.info(`Library full — oldest snapshot removed (max ${LIBRARY_MAX_ITEMS})`);
      }
      return next;
    });

    setSnapshotNameInput('');
    toast.success(`Snapshot "${name}" saved`);
  };

  const handleLoadSnapshot = (snapshot: LibrarySnapshot) => {
    setSettings((prev) => ({
      ...snapshot.settings,
      appTheme: prev.appTheme,
      isPlayingMotion: false,
      controlledTypedLength: null,
    }));
    toast.success(`Loaded snapshot "${snapshot.name}"`);
  };

  const handleStartRenameSnapshot = (snapshot: LibrarySnapshot) => {
    setRenamingSnapshotId(snapshot.id);
    setRenameDraft(snapshot.name);
  };

  const handleCommitRenameSnapshot = () => {
    if (!renamingSnapshotId) return;
    const trimmed = renameDraft.trim();
    if (!trimmed) {
      setRenamingSnapshotId(null);
      return;
    }
    setLibrary((prev: LibrarySnapshot[]) =>
      prev.map((s: LibrarySnapshot) =>
        s.id === renamingSnapshotId ? { ...s, name: trimmed.slice(0, 80), updatedAt: Date.now() } : s
      )
    );
    setRenamingSnapshotId(null);
    toast.success('Snapshot renamed');
  };

  const handleDeleteSnapshot = (id: string) => {
    setLibrary((prev: LibrarySnapshot[]) => prev.filter((s: LibrarySnapshot) => s.id !== id));
    toast.info('Snapshot deleted');
  };

  const handleToggleSnapshotSelection = (id: string) => {
    setSelectedSnapshotsForExport((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllSnapshots = () => {
    if (selectedSnapshotsForExport.size === library.length) {
      setSelectedSnapshotsForExport(new Set());
    } else {
      setSelectedSnapshotsForExport(new Set(library.map((s) => s.id)));
    }
  };

  const handleExportSelectedSnapshots = () => {
    if (selectedSnapshotsForExport.size === 0) {
      toast.error('Please select at least one snapshot to export');
      return;
    }
    const selected = library.filter((s) => selectedSnapshotsForExport.has(s.id));
    onBatchExportZip?.(selected);
  };

  const handleDownloadTemplateJson = (snapshot: LibrarySnapshot) => {
    const jsonStr = exportTemplateAsJson(snapshot, templateAuthor, templateDescription, []);
    const cleanName = snapshot.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    downloadJsonFile(jsonStr, `codemotion-template-${cleanName}.json`);
    toast.success(`Template JSON for "${snapshot.name}" downloaded!`);
    setExportingTemplateSnapshot(null);
    setTemplateAuthor('');
    setTemplateDescription('');
  };

  const handleImportTemplateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const template = parseAndValidateTemplate(content);

        const newSnapshot: LibrarySnapshot = {
          id: `snap-${Date.now()}`,
          name: template.name,
          createdAt: template.createdAt,
          updatedAt: Date.now(),
          settings: template.settings,
        };

        setLibrary((prev: LibrarySnapshot[]) => [newSnapshot, ...prev.slice(0, LIBRARY_MAX_ITEMS - 1)]);
        setSettings((prev) => ({
          ...template.settings,
          appTheme: prev.appTheme,
          isPlayingMotion: false,
          controlledTypedLength: null,
        }));

        toast.success(`Imported community template "${template.name}"${template.author ? ` by ${template.author}` : ''}!`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to import template JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePublishEditorSnippetToGallery = () => {
    const activeTab = settings.tabs.find((t) => t.id === settings.activeTabId) || settings.tabs[0];
    const currentCode = (activeTab?.code || '').trim();
    if (!currentCode) {
      toast.error('Code snippet is empty!');
      return;
    }

    const currentNormalizedCode = currentCode.replace(/\s+/g, ' ');

    const dummyIds = new Set(['pub-react-hook', 'pub-rust-axum', 'pub-py-fastapi', 'pub-go-goroutine', 'pub-css-glass', 'pub-ts-utility']);
    let existing: PublicCommunityTemplate[] = [];
    try {
      const saved = localStorage.getItem('codemotion_public_community_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          existing = parsed.filter((t: any) => !dummyIds.has(t?.id));
        }
      }
    } catch {}

    const allTemplates = [...existing, ...INITIAL_PUBLIC_TEMPLATES];

    const isDuplicate = allTemplates.some((t) => {
      const existingNormalizedCode = (t.code || '').trim().replace(/\s+/g, ' ');
      return existingNormalizedCode === currentNormalizedCode;
    });

    if (isDuplicate) {
      toast.error('Duplicate snippet! This exact code has already been published in the Community Gallery.');
      return;
    }

    const authorName = (templateAuthor.trim() || settings.watermarkText || 'Developer').slice(0, 50);
    const githubHandle = templateGithubInput
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/^@/, '') || 'developer';

    const newPublicTemplate: PublicCommunityTemplate = {
      id: `pub-custom-${Date.now()}`,
      title: activeTab?.title ? activeTab.title.replace(/\.[^/.]+$/, '') : 'Community Snippet',
      description: templateDescription.trim() || `Code snippet setup created by ${authorName}`,
      fileName: activeTab?.title || 'snippet.txt',
      language: activeTab?.language || 'typescript',
      theme: settings.theme,
      themeName: THEMES.find((th) => th.id === settings.theme)?.name || 'Vitesse Dark',
      background: settings.background,
      bgLabel: BACKGROUND_PRESETS.find((b) => b.value === settings.background)?.name || 'Custom Gradient',
      code: activeTab?.code || '',
      author: authorName,
      github: githubHandle,
      createdAt: Date.now(),
      likes: 0,
      category: LANGUAGES.find((l) => l.id === activeTab?.language)?.name || 'Code',
    };

    const updated = [newPublicTemplate, ...existing];
    try {
      localStorage.setItem('codemotion_public_community_templates', JSON.stringify(updated));
    } catch {}

    toast.success(`Published "${newPublicTemplate.title}" to Public Community Gallery with handle @${githubHandle}!`);
    setShowPublishModal(false);
  };

  const handleImportFromUrl = async () => {
    if (!importUrl.trim() || isUrlImporting) return;
    setIsUrlImporting(true);
    try {
      const { code, title } = await fetchCodeFromUrl(importUrl);
      const detected = detectLanguageFromCode(code, title);
      setSettings((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? { ...t, code, title, language: detected || t.language }
            : t
        ),
      }));
      const langObj = LANGUAGES.find((l) => l.id === detected);
      toast.success(`"${title}" imported from URL${langObj ? ` (${langObj.name})` : ''}`);
      setShowUrlPopover(false);
      setImportUrl('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not fetch from URL.');
    } finally {
      setIsUrlImporting(false);
    }
  };

  const applySocialPreset = (preset: SocialPreset) => {
    setSettings((prev) => ({
      ...prev,
      aspectRatio: preset.aspectRatio,
      activeSocialPresetId: preset.id,
      padding: preset.padding,
      background: preset.background,
      fontSize: preset.fontSize,
    }));
  };

  const applyCustomThemeBackground = (c1: string, c2: string, mode: 'gradient' | 'solid', angleDeg: number) => {
    const bgString = mode === 'solid' ? c1 : `linear-gradient(${angleDeg}deg, ${c1} 0%, ${c2} 100%)`;
    setSettings((prev) => ({
      ...prev,
      background: bgString,
      customBgType: mode,
      customColor1: c1,
      customColor2: c2,
      customGradientAngle: angleDeg,
    }));
  };

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
    lang.id.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
    lang.extension.toLowerCase().includes(languageSearchQuery.toLowerCase())
  );

  return (
    <div id="editor-sidebar" className="w-full h-full flex flex-col p-4 sm:p-5 gap-4 overflow-y-auto">
      {/* Category Tab Selector Navigation Bar */}
      <div id="sidebar-category-tabs" className="grid grid-cols-6 gap-1 p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <button
          onClick={() => setActiveTabSection('style')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'style'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Themes, Fonts & Code Diff"
        >
          <Palette className="w-3.5 h-3.5 sm:hidden" />
          <span>Theme</span>
        </button>

        <button
          onClick={() => setActiveTabSection('motion')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'motion'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Motion Code Typing & Video"
        >
          <Zap className="w-3.5 h-3.5 sm:hidden" />
          <span>Motion</span>
        </button>

        <button
          onClick={() => setActiveTabSection('annotations')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'annotations'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Line Spotlight & Callout Notes"
        >
          <Code className="w-3.5 h-3.5 sm:hidden" />
          <span>Notes</span>
        </button>

        <button
          onClick={() => setActiveTabSection('layout')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'layout'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Social Templates & Canvas Background"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:hidden" />
          <span>Layout</span>
        </button>

        <button
          onClick={() => setActiveTabSection('watermark')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'watermark'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Author Username, Watermark & Logo"
        >
          <User className="w-3.5 h-3.5 sm:hidden" />
          <span>Author</span>
        </button>

        <button
          onClick={() => setActiveTabSection('library')}
          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTabSection === 'library'
              ? 'bg-white text-black shadow-md'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
          title="Saved Snapshots Library"
        >
          <Library className="w-3.5 h-3.5 sm:hidden" />
          <span>Library</span>
        </button>
      </div>

      {/* SECTION 1: Theme, Code Diff & Fonts */}
      {activeTabSection === 'style' && (
        <div className="flex flex-col gap-5">
          {/* Import File & Quick Template Bar */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-all ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <FileCode className="w-3.5 h-3.5 text-zinc-300" />
                <span>Import & Templates</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUploadSelect}
                className="hidden"
                accept=".ts,.js,.py,.rs,.go,.html,.css,.json,.sql,.sh,.cpp,.c,.cs,.java,.kt,.swift,.rb,.php,.scala,.r,.dart,.ex,.vue,.svelte,.astro,.gql,.md,.yaml,.txt"
              />

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:text-black'
                  }`}
                  title="Upload code file from device"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  onClick={() => setShowUrlPopover((prev) => !prev)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showUrlPopover
                      ? 'bg-white text-black border-white shadow-xs'
                      : isDark
                      ? 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200 hover:text-black'
                  }`}
                  title="Import code from a URL (GitHub, gist, or raw file)"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>From URL</span>
                </button>
              </div>
            </div>

            {/* URL Import Popover */}
            {showUrlPopover && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleImportFromUrl();
                }}
                className={`p-3 rounded-xl border flex flex-col gap-2 ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-300'
                }`}
              >
                <span className={`text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Paste a GitHub file, gist, or raw code URL
                </span>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://github.com/user/repo/blob/main/index.ts"
                  className={`w-full text-xs font-mono rounded-lg border p-2 outline-none transition-colors ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600'
                      : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isUrlImporting || !importUrl.trim()}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {isUrlImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUrlImporting ? 'Fetching...' : 'Import from URL'}</span>
                </button>
              </form>
            )}

            {/* Quick Template Select Menu */}
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  const found = SNIPPET_TEMPLATES.find((t) => t.id === e.target.value);
                  if (found) applySnippetTemplate(found);
                }}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border appearance-none cursor-pointer outline-none transition-colors ${
                  isDark
                    ? 'bg-zinc-950 text-zinc-200 border-zinc-800 hover:border-zinc-700 focus:border-zinc-600'
                    : 'bg-zinc-50 text-zinc-800 border-zinc-300 hover:border-zinc-400'
                }`}
              >
                <option value="" disabled>Load Snippet Template...</option>
                {SNIPPET_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id} className={isDark ? 'bg-zinc-900 text-zinc-200' : 'bg-white text-zinc-800'}>
                    {tmpl.name} ({tmpl.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Diff Mode Toggle Card */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              settings.diffMode
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : isDark
                ? 'bg-zinc-900/60 border-zinc-800'
                : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${
                  settings.diffMode
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                }`}
              >
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold m-0 font-sans">Code Diff Mode</h3>
                <p className={`text-[11px] m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Highlight + (green) and - (red) refactor lines
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.diffMode}
                onChange={(e) => updateSetting('diffMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Active Tab Language Selector (Searchable & Categorized) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Code className="w-3.5 h-3.5 text-zinc-300" />
                <span>Active Language ({filteredLanguages.length})</span>
              </label>
              <button
                onClick={handleAutoDetectLanguage}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                }`}
                title="Auto detect language from current code"
              >
                <Wand2 className="w-3 h-3 text-amber-400" />
                <span>Auto Detect</span>
              </button>
            </div>

            {/* Language Search Input Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search languages... (e.g. swift, vue, python)"
                value={languageSearchQuery}
                onChange={(e) => setLanguageSearchQuery(e.target.value)}
                className={`w-full text-xs font-sans rounded-xl border pl-8 pr-3 py-2 outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* Quick Popular Language Pills */}
            <div className="flex flex-wrap gap-1 py-1">
              {(['typescript', 'javascript', 'python', 'rust', 'go', 'html', 'css', 'sql', 'cpp', 'swift', 'kotlin', 'vue'] as SupportedLanguage[]).map((langId) => {
                const langObj = LANGUAGES.find((l) => l.id === langId);
                const isSelected = activeTab?.language === langId;
                return (
                  <button
                    key={langId}
                    type="button"
                    onClick={() => handleLanguageChange(langId)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-xs'
                        : isDark
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {langObj?.name || langId}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Select with Filtered Options */}
            <select
              value={activeTab?.language || 'typescript'}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            >
              {filteredLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name} ({lang.extension})
                </option>
              ))}
            </select>
          </div>

          {/* Syntax Theme Selector */}
          <div className="flex flex-col gap-2">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Palette className="w-3.5 h-3.5" />
              <span>VS Code Syntax Theme</span>
            </label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value as SupportedTheme)}
              className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} ({theme.type})
                </option>
              ))}
            </select>
          </div>

          {/* Font Family & Typography Size */}
          <div className="flex flex-col gap-3">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Type className="w-3.5 h-3.5" />
              <span>Font & Typography</span>
            </label>

            <select
              value={settings.fontFamily}
              onChange={(e) => updateSetting('fontFamily', e.target.value)}
              className={`w-full text-xs font-semibold rounded-xl border p-2.5 outline-none transition-colors cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
              }`}
            >
              {FONTS.map((font) => (
                <option key={font.id} value={font.family}>
                  {font.name}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Font Size</span>
                <span className="font-mono font-bold text-xs">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Advanced Fine-Tuning Options Accordion Toggle */}
            <div className="border-t border-zinc-800/60 pt-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Advanced Fine-Tuning Options</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedOptions && (
                <div className="flex flex-col gap-4 mt-3 p-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 transition-all">
                  {/* Canvas Outer Padding Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">Canvas Outer Padding</span>
                      <span className="font-mono font-bold text-xs">{settings.padding}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="128"
                      step="8"
                      value={settings.padding}
                      onChange={(e) => updateSetting('padding', Number(e.target.value))}
                      className="w-full accent-zinc-400 cursor-pointer"
                    />
                  </div>

                  {/* Window Border Radius Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">Window Border Radius</span>
                      <span className="font-mono font-bold text-xs">{settings.borderRadius || 16}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="2"
                      value={settings.borderRadius || 16}
                      onChange={(e) => updateSetting('borderRadius', Number(e.target.value))}
                      className="w-full accent-zinc-400 cursor-pointer"
                    />
                  </div>

                  {/* Line Height Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">Line Height Spacing</span>
                      <span className="font-mono font-bold text-xs">{settings.lineHeight || 1.5}</span>
                    </div>
                    <input
                      type="range"
                      min="1.2"
                      max="2.2"
                      step="0.1"
                      value={settings.lineHeight || 1.5}
                      onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
                      className="w-full accent-zinc-400 cursor-pointer"
                    />
                  </div>

                  {/* Line Numbers Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                    <span className="text-xs font-semibold text-zinc-300">Show Line Numbers</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.lineNumbers}
                        onChange={(e) => updateSetting('lineNumbers', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Motion Code Simulator Controls */}
      {activeTabSection === 'motion' && (
        <div
          id="motion-card"
          className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
            settings.isPlayingMotion
              ? 'bg-gradient-to-r from-zinc-800/40 via-zinc-800/20 to-transparent border-zinc-700/50'
              : isDark
              ? 'bg-zinc-900/60 border-zinc-800/80'
              : 'bg-white border-zinc-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl border ${
                  settings.isPlayingMotion
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700 animate-pulse'
                    : isDark
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                }`}
              >
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold m-0 font-sans">Motion Code Animation</h3>
                <p className={`text-[11px] m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Simulate real-time character typing
                </p>
              </div>
            </div>

            <button
              onClick={() => updateSetting('isPlayingMotion', !settings.isPlayingMotion)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                settings.isPlayingMotion
                  ? 'bg-white text-black border-white shadow-sm'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              {settings.isPlayingMotion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{settings.isPlayingMotion ? 'Pause' : 'Play Motion'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800/40">
            {/* Export Format Selector (MP4 vs GIF) */}
            <div className="flex flex-col gap-1.5">
              <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Export Format</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateSetting('motionExportFormat', 'mp4')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (settings.motionExportFormat || 'mp4') === 'mp4'
                      ? 'bg-white text-black border-white shadow-md'
                      : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>MP4 Video (.mp4)</span>
                </button>

                <button
                  onClick={() => updateSetting('motionExportFormat', 'gif')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.motionExportFormat === 'gif'
                      ? 'bg-white text-black border-white shadow-md'
                      : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Animated GIF (.gif)</span>
                </button>
              </div>
            </div>

            {/* Animation Style Selector */}
             <div className="flex flex-col gap-1.5">
               <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Animation Style</span>
               <div className="grid grid-cols-2 gap-1.5">
                 <button
                   onClick={() => updateSetting('motionStyle', 'typewriter')}
                   className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                     (settings.motionStyle || 'typewriter') === 'typewriter'
                       ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                       : isDark
                       ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                       : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                   }`}
                   title="Smooth character-by-character typing"
                 >
                   <Type className="w-3.5 h-3.5" />
                   <span>Typewriter</span>
                 </button>

                 <button
                   onClick={() => updateSetting('motionStyle', 'lineByLine')}
                   className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                     settings.motionStyle === 'lineByLine'
                       ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                       : isDark
                       ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                       : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                   }`}
                   title="Line-by-line code reveal"
                 >
                   <FileCode className="w-3.5 h-3.5" />
                   <span>Line-by-Line</span>
                 </button>

                 <button
                   onClick={() => updateSetting('motionStyle', 'glitch')}
                   className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                     settings.motionStyle === 'glitch'
                       ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                       : isDark
                       ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                       : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                   }`}
                   title="Chaotic jumps with stutters and backtracking"
                 >
                   <Zap className="w-3.5 h-3.5" />
                   <span>Glitch</span>
                 </button>

                 <button
                   onClick={() => updateSetting('motionStyle', 'wave')}
                   className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                     settings.motionStyle === 'wave'
                       ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                       : isDark
                       ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                       : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                   }`}
                   title="Oscillating forward and backward motion"
                 >
                   <Play className="w-3.5 h-3.5" />
                   <span>Wave</span>
                 </button>
               </div>
             </div>

            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Speed</span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSetting('motionSpeed', s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      settings.motionSpeed === s
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Video Frame Rate (FPS) Selector */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Frame Rate</span>
              <div className="flex items-center gap-1">
                {([30, 60] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => updateSetting('motionFps', f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      (settings.motionFps || 60) === f
                        ? 'bg-white text-black border-white shadow-xs'
                        : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            {onRecordVideo && (
              <button
                onClick={onRecordVideo}
                disabled={recordingProgress !== null && recordingProgress !== undefined}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {settings.motionExportFormat === 'gif' ? <Film className="w-4 h-4 text-black" /> : <Video className="w-4 h-4 text-black" />}
                <span>
                  {recordingProgress !== null && recordingProgress !== undefined
                    ? `Rendering... ${recordingProgress}%`
                    : settings.motionExportFormat === 'gif'
                    ? 'Export Animated GIF (.gif)'
                    : 'Export MP4 Video (.mp4)'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Line Spotlight & Callout Notes */}
      {activeTabSection === 'annotations' && (
        <div className="flex flex-col gap-5">
          {/* Spotlight Mode Box */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-zinc-200" />
                <span className="text-xs font-bold">Line Spotlight Mode</span>
              </div>
              {(settings.focusedLines || []).length > 0 && (
                <button
                  onClick={handleClearSpotlight}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
                >
                  Clear Spotlight
                </button>
              )}
            </div>
            <p className={`text-[11px] leading-relaxed m-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {(settings.focusedLines || []).length > 0
                ? `${(settings.focusedLines || []).length} line(s) currently spotlighted (${(settings.focusedLines || []).join(', ')}). Click line numbers on the canvas to toggle.`
                : 'Click any line number on the canvas editor to spotlight specific lines while dimming the rest.'}
            </p>
          </div>

          {/* Add Line Annotation Form */}
          <form onSubmit={handleAddAnnotation} className={`p-4 rounded-2xl border flex flex-col gap-3 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <span className="text-xs font-bold flex items-center gap-1.5">
              <span>Add Callout Note Badge</span>
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className={`text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Line #</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newAnnotationLineInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setNewAnnotationLineInput(val);
                    }
                  }}
                  onBlur={() => {
                    const totalEditorLines = activeTab?.code ? activeTab.code.split('\n').length : 1;
                    const val = parseInt(newAnnotationLineInput.trim(), 10);
                    if (isNaN(val) || val <= 0) {
                      toast.error('Invalid line number! Must be at least 1.');
                      setNewAnnotationLineInput('1');
                    } else if (val > totalEditorLines) {
                      toast.error(`Invalid line number! The editor only has ${totalEditorLines} lines.`);
                      setNewAnnotationLineInput(totalEditorLines.toString());
                    }
                  }}
                  placeholder="1"
                  className={`w-full text-xs font-mono rounded-xl border p-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className={`text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Callout Text</label>
                <input
                  type="text"
                  placeholder="e.g. Core logic here"
                  value={newAnnotationText}
                  onChange={(e) => setNewAnnotationText(e.target.value)}
                  className={`w-full text-xs font-sans rounded-xl border p-2 outline-none ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>
            </div>

            {/* Badge Color Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tag Color</span>
              <div className="flex items-center gap-1.5">
                {(['sky', 'emerald', 'amber', 'purple', 'zinc'] as const).map((clr) => (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setNewAnnotationColor(clr)}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      clr === 'sky'
                        ? 'bg-sky-400'
                        : clr === 'emerald'
                        ? 'bg-emerald-400'
                        : clr === 'amber'
                        ? 'bg-amber-400'
                        : clr === 'purple'
                        ? 'bg-purple-400'
                        : 'bg-zinc-400'
                    } ${newAnnotationColor === clr ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent opacity-70'}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
              }`}
            >
              Add Callout Badge
            </button>
          </form>

           {/* Active Callout List */}
           {(settings.annotations || []).length > 0 && (
             <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between">
                 <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                   Active Callout Notes ({settings.annotations?.length})
                 </span>
                 <div className="flex items-center gap-1">
                   <button
                     onClick={handleSortAnnotationsByLine}
                     className="px-2 py-1 text-[10px] font-bold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors cursor-pointer"
                     title="Sort annotations by line number"
                   >
                     Sort
                   </button>
                   <button
                     onClick={handleClearAllAnnotations}
                     className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
                     title="Remove all annotations"
                   >
                     Clear All
                   </button>
                 </div>
               </div>
               <div className="flex flex-col gap-2">
                 {settings.annotations?.map((ann) => (
                   <div
                     key={ann.id}
                     className={`flex items-center justify-between p-3 rounded-xl border text-xs font-sans ${
                       isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
                     }`}
                   >
                     <div className="flex items-center gap-2 overflow-hidden">
                       <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
                         L{ann.line}
                       </span>
                       <span className="truncate">{ann.text}</span>
                     </div>
                     <button
                       onClick={() => handleRemoveAnnotation(ann.id)}
                       className="p-1 rounded-lg text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                       title="Delete Callout Note"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      {/* SECTION 4: Social Media Canvas Presets & Layout */}
      {activeTabSection === 'layout' && (
        <div id="customization-card" className="flex flex-col gap-5">
          {/* Social Media Templates Bar */}
          <div className="flex flex-col gap-2">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Share className="w-3.5 h-3.5 text-zinc-300" />
              <span>Social Media Canvas Templates</span>
            </label>

            <div className="flex flex-col gap-2">
              {SOCIAL_PRESETS.map((preset) => {
                const isCurrent = settings.activeSocialPresetId
                  ? settings.activeSocialPresetId === preset.id
                  : settings.aspectRatio === preset.aspectRatio;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applySocialPreset(preset)}
                    className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                        : isDark
                        ? 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-200'
                        : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                        <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{preset.name}</span>
                        <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {preset.platform} • {preset.aspectRatio} Aspect Ratio
                        </span>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-zinc-100" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Window Frame Style */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/40 pt-3">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Layout className="w-3.5 h-3.5" />
              <span>Window Frame</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              {(['macos', 'windows', 'minimal', 'none'] as WindowStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => updateSetting('windowStyle', style)}
                  className={`py-1.5 text-[11px] font-semibold capitalize rounded-lg transition-colors cursor-pointer ${
                    settings.windowStyle === style
                      ? 'bg-white text-black shadow-xs font-bold'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Resizing Control */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/40 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Canvas Width</span>
              </label>
              <span className="font-mono font-bold text-xs">{settings.canvasWidth || 800}px</span>
            </div>
            <input
              type="range"
              min="420"
              max="1080"
              step="10"
              value={settings.canvasWidth || 800}
              onChange={(e) => updateSetting('canvasWidth', Number(e.target.value))}
              className="w-full accent-zinc-400 cursor-pointer"
            />
          </div>

          {/* Canvas Background Gradients */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/40 pt-3">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Palette className="w-3.5 h-3.5 text-zinc-300" />
              <span>Canvas Background</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {BACKGROUND_PRESETS.map((bg) => {
                const isSelected = settings.background === bg.value;
                return (
                  <button
                    key={bg.id}
                    onClick={() => updateSetting('background', bg.value)}
                    className={`h-10 rounded-xl border relative overflow-hidden transition-transform transform active:scale-95 cursor-pointer ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950 border-white' : 'border-zinc-800'
                    }`}
                    style={{ background: bg.value }}
                    title={bg.name}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Palette Builder Box */}
             <div className={`p-4 rounded-2xl border flex flex-col gap-3 mt-2 ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
               <div className="flex items-center justify-between">
                 <span className="text-xs font-bold flex items-center gap-1.5">
                   <Palette className="w-3.5 h-3.5 text-sky-400" />
                   <span>Custom Theme Color Picker</span>
                 </span>
                 <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950 border border-zinc-800">
                   <button
                     type="button"
                     onClick={() => {
                       setCustomBgMode('gradient');
                       applyCustomThemeBackground(customColor1, customColor2, 'gradient', customAngle);
                     }}
                     className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                       customBgMode === 'gradient' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                     }`}
                   >
                     Gradient
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       setCustomBgMode('solid');
                       applyCustomThemeBackground(customColor1, customColor2, 'solid', customAngle);
                     }}
                     className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                       customBgMode === 'solid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                     }`}
                   >
                     Solid
                   </button>
                 </div>
               </div>

               {/* Live Preview of Custom Background */}
               <div
                 className="w-full h-20 rounded-xl border border-zinc-700 overflow-hidden"
                 style={{
                   background:
                     customBgMode === 'gradient'
                       ? `linear-gradient(${customAngle}deg, ${customColor1}, ${customColor2})`
                       : customColor1,
                 }}
               />

               {/* Dual Color Pickers */}
               <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1.5">
                   <label className={`text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                     {customBgMode === 'gradient' ? 'Start Color' : 'Background Color'}
                   </label>
                   <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-800 bg-zinc-950">
                     <input
                       type="color"
                       value={customColor1}
                       onChange={(e) => {
                         const val = e.target.value;
                         setCustomColor1(val);
                         applyCustomThemeBackground(val, customColor2, customBgMode, customAngle);
                       }}
                       className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                     />
                     <span className="text-xs font-mono font-semibold uppercase text-zinc-200">{customColor1}</span>
                   </div>
                 </div>

                 {customBgMode === 'gradient' && (
                   <div className="flex flex-col gap-1.5">
                     <label className={`text-[10px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>End Color</label>
                     <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-800 bg-zinc-950">
                       <input
                         type="color"
                         value={customColor2}
                         onChange={(e) => {
                           const val = e.target.value;
                           setCustomColor2(val);
                           applyCustomThemeBackground(customColor1, val, customBgMode, customAngle);
                         }}
                         className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                       />
                       <span className="text-xs font-mono font-semibold uppercase text-zinc-200">{customColor2}</span>
                     </div>
                   </div>
                 )}
               </div>

               {/* Angle Slider */}
               {customBgMode === 'gradient' && (
                 <div className="flex flex-col gap-1.5 pt-1">
                   <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Gradient Direction Angle</span>
                     <span className="font-mono text-zinc-200">{customAngle}°</span>
                   </div>
                   <input
                     type="range"
                     min="0"
                     max="360"
                     step="5"
                     value={customAngle}
                     onChange={(e) => {
                       const deg = Number(e.target.value);
                       setCustomAngle(deg);
                       applyCustomThemeBackground(customColor1, customColor2, 'gradient', deg);
                     }}
                     className="w-full accent-zinc-400 cursor-pointer"
                   />
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Author Username & Branding Watermark */}
      {activeTabSection === 'watermark' && (
        <div className="flex flex-col gap-4 p-4 rounded-2xl border bg-zinc-900/60 border-zinc-800/80">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <label className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <User className="w-3.5 h-3.5 text-zinc-300" />
              <span>Author Username & Watermark</span>
            </label>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.watermark}
                onChange={(e) => updateSetting('watermark', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white" />
            </label>
          </div>

          {settings.watermark && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Your Handle / Username</span>
                <input
                  type="text"
                  value={settings.watermarkText}
                  onChange={(e) => updateSetting('watermarkText', e.target.value)}
                  placeholder="e.g. @putra or @username"
                  className={`w-full text-xs font-mono rounded-xl border p-2.5 outline-none transition-colors ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Custom Avatar / Company Logo</span>
                <div className="flex items-center gap-2">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed text-xs font-semibold cursor-pointer transition-all ${
                      isDark
                        ? 'bg-zinc-950/80 border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-500'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{settings.watermarkAvatar ? 'Change Logo / Avatar' : 'Upload Logo / Avatar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            updateSetting('watermarkAvatar', evt.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  {settings.watermarkAvatar && (
                    <button
                      type="button"
                      onClick={() => updateSetting('watermarkAvatar', undefined)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-red-400 hover:bg-red-500/10 cursor-pointer ${
                        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-300'
                      }`}
                      title="Remove Logo Avatar"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: Saved Snapshots Library & Community Templates */}
      {activeTabSection === 'library' && (
        <div id="library-section" className="flex flex-col gap-4">
          {/* Hidden File Input for Importing Community Template JSON */}
          <input
            type="file"
            ref={templateFileInputRef}
            onChange={handleImportTemplateFile}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Save, Import & Publish Actions */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-3 ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Save Current Snapshot</span>
              <button
                type="button"
                onClick={() => templateFileInputRef.current?.click()}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                }`}
                title="Import a template JSON file shared by the community"
              >
                <FileUp className="w-3 h-3 text-zinc-400" />
                <span>Import JSON</span>
              </button>
            </div>

            <input
              type="text"
              value={snapshotNameInput}
              onChange={(e) => setSnapshotNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveSnapshot();
                }
              }}
              placeholder={activeTab?.title || 'Untitled snippet'}
              className={`w-full text-xs font-mono rounded-xl border p-2.5 outline-none transition-colors ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600'
                  : 'bg-zinc-100 border-zinc-300 text-zinc-900 placeholder:text-zinc-400'
              }`}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveSnapshot}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                Save Local
              </button>

              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 border ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-900 hover:bg-zinc-200'
                }`}
                title="Publish this snippet setup to the Public Community Gallery with your GitHub handle watermark"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish Public</span>
              </button>
            </div>

            {onOpenPresentationDeck && (
              <div className="w-full mt-1">
                <button
                  type="button"
                  onClick={onOpenPresentationDeck}
                  className={`w-full py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Present Deck</span>
                </button>
              </div>
            )}

            <p className={`text-[11px] m-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Save snapshot locally, publish to Community Gallery, or present as a slide deck!
            </p>
          </div>

          {/* Publish from Editor Card Modal */}
          {showPublishModal && (
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100 shadow-xl' : 'bg-white border-zinc-300 text-zinc-900 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Publish Snippet to Gallery</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Author Name *</label>
                  <input
                    type="text"
                    value={templateAuthor}
                    onChange={(e) => setTemplateAuthor(e.target.value)}
                    placeholder={settings.watermarkText || 'e.g. Septiyan Bintang'}
                    className={`w-full text-xs rounded-xl border p-2 outline-none ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">GitHub Handle / Username *</label>
                  <input
                    type="text"
                    value={templateGithubInput}
                    onChange={(e) => setTemplateGithubInput(e.target.value)}
                    placeholder="e.g. putrarawr"
                    className={`w-full text-xs rounded-xl border p-2 outline-none ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">Snippet Description *</label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Short description of this code setup..."
                    rows={2}
                    className={`w-full text-xs rounded-xl border p-2 outline-none resize-none ${
                      isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePublishEditorSnippetToGallery}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Publish to Public Gallery</span>
              </button>
            </div>
          )}

          {/* Export JSON Template Drawer */}
          {exportingTemplateSnapshot && (
            <div
              className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Export Template JSON</span>
                </span>
                <button
                  onClick={() => setExportingTemplateSnapshot(null)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <span className="text-[11px] text-zinc-400 font-mono font-bold truncate">
                "{exportingTemplateSnapshot.name}"
              </span>

              <input
                type="text"
                value={templateAuthor}
                onChange={(e) => setTemplateAuthor(e.target.value)}
                placeholder="Author Name (optional)"
                className={`w-full text-xs rounded-xl border p-2 outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                }`}
              />

              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Description / Usage tips (optional)"
                rows={2}
                className={`w-full text-xs rounded-xl border p-2 outline-none resize-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                }`}
              />

              <button
                onClick={() => handleDownloadTemplateJson(exportingTemplateSnapshot)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download .JSON Template</span>
              </button>
            </div>
          )}

           {/* Snapshot List & Batch Export */}
           {library.length > 0 && (
             <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <span
                   className={`text-[11px] font-bold uppercase tracking-wider ${
                     isDark ? 'text-zinc-400' : 'text-zinc-500'
                   }`}
                 >
                   Saved Snapshots ({library.length})
                 </span>

                 <div className="flex items-center gap-1.5">
                   {selectedSnapshotsForExport.size > 0 && (
                     <button
                       type="button"
                       onClick={handleExportSelectedSnapshots}
                       disabled={batchExportProgress !== null && batchExportProgress !== undefined}
                       className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                         isDark
                           ? 'bg-blue-900/60 border-blue-700 text-blue-300 hover:bg-blue-800'
                           : 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                       }`}
                       title={`Export ${selectedSnapshotsForExport.size} selected snapshot(s)`}
                     >
                       <Package className="w-3 h-3" />
                       <span>
                         {batchExportProgress !== null && batchExportProgress !== undefined
                           ? `${batchExportProgress}%`
                           : `Export (${selectedSnapshotsForExport.size})`}
                       </span>
                     </button>
                   )}

                   {onBatchExportZip && !selectedSnapshotsForExport.size && (
                     <button
                       type="button"
                       onClick={() => onBatchExportZip(library)}
                       disabled={batchExportProgress !== null && batchExportProgress !== undefined}
                       className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                         isDark
                           ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                           : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black'
                       }`}
                       title="Export all saved snapshots as a single ZIP file containing PNG images"
                     >
                       <Package className="w-3 h-3 text-emerald-400" />
                       <span>
                         {batchExportProgress !== null && batchExportProgress !== undefined
                           ? `${batchExportProgress}%`
                           : 'Export ZIP'}
                       </span>
                     </button>
                   )}

                   <button
                     type="button"
                     onClick={handleSelectAllSnapshots}
                     className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                       selectedSnapshotsForExport.size > 0
                         ? isDark
                           ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                           : 'bg-zinc-300 border-zinc-400 text-zinc-800'
                         : isDark
                         ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                         : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-zinc-700'
                     }`}
                     title={selectedSnapshotsForExport.size === library.length ? 'Deselect all' : 'Select all'}
                   >
                     <Check className="w-3 h-3" />
                   </button>
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 {library.map((snapshot: LibrarySnapshot) => (
                   <div
                     key={snapshot.id}
                     className={`p-3 rounded-xl border transition-all group ${
                       selectedSnapshotsForExport.has(snapshot.id)
                         ? isDark
                           ? 'bg-blue-900/30 border-blue-700'
                           : 'bg-blue-100 border-blue-300'
                         : isDark
                         ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                         : 'bg-white border-zinc-200 hover:border-zinc-300'
                     }`}
                   >
                     <div className="flex items-center justify-between gap-2">
                       <div className="flex items-start gap-2 flex-1 min-w-0">
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleToggleSnapshotSelection(snapshot.id);
                           }}
                           className="mt-0.5 flex-shrink-0"
                           title={selectedSnapshotsForExport.has(snapshot.id) ? 'Deselect' : 'Select for export'}
                         >
                           <input
                             type="checkbox"
                             checked={selectedSnapshotsForExport.has(snapshot.id)}
                             onChange={() => {}}
                             className="w-4 h-4 rounded cursor-pointer accent-blue-500"
                             onClick={(e) => e.stopPropagation()}
                           />
                         </button>
                         <div
                           className="flex-1 min-w-0 cursor-pointer"
                           onClick={() => handleLoadSnapshot(snapshot)}
                           title={`Load snapshot "${snapshot.name}"`}
                         >
                           {renamingSnapshotId === snapshot.id ? (
                             <input
                               autoFocus
                               type="text"
                               value={renameDraft}
                               onChange={(e) => setRenameDraft(e.target.value)}
                               onClick={(e) => e.stopPropagation()}
                               onBlur={handleCommitRenameSnapshot}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   e.preventDefault();
                                   handleCommitRenameSnapshot();
                                 }
                                 if (e.key === 'Escape') {
                                   setRenamingSnapshotId(null);
                                 }
                               }}
                               className={`w-full text-xs font-mono font-bold rounded-lg border p-1.5 outline-none ${
                                 isDark
                                   ? 'bg-zinc-950 border-zinc-700 text-zinc-100'
                                   : 'bg-zinc-100 border-zinc-300 text-zinc-900'
                               }`}
                             />
                           ) : (
                             <>
                               <span className={`block truncate text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                                 {snapshot.name}
                               </span>
                               <span className={`block text-[10px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                 {LANGUAGES.find((l) => l.id === snapshot.settings.tabs.find((t: any) => t.id === snapshot.settings.activeTabId)?.language)
                                   ?.name || 'Code'}{' '}
                                 • {THEMES.find((th) => th.id === snapshot.settings.theme)?.name || snapshot.settings.theme} •{' '}
                                 {formatRelativeTime(snapshot.updatedAt)}
                               </span>
                             </>
                           )}
                         </div>
                       </div>

                       {renamingSnapshotId !== snapshot.id && (
                         <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExportingTemplateSnapshot(snapshot);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Export as JSON Template"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRenameSnapshot(snapshot);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Rename Snapshot"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSnapshot(snapshot.id);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {library.length === 0 && (
            <p className={`text-[11px] m-0 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              No saved snapshots yet. Save your first one above or import a community template JSON file.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
