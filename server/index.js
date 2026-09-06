// Production server: serves the built SPA (dist/) and proxies /api/sportsdb to
// TheSportsDB, injecting the API key from a server-side env var. The key is
// never sent to the browser — clients only ever call this same-origin path.
// Also serves /api/news (see ./news.js) — filtered, cached club news.
//
// Env:
//   SPORTSDB_KEY       TheSportsDB API key (server-side secret; defaults to "123")
//   SPORTSDB_UPSTREAM  Upstream base (default https://www.thesportsdb.com)
//   PORT               Port to listen on (default 3000)

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchNews } from './news.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')

const KEY = (process.env.SPORTSDB_KEY || '123').trim()
const UPSTREAM = (process.env.SPORTSDB_UPSTREAM || 'https://www.thesportsdb.com').trim()
const PORT = Number(process.env.PORT || 3000)

// Only these v1 endpoints may be proxied — prevents the route being used as an
// open proxy to arbitrary paths.
const ALLOWED = new Set([
  'lookuptable.php',
  'eventslast.php',
  'eventsnext.php',
  'eventsseason.php',
  'lookup_all_players.php',
  'lookupteam.php',
  'lookupequipment.php',
  // Player career history, loaded on demand when a squad row is expanded.
  'lookuphonours.php',
  'lookupformerteams.php',
])

// Small in-memory cache: cuts upstream calls and blunts quota abuse.
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map()

const app = express()
app.disable('x-powered-by')

// Keep the whole site out of search indexes (unofficial fan project). This
// header is authoritative and covers the SPA, assets, and API responses.
app.use((_req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow')
  next()
})

app.get('/api/sportsdb/:endpoint', async (req, res) => {
  const { endpoint } = req.params
  if (!ALLOWED.has(endpoint)) return res.status(404).json({ error: 'unknown endpoint' })

  const qs = new URLSearchParams(req.query).toString()
  const cacheKey = `${endpoint}?${qs}`

  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return res.json(hit.body)

  const url = `${UPSTREAM}/api/v1/json/${KEY}/${endpoint}${qs ? `?${qs}` : ''}`
  try {
    const upstream = await fetch(url)
    if (!upstream.ok) return res.status(upstream.status).json({ error: `upstream ${upstream.status}` })
    const body = await upstream.json()
    cache.set(cacheKey, { at: Date.now(), body })
    res.set('Cache-Control', 'public, max-age=600')
    res.json(body)
  } catch {
    res.status(502).json({ error: 'upstream request failed' })
  }
})

app.get('/api/news', async (_req, res) => {
  try {
    const items = await fetchNews()
    res.set('Cache-Control', 'public, max-age=600')
    res.json({ items })
  } catch {
    res.status(502).json({ error: 'news feed request failed' })
  }
})

// The bundled assets are content-hashed, so caching them for an hour is safe.
// These four are not: they keep stable names across deploys, so a long max-age
// would pin whatever shipped last. That matters most for the service worker —
// it is the only channel for replacing itself, so if a bad one ever goes out,
// a cached copy would keep serving the broken app until it expired.
const NEVER_CACHE = new Set(['/sw.js', '/registerSW.js', '/manifest.webmanifest', '/index.html'])
app.use((req, res, next) => {
  if (NEVER_CACHE.has(req.path)) res.set('Cache-Control', 'no-cache')
  next()
})

// Static assets, then SPA fallback for client-side routes.
app.use(express.static(dist, { index: false, maxAge: '1h' }))
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`liverpool-fan-hub listening on :${PORT} (key ${KEY === '123' ? 'FREE 123' : 'set'})`)
})
