import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Pill from '../components/Pill'
import type { AppData } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import { fmtDate } from '../lib/format'

const sortOptions = ['Newest', 'Oldest'] as const
type SortOption = (typeof sortOptions)[number]

export default function News({ data }: { data: AppData }) {
  const { t, locale } = useI18n()
  const [sort, setSort] = useState<SortOption>('Newest')

  // data.news already arrives newest-first; reversing is enough for 'Oldest'
  // and keeps undated items in the same relative spot either way.
  const news = useMemo(
    () => (sort === 'Oldest' ? [...data.news].reverse() : data.news),
    [data.news, sort],
  )

  return (
    <div>
      <PageHeader title={t('news.title')}>
        {data.news.length > 1 && (
          <div className="flex gap-1.5">
            {sortOptions.map((opt) => (
              <Pill key={opt} active={sort === opt} onClick={() => setSort(opt)}>
                {opt === 'Newest' ? t('news.newest') : t('news.oldest')}
              </Pill>
            ))}
          </div>
        )}
      </PageHeader>

      {news.length ? (
        <div className="grid gap-2.5 md:grid-cols-2">
          {news.map((n) => (
            <a
              key={n.link}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-white/10 bg-lfc-maroon px-4 py-3.5 transition hover:border-white/20 hover:bg-lfc-red-dark"
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-lfc-yellow">
                {n.source}
                {n.publishedAt ? ` · ${fmtDate(n.publishedAt, locale)}` : ''}
              </div>
              <h2 className="mt-2 text-[15px] font-semibold leading-snug text-pretty">{n.title}</h2>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/40">{t('news.none')}</p>
      )}

      {/* The affiliation disclaimer lives in the global footer now, so this only
          has to explain where the articles come from. */}
      <p className="mt-4 text-[11px] leading-relaxed text-white/35">{t('news.note')}</p>
    </div>
  )
}
