import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchQuerySummary from './SearchQuerySummary.vue'
import FilterFactory from '@/models/FilterFactory'

describe('SearchQuerySummary', () => {
  it('summarizes embedding filters as a similarity search without exposing the embedding', () => {
    const wrapper = mount(SearchQuerySummary, {
      props: {
        searchQuery: {
          filters: [FilterFactory.create({ type: 'embedding', q: ['private-embedding-value'] })]
        }
      },
      global: {
        stubs: { FilterLabel: true },
        mocks: {
          $t: (key: string) =>
            key === 'similarity' ? 'Retrieved by semantic similarity' : key
        }
      }
    })

    expect(wrapper.get('[data-testid="embedding-similarity-summary"]').text()).toBe(
      'Retrieved by semantic similarity'
    )
    expect(wrapper.text()).not.toContain('private-embedding-value')
  })
})
