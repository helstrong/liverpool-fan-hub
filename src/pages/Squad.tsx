import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pill from '../components/Pill'
import { IS_FREE_KEY, loadPlayerCareer } from '../data/api'
import type { AppData, Player, PlayerCareer } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import type { TranslationKey } from '../i18n/strings'

const filters = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

export default function Squad({ data }: { data: AppData }) {
  const { t } = useI18n()
  const [pos, setPos] = useState<(typeof filters)[number]>('All')
  const players = data.players.filter((p) => pos === 'All' || p.position === pos)

  return (
    <div>
      <PageHeader title={t('squad.title')}>
        <span className="text-[11px] text-white/50">{t('squad.players', { n: players.length })}</span>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Pill key={f} active={pos === f} onClick={() => setPos(f)}>
            {f === 'All' ? t('squad.all') : t(`pos.${f}` as TranslationKey)}
          </Pill>
        ))}
      </div>

      {players.length ? (
        <div className="flex flex-col gap-px overflow-hidden rounded-2xl bg-white/[0.09]">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">{t('squad.none')}</p>
      )}

      {data.live && IS_FREE_KEY && (
        <p className="mt-4 text-[11px] leading-relaxed text-white/35">{t('squad.freeTier')}</p>
      )}
    </div>
  )
}

// One dense row per player, expanding to the full profile: bio facts the roster
// already carries, plus career history fetched on first open.
function PlayerRow({ player }: { player: Player }) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)

  const facts: [string, string][] = []
  if (player.foot) facts.push([t('player.foot'), player.foot])
  if (player.weight) facts.push([t('player.weight'), player.weight])
  if (player.birthplace) facts.push([t('player.born'), player.birthplace])
  if (player.signing) facts.push([t('player.signing'), player.signing])

  const meta = [player.nationality, player.age ? t('player.years', { n: player.age }) : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="bg-lfc-maroon">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 px-3.5 py-3 text-left transition hover:bg-white/[0.04]"
      >
        <span className="w-8 shrink-0 text-center font-display text-[26px] font-bold leading-none text-lfc-yellow">
          {player.number || '–'}
        </span>

        {player.photo && (
          <img
            src={player.photo}
            alt=""
            loading="lazy"
            className="h-9 w-9 shrink-0 rounded-full bg-white/10 object-cover object-top"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{player.name}</span>
          {meta && <span className="truncate text-[11px] text-white/50">{meta}</span>}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45">
            {t(`posShort.${player.position}` as TranslationKey)}
          </span>
          {player.height && <span className="text-[11px] text-white/35">{player.height}</span>}
        </div>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-white/[0.08] px-3.5 py-3.5">
          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-white/40">{label}</dt>
                  <dd className="truncate text-right font-medium text-white/80">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {player.description && (
            <div>
              <p className="line-clamp-6 text-[11px] leading-relaxed text-white/55">{player.description}</p>
              {lang !== 'en' && <p className="mt-1 text-[10px] text-white/30">{t('common.englishOnly')}</p>}
            </div>
          )}

          <Career playerId={player.id} />
        </div>
      )}
    </div>
  )
}

// Career history is fetched the first time a row opens rather than for all ~37
// players up front, which would be 74 requests on every squad visit.
function Career({ playerId }: { playerId: string }) {
  const { t } = useI18n()
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; data?: PlayerCareer }>({
    status: 'loading',
  })

  useEffect(() => {
    let cancelled = false
    loadPlayerCareer(playerId)
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch(() => !cancelled && setState({ status: 'error' }))
    return () => {
      cancelled = true
    }
  }, [playerId])

  if (state.status === 'loading')
    return <p className="text-[11px] text-white/35">{t('player.loadingCareer')}</p>
  if (state.status === 'error' || !state.data)
    return <p className="text-[11px] text-white/35">{t('player.noCareer')}</p>

  const { spells, honours } = state.data
  if (!spells.length && !honours.length)
    return <p className="text-[11px] text-white/35">{t('player.noCareer')}</p>

  return (
    <div className="space-y-3.5">
      {spells.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
            {t('player.formerClubs')}
          </h4>
          <ul className="space-y-1">
            {spells.map((s, i) => (
              <li key={`${s.team}-${i}`} className="flex items-center gap-2 text-[11px]">
                {s.badge && <img src={s.badge} alt="" loading="lazy" className="h-4 w-4 shrink-0 object-contain" />}
                <span className="truncate font-medium text-white/80">{s.team}</span>
                <span className="shrink-0 text-white/35">
                  {[s.joined, s.departed].filter(Boolean).join('–')}
                </span>
                {(s.appearances != null || s.goals != null) && (
                  <span className="ml-auto shrink-0 font-display text-xs font-bold text-white/60">
                    {s.appearances ?? 0}
                    <span className="px-0.5 font-sans text-[9px] font-normal text-white/35">{t('player.appsShort')}</span>
                    {s.goals ?? 0}
                    <span className="pl-0.5 font-sans text-[9px] font-normal text-white/35">{t('player.goalsShort')}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {honours.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
            {t('player.honours')}
          </h4>
          <div className="flex flex-wrap gap-1">
            {honours.map((h) => (
              <span
                key={`${h.honour}-${h.team ?? ''}`}
                title={h.seasons.join(', ')}
                className="rounded-full bg-white/[0.07] px-2 py-1 text-[10px] text-white/70"
              >
                {h.honour}
                {h.seasons.length > 1 && (
                  <span className="ml-1 font-semibold text-lfc-yellow">×{h.seasons.length}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-white/25">{t('player.noStatsNote')}</p>
    </div>
  )
}
