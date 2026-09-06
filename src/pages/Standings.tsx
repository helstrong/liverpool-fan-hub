import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import FormGuide from '../components/FormGuide'
import PageHeader from '../components/PageHeader'
import Pill from '../components/Pill'
import { TieRow } from '../components/ResultStrip'
import SeasonSelect from '../components/SeasonSelect'
import TeamBadge from '../components/TeamBadge'
import { CLUB_ID, IS_FREE_KEY, LEAGUE_ID } from '../data/api'
import type { CompetitionStandings, KnockoutStage } from '../data/api'
import { useSeason, useSelectedCompetition } from '../data/SeasonContext'
import type { Fixture, Team } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import { fmtDate } from '../lib/format'
import { resultBg, resultInk, resultShortKey } from '../lib/result'
import { teamSeason } from '../lib/teamSeason'
import type { SplitRecord } from '../lib/teamSeason'

export default function Standings() {
  const { t } = useI18n()
  const { status, data } = useSeason()
  const competitions = data?.competitions ?? []
  const [selectedId, setSelectedId] = useSelectedCompetition(competitions)

  const active = competitions.find((c) => c.competitionId === selectedId) ?? competitions[0]

  return (
    <div>
      <PageHeader title={t('standings.title')}>
        <SeasonSelect />
      </PageHeader>

      {competitions.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {competitions.map((c) => (
            <Pill
              key={c.competitionId}
              active={active?.competitionId === c.competitionId}
              onClick={() => setSelectedId(c.competitionId)}
            >
              {c.competitionName}
            </Pill>
          ))}
        </div>
      )}

      {status === 'error' ? (
        <p className="text-sm text-danger">{t('standings.error')}</p>
      ) : !competitions.length ? (
        <p className="text-sm text-white/40">
          {status === 'loading' ? t('standings.loading') : t('standings.noCompetitions')}
        </p>
      ) : active ? (
        <CompetitionView competition={active} />
      ) : null}
    </div>
  )
}

function CompetitionView({ competition }: { competition: CompetitionStandings }) {
  const { t } = useI18n()
  const hasTable = competition.source !== 'unavailable' && competition.standings.length > 0
  const hasKnockout = competition.knockout.length > 0

  if (!hasTable && !hasKnockout) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
        {competition.note ?? t('standings.noData')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {hasTable && <LeagueTable competition={competition} />}
      {hasKnockout && (
        <div>
          {hasTable ? (
            <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/55">
              {t('standings.knockoutStage')}
            </h2>
          ) : (
            competition.note && <p className="mb-3 text-xs leading-relaxed text-white/45">{competition.note}</p>
          )}
          <KnockoutBracket stages={competition.knockout} />
        </div>
      )}
    </div>
  )
}

