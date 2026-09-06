// Every formatter takes an explicit locale rather than reading the ambient one,
// so dates and numbers follow the language the user picked in the app instead of
// whatever their device happens to be set to. Timezone is deliberately NOT
// pinned — that always follows the device, so kick-off times are local wherever
// the viewer is (see toUtcIso in data/theSportsDb.ts).

export const fmtDate = (iso: string, locale = 'en-GB') =>
  new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' })

export const fmtDateTime = (iso: string, locale = 'en-GB') =>
  new Date(iso).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

// "Sun 30 Aug · 19:00" — the matchday stamp used on fixture cards and the
// countdown hero. Built from two calls rather than one because toLocaleString
// puts a comma between the date and the time that the design separates with a
// middot instead.
export const fmtMatchTime = (iso: string, locale = 'en-GB') => {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return ''
  const day = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

export const fmtNumber = (n: number, locale = 'en-GB') => n.toLocaleString(locale)

// League position is shown as "2nd" rather than "#2", so it needs an ordinal
// suffix. Turkish marks ordinals with a full stop instead ("2."), which is why
// this is locale-aware rather than a fixed English table.
export const ordinal = (n: number, locale = 'en-GB') => {
  if (locale.startsWith('tr')) return '.'
  const rem100 = n % 100
  if (rem100 >= 11 && rem100 <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
}
