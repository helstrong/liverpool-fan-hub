import { useI18n } from '../i18n/I18nContext'
import { LANGUAGES } from '../i18n/strings'

// A segmented toggle rather than a dropdown: every option stays visible, so it
// reads as a switch rather than something you have to open to discover. The
// starting language comes from the browser (see detectLang); this is the
// manual override. Hidden entirely while only one language ships.
export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n()

  // A switch with one option is just decoration — render nothing until there
  // is genuinely a choice to make.
  if (LANGUAGES.length < 2) return null

  return (
    <div
      role="group"
      aria-label={t('chrome.language')}
      className="flex shrink-0 items-center gap-0.5 rounded-[9px] bg-white/[0.08] p-0.5"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-[7px] px-1.5 py-1 text-[10px] font-bold tracking-wide transition ${
            lang === code ? 'bg-lfc-yellow text-lfc-maroon' : 'text-white/60 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
