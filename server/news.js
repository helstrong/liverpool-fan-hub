// Fetches, parses and filters Liverpool football news from Google News RSS.
//
// Google News RSS is a free, undocumented interface — not a published API with
// a support contract. It's fetched here server-side (no CORS concern) and
// cached, which is the standard low-risk pattern for small non-commercial news
// aggregation. It could change or be blocked by Google without notice.
//
// Shared by both the Vite dev middleware and the production Express server so
// the fetch/parse/filter/cache logic exists in exactly one place.

import { XMLParser } from 'fast-xml-parser'

// "Liverpool FC" rather than bare "Liverpool" keeps the city, the other clubs
// and unrelated news out of the feed.
const QUERY = 'Liverpool FC football'
const FEED_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=en-US&gl=US&ceid=US:en`

// Curated allowlist of outlets we trust to surface as "club news" — an
// editorial judgment call, not an automated trust score. Matched
// case-insensitively against the RSS <source> tag. Add/remove freely.
const TRUSTED_SOURCES = new Set(
  [
    // Wire services & major international broadcasters/papers
    'Reuters',
    'BBC',
    'BBC Sport',
    'ESPN',
    'The Guardian',
    'The Independent',
    'The Telegraph',
    'Sky Sports',
    // Local & club-focused outlets
    'Liverpool Echo',
    'This Is Anfield',
    'The Athletic',
    // Football-specific outlets
    'Goal.com',
    'UEFA.com',
    'Premier League',
    '90min',
    // Broadcasters with football rights
    'TNT Sports',
    'beIN SPORTS',
    // Official sources
    'Liverpoolfc.com',
    // Wire-syndicating aggregators
    'Yahoo Sports',
    'Yahoo Sports UK',
  ].map((s) => s.toLowerCase()),
)

const CACHE_TTL_MS = 15 * 60 * 1000
const parser = new XMLParser()

let cache = null // { at: number, items: NewsItem[] }

export async function fetchNews() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.items

  const res = await fetch(FEED_URL)
  if (!res.ok) throw new Error(`news feed: HTTP ${res.status}`)

  const xml = await res.text()
  const doc = parser.parse(xml)
  const rawItems = doc?.rss?.channel?.item ?? []
  const list = Array.isArray(rawItems) ? rawItems : [rawItems]

  const items = list
    .filter((it) => TRUSTED_SOURCES.has(String(it.source ?? '').toLowerCase().trim()))
    .map((it) => {
      const source = String(it.source ?? '').trim()
      let title = String(it.title ?? '').trim()
      // Google News titles end with " - {source}" — drop it since source is
      // already shown separately in the UI.
      const suffix = ` - ${source}`
      if (source && title.endsWith(suffix)) title = title.slice(0, -suffix.length).trim()
      return {
        title,
        link: String(it.link ?? '').trim(),
        source,
        publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : null,
      }
    })
    .filter((it) => it.title && it.link)
    // Google News RSS orders by relevance, not strictly by time — sort newest
    // first so every consumer (Home preview, News page) gets a consistent,
    // actually-chronological default. Undated items sort last.
    .sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return +new Date(b.publishedAt) - +new Date(a.publishedAt)
    })

  cache = { at: Date.now(), items }
  return items
}
