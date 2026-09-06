import { SectionTitle } from '../components/Card'
import Crest from '../components/Crest'
import Rings from '../components/Rings'
import type { AppData, ClubProfile, Kit } from '../data/types'
import { useI18n } from '../i18n/I18nContext'
import { fmtNumber } from '../lib/format'

const href = (url?: string) => (url ? (/^https?:\/\//.test(url) ? url : `https://${url}`) : undefined)

export default function Club({ data }: { data: AppData }) {
  const { t, locale, lang } = useI18n()
  const club = data.club

  if (!club) {
    return (
      <div>
        <h1 className="font-display text-3xl font-bold uppercase leading-none">{t('club.title')}</h1>
        <p className="mt-4 text-sm text-white/40">{t('club.unavailable')}</p>
      </div>
    )
  }

  // Formatted against the active language so 53715 doesn't render as a decimal.
  const capacity =
    club.capacity && Number.isFinite(Number(club.capacity))
      ? fmtNumber(Number(club.capacity), locale)
      : club.capacity

  const where = [club.location, club.country].filter(Boolean).join(', ')

  return (
    <div className="space-y-6">
      <Hero club={club} />

      {club.description && (
        <div>
          <p className="text-[13px] leading-relaxed text-white/70 text-pretty">{club.description}</p>
          {/* The provider ships 15 description languages but no Turkish one, so
              in Turkish this is English prose. Better to say so than to hide it. */}
          {lang !== 'en' && <p className="mt-1.5 text-[10px] text-white/30">{t('common.englishOnly')}</p>}
        </div>
      )}

      <section>
        <SectionTitle>{t('club.facts')}</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {club.formedYear && <BigFact value={club.formedYear} label={t('club.founded')} />}
          {capacity && <BigFact value={capacity} label={t('club.capacity')} />}
          {club.stadium && (
            <WideFact
              value={club.stadium}
              label={where ? `${t('club.stadium')} · ${where}` : t('club.stadium')}
            />
          )}
          {club.nicknames && <WideFact value={club.nicknames} label={t('club.nicknames')} />}
        </div>
      </section>

      {club.competitions && club.competitions.length > 0 && (
        <section>
          <SectionTitle>{t('club.competesIn')}</SectionTitle>
          <div className="flex flex-col gap-px overflow-hidden rounded-xl bg-white/[0.09]">
            {club.competitions.map((c) => (
              <div key={c} className="flex items-center gap-2.5 bg-lfc-maroon px-3.5 py-3 text-[13px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lfc-yellow" />
                {c}
              </div>
            ))}
          </div>
        </section>
      )}

      <Socials club={club} />
      <Fanart images={club.fanart} />
      <Kits kits={data.kits} />
    </div>
  )
}

function Hero({ club }: { club: ClubProfile }) {
  const { t } = useI18n()
  return (
    <section className="relative -mx-4 -mt-6 overflow-hidden border-b-2 border-lfc-yellow bg-gradient-to-br from-lfc-red via-lfc-red-dark to-lfc-maroon px-5 py-7 md:mx-0 md:mt-0 md:rounded-2xl md:border-b-0 md:border-l-2">
      {/* The club banner, when there is one, sits behind the gradient as texture
          rather than as its own band above the crest. */}
      {club.banner && (
        <img src={club.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      )}
      <Rings className="opacity-[0.12]" />

      <div className="relative flex items-center gap-4">
        {club.badge ? (
          <img
            src={club.badge}
            alt={t('a11y.crest', { name: club.name })}
            className="h-16 w-16 shrink-0 object-contain sm:h-[72px] sm:w-[72px]"
          />
        ) : (
          <Crest className="h-16 w-16 shrink-0 sm:h-[72px] sm:w-[72px]" />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[34px] font-bold uppercase leading-none tracking-[0.02em]">
            {club.name}
          </h1>
          {club.altName && <p className="mt-1.5 text-xs font-medium text-lfc-yellow">{club.altName}</p>}
          {(club.formedYear || club.location) && (
            <p className="mt-1 text-[11px] text-white/50">
              {[club.formedYear && `${t('club.founded')} ${club.formedYear}`, club.location]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function BigFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <div className="font-display text-[26px] font-bold leading-none text-lfc-yellow">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </div>
    </div>
  )
}

function WideFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.06] p-3">
      <div className="text-sm font-semibold leading-snug">{value}</div>
      <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </div>
    </div>
  )
}

function Socials({ club }: { club: ClubProfile }) {
  const { t } = useI18n()
  const links: [string, string | undefined][] = [
    ['Website', club.website],
    ['Instagram', club.instagram],
    ['Twitter / X', club.twitter],
    ['Facebook', club.facebook],
    ['YouTube', club.youtube],
  ]
  const present = links.filter(([, url]) => url)
  if (!present.length) return null

  return (
    <section>
      <SectionTitle>{t('club.officialLinks')}</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {present.map(([label, url]) => (
          <a
            key={label}
            href={href(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/[0.08] px-3.5 py-2 text-[11px] font-semibold transition hover:bg-lfc-yellow hover:text-lfc-maroon"
          >
            {label} ↗
          </a>
        ))}
      </div>
    </section>
  )
}

function Fanart({ images }: { images?: string[] }) {
  const { t } = useI18n()
  if (!images || !images.length) return null
  return (
    <section>
      <SectionTitle>{t('club.fanArt')}</SectionTitle>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="aspect-video w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </section>
  )
}

function Kits({ kits }: { kits: Kit[] }) {
  const { t } = useI18n()
  if (!kits.length) return null
  return (
    <section>
      <SectionTitle>{t('club.kits')}</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {kits.map((k) => (
          <div
            key={`${k.season}-${k.type}`}
            className="rounded-xl border border-white/10 bg-lfc-maroon p-3 text-center"
          >
            <img
              src={k.image}
              alt={t('a11y.kit', { season: k.season, type: k.type })}
              loading="lazy"
              className="mx-auto h-28 object-contain"
            />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/45">
              {k.season} · {k.type}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
