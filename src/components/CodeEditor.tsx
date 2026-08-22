import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SupportedLanguage, SupportedTheme, LineAnnotation } from '../types';
import { useShiki } from '../hooks/useShiki';
import { MessageSquare } from 'lucide-react';

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
  isPlayingMotion?: boolean;
  motionSpeed?: number;
  controlledTypedLength?: number | null;
  onMotionFinish?: () => void;
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
  isPlayingMotion = false,
  motionSpeed = 1,
  controlledTypedLength = null,
  onMotionFinish,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalTypedLength, setInternalTypedLength] = useState<number>(
    isPlayingMotion ? 0 : code.length
  );
  const timerRef = useRef<number | null>(null);

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

  const { highlightedHtml, isLoading } = useShiki(displayCode, language, theme);

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
    if (textareaRef.current && !isCurrentlyInMotion) {
      textareaRef.current.focus();
    }
  };

  const hasSpotlight = focusedLines.length > 0;

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

      {/* Dual Layer Textarea and Highlighting container */}
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

        {/* Editable Overlay Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          readOnly={isCurrentlyInMotion}
          className="code-textarea absolute inset-0 w-full h-full font-mono bg-transparent text-transparent caret-indigo-400 resize-none outline-none border-none p-0 m-0 overflow-hidden whitespace-pre z-20 pointer-events-auto cursor-text"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
          }}
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
                  ? 'border-sky-500/50 bg-sky-950/90 text-sky-200'
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

        {/* Shiki Highlighted Pre HTML with fail-safe fallback */}
        {isLoading || !highlightedHtml ? (
          <pre
            className="m-0 p-0 font-mono whitespace-pre opacity-90 text-zinc-100 relative z-1 pointer-events-none"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
            }}
          >
            {displayCode}
          </pre>
        ) : (
          <div className="relative inline-block w-full pointer-events-none">
            <div
              className="shiki-container code-highlighted w-full font-mono whitespace-pre m-0 p-0 relative z-1 pointer-events-none"
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}`,
              }}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
            {isCurrentlyInMotion && activeLength < code.length && (
              <span className="inline-block w-2 h-4 bg-sky-400 ml-0.5 animate-pulse rounded-xs opacity-90 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
