import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LANGUAGES, localeOf, strings } from './strings'
import type { Lang, TranslationKey } from './strings'

const STORAGE_KEY = 'lfc-fan-hub:lang'

export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  /** BCP 47 tag for the active language — pass to toLocaleString and friends. */
  locale: string
  t: Translate
}

const I18nContext = createContext<I18nContextValue | null>(null)

// Picks the starting language: an explicit choice the user made previously
// wins, otherwise the browser/phone's own preference order decides. Matched
// against whatever LANGUAGES offers, so this needs no edit when one is added.
function detectLang(): Lang {
  const available = LANGUAGES.map((l) => l.code)

  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved && available.includes(saved)) return saved
  } catch {
    /* private mode — fall through to the browser preference */
  }

  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of preferences) {
    // Match on the primary subtag so "en-GB", "en-US" and plain "en" all count.
    const primary = tag?.toLowerCase().split('-')[0] as Lang | undefined
    if (primary && available.includes(primary)) return primary
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore quota / private-mode errors — the choice just won't persist */
    }
  }, [])

  // Keeps the document in step for screen readers, hyphenation and spellcheck.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nContextValue>(() => {
    const table = strings[lang]
    const t: Translate = (key, vars) => {
      const template = table[key] ?? strings.en[key] ?? key
      if (!vars) return template
      return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
        name in vars ? String(vars[name]) : whole,
      )
    }
    return { lang, setLang, locale: localeOf[lang], t }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>')
  return ctx
}
