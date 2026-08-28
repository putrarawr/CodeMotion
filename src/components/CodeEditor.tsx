import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, ViewPlugin, Decoration, WidgetType, keymap } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { indentOnInput, bracketMatching } from '@codemirror/language';
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets } from '@codemirror/autocomplete';
import { search, searchKeymap } from '@codemirror/search';
import type { SupportedLanguage, SupportedTheme, LineAnnotation } from '../types';
import { MessageSquare } from 'lucide-react';
import { getLanguageExtension } from '../utils/cmLanguages';
import { getCmThemeExtensions, cmBaseTheme } from '../utils/cmThemes';
import { registerEditorView, isImperativeSyncing, isBridgeSuppressing } from '../utils/editorBridge';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  language: SupportedLanguage;
  theme: SupportedTheme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  showLineNumbers: boolean;
  diffMode: boolean;
  focusedLines?: number[];
  annotations?: LineAnnotation[];
  onToggleFocusedLine?: (lineNum: number) => void;
  peerCursors?: Map<string, { peerId: string; username: string; line: number; ch: number }>;
  onCursorChange?: (line: number, ch: number) => void;
  isPlayingMotion?: boolean;
  motionSpeed?: number;
  controlledTypedLength?: number | null;
  onMotionFinish?: () => void;
}

class MotionCursorWidget extends WidgetType {
  eq() {
    return true;
  }
  toDOM() {
    const span = document.createElement('span');
    span.className =
      'inline-block w-2 h-4 bg-white ml-0.5 animate-pulse rounded-xs opacity-90 align-middle';
    return span;
  }
  ignoreEvent() {
    return true;
  }
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  theme,
  fontFamily,
  fontSize,
  lineHeight,
  showLineNumbers,
  diffMode,
  focusedLines = [],
  annotations = [],
  onToggleFocusedLine,
  peerCursors,
  onCursorChange,
  isPlayingMotion = false,
  motionSpeed = 1,
  controlledTypedLength = null,
  onMotionFinish,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const timerRef = useRef<number | null>(null);

  const onCursorChangeRef = useRef(onCursorChange);
  onCursorChangeRef.current = onCursorChange;
  // True while we programmatically replace the doc (motion slicing, external sync).
  // Prevents those changes from being pushed back via onChange (which would
  // overwrite the real code with the motion slice).
  const applyingProgrammaticRef = useRef(false);
  const [internalTypedLength, setInternalTypedLength] = useState<number>(
    isPlayingMotion ? 0 : code.length
  );

  // Always-fresh callbacks without re-creating the view
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Compartments for dynamic reconfiguration
  const langCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const editableCompartment = useRef(new Compartment());

  // Latest motion/display config readable imperatively by the cursor plugin
  const displayCfgRef = useRef({ inMotion: false, activeLength: 0, totalLength: 0 });

  // If motion play state changes to true, reset internal typed length to 0
  useEffect(() => {
    if (isPlayingMotion && controlledTypedLength === null) {
      setInternalTypedLength(0);
    } else if (!isPlayingMotion && controlledTypedLength === null) {
      setInternalTypedLength(code.length);
    }
  }, [isPlayingMotion, controlledTypedLength, code]);

