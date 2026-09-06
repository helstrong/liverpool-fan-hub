import { Component } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Last-resort safety net: without this, any uncaught error during render
// (e.g. a stale-cache shape mismatch, or a bug in a new feature) unmounts the
// whole tree and leaves a blank white page with no clue why. This shows a
// recoverable message instead.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) return <CrashView />
    return this.props.children
  }
}

// Split out as a function component so the fallback can still be translated —
// a class can't use hooks. Safe because I18nProvider sits above this boundary,
// so its context is available even when everything below has failed.
function CrashView() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg font-bold text-white">{t('status.crashed')}</p>
      <p className="max-w-sm text-sm text-white/60">{t('status.crashedHelp')}</p>
      <button
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
        className="rounded-lg bg-lfc-yellow px-4 py-2 text-sm font-semibold text-lfc-maroon transition hover:opacity-90"
      >
        {t('status.reload')}
      </button>
    </div>
  )
}
