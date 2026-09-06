/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPORTSDB_BASE?: string
  readonly VITE_SPORTSDB_FREE_TIER?: string
  readonly VITE_LEAGUE_ID?: string
  readonly VITE_SEASON?: string
  readonly VITE_TEAM_ID?: string
  readonly VITE_USE_SAMPLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
