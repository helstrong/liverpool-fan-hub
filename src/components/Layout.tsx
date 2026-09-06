import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import Crest from './Crest'
import Footer from './Footer'
import Icon from './Icon'
import LanguageToggle from './LanguageToggle'
import { useI18n } from '../i18n/I18nContext'
import type { TranslationKey } from '../i18n/strings'

const nav: { to: string; label: TranslationKey; icon: string; end: boolean }[] = [
  { to: '/', label: 'nav.home', icon: 'home', end: true },
  { to: '/fixtures', label: 'nav.fixtures', icon: 'fixtures', end: false },
  { to: '/standings', label: 'nav.table', icon: 'standings', end: false },
  { to: '/squad', label: 'nav.squad', icon: 'squad', end: false },
  { to: '/club', label: 'nav.club', icon: 'club', end: false },
  { to: '/news', label: 'nav.news', icon: 'news', end: false },
]

interface LayoutProps {
  children: ReactNode
  live?: boolean
  onRefresh?: () => void
  refreshing?: boolean
  badge?: string
}

export default function Layout({ children, live = false, onRefresh, refreshing = false, badge }: LayoutProps) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Installed on iOS the status bar is translucent over the page, so the
          header carries its inset as extra top padding. */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-lfc-maroon-dark/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3">
          {/* The crest and wordmark are the usual way back to the dashboard. */}
          <NavLink to="/" end className="flex shrink-0 items-center gap-2.5" aria-label={t('nav.home')}>
            {badge ? (
              <img src={badge} alt={t('a11y.crest', { name: 'Liverpool' })} className="h-7 w-7 shrink-0 object-contain" />
            ) : (
              <Crest className="h-7 w-7 shrink-0" />
            )}
            <span className="font-display text-[15px] font-semibold uppercase tracking-[0.14em]">
              Fan Hub
            </span>
          </NavLink>

          <div className="ml-auto flex items-center gap-2">
            <nav className="hidden gap-1 md:flex">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive ? 'bg-lfc-yellow text-lfc-maroon' : 'text-white/70 hover:bg-white/10'
                    }`
                  }
                >
                  {t(n.label)}
                </NavLink>
              ))}
            </nav>

            <LanguageToggle />

            {/* Whether the numbers on screen came from the live provider or the
                bundled sample set — worth stating plainly, not just implying. */}
            <span
              className={`hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] sm:flex ${
                live ? 'text-lfc-yellow' : 'text-white/45'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-lfc-yellow' : 'bg-white/40'}`} />
              {live ? t('chrome.live') : t('chrome.sample')}
            </span>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title={t('chrome.refresh')}
                aria-label={t('chrome.refresh')}
                className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-white/[0.08] text-white/75 transition hover:bg-white/[0.16] disabled:opacity-50"
              >
                <svg
                  className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 11-3-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <Footer />

      {/* Fixed to the viewport rather than the body, so it needs its own
          horizontal insets as well as clearance for the home indicator. */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/10 bg-lfc-maroon-deep/95 pb-[calc(0.375rem+env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur-md md:hidden">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 pb-1.5 pt-2.5 text-[10px] font-semibold ${
                isActive ? 'text-lfc-yellow' : 'text-white/45'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={n.icon} className="h-[19px] w-[19px]" />
                <span className="max-w-full truncate px-0.5">{t(n.label)}</span>
                <span
                  className={`h-0.5 w-[18px] rounded-full ${isActive ? 'bg-lfc-yellow' : 'bg-transparent'}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
