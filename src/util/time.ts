/**
 * Format a date string as a human-readable relative time (e.g. "2 minutes ago", "last month").
 * Unit selection is automatic; phrasing is delegated entirely to Intl.RelativeTimeFormat.
 */
export function relativeTime(dateStr: string, locale = 'en'): string {
  const diff = (new Date(dateStr).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  const [value, unit]: [number, Intl.RelativeTimeFormatUnit] =
    abs < 60 ? [diff, 'second']
    : abs < 3600 ? [diff / 60, 'minute']
    : abs < 86400 ? [diff / 3600, 'hour']
    : abs < 86400 * 30 ? [diff / 86400, 'day']
    : abs < 86400 * 365 ? [diff / (86400 * 30), 'month']
    : [diff / (86400 * 365), 'year']
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(value), unit)
}
