import React, { useState } from 'react';
import type { WindowStyle, SupportedLanguage, SnippetTab } from '../types';
import { Minus, Square, X, Plus, FileCode2, Edit2 } from 'lucide-react';

interface WindowFrameProps {
  windowStyle: WindowStyle;
  tabs: SnippetTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onUpdateTabTitle: (tabId: string, newTitle: string) => void;
  onAddTab: () => void;
  onRemoveTab: (tabId: string) => void;
  language: SupportedLanguage;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowStyle,
  tabs,
  activeTabId,
  onSelectTab,
  onUpdateTabTitle,
  onAddTab,
  onRemoveTab,
  children,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 border border-white/10 bg-slate-950/60 backdrop-blur-md">
      {/* Header Bar with Multi-File Tabs */}
      {windowStyle !== 'none' && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 select-none bg-slate-900/80 gap-2 overflow-x-auto">
          {/* macOS Controls Left */}
          {windowStyle === 'macos' && (
            <div className="flex items-center gap-1.5 pl-1 pr-2 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs" />
            </div>
          )}

          {windowStyle === 'windows' && (
            <div className="flex items-center gap-1 opacity-60 flex-shrink-0 pl-1 pr-2">
              <FileCode2 className="w-4 h-4 text-zinc-300" />
            </div>
          )}

          {windowStyle === 'minimal' && (
            <div className="flex items-center gap-1 flex-shrink-0 pl-1 pr-2">
              <div className="w-2 h-2 rounded-full bg-zinc-400/50" />
            </div>
          )}

          {/* Multi-File Tab Pills Header */}
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-0.5">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const isEditing = editingTabId === tab.id;

              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer group flex-shrink-0 border ${
                    isActive
                      ? 'bg-zinc-800/90 text-white border-white/20 shadow-xs font-semibold'
                      : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/50'
                  }`}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={tab.title}
                      onChange={(e) => onUpdateTabTitle(tab.id, e.target.value)}
                      onBlur={() => setEditingTabId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          setEditingTabId(null);
                        }
                      }}
                      className="bg-transparent text-xs font-mono outline-none border-b border-indigo-400 max-w-[120px]"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => setEditingTabId(tab.id)}
                      className="truncate max-w-[130px]"
                      title="Double-click to rename file"
                    >
                      {tab.title}
                    </span>
                  )}

                  {/* Rename Icon button on active tab */}
                  {isActive && !isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTabId(tab.id);
                      }}
                      title="Rename file"
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity p-0.5"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {/* Remove Tab Button */}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTab(tab.id);
                      }}
                      title="Close file"
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add New Tab Button */}
            {tabs.length < 6 && (
              <button
                onClick={onAddTab}
                title="Add file tab"
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Windows Header Control Icons */}
          {windowStyle === 'windows' && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs flex-shrink-0 pr-1">
              <Minus className="w-3 h-3" />
              <Square className="w-2.5 h-2.5" />
              <X className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      )}

      {/* Editor Body */}
      <div className="relative w-full p-4 md:p-6 overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
