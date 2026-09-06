import { useI18n } from '../i18n/I18nContext'

// Shown on every screen. The club's marks and data belong to Liverpool FC and
// the data providers; saying plainly that this isn't an official channel is the
// honest thing to do and keeps the project clearly a supporters' one.
export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="mx-auto max-w-5xl px-4 pb-8 pt-2">
      <p className="border-t border-white/[0.08] pt-4 text-center text-[11px] leading-relaxed text-white/35">
        {t('footer.fanProject')}
      </p>
    </footer>
  )
}
