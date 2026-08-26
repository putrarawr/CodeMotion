import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiGithub } from 'react-icons/si';
import {
  Search,
  ArrowUpRight,
  FileCode,
  Download,
  Sun,
  Moon,
  Code,
  ExternalLink,
  Heart,
} from 'lucide-react';
import type { SnippetSettings } from '../types';
import { type PublicCommunityTemplate } from '../utils/communityTemplatesData';
import { exportTemplateAsJson, downloadJsonFile } from '../utils/communityTemplates';
import { Logo } from './Logo';
import { toast } from 'sonner';

interface TemplateGalleryPageProps {
  settings: SnippetSettings;
  onToggleAppTheme: () => void;
  onSelectTemplate: (template: {
    code: string;
    fileName: string;
    language: any;
    theme: any;
    background: string;
  }) => void;
}

export const TemplateGalleryPage: React.FC<TemplateGalleryPageProps> = ({
  settings,
  onToggleAppTheme,
  onSelectTemplate,
}) => {
  const isDark = settings.appTheme === 'dark';

  // Load public templates from localStorage (legacy dummy IDs are purged)
  const [publicTemplates, setPublicTemplates] = useState<PublicCommunityTemplate[]>(() => {
    const dummyIds = new Set(['pub-react-hook', 'pub-rust-axum', 'pub-py-fastapi', 'pub-go-goroutine', 'pub-css-glass', 'pub-ts-utility']);
    try {
      const saved = localStorage.getItem('codemotion_public_community_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((t: any) => !dummyIds.has(t?.id));
          localStorage.setItem('codemotion_public_community_templates', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch {}
    return [];
  });

  // Track liked template IDs in localStorage
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('codemotion_liked_templates');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set<string>();
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Unique categories list
  const categories = ['all', ...Array.from(new Set(publicTemplates.map((t) => t.category)))];

  // Filtered templates
  const filteredTemplates = publicTemplates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.github.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleToggleLike = (templateId: string) => {
    const nextLikedState = new Set(likedIds);
    let isNowLiked = false;

    if (nextLikedState.has(templateId)) {
      nextLikedState.delete(templateId);
    } else {
      nextLikedState.add(templateId);
      isNowLiked = true;
    }

    setLikedIds(nextLikedState);
    try {
      localStorage.setItem('codemotion_liked_templates', JSON.stringify(Array.from(nextLikedState)));
    } catch {}

    setPublicTemplates((prev) => {
      const updated = prev.map((t) => {
        if (t.id === templateId) {
          const currentLikes = t.likes || 0;
          return {
            ...t,
            likes: isNowLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
          };
        }
        return t;
      });

      try {
        localStorage.setItem('codemotion_public_community_templates', JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  const handleDownloadTemplateJson = (t: PublicCommunityTemplate) => {
    const fakeSnapshot = {
      id: t.id,
      name: t.title,
      createdAt: t.createdAt,
      updatedAt: t.createdAt,
      settings: {
        ...settings,
        theme: t.theme,
        background: t.background,
        tabs: [{ id: 't1', title: t.fileName, code: t.code, language: t.language }],
        activeTabId: 't1',
      },
    };

    const jsonStr = exportTemplateAsJson(fakeSnapshot, t.author, t.description, [t.language, t.category]);
    const cleanName = t.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    downloadJsonFile(jsonStr, `codemotion-template-${cleanName}.json`);
    toast.success(`Downloaded template "${t.title}" JSON!`);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute inset-0 opacity-[0.10] ${
            isDark ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)]' : 'bg-[radial-gradient(#000000_1px,transparent_1px)]'
          } [background-size:24px_24px]`}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-zinc-800/10 via-zinc-700/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      </div>

      {/* Header Navigation Bar */}
      <header
        className={`w-full border-b sticky top-0 z-40 backdrop-blur-xl ${
          isDark ? 'bg-zinc-950/80 border-zinc-800/80 text-white' : 'bg-white/80 border-zinc-200 text-zinc-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <Logo className="w-5 h-5 text-white" />
            <span className="text-sm font-bold tracking-tight">CodeMotion</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/editor"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all no-underline ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white' : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:text-black'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-zinc-300" />
              <span>Editor Workspace</span>
            </Link>

            <button
              onClick={onToggleAppTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
              }`}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 z-10 w-full flex flex-col gap-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Community Code Templates
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Explore developer code snippet presets, preview syntax themes, and open any preset directly in the Editor. To publish your snippet setup, use the <strong>Publish Public</strong> button in the Editor workspace!
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-6 border-zinc-800/60">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, language, author, or github..."
              className={`w-full text-xs rounded-xl border pl-9 pr-3 py-2 outline-none transition-colors ${
                isDark
                  ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400'
              }`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex-shrink-0 capitalize ${
                  selectedCategory === cat
                    ? 'bg-white text-black border-white shadow-sm'
                    : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    : 'bg-white border-zinc-300 text-zinc-600 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const isLiked = likedIds.has(template.id);
            return (
              <div
                key={template.id}
                className={`rounded-3xl border transition-all overflow-hidden flex flex-col justify-between group hover:border-zinc-700 hover:shadow-2xl ${
                  isDark ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-md'
                }`}
              >
                {/* Card Header & Author Info */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold m-0 truncate">{template.title}</h3>
                      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {template.description}
                      </p>
                    </div>

                    {/* Interactive Like Counter */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(template.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          : isDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-zinc-700'
                          : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-rose-500'
                      }`}
                      title={isLiked ? 'Unlike snippet' : 'Like snippet'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-zinc-400'
                        }`}
                      />
                      <span>{template.likes || 0}</span>
                    </button>
                  </div>

                  {/* Author Info Line (No Badge) */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0 text-xs">
                      <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        {template.author}
                      </span>
                      {template.github && (
                        <a
                          href={`https://github.com/${template.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-xs font-mono transition-colors no-underline ${
                            isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
                          }`}
                          title={`View GitHub profile @${template.github}`}
                        >
                          <SiGithub className="w-3 h-3 text-zinc-400" />
                          <span>@{template.github}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                        </a>
                      )}
                    </div>

                    <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {template.language} • {template.themeName}
                    </span>
                  </div>

                  {/* Code Window Visual Preview */}
                  <div
                    className="rounded-2xl p-4 sm:p-5 shadow-inner transition-all relative overflow-hidden"
                    style={{ background: template.background }}
                  >
                    <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-3.5 shadow-lg">
                      <div className="flex items-center justify-between mb-3 opacity-70">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                          <span className="text-[10px] font-mono text-zinc-400 ml-2">{template.fileName}</span>
                        </div>
                      </div>

                      <div className="font-mono text-[11px] leading-relaxed text-zinc-200 overflow-hidden max-h-28 relative">
                        <pre className="m-0 font-mono whitespace-pre-wrap">
                          {template.code.split('\n').slice(0, 6).join('\n')}
                        </pre>
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div
                  className={`p-3.5 px-5 border-t flex items-center justify-between ${
                    isDark ? 'border-zinc-800/80 bg-zinc-950/60' : 'border-zinc-100 bg-zinc-50/60'
                  }`}
                >
                  <span className="text-[11px] font-mono text-zinc-500">
                    {template.code.split('\n').length} lines • {template.bgLabel}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadTemplateJson(template)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isDark
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          : 'bg-white border-zinc-300 text-zinc-600 hover:text-black'
                      }`}
                      title="Download template JSON file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectTemplate({
                          code: template.code,
                          fileName: template.fileName,
                          language: template.language,
                          theme: template.theme,
                          background: template.background,
                        });
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Use Template</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <FileCode className="w-10 h-10 text-zinc-500" />
            <p className="text-sm font-semibold text-zinc-400">No community templates published yet.</p>
            <p className="text-xs text-zinc-500 max-w-sm">
              Open the CodeMotion Editor and click <strong>Publish Public</strong> in the Library section to share your first snippet template!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
