# ⚡ CodeMotion

> **Zero-Friction Client-Side Code Snippet & Motion Generator**  
> Transform plain source code into aesthetic, high-resolution snippet images and butter-smooth typing motion videos for Twitter/X, LinkedIn, documentation, and presentations.

[![Live Demo](https://img.shields.io/badge/Live_Demo-codemotion.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://codemotion.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Demo

Try **CodeMotion** online directly in your browser without installation:

👉 **[https://codemotion.vercel.app/](https://codemotion.vercel.app/)**

---

## ✨ Features

- **⚡ Motion Code Typing Simulator**: Simulate real-time character-by-character typing animation with speed controls (`0.5x`, `1x`, `2x`).
- **🎥 WebM Motion Video Export**: Record smooth WebM motion animation videos in seconds with a background rendering engine.
- **🎨 Shiki Syntax Highlighting Engine**: Exact VS Code syntax rendering with TextMate grammars supporting 16+ languages and 10+ popular color palettes.
- **🗂️ Multi-File Tabbed Snippets**: Create window frames with multiple file tabs, tab switching, and inline double-click renaming.
- **🔀 Code Diff Mode**: Highlight line additions (`+` emerald) and deletions (`-` rose) to showcase PRs and refactoring.
- **📸 High-DPI Retina Export**: Export PNGs at 2x or 3x DPI (Retina), vector SVG graphics, or copy PNG blobs directly to system clipboard.
- **🎨 Modern Obsidian & Light/Dark Theme**: Vercel-inspired monochrome aesthetic system with full Light & Dark UI mode switcher.
- **🔒 100% Client-Side Privacy**: Zero server uploads. Everything processes locally in your browser.
- **📱 100% Mobile & Cross-Device Responsive**: Optimized layout for smartphones, tablets, and desktop displays.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` or `pnpm` / `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/codemotion.git

# Navigate into project directory
cd codemotion

# Install dependencies
npm install
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173/` in your browser to view the Landing Page, or `http://localhost:5173/editor` to open the Workspace Editor.

### Build for Production

```bash
npm run build
```

The output production bundle will be generated inside the `dist/` directory.

---

## 🛠️ Technology Stack

- **Deployment**: [Vercel](https://vercel.com/) ([codemotion.vercel.app](https://codemotion.vercel.app/))
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Syntax Highlighter**: [Shiki](https://shiki.style/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) + [React Icons (Simple Icons)](https://react-icons.github.io/react-icons/)
- **Image & Video Exporters**: `html-to-image` + HTML5 `MediaRecorder` API
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Cmd` / `Ctrl` + `S` | Instant Retina 3x PNG Image Download |
| `Cmd` / `Ctrl` + `Shift` + `C` | Copy PNG Blob directly to System Clipboard |
| `Double-Click` Tab Title | Rename active tab filename inline |

---

## 📁 Project Structure

```
codesnap/
├── public/                  # Static assets & icons
├── src/
│   ├── components/          # React Components
│   │   ├── Canvas.tsx       # Main preview canvas container
│   │   ├── CodeEditor.tsx   # Dual-layer Shiki syntax editor
│   │   ├── ControlPanel.tsx # Customization sidebar controls
│   │   ├── Header.tsx       # Top navigation & export toolbar
│   │   ├── LandingPage.tsx  # Multi-section animated landing page
│   │   ├── Logo.tsx         # Custom CodeMotion SVG logo
│   │   ├── PresetBar.tsx    # Aesthetic preset selector
│   │   ├── VideoLoadingOverlay.tsx # Video generation loading modal
│   │   └── WindowFrame.tsx  # Window frame & multi-tab header
│   ├── hooks/               # Custom React Hooks
│   │   ├── useExport.ts     # PNG, SVG & clipboard exporter
│   │   ├── useLocalStorage.ts # Persistent settings state
│   │   └── useShiki.ts      # Shiki syntax highlighter loader
│   ├── types/               # TypeScript interfaces & types
│   ├── utils/               # Color palettes, languages, recorder & defaults
│   ├── App.tsx              # Application router & workspace layout
│   ├── index.css            # Design tokens & marquee keyframes
│   └── main.tsx             # React DOM entry point
├── index.html               # Main HTML entry & SEO meta tags
└── vite.config.ts           # Vite configuration
```

---

