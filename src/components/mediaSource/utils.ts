import { MediaSource } from '@/models/generated/canonical'

const Categories = [
  'identity',
  'temporal',
  'geo',
  'specs',
  'historiography',
  'production',
  'resourceHolder'
] as const

export type CategorizedProperties = Record<
  (typeof Categories)[number] | 'uncategorized',
  Record<string, string[]>
>

const propertiesByCategories: Record<(typeof Categories)[number], string[]> = {
  identity: [
    'longTitle',
    'variantTitle',
    'otherTitle',
    'subtitle',
    'partnerUid',
    'description',
    'bibRecText',
    'topics'
  ],
  temporal: ['firstPubYear', 'lastPubYear', 'periodicity', 'formerPeriodicity'],
  geo: ['publicationPlace', 'countryCode', 'provinceCode', 'localGeographicOutreach'],
  specs: ['ocr', 'olr', 'asrFormat', 'ocrFormat'],
  historiography: ['dhsLink', 'wikipedia', 'additionalSources', 'bibRecLink'],
  production: ['founder', 'publisher', 'editor', 'printer'],
  resourceHolder: [
    'institutionNames',
    'institutionLinks',
    'institutionLogos',
    'provenanceId',
    'permalink',
    'institutionPortal'
  ]
}

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const escapeHtmlAttribute = (value: string): string => {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

const isSafeHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const urlsToHtml = (text: string): string => {
  const urlRegex = /https?:\/\/[^\s<>"']+/gi
  let result = ''
  let lastIndex = 0

  for (const match of text.matchAll(urlRegex)) {
    if (match.index === undefined) {
      continue
    }

    const matchedUrl = match[0]
    result += escapeHtml(text.slice(lastIndex, match.index))

    if (isSafeHttpUrl(matchedUrl)) {
      result += `<a href="${escapeHtmlAttribute(matchedUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(matchedUrl)}</a>`
    } else {
      result += escapeHtml(matchedUrl)
    }

    lastIndex = match.index + matchedUrl.length
  }

  result += escapeHtml(text.slice(lastIndex))
  return result
}

export const getMappedProperties = (
  metadataProperties: MediaSource['properties']
): CategorizedProperties => {
  if (!Array.isArray(metadataProperties)) {
    return {} as CategorizedProperties
  }
  const categoryByProperty: Record<string, string> = Object.entries(propertiesByCategories).reduce(
    (acc, [key, propNames]: [string, string[]]) => {
      propNames.forEach(prop => {
        acc[prop] = key
      })
      return acc
    },
    {} as Record<string, string>
  )
  // fill the propertiesByCategories with the values from mediaSource.properties
  const mapped: CategorizedProperties = {} as CategorizedProperties
  metadataProperties.forEach(prop => {
    const category = categoryByProperty[prop.id] || 'uncategorized'
    if (!mapped[category]) {
      mapped[category] = {}
    }
    if (!mapped[category][prop.id]) {
      mapped[category][prop.id] = []
    }
    mapped[category][prop.id].push(urlsToHtml(prop.value))
  })
  return mapped
}

export const getNestedProperty = (obj: unknown, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') {
      return undefined
    }
    return (acc as Record<string, unknown>)[key]
  }, obj)
}
