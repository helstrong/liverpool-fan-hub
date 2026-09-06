import type { NewsItem } from './types'

// Thin client for the app's own /api/news endpoint (server/news.js), which
// fetches, parses and filters Liverpool football news from Google News RSS
// server-side — see that file for why (CORS, and a curated trusted-source
// allowlist that can't be applied from the browser).
export async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch('/api/news')
  if (!res.ok) throw new Error(`news: HTTP ${res.status}`)
  const { items } = (await res.json()) as { items: NewsItem[] }
  return items
}
