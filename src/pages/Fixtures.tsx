import { useEffect, useState } from 'react'
import MatchCard from '../components/MatchCard'
import PageHeader from '../components/PageHeader'
import SeasonSelect from '../components/SeasonSelect'
import { useSeason } from '../data/SeasonContext'
import { useI18n } from '../i18n/I18nContext'

export default function Fixtures() {
  const { t } = useI18n()
  const { status, data } = useSeason()
  const [tab, setTab] = useState<'upcoming' | 'results'>('upcoming')

  const results = data?.results ?? []
  const upcoming = data?.upcoming ?? []

  // A finished season has no upcoming matches — open on Results instead.
  useEffect(() => {
    if (data && !upcoming.length && results.length) setTab('results')
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const list = tab === 'results' ? results : upcoming

  return (
    <div>
      <PageHeader title={t('fixtures.title')}>
        <SeasonSelect />
      </PageHeader>

      <div className="mb-4 flex gap-1.5 rounded-xl bg-white/[0.07] p-1">
        {(['upcoming', 'results'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`flex-1 rounded-[9px] py-2 text-xs font-semibold uppercase tracking-[0.06em] transition ${
              tab === key ? 'bg-lfc-yellow text-lfc-maroon' : 'text-white/55 hover:text-white'
            }`}
          >
            {key === 'results' ? t('fixtures.results') : t('fixtures.upcoming')}{' '}
            <span className="opacity-60">{key === 'results' ? results.length : upcoming.length}</span>
          </button>
        ))}
      </div>

      {status === 'error' ? (
        <p className="text-sm text-danger">{t('fixtures.error')}</p>
      ) : list.length ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          {list.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">
          {status === 'loading'
            ? t('fixtures.loading')
            : tab === 'results'
              ? t('fixtures.noneResults')
              : t('fixtures.noneUpcoming')}
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-white/35">{t('fixtures.note')}</p>
    </div>
  )
}
