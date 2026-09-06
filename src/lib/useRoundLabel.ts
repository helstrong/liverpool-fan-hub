import { roundRef } from '../data/api'
import type { RoundRef } from '../data/api'
import type { Fixture } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import type { TranslationKey } from '../i18n/strings'

// Turns a fixture's round descriptor into wording in the active language.
// The data layer decides *which* round it is; this decides how to say it, so
// "Matchday 4" becomes "4. Hafta" without the grouping logic knowing about
// languages at all.
export function useRoundLabel() {
  const { t } = useI18n()

  return (source?: Fixture | RoundRef) => {
    if (!source) return undefined
    // Discriminated on `competition` rather than `id`, because a Fixture has an
    // id too — it just means something else.
    const ref: RoundRef | undefined = 'competition' in source ? roundRef(source) : source
    if (!ref) return undefined
    return t(`round.${ref.id}` as TranslationKey, { n: ref.n ?? '' }).trim()
  }
}
