import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Two independent builds share this one config: the default consumer app
// and the dealer-only app (dealer.html / dealer-main.tsx), selected via
// BUILD_TARGET so each gets its own output dir, dev port, and — critically
// — its own env vars at build time (VITE_APP_ROLE etc.), which a single
// multi-page build sharing one env can't do.
// https://vite.dev/config/
export default defineConfig(() => {
  const isDealer = process.env.BUILD_TARGET === 'dealer'
  return {
    plugins: [
      react(),
      tailwindcss(),
      // rollupOptions.input only selects the entry for `vite build` — the
      // dev server's own SPA history fallback always serves index.html for
      // any client-side route with no matching file (/, /browse, /login,
      // ...), so without this every path except the literal /dealer.html
      // would silently render the consumer app instead.
      {
        name: 'dealer-dev-entry',
        configureServer(server) {
          if (!isDealer) return
          server.middlewares.use((req, _res, next) => {
            const pathname = req.url?.split('?')[0] ?? ''
            const isClientRoute =
              req.method === 'GET' &&
              !pathname.startsWith('/@') &&
              !pathname.startsWith('/src/') &&
              !pathname.startsWith('/node_modules/') &&
              !pathname.includes('.')
            if (isClientRoute) req.url = '/dealer.html'
            next()
          })
        },
      },
    ],
    build: {
      outDir: isDealer ? 'dist-dealer' : 'dist',
      rollupOptions: {
        input: isDealer ? 'dealer.html' : 'index.html',
      },
    },
    server: {
      port: isDealer ? 5176 : 5175,
      strictPort: true,
    },
  }
})
