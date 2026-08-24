import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import type { Plugin } from 'vite'

/**
 * Dev middleware: serve app.html at "/" (production "/" is mapped to app.html
 * via vercel.json rewrites, because bot traffic must receive seo.html first).
 */
function serveAppAtRoot(): Plugin {
  const rewrite = (req: { url?: string }) => {
    if (req.url === '/' || req.url?.startsWith('/?')) {
      req.url = '/app.html'
    }
  }
  return {
    name: 'dev-serve-app-at-root',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveAppAtRoot()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app.html'),
      },
    },
  },
})
