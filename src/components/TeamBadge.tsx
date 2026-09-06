import type { Team } from '../data/types'
import { useI18n } from '../i18n/I18nContext'

// Renders a club crest from its badge URL, falling back to a short-code chip
// when no image is available (e.g. sample data or a missing badge).
export default function TeamBadge({
  team,
  size = 32,
  highlight = false,
}: {
  team: Team
  size?: number
  highlight?: boolean
}) {
  const { t } = useI18n()
  const style = { width: size, height: size }

  if (team.badge) {
    return (
      <img
        src={team.badge}
        alt={t('a11y.crest', { name: team.name })}
        loading="lazy"
        style={style}
        className="shrink-0 rounded-full object-contain"
      />
    )
  }

  return (
    <span
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold tracking-[0.06em] ${
        highlight
          ? 'bg-lfc-yellow text-lfc-maroon'
          : 'border border-white/[0.18] bg-white/10 text-white'
      }`}
    >
      {team.short}
    </span>
  )
}
