import type { ClubProfile, Fixture, Kit, NewsItem, Player, Standing, Team } from './types'

// ---------------------------------------------------------------------------
// SAMPLE DATA — fallback only, shown when VITE_USE_SAMPLE=true or when the live
// TheSportsDB fetch fails entirely. Not guaranteed accurate. The UI consumes
// only the shapes in ./types.ts, so the live client (./theSportsDb.ts) can
// swap in seamlessly.
// ---------------------------------------------------------------------------

export const CLUB_ID = 'lfc'

const teams: Record<string, Team> = {
  lfc: { id: 'lfc', name: 'Liverpool', short: 'LIV' },
  ars: { id: 'ars', name: 'Arsenal', short: 'ARS' },
  mci: { id: 'mci', name: 'Manchester City', short: 'MCI' },
  tot: { id: 'tot', name: 'Tottenham', short: 'TOT' },
  eve: { id: 'eve', name: 'Everton', short: 'EVE' },
  new: { id: 'new', name: 'Newcastle United', short: 'NEW' },
  bha: { id: 'bha', name: 'Brighton', short: 'BHA' },
  nfo: { id: 'nfo', name: 'Nottingham Forest', short: 'NFO' },
}

export const club: ClubProfile = {
  name: 'Liverpool',
  altName: 'Liverpool Football Club',
  nicknames: 'The Reds',
  formedYear: '1892',
  stadium: 'Anfield',
  capacity: '61276',
  location: 'Liverpool',
  country: 'England',
  description:
    'Liverpool Football Club is a professional football club based in Liverpool, England, competing in the Premier League. Founded in 1892 and playing at Anfield ever since, the club is among the most decorated in English football and is known worldwide for its supporters and the anthem "You’ll Never Walk Alone".',
  competitions: ['Premier League', 'FA Cup', 'EFL Cup', 'UEFA Champions League'],
  website: 'www.liverpoolfc.com',
  facebook: 'www.facebook.com/LiverpoolFC',
  twitter: 'www.twitter.com/LFC',
  instagram: 'instagram.com/liverpoolfc',
  youtube: 'www.youtube.com/liverpoolfc',
  fanart: [],
}

export const standings: Standing[] = [
  { rank: 1, team: teams.lfc, played: 4, won: 3, drawn: 1, lost: 0, gf: 9, ga: 3, points: 10, form: 'WWDW' },
  { rank: 2, team: teams.ars, played: 4, won: 3, drawn: 0, lost: 1, gf: 8, ga: 3, points: 9, form: 'WDWW' },
  { rank: 3, team: teams.mci, played: 4, won: 3, drawn: 0, lost: 1, gf: 9, ga: 4, points: 9, form: 'WWLW' },
  { rank: 4, team: teams.tot, played: 4, won: 2, drawn: 2, lost: 0, gf: 7, ga: 4, points: 8, form: 'DWWD' },
  { rank: 5, team: teams.new, played: 4, won: 2, drawn: 1, lost: 1, gf: 6, ga: 4, points: 7, form: 'WLWD' },
]

export const fixtures: Fixture[] = [
  {
    id: 'f1', competition: 'Premier League', date: '2026-09-12T14:00:00Z',
    home: teams.new, away: teams.lfc, homeScore: 0, awayScore: 2,
    status: 'finished', venue: 'St James’ Park', round: '4',
  },
  {
    id: 'f2', competition: 'Premier League', date: '2026-08-30T11:30:00Z',
    home: teams.lfc, away: teams.bha, homeScore: 1, awayScore: 1,
    status: 'finished', venue: 'Anfield', round: '3',
  },
  {
    id: 'f3', competition: 'Premier League', date: '2026-08-23T16:30:00Z',
    home: teams.lfc, away: teams.nfo, homeScore: 3, awayScore: 1,
    status: 'finished', venue: 'Anfield', round: '2',
  },
  {
    id: 'f4', competition: 'Premier League', date: '2026-09-19T16:30:00Z',
    home: teams.lfc, away: teams.eve, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Anfield', round: '5',
  },
  {
    id: 'f5', competition: 'Premier League', date: '2026-09-27T15:30:00Z',
    home: teams.tot, away: teams.lfc, homeScore: null, awayScore: null,
    status: 'upcoming', venue: 'Tottenham Hotspur Stadium', round: '6',
  },
]

export const players: Player[] = [
  { id: 'p1', name: 'Alisson Becker', number: 1, position: 'Goalkeeper', nationality: 'Brazil', age: 33, foot: 'Right', height: '191 cm', birthplace: 'Novo Hamburgo, Brazil' },
  { id: 'p2', name: 'Virgil van Dijk', number: 4, position: 'Defender', nationality: 'The Netherlands', age: 35, foot: 'Right', height: '193 cm', birthplace: 'Breda, Netherlands' },
  { id: 'p3', name: 'Ibrahima Konaté', number: 5, position: 'Defender', nationality: 'France', age: 27, foot: 'Right', height: '194 cm', birthplace: 'Paris, France' },
  { id: 'p4', name: 'Andrew Robertson', number: 26, position: 'Defender', nationality: 'Scotland', age: 32, foot: 'Left', height: '178 cm', birthplace: 'Glasgow, Scotland' },
  { id: 'p5', name: 'Alexis Mac Allister', number: 10, position: 'Midfielder', nationality: 'Argentina', age: 27, foot: 'Right', height: '176 cm', birthplace: 'Santa Rosa, Argentina' },
  { id: 'p6', name: 'Ryan Gravenberch', number: 38, position: 'Midfielder', nationality: 'The Netherlands', age: 24, foot: 'Right', height: '190 cm', birthplace: 'Amsterdam, Netherlands' },
  { id: 'p7', name: 'Dominik Szoboszlai', number: 8, position: 'Midfielder', nationality: 'Hungary', age: 26, foot: 'Right', height: '186 cm', birthplace: 'Székesfehérvár, Hungary' },
  { id: 'p8', name: 'Mohamed Salah', number: 11, position: 'Forward', nationality: 'Egypt', age: 34, foot: 'Left', height: '175 cm', birthplace: 'Nagrig, Egypt' },
  { id: 'p9', name: 'Cody Gakpo', number: 18, position: 'Forward', nationality: 'The Netherlands', age: 27, foot: 'Right', height: '193 cm', birthplace: 'Eindhoven, Netherlands' },
  { id: 'p10', name: 'Luis Díaz', number: 7, position: 'Forward', nationality: 'Colombia', age: 29, foot: 'Right', height: '178 cm', birthplace: 'Barrancas, Colombia' },
]

export const kits: Kit[] = []

export const news: NewsItem[] = [
  {
    title: 'Liverpool edge Merseyside derby with second-half surge',
    link: 'https://example.com/sample-news-1',
    source: 'Fan Hub Demo',
    publishedAt: '2026-09-12T21:00:00.000Z',
  },
  {
    title: 'Reds linked with young Premier League winger ahead of the window',
    link: 'https://example.com/sample-news-2',
    source: 'Fan Hub Demo',
    publishedAt: '2026-09-09T12:00:00.000Z',
  },
  {
    title: 'Key midfielder returns to full training ahead of a busy month',
    link: 'https://example.com/sample-news-3',
    source: 'Fan Hub Demo',
    publishedAt: '2026-09-07T09:00:00.000Z',
  },
]
