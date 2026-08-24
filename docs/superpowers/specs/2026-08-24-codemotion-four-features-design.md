# CodeMotion — Four Feature Additions (Design)

Date: 2026-08-24
Status: Approved

## Overview

Four features plus a copy-consistency pass for CodeMotion, a client-side code
screenshot & motion video generator:

1. **Snippet Library** — save, load, rename, and delete named snapshots of the
   full editor state in localStorage, exposed as a 6th sidebar tab.
2. **CodeMirror 6 Native Editor** — replace the transparent-textarea-over-Shiki
   dual layer with a native CodeMirror 6 editor using Lezer grammars and custom
   monochrome-mapped themes. Removes the `shiki` dependency entirely.
3. **Drag & Drop + Paste Import** — drop or paste files/code anywhere in the
   workspace to import into the active tab (or set avatar for images).
4. **Import from URL** — fetch code from GitHub blob URLs, gists, and raw URLs
   via a small popover next to Upload File.
5. **English copy pass** — all user-facing strings unified to English.

Global constraints from the user:

- All new UI must match the existing monochrome zinc design system and card
  composition (`rounded-2xl border bg-zinc-900/60 border-zinc-800` dark,
  `bg-white border-zinc-200 shadow-xs` light).
- Every user-facing string in English.

---

## 1. Snippet Library

### Data model

```ts
// src/types/index.ts
export interface LibrarySnapshot {
  id: string;            // `snap-${Date.now()}`
  name: string;
  createdAt: number;     // epoch ms
  updatedAt: number;     // epoch ms
  settings: SnippetSettings;
}
```

Storage: `useLocalStorage<LibrarySnapshot[]>('codemotion_library', [])`.

On save, `watermarkAvatar` is stripped from the stored settings (base64 images
can be hundreds of KB and would blow the ~5MB quota). The text handle
(`watermarkText`) is kept.

### UX

Sidebar tab bar grows from 5 to 6 columns. New tab: icon `Library`, label
"Library", title "Saved Snapshots Library".

Tab contents (top to bottom):

1. **Save Snapshot card** — name input (defaults to active tab title) +
   full-width Save button styled like other primary buttons
   (`bg-white text-black hover:bg-zinc-200` dark / inverse light).
   - Saving with an existing name creates a new snapshot (no dedupe).
2. **Snapshot list** — each row: name (bold), meta line
   `{primary language} • {theme name} • {relative date}`, action buttons:
   - **Load**: click anywhere on the row body.
   - **Rename**: pencil icon button → inline input (same interaction pattern as
     double-click tab-title rename).
   - **Delete**: trash icon button, no confirmation (consistent with annotation
     delete), toast "Snapshot deleted".

Behaviors:

- **Load** replaces the entire settings object except `appTheme`, which stays
  as the user's current value. Toast: `Loaded snapshot "{name}"`.
- Cap at **50 snapshots**. When saving past the cap, evict the oldest snapshot
  and show toast: `Library full — oldest snapshot removed (max 50)`.
- Empty state: muted helper text "No saved snapshots yet. Save your first one
  above."
- Saving shows toast: `Snapshot "{name}" saved`.

---

## 2. CodeMirror 6 Native Editor

### Dependencies

Added: `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`,
`@codemirror/language`, `@codemirror/search`, `@codemirror/autocomplete`,
plus official `@codemirror/lang-*` packages.

Removed: `shiki`, `src/hooks/useShiki.ts` (only consumer was CodeEditor),
and the old dual-layer rendering inside `CodeEditor.tsx`.

### Architecture

- **`src/components/CodeEditor.tsx`** — rewritten around a single
  `EditorView`. Container keeps identical inline styles (fontFamily, fontSize,
  lineHeight) so Canvas metrics are unchanged. Props stay the same.
- **`src/utils/cmLanguages.ts`** — `getLanguageExtension(lang):
  Promise<LanguageSupport | []>` map, all dynamic imports:
  - Official packages: typescript/javascript (`@codemirror/lang-javascript`),
    python, rust, go, cpp, java, markdown, css, html, json, sql, php, yaml, vue.
  - Legacy StreamLanguage modes (`@codemirror/legacy-modes`): csharp, kotlin,
    swift, ruby, bash/shell, r, scala, dockerfile, c (clike).
  - HTML grammar fallback: astro, svelte (highlighted as HTML).
  - Plain text fallback (no highlighting): graphql, elixir, dart.
  - Extensions are cached after first load.
- **`src/utils/cmThemes.ts`** — for each of the 10 `SupportedTheme`s, a CM
  theme extension with hardcoded background + ~12 token colors (keyword,
  string, number, comment, function, variable, type, operator, punctuation,
  tag, attribute, constant), hand-mapped from the Shiki palettes. Also exports
  a `themeBackgrounds: Record<SupportedTheme, string>` used by WindowFrame if
  needed. Caret/selection use monochrome styling that works on both light and
  dark syntax themes.

### Editing features

