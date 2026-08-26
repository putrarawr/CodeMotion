import { useState, useRef, useCallback, useEffect } from 'react';
import type { SnippetSettings } from '../types';

const MAX_HISTORY_LENGTH = 30;

export function useSettingsHistory(
  settings: SnippetSettings,
  setSettings: React.Dispatch<React.SetStateAction<SnippetSettings>>
) {
  const historyRef = useRef<SnippetSettings[]>([settings]);
  const currentIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const isInternalUpdateRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateUndoRedoStatus = useCallback(() => {
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
  }, []);

  // Record a state change with debouncing for smooth slider/typing interaction
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      updateUndoRedoStatus();
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const history = historyRef.current;
      const currentIndex = currentIndexRef.current;

      // Clean non-persistent fields for state equality comparison
      const cleanPrev = { ...history[currentIndex], isPlayingMotion: false, controlledTypedLength: null };
      const cleanCurrent = { ...settings, isPlayingMotion: false, controlledTypedLength: null };

      if (JSON.stringify(cleanPrev) === JSON.stringify(cleanCurrent)) {
        return;
      }

      // Truncate future redo states if user makes a new change
      const updatedHistory = history.slice(0, currentIndex + 1);
      updatedHistory.push(settings);

      if (updatedHistory.length > MAX_HISTORY_LENGTH) {
        updatedHistory.shift();
      }

      historyRef.current = updatedHistory;
      currentIndexRef.current = updatedHistory.length - 1;
      updateUndoRedoStatus();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [settings, updateUndoRedoStatus]);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current -= 1;
      const previousState = historyRef.current[currentIndexRef.current];
      isInternalUpdateRef.current = true;
      setSettings((prev) => ({
        ...previousState,
        appTheme: prev.appTheme, // Keep current UI theme
        isPlayingMotion: false,
        controlledTypedLength: null,
      }));
      updateUndoRedoStatus();
    }
  }, [setSettings, updateUndoRedoStatus]);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current += 1;
      const nextState = historyRef.current[currentIndexRef.current];
      isInternalUpdateRef.current = true;
      setSettings((prev) => ({
        ...nextState,
        appTheme: prev.appTheme, // Keep current UI theme
        isPlayingMotion: false,
        controlledTypedLength: null,
      }));
      updateUndoRedoStatus();
    }
  }, [setSettings, updateUndoRedoStatus]);

  // Global Keyboard Shortcuts (Cmd/Ctrl + Z and Cmd/Ctrl + Shift + Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (!isCmdOrCtrl) return;

      // Ignore if user is currently inside an input, textarea, or CodeMirror editor
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true' ||
          activeEl.classList.contains('cm-content'))
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
