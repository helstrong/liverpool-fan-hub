import { CLUB_ID } from '../data/api'
import type { Fixture, Team } from '../data/types'

export type MatchResult = 'W' | 'D' | 'L'

export interface Perspective {
  opponent: Team
  atHome: boolean
  /** Liverpool's goals, then the opponent's — not home-then-away. */
  ours: number | null
  theirs: number | null
  result: MatchResult | null
}

// This is a single-club hub, so most surfaces read a match from Liverpool's
// side — "vs Kasımpaşa 4–1" rather than whichever way round the fixture is
// stored. Derived once here so the result colours, the score order and the
// opponent name can't drift apart between the cards that show them.
export function perspective(fixture: Fixture): Perspective {
  const atHome = fixture.home.id === CLUB_ID
  const ours = atHome ? fixture.homeScore : fixture.awayScore
  const theirs = atHome ? fixture.awayScore : fixture.homeScore
  const played = fixture.status === 'finished' && ours != null && theirs != null

  return {
    opponent: atHome ? fixture.away : fixture.home,
    atHome,
    ours,
    theirs,
    result: played ? (ours! > theirs! ? 'W' : ours! < theirs! ? 'L' : 'D') : null,
  }
}

// Translation key for a result, so W/D/L reads in the active language wherever
// it's spelled out (card footers, form-square tooltips).
export const resultKey = (r: MatchResult) => `result.${r}` as const

// The single letter shown inside a form square or result badge. Turkish uses
// G/B/M, so it can't just be the MatchResult itself — otherwise a Turkish table
// would read "L W W" next to a record written "2G 0B 1M".
export const resultShortKey = (r: MatchResult) => `resultShort.${r}` as const

// Tailwind classes rather than raw hex so W/D/L reads identically everywhere it
// appears — form squares, fixture cards, result strips — from one definition.
export const resultBg: Record<MatchResult, string> = {
  W: 'bg-result-win',
  D: 'bg-result-draw',
  L: 'bg-result-loss',
}

export const resultFg: Record<MatchResult, string> = {
  W: 'text-result-win',
  D: 'text-result-draw',
  L: 'text-result-loss',
}

export const resultBorder: Record<MatchResult, string> = {
  W: 'border-l-result-win',
  D: 'border-l-result-draw',
  L: 'border-l-result-loss',
}

// Ink for text sitting on a filled result chip — a dark tint of the chip's own
// hue rather than flat black, which keeps the chips reading as one set.
export const resultInk: Record<MatchResult, string> = {
  W: 'text-[#04241F]',
  D: 'text-[#12181D]',
  L: 'text-[#0F1418]',
}
