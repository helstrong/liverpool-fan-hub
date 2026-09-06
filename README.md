# Liverpool FC Fan Hub

A responsive web app for Liverpool supporters — results, fixtures, the league
table, squad, club profile and news in one place, in club colours (red
`#C8102E`, yellow `#F6EB61`, teal `#00B2A9`).

Built with **React + Vite + TypeScript + Tailwind CSS**, and installable as a
PWA.

> ℹ️ **Unofficial.** A fan project. Not affiliated with, endorsed by, or an
> official channel of Liverpool Football Club.

## Features

- **Home** — a live countdown to the next kick-off, the last result, the season
  standing (position, points, goal difference, form), a league table preview and
  the latest news.
- **Fixtures** — every match of a season across the Premier League, FA Cup, EFL
  Cup, European ties and friendlies, split into upcoming and results.
- **Tables** — a table per competition, with crests, a last-5 form guide, and
  knockout results where a competition has no single table. Any club's row
  expands to show that club's season split by home and away.
- **Head-to-head** — from an expanded row, a full record against Liverpool
  across every season the data source archives (the Premier League reaches back
  to its first season in 1992-93).
- **Squad** — a filterable roster; each player expands to their bio plus career
  history (former clubs with appearances and goals, and honours won).
- **Club** — profile, honours-era facts, competitions, official links, fan art
  and kits.
- **News** — a curated, trusted-source feed, sorted newest or oldest first.

## Getting started

```bash
npm install
cp .env.example .env   # then set SPORTSDB_KEY
npm run dev
```

The app runs live out of the box: TheSportsDB's free `123` key works without an
account, though it caps the table, squad and fixture lists. A paid key removes
those limits.

```bash
npm run build   # production bundle into dist/
npm start       # serve dist/ + the API proxy on :3000
```

## Configuration

The API key is **server-side only** — the browser only ever talks to a
same-origin `/api/sportsdb` path, and the proxy injects the key. It is never
bundled into the client.

| Variable | Default | Meaning |
| --- | --- | --- |
| `SPORTSDB_KEY` | `123` | **Server-side** TheSportsDB key. `123` = free tier. |
| `SPORTSDB_UPSTREAM` | `https://www.thesportsdb.com` | Upstream host (server-side). |
| `PORT` | `3000` | Port the production server listens on. |
| `VITE_SPORTSDB_FREE_TIER` | `false` | Set `true` on the free key so the UI shows tier-limit notes. |
| `VITE_USE_SAMPLE` | — | Set `true` to force the bundled sample data. |
| `VITE_LEAGUE_ID` | `4328` | English Premier League |
| `VITE_TEAM_ID` | `133602` | Liverpool FC |
| `VITE_SEASON` | auto-detected from today's date | Only set to pin a specific season (`YYYY-YYYY`). |

## Data notes

Worth knowing, because the app is honest about them in the UI rather than
hiding them:

- **The published table can lag.** TheSportsDB recomputes the league table on
  its own schedule and can sit days behind the results it already serves. When
  the fixtures show more matches played than the table accounts for, the app
  recomputes the table from results and says so. It reverts to the official
  table once that catches up — which matters, because a computed table can't
  see points deductions.
- **No per-player match statistics.** This provider publishes none for this
  league: `lookuplineup` and `lookupeventstats` return nothing, and events carry
  no goal or card detail. Player pages therefore show career history
  (appearances and goals per former club, honours) rather than season stats.
- **Kick-off times are UTC without a timezone marker.** The client marks them as
  UTC so they render in whatever timezone the viewer is actually in.

## Deployment

`Dockerfile` builds the SPA and serves it with the Express proxy
(`server/index.js`). Set `SPORTSDB_KEY` in the host's environment; leave
`VITE_SEASON` unset so the season follows the calendar.

The service worker and `index.html` are served `no-cache` deliberately — they
are the only route to shipping a fix if a bad service worker ever goes out.

## Crest

The club crest shown in the app, the favicon and the installed app icons is
Liverpool FC's badge as supplied by TheSportsDB, bundled at `public/crest.png`.
It is a registered trademark of Liverpool Football Club and is used here only to
identify the club in an unofficial supporters' project.

## Attribution

Football data from [TheSportsDB](https://www.thesportsdb.com/). News headlines
via Google News RSS, filtered to a small allowlist of trusted outlets. Club
marks, badges and imagery belong to their respective owners.