  // Motion Typing Animation Interval (when not manually controlled by video recorder)
  useEffect(() => {
    if (!isPlayingMotion || controlledTypedLength !== null) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(10, Math.floor(35 / motionSpeed));
    timerRef.current = window.setInterval(() => {
      setInternalTypedLength((prev) => {
        if (prev >= code.length) {
          if (timerRef.current !== null) window.clearInterval(timerRef.current);
          if (onMotionFinish) onMotionFinish();
          return code.length;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [isPlayingMotion, controlledTypedLength, code, motionSpeed, onMotionFinish]);

  // Effective typed length (manually controlled during video recording, or internal state during playback)
  const isCurrentlyInMotion = isPlayingMotion || (controlledTypedLength !== null && controlledTypedLength !== undefined);

  const activeLength =
    controlledTypedLength !== null && controlledTypedLength !== undefined
      ? controlledTypedLength
      : isPlayingMotion
      ? internalTypedLength
      : code.length;

  const displayCode = isCurrentlyInMotion ? code.slice(0, activeLength) : code;

  // Keep imperative config fresh for the cursor plugin
  displayCfgRef.current = {
    inMotion: isCurrentlyInMotion,
    activeLength,
    totalLength: code.length,
  };

  // Mount CodeMirror instance once
  useEffect(() => {
    if (!hostRef.current) return;

    const cursorPlugin = ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
          this.decorations = buildCursorDecoration(view);
        }
        update(update: ViewUpdate) {
          this.decorations = buildCursorDecoration(update.view);
        }
      },
      { decorations: (v) => v.decorations }
    );

    function buildCursorDecoration(view: EditorView): DecorationSet {
      const cfg = displayCfgRef.current;
      if (!cfg.inMotion || cfg.activeLength >= cfg.totalLength) {
        return Decoration.none;
      }
      const widget = Decoration.widget({ widget: new MotionCursorWidget(), side: 1 });
      return Decoration.set([widget.range(view.state.doc.length)]);
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: displayCode,
        extensions: [
          cmBaseTheme,
          themeCompartment.current.of(getCmThemeExtensions(theme)),
          langCompartment.current.of([]),
          editableCompartment.current.of([
            EditorState.readOnly.of(isCurrentlyInMotion),
            EditorView.editable.of(!isCurrentlyInMotion),
          ]),
          cursorPlugin,
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          search({ top: true }),
          EditorView.updateListener.of((update) => {
            if (
              update.docChanged &&
              !applyingProgrammaticRef.current &&
              !isBridgeSuppressing()
            ) {
              onChangeRef.current(update.state.doc.toString());
            }
            if (update.selectionSet && onCursorChangeRef.current) {
              const pos = update.state.selection.main.head;
              const lineInfo = update.state.doc.lineAt(pos);
              const line = lineInfo.number - 1;
              const ch = pos - lineInfo.from;
              onCursorChangeRef.current(line, ch);
            }
          }),
        ],
      }),
      parent: hostRef.current,
    });

    viewRef.current = view;
    registerEditorView(view, applyingProgrammaticRef);
    return () => {
      view.destroy();
      viewRef.current = null;
      registerEditorView(null, null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External value sync (settings load, snapshot load, template, motion slicing)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (isImperativeSyncing()) return;
    if (displayCode === view.state.doc.toString()) return;
    applyingProgrammaticRef.current = true;
    try {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: displayCode },
      });
    } finally {
      applyingProgrammaticRef.current = false;
    }
  }, [displayCode]);

  // Language extension lazy loading
  useEffect(() => {
    let alive = true;
    getLanguageExtension(language).then((ext) => {
      if (alive && viewRef.current) {
        viewRef.current.dispatch({
          effects: langCompartment.current.reconfigure(ext),
        });
      }
    });
    return () => {
      alive = false;
    };
  }, [language]);

  // Syntax theme switching
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.current.reconfigure(getCmThemeExtensions(theme)),
    });
  }, [theme]);

  // Editable/read-only toggling during motion playback & recording
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: editableCompartment.current.reconfigure([
        EditorState.readOnly.of(isCurrentlyInMotion),
        EditorView.editable.of(!isCurrentlyInMotion),
      ]),
    });
  }, [isCurrentlyInMotion]);

  // Compute line metadata for line numbers, diff highlighting, and annotations
  const linesInfo = useMemo(() => {
    const lines = displayCode.split('\n');
    const hasSpotlight = focusedLines.length > 0;

    return lines.map((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trimStart();
      const isAdded = diffMode && (trimmed.startsWith('+') || line.startsWith('+'));
      const isRemoved = diffMode && (trimmed.startsWith('-') || line.startsWith('-'));
      const isFocused = !hasSpotlight || focusedLines.includes(lineNum);
      const lineAnnotation = annotations.find((a) => a.line === lineNum);

      return {
        num: lineNum,
        isAdded,
        isRemoved,
        isFocused,
        annotation: lineAnnotation,
        lineText: line,
      };
    });
  }, [displayCode, diffMode, focusedLines, annotations]);

  const handleContainerClick = () => {
    if (viewRef.current && !isCurrentlyInMotion) {
      viewRef.current.focus();
    }
  };

  const hasSpotlight = focusedLines.length > 0;

  const fontVars = {
    '--cm-font-family': fontFamily,
    '--cm-font-size': `${fontSize}px`,
    '--cm-line-height': String(lineHeight),
  } as React.CSSProperties;

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full flex items-start text-left font-mono select-text cursor-text"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}`,
      }}
    >
      {/* Optional Line Numbers Column */}
      {showLineNumbers && (
        <div
          className="flex flex-col pr-3 text-right select-none border-r border-white/10 mr-3 sm:mr-4 font-mono flex-shrink-0 z-20"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
          }}
        >
          {linesInfo.map((info) => (
            <button
              key={info.num}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFocusedLine) onToggleFocusedLine(info.num);
              }}
              title={`Click to ${info.isFocused && hasSpotlight ? 'unfocus' : 'focus'} line ${info.num}`}
              className={`block w-full text-right px-1 transition-all cursor-pointer hover:text-white ${
                info.isAdded
                  ? 'text-emerald-400 font-bold'
                  : info.isRemoved
                  ? 'text-rose-400 font-bold'
                  : info.isFocused
                  ? 'text-zinc-300 font-medium opacity-80'
                  : 'text-zinc-600 opacity-40'
              }`}
            >
              {info.isAdded ? '+' : info.isRemoved ? '-' : info.num}
            </button>
          ))}
        </div>
      )}

      {/* CodeMirror Editing Surface with Overlay Layers */}
      <div className="relative flex-1 min-w-0">
        {/* Diff line background highlights overlay & Spotlight dimmed overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 font-mono"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
          }}
        >
          {linesInfo.map((info) => {
            let lineBg = 'transparent';
            if (diffMode && info.isAdded) lineBg = 'rgba(34, 197, 94, 0.15)';
            else if (diffMode && info.isRemoved) lineBg = 'rgba(239, 68, 68, 0.15)';
            else if (hasSpotlight && info.isFocused) lineBg = 'rgba(255, 255, 255, 0.08)';

            return (
              <div
                key={info.num}
                className={`w-full flex items-center justify-between transition-all duration-150 ${
                  hasSpotlight && info.isFocused ? 'border-l-2 border-zinc-100' : ''
                }`}
                style={{
                  height: `${fontSize * lineHeight}px`,
                  backgroundColor: lineBg,
                  opacity: info.isFocused ? 1 : 0.35,
                }}
              />
            );
          })}
        </div>

        {/* CodeMirror Host */}
        <div
          ref={hostRef}
          className="relative z-[1] w-full"
          style={fontVars}
        />

        {/* Floating Callout Annotations Overlay */}
        {annotations.length > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 font-mono"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
            }}
          >
            {linesInfo.map((info) => {
              const ann = info.annotation;
              const badgeColor =
                ann?.color === 'emerald'
                  ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200'
                  : ann?.color === 'amber'
                  ? 'border-amber-500/50 bg-amber-950/90 text-amber-200'
                  : ann?.color === 'sky'
                  ? 'border-zinc-700 bg-zinc-900/90 text-zinc-100'
                  : ann?.color === 'purple'
                  ? 'border-purple-500/50 bg-purple-950/90 text-purple-200'
                  : 'border-zinc-700 bg-zinc-900/90 text-zinc-100';

              return (
                <div
                  key={info.num}
                  className="w-full flex items-center justify-end pr-2 pointer-events-none"
                  style={{ height: `${fontSize * lineHeight}px` }}
                >
                  {ann && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-sans font-bold border shadow-xl backdrop-blur-md pointer-events-auto transform transition-all hover:scale-105 ${badgeColor}`}
                    >
                      <MessageSquare className="w-3 h-3 opacity-80" />
                      <span>{ann.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Real-time Multiplayer Peer Cursor Flags Overlay (Floating Above Code Line) */}
        {peerCursors && peerCursors.size > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 font-mono"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
            }}
          >
            {Array.from(peerCursors.values()).map((peer) => {
              const topOffset = peer.line * (fontSize * lineHeight) - 2;
              return (
                <div
                  key={peer.peerId}
                  className="absolute left-14 flex items-center gap-1 pointer-events-none transition-all duration-150 -translate-y-full"
                  style={{ top: `${topOffset}px` }}
                >
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-t-lg rounded-br-lg bg-emerald-500 text-black font-sans text-[10px] font-extrabold shadow-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    <span>{peer.username || 'Anonymous'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
