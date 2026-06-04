import { describe, expect, it } from 'vitest'
import { labelByItems, labelByQs } from './SearchPills.logic'

describe('labelByItems', () => {
  it('keeps only object items and computes hidden count', () => {
    const result = labelByItems({
      items: [null, { name: 'alpha' }, 'bad', { name: 'beta' }] as never[],
      max: 1
    })

    expect(result.tokens).toEqual([{ type: 'text', value: 'alpha', html: false }])
    expect(result.operatorKey).toBe('op.or')
    expect(result.hiddenCount).toBe(1)
  })

  it('builds translation tokens and fallback when value is empty', () => {
    const result = labelByItems({
      items: [{ id: '' }, { id: 'fr' }],
      prop: 'id',
      max: 2,
      translate: true,
      type: 'language',
      op: 'AND'
    })

    expect(result.tokens).toEqual([
      {
        type: 'translation',
        translationKey: 'buckets.language.',
        fallback: '...'
      },
      {
        type: 'translation',
        translationKey: 'buckets.language.fr',
        fallback: 'fr'
      }
    ])
    expect(result.operatorKey).toBe('op.and')
  })

  it('marks html excerpts and truncates long values', () => {
    const result = labelByItems({
      items: [{ htmlExcerpt: '<b>abcdefghijklmnopqrstuvwxyz</b>' }],
      prop: 'htmlExcerpt',
      maxLength: 5
    })

    expect(result.tokens).toEqual([
      {
        type: 'text',
        value: '<b>ab…',
        html: true
      }
    ])
  })
})

describe('labelByQs', () => {
  it('handles scalar q values', () => {
    const result = labelByQs({ q: 1918 })

    expect(result.values).toBe('1918')
    expect(result.params).toEqual({ n: 1, values: '1918' })
    expect(result.hiddenCount).toBe(0)
  })

  it('keeps first values and tail when truncation with tail is enabled', () => {
    const result = labelByQs({ q: [1, 2, 3, 4, 5], max: 3, keepTailOnTruncate: true })

    expect(result.values).toBe('1, 2 ... 5')
    expect(result.plural).toBe(5)
    expect(result.hiddenCount).toBe(2)
  })

  it('disables tail compression when configured', () => {
    const result = labelByQs({ q: [1, 2, 3, 4, 5], max: 3, keepTailOnTruncate: false })

    expect(result.values).toBe('1, 2, 3')
    expect(result.hiddenCount).toBe(2)
  })

  it('normalizes max to at least 1 and maps pages param', () => {
    const result = labelByQs({
      q: ['12', '34'],
      max: 0,
      translationKey: 'pps',
      valuesParamKey: 'pages'
    })

    expect(result.translationKey).toBe('pps')
    expect(result.values).toBe('12')
    expect(result.params).toEqual({ n: 2, values: '12', pages: '12' })
    expect(result.hiddenCount).toBe(1)
  })
})
