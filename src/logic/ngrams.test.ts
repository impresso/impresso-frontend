import { describe, expect, it } from 'vitest'
import { findIdenticalTrends } from './ngrams'

describe('findIdenticalTrends', () => {
  it('groups terms with identical non-zero values', () => {
    const trends = [
      { ngram: 'München', values: [1, 0, 2] },
      { ngram: 'munchen', values: [1, 0, 2] },
      { ngram: 'Berlin', values: [3, 1, 2] }
    ]
    expect(findIdenticalTrends(trends)).toEqual([['München', 'munchen']])
  })

  it('ignores terms without matches', () => {
    const trends = [
      { ngram: 'foo', values: [0, 0] },
      { ngram: 'bar', values: [0, 0] }
    ]
    expect(findIdenticalTrends(trends)).toEqual([])
  })

  it('returns separate groups', () => {
    const trends = [
      { ngram: 'a', values: [1] },
      { ngram: 'A', values: [1] },
      { ngram: 'b', values: [2] },
      { ngram: 'B', values: [2] }
    ]
    expect(findIdenticalTrends(trends)).toEqual([
      ['a', 'A'],
      ['b', 'B']
    ])
  })

  it('does not group a repeated term with itself', () => {
    const trends = [
      { ngram: 'a', values: [1] },
      { ngram: 'a', values: [1] }
    ]
    expect(findIdenticalTrends(trends)).toEqual([])
  })
})
