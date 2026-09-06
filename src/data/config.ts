// Runtime configuration for the live data source (TheSportsDB).
//
// The API key is NEVER referenced here — it lives server-side and is injected by
// the proxy (Vite dev server in development, the Node server in production). The
// browser only ever talks to the same-origin path below, so the key is never
// bundled into the client. See server/index.js and vite.config.ts.
//
// Set VITE_USE_SAMPLE=true to force the bundled sample data instead.

const env = import.meta.env

// Same-origin proxy path. The server rewrites this to TheSportsDB's v1 API and
// adds the key. Override only if you host the proxy elsewhere.
export const SPORTSDB_BASE = env.VITE_SPORTSDB_BASE?.trim() || '/api/sportsdb'

export const LEAGUE_ID = Number(env.VITE_LEAGUE_ID ?? 4328) // English Premier League
export const TEAM_ID = Number(env.VITE_TEAM_ID ?? 133602) // Liverpool FC

// Premier League seasons run ~Aug → May, so before July we're still in the season
// that started the previous calendar year. Recomputed from the clock instead
// of a hardcoded year so the default never needs a manual yearly bump.
function currentSeason(): string {
  const now = new Date()
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return `${startYear}-${startYear + 1}`
}

export const SEASON = env.VITE_SEASON?.trim() || currentSeason() // format: YYYY-YYYY

export const USE_LIVE = env.VITE_USE_SAMPLE?.trim() !== 'true'

// Public flag (not the key) for whether the proxy uses the free "123" key, which
// caps the table (top 5), squad (~10) and fixtures. Set VITE_SPORTSDB_FREE_TIER=
// true when running on the free key so the UI can note the limits.
export const IS_FREE_KEY = env.VITE_SPORTSDB_FREE_TIER?.trim() === 'true'

// Highlight id must match the team id used by whichever source is active.
export const CLUB_ID = USE_LIVE ? String(TEAM_ID) : 'lfc'

// How long the browser holds the whole AppData bundle. This stacks on top of
// the server's own window, so 15 minutes here meant a finished match could take
// around 25 minutes to surface. Five keeps it current without real extra load,
// since most refetches are answered from the server's cache anyway.
export const CACHE_TTL_MS = 5 * 60 * 1000
