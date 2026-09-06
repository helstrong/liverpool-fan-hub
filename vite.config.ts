import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fetchNews } from './server/news.js'

// In development the Vite dev server proxies /api/sportsdb → TheSportsDB, adding
// the key from SPORTSDB_KEY (a plain env var, NOT VITE_-prefixed, so it is never
// exposed to the browser). Production does the same via server/index.js.
//
// /api/news isn't a simple pass-through (it fetches, parses and filters an RSS
// feed — see server/news.js), so it's wired up as dev middleware here, sharing
// the exact same logic the production Express server uses.
function newsDevMiddleware(key: string) {
  return {
    name: 'news-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/meta', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ freeTier: key === '123' }))
      })
      server.middlewares.use('/api/news', async (_req, res) => {
        try {
          const items = await fetchNews()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ items }))
        } catch {
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'news feed request failed' }))
        }
      })
    },
  }
}

// Installable-app layer. Purely additive: the site keeps working exactly as it
// does in a browser tab, and this only changes things for someone who installs
// it to their home screen. Deliberately NOT enabled in dev (devOptions defaults
// to off) so a stale service worker can never confuse local development.
function pwa() {
  return VitePWA({
    registerType: 'autoUpdate',
    // No includeAssets: the globPatterns below already sweep up everything in
    // public/, and listing them twice duplicates precache entries.
    manifest: {
      name: 'Liverpool FC Fan Hub',
      short_name: 'LFC Hub',
      description: 'Fixtures, tables, squad and news for Liverpool FC.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#2E050F',
      theme_color: '#2E050F',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        // Separate art with the crest pulled in from the edges, so Android's
        // circle/squircle masks crop padding rather than the shield itself.
        { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // Safe to precache because Vite content-hashes these filenames — a new
      // build produces new names rather than shadowing the old ones.
      globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      navigateFallback: '/index.html',
      // Without this the SPA fallback would answer API requests with the HTML
      // shell whenever the network hiccups.
      navigateFallbackDenylist: [/^\/api\//],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          // Live data is always fetched fresh when there's a connection; the
          // cached copy is only a fallback for being offline. The app's own
          // localStorage cache (see data/api.ts) still applies on top.
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api',
            networkTimeoutSeconds: 10,
            expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ url }) => url.hostname.endsWith('thesportsdb.com'),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'crests-and-photos',
            expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
          handler: 'CacheFirst',
          options: {
            cacheName: 'fonts',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' → load all vars, incl. non-VITE
  const key = env.SPORTSDB_KEY?.trim() || '123'
  const base = env.SPORTSDB_UPSTREAM?.trim() || 'https://www.thesportsdb.com'

  return {
    plugins: [react(), newsDevMiddleware(key), pwa()],
    server: {
      proxy: {
        '/api/sportsdb': {
          target: base,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/sportsdb/, `/api/v1/json/${key}`),
        },
      },
    },
  }
})
