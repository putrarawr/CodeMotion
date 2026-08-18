import React, { useMemo } from 'react';
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
}) => {
  const { highlightedHtml, isLoading } = useShiki(code, language, theme);

  // Compute line metadata for line numbers & diff highlighting
  const linesInfo = useMemo(() => {
    const lines = code.split('\n');
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
  }, [code, diffMode]);

  return (
    <div
      className="relative w-full flex items-start text-left font-mono select-none"
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
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="code-textarea absolute inset-0 w-full h-full font-mono bg-transparent text-transparent caret-indigo-400 resize-none outline-none border-none p-0 m-0 overflow-hidden whitespace-pre z-10"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}`,
          }}
        />

        {/* Shiki Highlighted Pre HTML */}
        {isLoading ? (
          <pre
            className="m-0 p-0 font-mono whitespace-pre opacity-70 text-zinc-400 relative z-1"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
            }}
          >
            {code}
          </pre>
        ) : (
          <div
            className="shiki-container code-highlighted w-full font-mono whitespace-pre m-0 p-0 relative z-1"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}`,
            }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </div>
    </div>
  );
};
