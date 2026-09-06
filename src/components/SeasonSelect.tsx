import { useSeason } from '../data/SeasonContext'
import { useI18n } from '../i18n/I18nContext'

// "2025-2026" → "2025/26"
const label = (s: string) => {
  const [a, b] = s.split('-')
  return b ? `${a}/${b.slice(2)}` : s
}

export default function SeasonSelect() {
  const { t } = useI18n()
  const { season, setSeason, seasons, status } = useSeason()

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-[11px]">
      <span className="uppercase tracking-[0.08em] text-white/40">{t('chrome.season')}</span>
      <select
        value={season}
        onChange={(e) => setSeason(e.target.value)}
        disabled={status === 'loading'}
        className="rounded-md border border-white/10 bg-white/[0.07] px-2 py-1 text-[11px] font-semibold text-white transition focus:outline-none focus:ring-1 focus:ring-lfc-yellow disabled:opacity-60"
      >
        {seasons.map((s) => (
          <option key={s} value={s}>
            {label(s)}
          </option>
        ))}
      </select>
    </label>
  )
}
