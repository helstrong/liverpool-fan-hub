import { Link } from 'react-router-dom'
import { SectionTitle, sectionLinkClass } from '../components/Card'
import CompetitionSelect from '../components/CompetitionSelect'
import FormGuide from '../components/FormGuide'
import { ResultStrip, TieRow } from '../components/ResultStrip'
import SeasonSelect from '../components/SeasonSelect'
import Rings from '../components/Rings'
import TeamBadge from '../components/TeamBadge'
import { CLUB_ID, IS_FREE_KEY, lastResult, nextMatch, standingFor } from '../data/api'
import type { KnockoutStage } from '../data/api'
import { useSeason, useSelectedCompetition } from '../data/SeasonContext'
import type { AppData, Fixture, Standing } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import type { Translate } from '../i18n/I18nContext'
import { fmtDate, fmtMatchTime, ordinal } from '../lib/format'
import { useCountdown } from '../lib/useCountdown'
import { useRoundLabel } from '../lib/useRoundLabel'

export default function Home({ data }: { data: AppData }) {
  const { t, locale } = useI18n()
  const roundLabel = useRoundLabel()
  const last = lastResult(data)
  const next = nextMatch(data)
  const ourStanding = standingFor(data, CLUB_ID)

  const { status: seasonStatus, data: seasonData } = useSeason()
  const competitions = seasonData?.competitions ?? []
  const [activeCompetitionId, setActiveCompetitionId] = useSelectedCompetition(competitions)
  const activeCompetition = competitions.find((c) => c.competitionId === activeCompetitionId) ?? competitions[0]

  return (
    <div className="space-y-6">
      <MatchdayHero fixture={next} />

      {last && (
        <section>
          <SectionTitle
            action={
              <span className="shrink-0 text-[11px] text-white/40">
                {[last.competition, roundLabel(last)].filter(Boolean).join(' · ')}
              </span>
            }
          >
            {t('home.lastResult')}
          </SectionTitle>
          <ResultStrip fixture={last} />
        </section>
      )}

      {ourStanding && <SeasonStanding standing={ourStanding} />}

      <section>
        <SectionTitle
          action={
            <Link to="/standings" className={sectionLinkClass}>
              {t('home.fullTable')}
            </Link>
          }
        >
          {activeCompetition?.competitionName ?? t('home.table')}
        </SectionTitle>

        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <SeasonSelect />
          <CompetitionSelect
            competitions={competitions}
            value={activeCompetitionId}
            onChange={setActiveCompetitionId}
          />
        </div>

        {seasonStatus === 'error' ? (
          <Empty label={t('home.tableError')} />
        ) : !competitions.length ? (
          <Empty label={seasonStatus === 'loading' ? t('common.loading') : t('home.noCompetitions')} />
        ) : activeCompetition?.standings.length ? (
          <div className="space-y-3">
            <MiniTable standings={activeCompetition.standings.slice(0, 6)} />
            {IS_FREE_KEY && activeCompetition.standings.length <= 6 && (
              <p className="text-[11px] text-white/35">{t('standings.freeTier')}</p>
            )}
            {activeCompetition.knockout.length > 0 && (
              <KnockoutMini stages={activeCompetition.knockout} t={t} />
            )}
          </div>
        ) : activeCompetition?.knockout.length ? (
          <div className="space-y-3">
            {activeCompetition.note && <p className="text-[11px] text-white/35">{activeCompetition.note}</p>}
            <KnockoutMini stages={activeCompetition.knockout} t={t} />
          </div>
        ) : (
          <Empty label={activeCompetition?.note ?? t('home.tableUnavailable')} />
        )}
      </section>

      {data.news.length > 0 && (
        <section>
          <SectionTitle
            action={
              <Link to="/news" className={sectionLinkClass}>
                {t('home.allNews')}
              </Link>
            }
          >
            {t('home.latestNews')}
          </SectionTitle>
          {/* 1px gaps over a lighter backdrop give hairline rules between items
              without a border on each one. */}
          <div className="flex flex-col gap-px overflow-hidden rounded-2xl bg-white/[0.09]">
            {data.news.slice(0, 3).map((n) => (
              <a
                key={n.link}
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-lfc-maroon px-4 py-3.5 transition hover:bg-lfc-red-dark"
              >
                <div className="text-sm font-semibold leading-snug text-pretty">{n.title}</div>
                <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-lfc-yellow">
                  {n.source}
                  {n.publishedAt ? ` · ${fmtDate(n.publishedAt, locale)}` : ''}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// The matchday panel: who's next and exactly how long until kick-off. Bleeds to
// the screen edges on mobile the way the design does, and tucks back into the
// content column on desktop.
function MatchdayHero({ fixture }: { fixture?: Fixture }) {
  const { t, locale } = useI18n()
  const roundLabel = useRoundLabel()
  const countdown = useCountdown(fixture?.date)

  const shell =
    '-mx-4 -mt-6 relative overflow-hidden border-b-2 border-lfc-yellow bg-gradient-to-br from-lfc-red via-lfc-red-dark to-lfc-maroon px-5 pb-6 pt-6 md:mx-0 md:mt-0 md:rounded-2xl md:border-b-0 md:border-l-2'

  if (!fixture) {
    return (
      <section className={shell}>
        <Rings />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-lfc-yellow">
            {t('home.nextMatch')}
          </p>
          <p className="mt-3 text-sm text-white/60">{t('home.noUpcoming')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={shell}>
      <Rings />

      <div className="relative flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-lfc-yellow">
          {countdown?.started ? t('home.kickingOff') : t('home.nextMatch')}
        </span>
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.06em] text-white/55">
          {[fixture.competition, roundLabel(fixture)].filter(Boolean).join(' · ')}
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <HeroSide team={fixture.home} label={t('home.sideHome')} />
        <div className="font-display text-[26px] font-bold tracking-[0.04em] text-white/30">VS</div>
        <HeroSide team={fixture.away} label={t('home.sideAway')} />
      </div>

      {countdown && (
        <div className="relative mt-5 grid grid-cols-4 gap-1.5">
          <CountdownCell value={countdown.days} label={t('home.days')} />
          <CountdownCell value={countdown.hours} label={t('home.hrs')} />
          <CountdownCell value={countdown.minutes} label={t('home.min')} />
          <CountdownCell value={countdown.seconds} label={t('home.sec')} />
        </div>
      )}

      <div className="relative mt-3.5 flex items-center justify-between gap-3 text-[11px] font-medium text-white/60">
        <span>{fmtMatchTime(fixture.date, locale)}</span>
        {fixture.venue && <span className="truncate text-right">{fixture.venue}</span>}
      </div>
    </section>
  )
}

function HeroSide({ team, label }: { team: Fixture['home']; label: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <TeamBadge team={team} size={52} highlight={team.id === CLUB_ID} />
      <span className="line-clamp-2 text-center text-[13px] font-semibold">{team.name}</span>
      <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/45">{label}</span>
    </div>
  )
}

function CountdownCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.08] bg-black/[0.28] py-2.5 text-center">
      <div className="font-display text-[32px] font-bold leading-none text-lfc-yellow">{value}</div>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">
        {label}
      </div>
    </div>
  )
}

// Position, points and goal difference at a glance, with the record and form
// underneath — the numbers the hero used to carry before matchday took its place.
function SeasonStanding({ standing }: { standing: Standing }) {
  const { t, locale } = useI18n()
  const gd = standing.gf - standing.ga
  const suffix = ordinal(standing.rank, locale)

  return (
    <section>
      <SectionTitle>{t('home.seasonStanding')}</SectionTitle>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-lfc-yellow px-2.5 py-3 text-lfc-maroon">
          <div className="font-display text-[38px] font-bold leading-[0.85]">
            {standing.rank}
            {/* A Turkish ordinal is just a full stop, which shouldn't be raised
                the way an English "nd" is. */}
            <span className={suffix.length > 1 ? 'align-top text-xl leading-none' : ''}>{suffix}</span>
          </div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] opacity-65">
            {t('home.position')}
          </div>
        </div>
        <StatTile value={String(standing.points)} label={t('home.points')} />
        <StatTile value={`${gd >= 0 ? '+' : ''}${gd}`} label={t('home.goalDiff')} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-xl bg-white/5 px-3 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
          {t('home.last5')}
        </span>
        <FormGuide form={standing.form} />
        <span className="ml-auto text-[11px] font-medium text-white/45">
          {standing.won}
          {t('table.won')} {standing.drawn}
          {t('table.drawn')} {standing.lost}
          {t('table.lost')}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-white/35">
        {standing.played} {t('common.played')} · {standing.gf} {t('common.scored')} · {standing.ga}{' '}
        {t('common.conceded')}
      </p>
    </section>
  )
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] px-2.5 py-3">
      <div className="font-display text-[38px] font-bold leading-[0.85]">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
        {label}
      </div>
    </div>
  )
}

function MiniTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/5">
      {standings.map((s, i) => {
        const isClub = s.team.id === CLUB_ID
        return (
          <div
            key={s.team.id}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm ${
              i > 0 ? 'border-t border-white/[0.06]' : ''
            } ${isClub ? 'bg-lfc-yellow font-semibold text-lfc-maroon' : ''}`}
          >
            <span
              className={`w-5 shrink-0 font-display text-[15px] font-bold ${
                isClub ? '' : 'text-white/45'
              }`}
            >
              {s.rank}
            </span>
            <TeamBadge team={s.team} size={20} highlight={isClub} />
            <span className="flex-1 truncate">{s.team.name}</span>
            <span className={`w-7 shrink-0 text-center text-xs ${isClub ? 'opacity-60' : 'text-white/40'}`}>
              {s.played}
            </span>
            <span className="w-8 shrink-0 text-right font-display text-[17px] font-bold">{s.points}</span>
          </div>
        )
      })}
    </div>
  )
}

// Liverpool's own knockout run, condensed for the dashboard — the full version
// lives on the Tables page.
function KnockoutMini({ stages, t }: { stages: KnockoutStage[]; t: Translate }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
        {t('home.knockoutStage')}
      </p>
      {stages.map((stage) =>
        stage.fixtures.map((f) => <TieRow key={f.id} fixture={f} round={stage.round} />),
      )}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
      {label}
    </div>
  )
}