function LeagueTable({ competition }: { competition: CompetitionStandings }) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState<string | null>(null)

  const standings = competition.standings
  // Computed tables carry a form guide too now, so this keys off whether the
  // data actually has form rather than off which source produced it.
  const showForm = standings.some((s) => s.form)
  const isLeague = competition.competitionId === LEAGUE_ID
  const canExpand = competition.events.length > 0
  // rank, club, P, W, D, L, GF, GA, GD, Pts (+ form) — the width the expanded
  // detail row has to span.
  const columns = 10 + (showForm ? 1 : 0)

  // The design's mobile table is #/Club/P/GD/Pts/Form. The per-result breakdown
  // is real data the app already had, so rather than drop it, it's hidden at
  // phone width and returns from sm: up where there's room for it.
  const wide = 'hidden px-1.5 py-2.5 text-center sm:table-cell'

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">
              <th className="px-3 py-2.5 text-left">{t('table.rank')}</th>
              <th className="py-2.5 text-left">{t('table.club')}</th>
              <th className="px-1.5 py-2.5 text-center">{t('table.played')}</th>
              <th className={wide}>{t('table.won')}</th>
              <th className={wide}>{t('table.drawn')}</th>
              <th className={wide}>{t('table.lost')}</th>
              <th className={wide}>{t('table.goalsFor')}</th>
              <th className={wide}>{t('table.goalsAgainst')}</th>
              <th className="px-1.5 py-2.5 text-center">{t('table.goalDiff')}</th>
              <th className="px-2 py-2.5 text-right">{t('table.points')}</th>
              {showForm && <th className="px-3 py-2.5 text-right">{t('table.form')}</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const isClub = s.team.id === CLUB_ID
              const isOpen = expanded === s.team.id
              const gd = s.gf - s.ga
              const dim = isClub ? 'opacity-60' : 'text-white/60'

              return (
                <Fragment key={s.team.id}>
                  <tr
                    onClick={canExpand ? () => setExpanded(isOpen ? null : s.team.id) : undefined}
                    aria-expanded={canExpand ? isOpen : undefined}
                    className={`border-b border-white/[0.06] ${canExpand ? 'cursor-pointer' : ''} ${
                      isClub ? 'bg-lfc-yellow font-semibold text-lfc-maroon' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span
                        className={`font-display text-[15px] font-bold ${
                          isClub ? '' : isLeague && s.rank <= 4 ? 'text-lfc-yellow' : 'text-white/45'
                        }`}
                      >
                        {s.rank}
                      </span>
                    </td>
                    <td className="w-full max-w-0 py-2.5 pr-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <TeamBadge team={s.team} size={20} highlight={isClub} />
                        <span className="truncate text-[13px]">{s.team.name}</span>
                        {canExpand && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className={`h-3 w-3 shrink-0 opacity-40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className={`px-1.5 py-2.5 text-center text-xs ${dim}`}>{s.played}</td>
                    <td className={`${wide} text-xs ${dim}`}>{s.won}</td>
                    <td className={`${wide} text-xs ${dim}`}>{s.drawn}</td>
                    <td className={`${wide} text-xs ${dim}`}>{s.lost}</td>
                    <td className={`${wide} text-xs ${dim}`}>{s.gf}</td>
                    <td className={`${wide} text-xs ${dim}`}>{s.ga}</td>
                    <td className={`px-1.5 py-2.5 text-center text-xs ${dim}`}>
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td className="px-2 py-2.5 text-right font-display text-[17px] font-bold">{s.points}</td>
                    {showForm && (
                      <td className="px-3 py-2.5">
                        <FormGuide form={s.form} size="sm" className="justify-end" />
                      </td>
                    )}
                  </tr>

                  {isOpen && (
                    <tr className="border-b border-white/[0.06] bg-black/20">
                      <td colSpan={columns} className="px-3 py-4">
                        <TeamDetail
                          team={s.team}
                          events={competition.events}
                          competitionId={competition.competitionId}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/35">
        {canExpand && `${t('standings.expandHint')} `}
        {isLeague && `${t('standings.top4')} `}
        {IS_FREE_KEY && standings.length <= 6 && `${t('standings.freeTier')} `}
        {competition.note}
      </p>
    </div>
  )
}

// The expanded row: how this club's season has actually gone, split by venue,
// plus a way through to their full record against Liverpool.
function TeamDetail({
  team,
  events,
  competitionId,
}: {
  team: Team
  events: Fixture[]
  competitionId: number
}) {
  const { t, locale } = useI18n()
  const season = teamSeason(events, team.id)

  if (!season.played) return <p className="text-[11px] text-white/40">{t('team.noResults')}</p>

  return (
    <div className="space-y-3.5">
      <div className="grid gap-2 sm:grid-cols-3">
        <RecordCard label={t('team.seasonRecord')} record={season.overall} />
        <RecordCard label={t('team.homeRecord')} record={season.home} />
        <RecordCard label={t('team.awayRecord')} record={season.away} />
      </div>

      <div>
        <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
          {t('team.results')}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {season.results.map((f) => (
            <ResultChip key={f.id} fixture={f} teamId={team.id} locale={locale} />
          ))}
        </div>
      </div>

      {team.id !== CLUB_ID && (
        <Link
          to={`/opponent/${team.id}?comp=${competitionId}`}
          state={{ team }}
          className="inline-block text-[11px] font-semibold text-lfc-yellow hover:underline"
        >
          {t('team.vsClub')}
        </Link>
      )}
    </div>
  )
}

function RecordCard({ label, record }: { label: string; record: SplitRecord }) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">{label}</div>
      <div className="mt-1.5 font-display text-lg font-bold">
        {record.won}
        <span className="px-0.5 font-sans text-[10px] font-normal text-white/40">{t('table.won')}</span>
        {record.drawn}
        <span className="px-0.5 font-sans text-[10px] font-normal text-white/40">{t('table.drawn')}</span>
        {record.lost}
        <span className="px-0.5 font-sans text-[10px] font-normal text-white/40">{t('table.lost')}</span>
      </div>
      <div className="mt-0.5 text-[10px] text-white/35">
        {record.gf}–{record.ga}
      </div>
    </div>
  )
}

// One match as a compact coloured chip: opponent, score, and the result read
// from this club's side.
function ResultChip({ fixture, teamId, locale }: { fixture: Fixture; teamId: string; locale: string }) {
  const { t } = useI18n()
  const isHome = fixture.home.id === teamId
  const scored = (isHome ? fixture.homeScore : fixture.awayScore) ?? 0
  const conceded = (isHome ? fixture.awayScore : fixture.homeScore) ?? 0
  const opponent = isHome ? fixture.away : fixture.home
  const outcome = scored > conceded ? 'W' : scored < conceded ? 'L' : 'D'

  return (
    <span
      title={`${isHome ? 'vs' : '@'} ${opponent.name} · ${fmtDate(fixture.date, locale)}`}
      className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] py-1 pl-1 pr-2 text-[11px]"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded font-display text-[10px] font-bold ${resultBg[outcome]} ${resultInk[outcome]}`}
      >
        {t(resultShortKey(outcome))}
      </span>
      <span className="max-w-[7rem] truncate text-white/60">{opponent.short}</span>
      <span className="font-display font-bold">
        {scored}–{conceded}
      </span>
    </span>
  )
}

// Liverpool's own run through the knockout rounds, one stage at a time
// (Qualifying, Play-off, Round of 16, ...) — real results, not a full bracket
// of every tie in the competition.
function KnockoutBracket({ stages }: { stages: KnockoutStage[] }) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      {stages.map((stage) =>
        stage.fixtures.map((f) => <TieRow key={f.id} fixture={f} round={stage.round} />),
      )}
    </div>
  )
}
