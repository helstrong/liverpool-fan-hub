// UI copy. Hand-rolled rather than pulling in an i18n library: the app has one
// namespace and no pluralisation rules beyond simple counts, so a typed record
// and a substitution helper cover it without adding a dependency to the bundle.
//
// English only for now, but the structure is unchanged from a two-language
// build, so a second language is a new table plus a LANGUAGES entry.
//
// Competition and club names are deliberately absent — those arrive from the
// data source as proper nouns and aren't translated.

const en = {
  'nav.home': 'Home',
  'nav.fixtures': 'Fixtures',
  'nav.table': 'Table',
  'nav.squad': 'Squad',
  'nav.club': 'Club',
  'nav.news': 'News',

  'chrome.live': 'Live',
  'chrome.sample': 'Sample',
  'chrome.refresh': 'Refresh data',
  'chrome.language': 'Change language',
  'a11y.crest': '{name} crest',
  'a11y.kit': '{season} {type} kit',
  'chrome.season': 'Season',
  'chrome.competition': 'Competition',

  'footer.fanProject':
    'An unofficial fan project, made by supporters. Not affiliated with, endorsed by, or an official channel of Liverpool Football Club.',

  'common.loading': 'Loading…',
  'common.viewAll': 'View all →',
  'common.back': 'Back',
  'common.played': 'played',
  'common.scored': 'scored',
  'common.conceded': 'conceded',

  'round.matchday': 'Matchday {n}',
  'round.round': 'Round {n}',
  'round.qualifying': 'Qualifying',
  'round.playoff': 'Knockout Play-off',
  'round.r16': 'Round of 16',
  'round.quarter': 'Quarter-final',
  'round.semi': 'Semi-final',
  'round.final': 'Final',
  'round.knockout': 'Knockout stage',

  'common.englishOnly': 'Description available in English only.',

  'result.W': 'Win',
  'result.D': 'Draw',
  'result.L': 'Loss',
  'resultShort.W': 'W',
  'resultShort.D': 'D',
  'resultShort.L': 'L',

  'home.nextMatch': 'Next match',
  'home.kickingOff': 'Kicking off',
  'home.noUpcoming':
    'No upcoming fixtures right now — the schedule for the next round hasn’t been published yet.',
  'home.sideHome': 'Home',
  'home.sideAway': 'Away',
  'home.days': 'Days',
  'home.hrs': 'Hrs',
  'home.min': 'Min',
  'home.sec': 'Sec',
  'home.lastResult': 'Last result',
  'home.seasonStanding': 'Season standing',
  'home.position': 'Position',
  'home.points': 'Points',
  'home.goalDiff': 'Goal diff',
  'home.last5': 'Last 5',
  'home.fullTable': 'Full table →',
  'home.latestNews': 'Latest news',
  'home.allNews': 'All news →',
  'home.table': 'Table',
  'home.tableError': 'Couldn’t load the table',
  'home.noCompetitions': 'No competitions this season',
  'home.tableUnavailable': 'Table unavailable',
  'home.knockoutStage': 'Knockout stage',

  'fixtures.title': 'Fixtures',
  'fixtures.upcoming': 'Upcoming',
  'fixtures.results': 'Results',
  'fixtures.error': 'Couldn’t load fixtures for this season.',
  'fixtures.loading': 'Loading fixtures…',
  'fixtures.noneUpcoming': 'No upcoming matches this season.',
  'fixtures.noneResults': 'No results this season.',
  'fixtures.note':
    'Includes the Premier League, FA Cup, EFL Cup, European ties and friendlies. Friendlies for past seasons may be incomplete.',

  'standings.title': 'Tables',
  'standings.error': 'Couldn’t load tables for this season.',
  'standings.loading': 'Loading tables…',
  'standings.noCompetitions': 'No competitions found for this season.',
  'standings.noData': 'No data available for this competition.',
  'standings.knockoutStage': 'Knockout stage',
  'standings.top4': 'Top 4 qualify for the Champions League.',
  'standings.freeTier': 'The free data tier returns only the top of the table.',
  'standings.expandHint': 'Tap a club for its season record.',

  'table.rank': '#',
  'table.club': 'Club',
  'table.played': 'P',
  'table.won': 'W',
  'table.drawn': 'D',
  'table.lost': 'L',
  'table.goalsFor': 'GF',
  'table.goalsAgainst': 'GA',
  'table.goalDiff': 'GD',
  'table.points': 'Pts',
  'table.form': 'Form',

  'team.seasonRecord': 'Season record',
  'team.homeRecord': 'Home',
  'team.awayRecord': 'Away',
  'team.results': 'Results',
  'team.noResults': 'No matches played yet this season.',
  'team.vsClub': 'Record vs Liverpool →',

  'h2h.title': 'vs Liverpool',
  'h2h.loading': 'Loading meetings…',
  'h2h.error': 'Couldn’t load the head-to-head record.',
  'h2h.none': 'No recorded meetings with Liverpool in this competition.',
  'h2h.clubWins': 'Liverpool wins',
  'h2h.draws': 'Draws',
  'h2h.opponentWins': 'Opponent wins',
  'h2h.meetings': 'Meetings',
  'h2h.goals': 'Goals',
  'h2h.coverage':
    'Covering {from} to {to} — the seasons this data source provides. Earlier meetings aren’t available.',

  'squad.title': 'Squad',
  'squad.players': '{n} players',
  'squad.all': 'All',
  'squad.none': 'No players to show.',
  'squad.freeTier':
    'Squad data is provided by TheSportsDB’s free tier, which returns a limited roster and no per-season match statistics.',

  'pos.Goalkeeper': 'Goalkeeper',
  'pos.Defender': 'Defender',
  'pos.Midfielder': 'Midfielder',
  'pos.Forward': 'Forward',
  'posShort.Goalkeeper': 'GK',
  'posShort.Defender': 'DEF',
  'posShort.Midfielder': 'MID',
  'posShort.Forward': 'FWD',

  'player.years': '{n} years',
  'player.foot': 'Foot',
  'player.weight': 'Weight',
  'player.born': 'Born',
  'player.signing': 'Signing',
  'player.appsShort': 'app',
  'player.goalsShort': 'g',
  'player.career': 'Career',
  'player.honours': 'Honours',
  'player.formerClubs': 'Former clubs',
  'player.loadingCareer': 'Loading career…',
  'player.noCareer': 'No career history available for this player.',
  'player.noStatsNote':
    'This data source carries player profiles only — it publishes no per-match statistics for this league.',

  'club.title': 'Club',
  'club.unavailable': 'Club information is unavailable right now.',
  'club.facts': 'Club facts',
  'club.founded': 'Founded',
  'club.capacity': 'Capacity',
  'club.stadium': 'Stadium',
  'club.nicknames': 'Nicknames',
  'club.competesIn': 'Competes in',
  'club.officialLinks': 'Official links',
  'club.fanArt': 'Fan art',
  'club.kits': 'Kits',

  'news.title': 'News',
  'news.newest': 'Newest',
  'news.oldest': 'Oldest',
  'news.none': 'No news available right now.',
  'news.note': 'Curated from a small set of trusted outlets via Google News.',

  'status.loading': 'Loading the latest…',
  'status.errorTitle': 'Couldn’t load data',
  'status.tryAgain': 'Try again',
  'status.warnings': 'Some sections couldn’t be loaded from the live source:',
  'status.crashed': 'Something went wrong.',
  'status.crashedHelp':
    'Please try reloading the page. If the problem persists, clearing this site’s data may help.',
  'status.reload': 'Reload',
} as const

export type TranslationKey = keyof typeof en

export const strings = { en }
export type Lang = keyof typeof strings

// One language today. The machinery stays because adding another is then just
// a second table here plus an entry in this list — nothing else changes.
export const LANGUAGES: { code: Lang; label: string }[] = [{ code: 'en', label: 'EN' }]

// Date/number formatting locale for each UI language.
export const localeOf: Record<Lang, string> = { en: 'en-GB' }
