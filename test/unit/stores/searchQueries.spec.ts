import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { SearchQueryHistoryLimit, useSearchQueriesStore } from '@/stores/searchQueries'

describe('useSearchQueriesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useRealTimers()
  })

  it('starts empty', () => {
    const store = useSearchQueriesStore()
    expect(store.entries).toEqual([])
    expect(store.all).toEqual([])
  })

  it('records a hash with timestamp and optional summary', () => {
    const store = useSearchQueriesStore()

    store.recordHash('abc', 'first query')

    expect(store.entries).toHaveLength(1)
    expect(store.entries[0].hash).toBe('abc')
    expect(store.entries[0].summary).toBe('first query')
    expect(typeof store.entries[0].timestamp).toBe('number')
  })

  it('ignores empty or whitespace hashes', () => {
    const store = useSearchQueriesStore()

    store.recordHash('   ')
    store.recordHash('')

    expect(store.entries).toHaveLength(0)
  })

  it('deduplicates by hash, updates timestamp, and moves item to top', () => {
    const store = useSearchQueriesStore()

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    store.recordHash('h1', 'one')

    vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'))
    store.recordHash('h2', 'two')

    vi.setSystemTime(new Date('2026-01-01T00:00:02.000Z'))
    store.recordHash('h1', 'one-updated')

    expect(store.entries).toHaveLength(2)
    expect(store.entries[0].hash).toBe('h1')
    expect(store.entries[0].summary).toBe('one-updated')
    expect(store.entries[0].timestamp).toBe(new Date('2026-01-01T00:00:02.000Z').getTime())
  })

  it('enforces SearchQueryHistoryLimit', () => {
    const store = useSearchQueriesStore()

    for (let i = 0; i < SearchQueryHistoryLimit + 3; i++) {
      store.recordHash(`h-${i}`)
    }

    expect(store.entries).toHaveLength(SearchQueryHistoryLimit)
    // newest stays first, oldest trimmed
    expect(store.entries[0].hash).toBe(`h-${SearchQueryHistoryLimit + 2}`)
  })

  it('finds entries by hash via getter', () => {
    const store = useSearchQueriesStore()
    store.recordHash('find-me', 'summary')

    expect(store.byHash('find-me')?.summary).toBe('summary')
    expect(store.byHash('missing')).toBeUndefined()
  })

  it('removes a hash', () => {
    const store = useSearchQueriesStore()
    store.recordHash('a')
    store.recordHash('b')

    store.removeHash('a')

    expect(store.entries.map(e => e.hash)).toEqual(['b'])
  })

  it('clears all entries', () => {
    const store = useSearchQueriesStore()
    store.recordHash('a')
    store.recordHash('b')

    store.clear()

    expect(store.entries).toEqual([])
  })
})