- Bracket auto-close & matching (`closeBrackets`, bracketMatching)
- Language-aware auto-indentation (`indentOnInput`, indentUnit)
- Search & replace panel bound to `Mod-f` via `@codemirror/search`
- Undo/redo history (`Mod-z` / `Mod-shift-z`)
- Editor remains editable except while motion is playing/recording
  (`EditorState.readOnly` + `EditorView.editable` compartment).

### Integration with existing features

- **Diff mode**: `StateField` producing line decorations — emerald background
  for lines whose trimmed content starts with `+`, rose for `-`; gutter markers
  show `+` / `-` in place of line numbers for those lines.
- **Line Spotlight**: line decoration dimming non-focused lines (opacity) with
  white left border on focused lines; clickable custom gutter
  (`domEventHandlers`) preserves the click-line-number-to-toggle behavior.
- **Annotations**: widget decorations placing the existing badge markup at the
  end of annotated lines (same color classes as today).
- **Motion mode**: the existing typedLength state machine is preserved.
  `displayCode = code.slice(0, activeLength)` becomes the CM document via a
  dispatch on change. A block-cursor widget decoration renders at the doc end
  during motion (replaces the current pulsing span).
- **Export**: CM's DOM is plain DOM; `html-to-image` capture of
  `#export-container` works unchanged.

Known accepted trade-offs (user-approved):

- Token colors approximate Shiki (hand-mapped), may differ subtly.
- astro/svelte/graphql/elixir/dart get simpler highlighting than Shiki provided.

---

## 3. Drag & Drop + Paste Import

New hook `src/hooks/useCodeImport.ts` attached in `EditorWorkspace`.

- **Drag & drop**: window-level `dragover`/`dragleave`/`drop`. While dragging,
  render a full-workspace overlay: dashed zinc border, blurred backdrop, label
  "Drop file to import". On drop:
  - `image/*` file → sets `watermarkAvatar` (toast: `Avatar updated`).
  - Text/code file ≤ 200KB → loads into the active tab (code + title + auto
    detected language), reusing the same path and validation as Upload File
    (toast: `File "{name}" imported (Detected: {lang})`).
  - Oversized file → error toast `File is too large. Maximum is 200 KB.`

- **Paste**: window-level `paste` listener active only when the event target is
  not an editable element (input, textarea, contentEditable, or inside the CM
  editor). Plain-text paste → active tab (auto-detect language, toast);
  image paste → avatar. Pasting while typing in the editor behaves normally.

---

## 4. Import from URL

UI: a "From URL" button next to Upload File in the Style section. Opens a small
popover card: URL text input + Import button.

URL resolution order (`src/utils/urlImport.ts`):

1. `github.com/{u}/{r}/blob/{branch}/{path...}` → rewrite to
   `raw.githubusercontent.com/{u}/{r}/{branch}/{path...}`.
2. `gist.github.com/{u}/{id}` → `GET https://api.github.com/gists/{id}`,
   take the first file's `raw_url`, then fetch it.
3. Anything else → fetched directly (works for raw.githubusercontent.com and
   any CORS-enabled text URL).

Rules:

- Response must be `text/*` or JSON, ≤ 200KB (error: `File is too large...`).
- Title = last path segment; language auto-detected by extension/content.
- Errors surface as English toasts: `Could not fetch from URL (network or CORS
  error).`, `URL not found (404).`, `No files found in gist.`

---

## 5. English Copy Pass

Sweep all user-facing strings to English across `ControlPanel.tsx`,
`Header.tsx`, `App.tsx`, `recorder.ts`, `UserJourneyTour.tsx`,
`LandingPage.tsx`, `ThankYouModal.tsx`, `WhatsNewModal.tsx`: toasts, titles,
placeholders, aria-labels. Examples: "Baris tidak valid!..." → "Invalid line
number...", "Share link disalin ke clipboard!" → "Share link copied to
clipboard!", "Cari bahasa..." → "Search languages...".

README updates: syntax engine credit changes to CodeMirror 6 Lezer grammars;
add new features (Library, DnD/paste import, URL import, search/replace) and
the `Cmd/Ctrl+F` shortcut to the shortcuts table.

---

## Error handling summary

| Case | Behavior |
| --- | --- |
| localStorage quota exceeded | try/catch around write; error toast, library unchanged |
| Snapshot list corrupt JSON | `useLocalStorage` already falls back to default `[]` |
| Drop/paste oversized file | error toast, no state change |
| URL fetch fails / 404 / non-text | descriptive error toast, no state change |
| Unknown language after import | keep previous tab language, info toast |

## Testing & verification

- `npm run build` (tsc -b + vite build) passes
- `npm run lint` (oxlint) passes
- Manual smoke test on dev server:
  - Save/load/rename/delete snapshot; verify avatar stripped and appTheme kept
  - Editing features: bracket close, Cmd+F search, undo
  - Diff/spotlight/annotations/motion still render and export correctly
  - PNG/SVG export + MP4/GIF recording unaffected
  - DnD image → avatar; DnD .py file → tab; paste text outside editor
  - GitHub blob URL and raw URL import
