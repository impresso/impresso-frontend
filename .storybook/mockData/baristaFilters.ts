import type { Filter } from '@/models'

export const MockBaristaSearchFilters: Filter[] = [
  { type: 'newspaper', q: 'luxwort', context: 'include', precision: 'exact', op: 'OR' }
]

export const MockBaristaSuggestedFilters: Filter[] = [
  ...MockBaristaSearchFilters,
  {
    type: 'person',
    q: ['2-50-Robert_Schumann'],
    context: 'include',
    precision: 'exact',
    op: 'AND'
  },
  { type: 'string', q: ['Schumann'], context: 'include', precision: 'exact', op: 'OR' }
]

export const MockBaristaFilterItemNames: Record<string, string> = {
  luxwort: 'Luxemburger Wort',
  '2-50-Robert_Schumann': 'Robert Schumann'
}

/**
 * Same shape as the `filters-items` service response, joined by `joinFiltersWithItems`
 */
export const MockBaristaSuggestedFiltersWithItems = MockBaristaSuggestedFilters.map(filter => ({
  ...filter,
  items: ([] as string[]).concat(filter.q as string | string[]).map(id => ({
    id,
    uid: id,
    name: MockBaristaFilterItemNames[id] ?? id,
    count: 0
  }))
}))
