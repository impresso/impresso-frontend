import { describe, test as it } from 'vitest'
import assert from 'assert'
import { optimizeFilters } from '../../../src/logic/filters'

type FilterLike = {
  type: string
  q: string | string[]
}

describe('optimizeFilters', () => {
  it('does not merge filters of different types', () => {
    const filters: FilterLike[] = [
      { type: 'string', q: 'foo' },
      { type: 'language', q: ['de'] },
      { type: 'newspaper', q: ['DTT', 'BOO'] }
    ]
    const optimizedFilters: FilterLike[] = [
      { type: 'string', q: 'foo' },
      { type: 'language', q: 'de' },
      { type: 'newspaper', q: ['DTT', 'BOO'] }
    ]

    assert.deepEqual(optimizeFilters(filters), optimizedFilters)
  })

  it('optimizes filters with single elements and default operators', () => {
    const filters: FilterLike[] = [
      { type: 'string', q: ['foo'] },
      { type: 'string', q: ['de'] }
    ]
    const optimizedFilters: FilterLike[] = [
      {
        q: 'foo',
        type: 'string'
      },
      {
        q: 'de',
        type: 'string'
      }
    ]

    assert.deepEqual(optimizeFilters(filters), optimizedFilters)
  })

  it('does not optimize filters with single elements and different operators', () => {
    const filters = [
      { type: 'string', q: ['foo'] },
      { type: 'string', q: ['de'], op: 'AND' }
    ]
    const optimizedFilters = [
      { type: 'string', q: 'foo' },
      { type: 'string', q: 'de', op: 'AND' }
    ]

    assert.deepEqual(optimizeFilters(filters), optimizedFilters)
  })
})
