import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { SupportedLanguage, SupportedTheme } from '../types';
import { useShiki } from '../hooks/useShiki';

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

  // Compute line metadata for line numbers & diff highlighting
  const linesInfo = useMemo(() => {
    const lines = displayCode.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trimStart();
      const isAdded = diffMode && (trimmed.startsWith('+') || line.startsWith('+'));
      const isRemoved = diffMode && (trimmed.startsWith('-') || line.startsWith('-'));
      return {
        num: idx + 1,
        isAdded,
        isRemoved,
        lineText: line,
      };
    });
  }, [displayCode, diffMode]);

  const handleContainerClick = () => {
    if (textareaRef.current && !isCurrentlyInMotion) {
      textareaRef.current.focus();
    }
  };

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
          className="flex flex-col pr-4 text-right select-none opacity-40 border-r border-white/10 mr-4 font-mono flex-shrink-0"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
          }}
        >
          {linesInfo.map((info) => (
            <span
              key={info.num}
              className={`block ${
                info.isAdded
                  ? 'text-emerald-400 font-bold'
                  : info.isRemoved
                  ? 'text-rose-400 font-bold'
                  : 'text-zinc-400'
              }`}
            >
              {info.isAdded ? '+' : info.isRemoved ? '-' : info.num}
            </span>
          ))}
        </div>
      )}

      {/* Dual Layer Textarea and Highlighting container */}
      <div className="relative flex-1 min-w-0">
        {/* Diff line background highlights overlay */}
        {diffMode && (
          <div
            className="absolute inset-0 pointer-events-none z-0 font-mono"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
            }}
          >
            {linesInfo.map((info) => (
              <div
                key={info.num}
                className="w-full"
                style={{
                  height: `${fontSize * lineHeight}px`,
                  backgroundColor: info.isAdded
                    ? 'rgba(34, 197, 94, 0.15)'
                    : info.isRemoved
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'transparent',
                }}
              />
            ))}
          </div>
        )}

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

        {/* Shiki Highlighted Pre HTML */}
        {isLoading ? (
          <pre
            className="m-0 p-0 font-mono whitespace-pre opacity-70 text-zinc-400 relative z-1 pointer-events-none"
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
