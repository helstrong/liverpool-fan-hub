import { useI18n } from '../i18n/I18nContext'

export function LoadingView() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-white/50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-lfc-yellow" />
      <p className="text-sm">{t('status.loading')}</p>
    </div>
  )
}

export function ErrorView({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-semibold text-danger">{t('status.errorTitle')}</p>
      {message && <p className="max-w-md break-words text-xs text-white/45">{message}</p>}
      <button
        onClick={onRetry}
        className="rounded-lg bg-lfc-yellow px-4 py-2 text-sm font-semibold text-lfc-maroon transition hover:opacity-90"
      >
        {t('status.tryAgain')}
      </button>
    </div>
  )
}

export function WarningBanner({ warnings }: { warnings: string[] }) {
  const { t } = useI18n()
  if (!warnings.length) return null
  return (
    <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
      <p className="font-semibold">{t('status.warnings')}</p>
      <ul className="mt-1 list-inside list-disc">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  )
}
