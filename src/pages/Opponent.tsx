import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { SectionTitle } from '../components/Card'
import MatchCard from '../components/MatchCard'
import Rings from '../components/Rings'
import TeamBadge from '../components/TeamBadge'
import { LEAGUE_ID, fetchHeadToHead } from '../data/api'
import type { Fixture, Team } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import { perspective } from '../lib/result'

interface State {
  status: 'loading' | 'ready' | 'error'
  fixtures: Fixture[]
  seasons: string[]
}

// "2019-2020" → "2019/20"
const seasonLabel = (s: string) => {
  const [a, b] = s.split('-')
  return b ? `${a}/${b.slice(2)}` : s
}

export default function Opponent() {
  const { t } = useI18n()
  const { teamId = '' } = useParams()
  const [params] = useSearchParams()
  const competitionId = Number(params.get('comp')) || LEAGUE_ID

  // The table row that linked here already had the team, so it's passed through
  // navigation state rather than costing a lookup request. Falls back to the
  // fixtures themselves when someone lands on the URL directly.
  const passed = (useLocation().state as { team?: Team } | null)?.team

  const [state, setState] = useState<State>({ status: 'loading', fixtures: [], seasons: [] })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', fixtures: [], seasons: [] })

    fetchHeadToHead(competitionId, teamId)
      .then(({ fixtures, seasons }) => {
        if (!cancelled) setState({ status: 'ready', fixtures, seasons })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', fixtures: [], seasons: [] })
      })

    return () => {
      cancelled = true
    }
  }, [competitionId, teamId])

  const { fixtures, seasons } = state
  const opponent =
    passed ??
    (fixtures.length
      ? [fixtures[0].home, fixtures[0].away].find((x) => x.id === teamId)
      : undefined)

  const tally = fixtures.reduce(
    (acc, f) => {
      const { result, ours, theirs } = perspective(f)
      if (result === 'W') acc.club++
      else if (result === 'L') acc.opponent++
      else if (result === 'D') acc.draws++
      acc.goalsFor += ours ?? 0
      acc.goalsAgainst += theirs ?? 0
      return acc
    },
    { club: 0, draws: 0, opponent: 0, goalsFor: 0, goalsAgainst: 0 },
  )

  return (
    <div>
      <Link to="/standings" className="mb-3 inline-block text-[11px] font-semibold text-lfc-yellow hover:underline">
        ← {t('standings.title')}
      </Link>

      <section className="relative -mx-4 mb-5 overflow-hidden border-b-2 border-lfc-yellow bg-gradient-to-br from-lfc-red via-lfc-red-dark to-lfc-maroon px-5 py-6 md:mx-0 md:rounded-2xl md:border-b-0 md:border-l-2">
        <Rings />
        <div className="relative flex items-center gap-4">
          {opponent && <TeamBadge team={opponent} size={56} />}
          <div className="min-w-0">
            <h1 className="font-display text-[30px] font-bold uppercase leading-none tracking-[0.02em]">
              {opponent?.name ?? teamId}
            </h1>
            <p className="mt-1.5 text-xs font-medium text-lfc-yellow">{t('h2h.title')}</p>
          </div>
        </div>
      </section>

      {state.status === 'loading' ? (
        <p className="text-sm text-white/40">{t('h2h.loading')}</p>
      ) : state.status === 'error' ? (
        <p className="text-sm text-danger">{t('h2h.error')}</p>
      ) : !fixtures.length ? (
        <p className="text-sm text-white/40">{t('h2h.none')}</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            <Tally value={tally.club} label={t('h2h.clubWins')} accent />
            <Tally value={tally.draws} label={t('h2h.draws')} />
            <Tally value={tally.opponent} label={t('h2h.opponentWins')} />
            <Tally value={fixtures.length} label={t('h2h.meetings')} />
          </div>

          <p className="text-[11px] text-white/40">
            {t('h2h.goals')}: Liverpool{' '}
            <span className="font-display text-sm font-bold text-white/70">
              {tally.goalsFor}–{tally.goalsAgainst}
            </span>{' '}
            {opponent?.name}
          </p>

          <div>
            <SectionTitle>{t('team.results')}</SectionTitle>
            <div className="grid gap-2.5 md:grid-cols-2">
              {fixtures.map((f) => (
                <MatchCard key={f.id} fixture={f} />
              ))}
            </div>
          </div>
        </div>
      )}

      {state.status === 'ready' && seasons.length > 0 && (
        <p className="mt-5 text-[11px] leading-relaxed text-white/35">
          {t('h2h.coverage', {
            from: seasonLabel(seasons[seasons.length - 1]),
            to: seasonLabel(seasons[0]),
          })}
        </p>
      )}
    </div>
  )
}

function Tally({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl px-2.5 py-3 ${
        accent ? 'bg-lfc-yellow text-lfc-maroon' : 'border border-white/10 bg-white/[0.07]'
      }`}
    >
      <div className="font-display text-[32px] font-bold leading-[0.85]">{value}</div>
      <div
        className={`mt-1.5 text-[9px] font-semibold uppercase leading-tight tracking-[0.1em] ${
          accent ? 'opacity-65' : 'text-white/50'
        }`}
      >
        {label}
      </div>
    </div>
  )
}
