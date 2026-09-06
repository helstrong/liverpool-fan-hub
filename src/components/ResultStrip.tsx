import type { RoundRef } from '../data/api'
import type { Fixture } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import { fmtMatchTime } from '../lib/format'
import { perspective, resultBg, resultBorder, resultInk, resultKey, resultShortKey } from '../lib/result'
import { useRoundLabel } from '../lib/useRoundLabel'

// Both strips read the match from Liverpool's side and carry the result as a
// coloured left edge, so a run of them scans as a form guide on its own.
const edge = (result: ReturnType<typeof perspective>['result']) =>
  result ? resultBorder[result] : 'border-l-white/10'

const scoreline = (p: ReturnType<typeof perspective>) =>
  p.ours != null && p.theirs != null ? `${p.ours}–${p.theirs}` : 'vs'

// Home's "Last result": the scoreline leads at full broadcast scale, with the
// W/D/L badge closing the row.
export function ResultStrip({ fixture }: { fixture: Fixture }) {
  const { t, locale } = useI18n()
  const p = perspective(fixture)

  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border border-white/10 border-l-[3px] bg-lfc-maroon px-4 py-3.5 ${edge(p.result)}`}
    >
      <div className="shrink-0 font-display text-[44px] font-bold leading-[0.85]">
        {p.ours != null && p.theirs != null ? (
          <>
            {p.ours}
            <span className="px-[3px] text-white/30">–</span>
            {p.theirs}
          </>
        ) : (
          <span className="text-white/35">vs</span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold">
          {p.atHome ? 'vs' : '@'} {p.opponent.name}
        </span>
        <span className="truncate text-[11px] text-white/50">
          {[fmtMatchTime(fixture.date, locale), fixture.venue].filter(Boolean).join(' · ')}
        </span>
      </div>

      {p.result && (
        <span
          title={t(resultKey(p.result))}
          className={`ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-[15px] font-bold ${resultBg[p.result]} ${resultInk[p.result]}`}
        >
          {t(resultShortKey(p.result))}
        </span>
      )}
    </div>
  )
}

// A knockout tie on the Tables page: the round leads as a yellow eyebrow, since
// which stage it was is the thing you're scanning for.
export function TieRow({ fixture, round: stageRound }: { fixture: Fixture; round?: RoundRef }) {
  const { t } = useI18n()
  const roundLabel = useRoundLabel()
  const p = perspective(fixture)
  const round = roundLabel(stageRound ?? fixture)

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-white/10 border-l-[3px] bg-lfc-maroon px-3.5 py-3 ${edge(p.result)}`}
    >
      <div className="min-w-0 flex-1">
        {round && (
          <div className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-lfc-yellow">
            {round}
          </div>
        )}
        <div className="mt-1.5 truncate text-sm font-semibold">
          {p.atHome ? 'vs' : '@'} {p.opponent.name}
        </div>
      </div>
      <div className="shrink-0 font-display text-[30px] font-bold leading-[0.9]">{scoreline(p)}</div>
    </div>
  )
}
