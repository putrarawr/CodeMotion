# CodeMotion

> Client-Side Animated Code Snippet & Video Generator

CodeMotion by [Septiyan Bintang Ramadhan Putra](https://github.com/putrarawr) — Repository: [putrarawr/CodeMotion](https://github.com/putrarawr/CodeMotion).

CodeMotion is a lightweight, high-performance web tool that transforms source code into high-resolution graphics and 60FPS typing motion videos. Designed for tech content creators, educators, software engineers, and documentation writers.

---

## Live Demo

Try CodeMotion online directly in your browser:

[https://codemotion.biz.id/](https://codemotion.biz.id/)

Repository: [https://github.com/putrarawr/CodeMotion](https://github.com/putrarawr/CodeMotion)

---

## Core Features

- Real-Time Motion Recording: Export butter-smooth 60FPS MP4 videos or animated GIFs with typewriter and line-by-line typing motion.
- Pure ISO MP4 Container: Generates standard ISO container MP4 files with instant browser downloads across Linux, Windows, macOS, and mobile devices.
- CodeMirror 6 Syntax Engine: Native in-editor syntax highlighting powered by Lezer grammars with lazy-loaded language packages, bracket auto-close, auto-indent, and undo history.
- Search & Replace: Full find-and-replace panel inside the editor (`Cmd` / `Ctrl` + `F`).
- Multi-File Tabbed Snippets: Create window frames with multiple file tabs, tab switching, and inline title editing.
- Snapshot Library: Save, load, rename, and delete named snapshots of your full snippet setup locally (up to 50).
- Code Diff Mode: Highlight line additions (+ emerald) and deletions (- rose) to showcase pull requests and code refactoring.
- Drag & Drop + Paste Import: Drop code files anywhere to load them into the editor, drop or paste images to set your avatar / logo.
- Import from URL: Fetch code directly from GitHub file links, gists, or any raw text URL.
- High-DPI Retina Export: Export PNGs at 2x or 3x DPI (Retina), vector SVG graphics, or copy PNG images directly to the system clipboard.
- Modern Obsidian Aesthetic: Vercel-inspired monochrome dark and light UI design system with zero element overlapping.
- 100% Client-Side Privacy: Zero server processing. Everything renders locally within your browser.
- LZ State Compression: Share full code snippets, tab titles, languages, and theme settings via ultra-short URL hash links.

---

## Technology Stack

- Deployment: Custom Domain ([codemotion.biz.id](https://codemotion.biz.id/))
- Framework: React 19 + TypeScript
- Build Tool: Vite
- Routing: React Router v7
- Syntax Highlighter: CodeMirror 6 (Lezer Grammars, lazy-loaded per language)
- Video Encoder: mp4-muxer + HTML5 Canvas Rendering Engine
- Animations: Framer Motion
- Styling: Tailwind CSS v4 + Obsidian Design Tokens

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd` / `Ctrl` + `S` | Instant Retina 3x PNG Image Download |
| `Cmd` / `Ctrl` + `Shift` + `C` | Copy PNG Image directly to Clipboard |
| `Cmd` / `Ctrl` + `F` | Open Search & Replace panel in the editor |
| `Double-Click` Tab Title | Rename active file tab title inline |

---

## Note on Motion Video Export & Performance

> **Note & Apology / Catatan Performa:**
> CodeMotion processes 100% of video generation locally inside your web browser (client-side) to protect your privacy and ensure zero server tracking. Because video rendering relies on your device's local GPU, CPU, and browser engine (Chrome vs Firefox vs Safari), the frame rate and rendering speed of exported MP4/GIF videos may slightly vary across different laptops or low-spec devices compared to the real-time 60FPS live preview in the editor.
>
> We apologize if the exported video motion is not 100% as fluid on lower-spec hardware as the live website preview. For lower-spec devices or instant 60FPS captures, you can also use the **Instant Live Screen Record** mode in the editor export panel!

---

## Support & Donation

If CodeMotion helps your workflow, consider supporting the project to keep it free and ad-free:

- Saweria: [https://saweria.co/codemotion](https://saweria.co/codemotion)
- GitHub Repository: [https://github.com/putrarawr/CodeMotion](https://github.com/putrarawr/CodeMotion)

---

## License

This project is open source under the [MIT License](LICENSE).
