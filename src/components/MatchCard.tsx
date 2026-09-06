import { CLUB_ID } from '../data/api'
import type { Fixture, Team } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import { fmtMatchTime } from '../lib/format'
import { perspective, resultFg, resultKey } from '../lib/result'
import { useRoundLabel } from '../lib/useRoundLabel'
import TeamBadge from './TeamBadge'

// The fixtures-list card: competition and kick-off across the top, the two
// sides stacked so the scoreline can sit beside them at broadcast scale, and
// round/venue plus the result along the bottom.
export default function MatchCard({ fixture }: { fixture: Fixture }) {
  const { t, locale } = useI18n()
  const label = useRoundLabel()
  const finished = fixture.status === 'finished'
  const { result } = perspective(fixture)
  const round = label(fixture)
  const meta = [round, fixture.venue].filter(Boolean).join(' · ')

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-lfc-maroon px-4 py-3.5">
      <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.08em]">
        <span className="min-w-0 truncate text-lfc-yellow">{fixture.competition}</span>
        <span className="shrink-0 text-white/45">{fmtMatchTime(fixture.date, locale)}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <TeamLine team={fixture.home} />
          <TeamLine team={fixture.away} />
        </div>
        <div
          className={`shrink-0 font-display text-[34px] font-bold leading-[0.9] ${
            finished ? 'text-white' : 'text-white/35'
          }`}
        >
          {finished ? `${fixture.homeScore}–${fixture.awayScore}` : 'vs'}
        </div>
      </div>

      {(meta || result) && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-2.5 text-[11px] text-white/45">
          <span className="min-w-0 truncate">{meta}</span>
          {result && (
            <span
              className={`shrink-0 font-display text-xs font-bold uppercase tracking-[0.1em] ${resultFg[result]}`}
            >
              {t(resultKey(result))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function TeamLine({ team }: { team: Team }) {
  const isClub = team.id === CLUB_ID
  return (
    <div className="flex min-w-0 items-center gap-2">
      <TeamBadge team={team} size={22} highlight={isClub} />
      <span className={`truncate text-sm ${isClub ? 'font-semibold text-white' : 'text-white/80'}`}>
        {team.name}
      </span>
    </div>
  )
}
