import { EditorView } from '@codemirror/view';

/**
 * Bridge for imperative, synchronous document updates from the video recorder.
 * React state -> useEffect -> CM dispatch is asynchronous and can be delayed
 * under heavy load (html-to-image rasterization), causing snapshots to capture
 * stale content. The recorder uses this bridge to update the CM document
 * synchronously right before each frame capture.
 */

let activeView: EditorView | null = null;
let activeGuard: { current: boolean } | null = null;
let imperativelySyncing = false;
let bridgeSuppressing = false;

export function registerEditorView(view: EditorView | null, guard: { current: boolean } | null) {
  activeView = view;
  activeGuard = guard;
}

export function setImperativeSyncing(active: boolean) {
  imperativelySyncing = active;
}

export function isImperativeSyncing(): boolean {
  return imperativelySyncing;
}

export function isBridgeSuppressing(): boolean {
  return bridgeSuppressing;
}

function resolveView(scope?: HTMLElement): EditorView | null {
  if (activeView) return activeView;
  if (!scope) return null;

  // CodeMirror 6 attaches its EditorView instance to the .cm-editor root element
  const cmEditor =
    scope.querySelector<HTMLElement>('.cm-editor') ||
    (scope.classList.contains('cm-editor') ? scope : scope.closest<HTMLElement>('.cm-editor'));

  const found = cmEditor ? EditorView.findFromDOM(cmEditor) : null;
  if (found) {
    activeView = found;
    if (!activeGuard) activeGuard = { current: false };
  }
  return found;
}

export function syncEditorDocument(code: string, scope?: HTMLElement) {
  const view = resolveView(scope);
  if (!view) {
    console.warn('[CodeMotion] syncEditorDocument: no CodeMirror view found');
    return;
  }
  if (view.state.doc.toString() === code) return;
  bridgeSuppressing = true;
  try {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: code },
    });
  } finally {
    bridgeSuppressing = false;
  }
}
