import { useI18n } from '../i18n/I18nContext'
import { resultBg, resultInk, resultKey, resultShortKey } from '../lib/result'
import type { MatchResult } from '../lib/result'

// Renders a last-5 form string like "DWWLD" as coloured W/D/L squares.
// TheSportsDB orders the string oldest → newest.
//
// "md" is the standalone row on Home; "sm" is the trailing column of the
// standings table, where five squares have to fit inside one table cell.
const sizes = {
  md: 'h-[22px] w-[22px] rounded-md text-[13px]',
  sm: 'h-[13px] w-[13px] rounded-[3px] text-[9px]',
}

export default function FormGuide({
  form,
  size = 'md',
  className = '',
}: {
  form?: string
  size?: keyof typeof sizes
  className?: string
}) {
  const { t } = useI18n()
  const results = ((form ?? '').toUpperCase().replace(/[^WDL]/g, '').split('') as MatchResult[])
  if (!results.length) return <span className="text-xs text-white/25">—</span>

  return (
    <div className={`flex gap-[5px] ${className}`}>
      {results.map((r, i) => (
        <span
          key={i}
          title={t(resultKey(r))}
          className={`flex items-center justify-center font-display font-bold ${sizes[size]} ${resultBg[r]} ${resultInk[r]}`}
        >
          {t(resultShortKey(r))}
        </span>
      ))}
    </div>
  )
}
