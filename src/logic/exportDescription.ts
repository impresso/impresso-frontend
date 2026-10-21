/**
 * Helpers to compose a human-readable description for a background job
 * (typically a CSV export) from the search filters that produced it.
 *
 * The goal is to avoid the misleading default ("All of Impresso") when we
 * actually have filters applied, and to produce a text description
 * synchronously at export time - so the description is guaranteed to be
 * accurate even if the on-screen `SearchQuerySummary` hasn't updated yet.
 */
import type { Filter } from '@/models'

type FilterLike = Pick<Filter, 'type' | 'q' | 'op' | 'precision' | 'context'>

const MAX_DESCRIPTION_LENGTH = 1000
const MAX_VALUES_PER_FILTER = 3

const FilterTypeLabels: Record<string, string> = {
  string: 'query',
  hasTextContents: 'has text',
  type: 'content type',
  isFront: 'front page',
  contentLength: 'content length',
  ocrQuality: 'OCR quality',
  source: 'source',
  sourceType: 'source type',
  sourceMedium: 'source medium',
  newspaper: 'newspaper',
  mediaSource: 'media source',
  partner: 'partner',
  daterange: 'date range',
  year: 'year',
  collection: 'collection',
  person: 'person',
  location: 'location',
  language: 'language',
  country: 'country',
  copyright: 'copyright',
  nag: 'named entity',
  organisation: 'organisation',
  page: 'page',
  textReuseCluster: 'text reuse cluster',
  textReuseClusterSize: 'text reuse cluster size',
  textReuseClusterLexicalOverlap: 'text reuse lexical overlap',
  textReuseClusterDayDelta: 'text reuse day delta',
  topic: 'topic',
  uid: 'item'
}

function toArray(value: unknown): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.map(v => String(v))
  return [String(value)]
}

function formatValues(values: string[]): string {
  if (values.length === 0) return ''
  if (values.length <= MAX_VALUES_PER_FILTER) return values.join(', ')
  return `${values.slice(0, MAX_VALUES_PER_FILTER).join(', ')} +${values.length - MAX_VALUES_PER_FILTER} more`
}

function describeFilter(filter: FilterLike): string {
  const label = FilterTypeLabels[filter.type] ?? filter.type
  const negated = filter.context === 'exclude'
  const prefix = negated ? `not ${label}` : label
  const values = toArray(filter.q)
  if (filter.type === 'daterange') {
    const [range] = values
    if (range && range.includes(' TO ')) {
      const [from, to] = range.split(' TO ').map(s => s.replace(/[[\]"']/g, '').trim())
      return `${prefix}: ${from} - ${to}`
    }
    return values.length ? `${prefix}: ${formatValues(values)}` : prefix
  }
  if (values.length === 0) return prefix
  return `${prefix}: ${formatValues(values)}`
}

export interface BuildExportDescriptionInput {
  filters?: FilterLike[]
  totalRows?: number
  selectedCount?: number
  groupBy?: string
  prefix?: string
}

/**
 * Compose a plain-text description for an export job.
 *
 * Examples:
 * - "Export of 12 selected items"
 * - "Search export - all published content (no filters)"
 * - "Search export - date range: 1926-01-01 - 1927-12-31; newspaper: GDL"
 */
export function buildExportDescription({
  filters = [],
  totalRows,
  selectedCount,
  groupBy = 'articles',
  prefix = 'Search export'
}: BuildExportDescriptionInput): string {
  const parts: string[] = []

  if (selectedCount && selectedCount > 0) {
    parts.push(`Export of ${selectedCount} selected ${groupBy}`)
  } else if (!filters.length) {
    parts.push(`${prefix} - all published content (no filters applied)`)
  } else {
    const descriptions = filters
      .filter(f => f && typeof f.type === 'string')
      .map(describeFilter)
      .filter(Boolean)
    parts.push(`${prefix} - ${descriptions.join('; ')}`)
  }

  if (typeof totalRows === 'number' && totalRows >= 0 && !selectedCount) {
    parts.push(`(${totalRows.toLocaleString()} ${groupBy})`)
  }

  return parts.join(' ').slice(0, MAX_DESCRIPTION_LENGTH)
}
