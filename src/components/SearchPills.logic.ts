import type { LabelToken } from '@/components/SearchPillsItemLabel.vue'

export type FilterLabelItem = Record<string, unknown>

export type LabelByItemsOptions = {
  items?: object[]
  prop?: string
  max?: number
  op?: string
  translate?: boolean
  type?: string
  maxLength?: number
}

export type LabelByItemsResult = {
  tokens: LabelToken[]
  operatorKey: string
  hiddenCount: number
}

export type LabelByQsOptions = {
  q?: string | number | Array<string | number>
  max?: number
  translationKey?: string
  valuesParamKey?: string
  keepTailOnTruncate?: boolean
}

export type LabelByQsResult = {
  translationKey?: string
  params: {
    n: number
    values: string
    pages?: string
  }
  plural: number
  hiddenCount: number
  values: string
}

const isValidItem = (item: unknown): item is FilterLabelItem => {
  return item != null && typeof item === 'object'
}

export const labelByItems = ({
  items = [],
  prop = 'name',
  max = 1,
  op = 'AND',
  translate = false,
  type = 'label',
  maxLength = -1
}: LabelByItemsOptions = {}): LabelByItemsResult => {
  const validItems = items.filter(isValidItem)
  const tokens: LabelToken[] = validItems.slice(0, max).map(item => {
    const rawValue = (item as Record<string, unknown>)[prop]

    if (translate) {
      const fallback = rawValue == null || rawValue === '' ? '...' : String(rawValue)
      return {
        type: 'translation',
        translationKey: `buckets.${type}.${String(rawValue ?? '')}`,
        fallback
      }
    }

    if (rawValue == null || rawValue === '') {
      return {
        type: 'text',
        value: '...'
      }
    }

    const value = String(rawValue)
    const labelValue =
      maxLength < 0 ? value : value.length > maxLength ? `${value.slice(0, maxLength)}…` : value

    return {
      type: 'text',
      value: labelValue,
      html: prop === 'htmlExcerpt'
    }
  })

  return {
    tokens,
    operatorKey: `op.${op.toLowerCase()}`,
    hiddenCount: validItems.slice(max).length
  }
}

export const labelByQs = ({
  q,
  max = 3,
  translationKey,
  valuesParamKey = 'values',
  keepTailOnTruncate = true
}: LabelByQsOptions = {}): LabelByQsResult => {
  const qValues = Array.isArray(q) ? q : q != null ? [q] : []
  const normalizedMax = Math.max(1, max)
  const shouldCompressWithTail =
    keepTailOnTruncate && qValues.length > normalizedMax && normalizedMax >= 2
  const shownValues = shouldCompressWithTail
    ? [...qValues.slice(0, normalizedMax - 1), qValues[qValues.length - 1]]
    : qValues.slice(0, normalizedMax)
  const values = shouldCompressWithTail
    ? `${shownValues
        .slice(0, shownValues.length - 1)
        .map(value => String(value))
        .join(', ')} ... ${String(shownValues[shownValues.length - 1])}`
    : shownValues.map(value => String(value)).join(', ')
  const plural = qValues.length || 1
  const hiddenCount = Math.max(qValues.length - shownValues.length, 0)
  const params: LabelByQsResult['params'] = {
    n: plural,
    values
  }

  if (valuesParamKey === 'pages') {
    params.pages = values
  }

  return {
    translationKey,
    params,
    plural,
    hiddenCount,
    values
  }
}
