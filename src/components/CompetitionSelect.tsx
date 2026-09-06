import type { CompetitionStandings } from '../data/api'
import { useI18n } from '../i18n/I18nContext'

// Compact dropdown for choosing a competition, for tighter spaces (e.g. the
// Home dashboard's Table card) where the pill tabs used on the full Standings
// page wouldn't fit. Renders nothing if there's only one competition to pick.
export default function CompetitionSelect({
  competitions,
  value,
  onChange,
  className = '',
}: {
  competitions: CompetitionStandings[]
  value: number | null
  onChange: (id: number) => void
  className?: string
}) {
  const { t } = useI18n()
  if (competitions.length <= 1) return null

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={t('chrome.competition')}
      className={`rounded-md border border-white/10 bg-white/[0.07] px-2 py-1 text-[11px] font-semibold text-white transition focus:outline-none focus:ring-1 focus:ring-lfc-yellow ${className}`}
    >
      {competitions.map((c) => (
        <option key={c.competitionId} value={c.competitionId}>
          {c.competitionName}
        </option>
      ))}
    </select>
  )
}
