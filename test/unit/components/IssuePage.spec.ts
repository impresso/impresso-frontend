import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { defineComponent, reactive } from 'vue'
import IssuePage from '@/pages/IssuePage.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary.vue'

const service = vi.hoisted(() => ({ path: 'content-items', find: vi.fn() }))
vi.mock('@/services', () => ({ contentItems: service }))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => route
}))

const route = reactive({ name: 'issuePageOverview', params: { issue_id: 'issue-1' } })
const overview = defineComponent({
  props: ['item', 'listFilters'],
  template: '<div />'
})

describe('IssuePage content items', () => {
  beforeEach(() => {
    route.params.issue_id = 'issue-1'
    route.name = 'issuePageOverview'
    service.find.mockReset().mockImplementation(({ query }) =>
      Promise.resolve({
        data: [{ id: `${query.filters[0].q}-i0001` }],
        pagination: { total: 1, offset: query.offset, limit: query.limit }
      })
    )
  })

  it('loads items for the current issue and reloads when the issue changes', async () => {
    const wrapper = shallowMount(IssuePage, {
      global: {
        mocks: { $t: (key: string) => key, $n: (number: number) => String(number) },
        stubs: {
          'i-layout': { template: '<div><slot /></div>' },
          'i-layout-section': { template: '<section><slot name="header" /><slot /></section>' },
          'b-navbar': { template: '<nav><slot /></nav>' },
          'b-navbar-nav': { template: '<nav><slot /></nav>' },
          RouterView: {
            setup: () => ({ overview }),
            template: '<slot :Component="overview" />'
          },
          ListOfFindResponseItems: false,
          List: { template: '<div><slot name="header" /><slot /></div>' }
        }
      }
    })
    await flushPromises()

    expect(service.find).toHaveBeenLastCalledWith({
      query: {
        limit: 10,
        offset: 0,
        filters: [{ type: 'issue', q: 'issue-1' }],
        order_by: 'id'
      }
    })
    expect(wrapper.getComponent(ContentItem).props('contentItem').id).toBe('issue-1-i0001')
    expect(wrapper.get('h3').text()).toBe('issue-1')
    expect(wrapper.getComponent(overview).props()).toEqual({
      item: { id: 'issue-1' },
      listFilters: [{ type: 'issue', q: 'issue-1' }]
    })
    expect(wrapper.getComponent(SearchResultsSummary).props()).toMatchObject({
      totalRows: 1,
      isLoading: false,
      groupBy: 'articles',
      searchQuery: {
        filters: [{ type: 'issue', q: 'issue-1', items: [{ id: 'issue-1', label: 'issue-1' }] }]
      }
    })

    route.params.issue_id = 'issue-2'
    await flushPromises()

    expect(service.find).toHaveBeenCalledTimes(2)
    expect(service.find).toHaveBeenLastCalledWith({
      query: {
        limit: 10,
        offset: 0,
        filters: [{ type: 'issue', q: 'issue-2' }],
        order_by: 'id'
      }
    })
    expect(wrapper.getComponent(ContentItem).props('contentItem').id).toBe('issue-2-i0001')
    expect(wrapper.get('h3').text()).toBe('issue-2')
    expect(wrapper.getComponent(overview).props()).toEqual({
      item: { id: 'issue-2' },
      listFilters: [{ type: 'issue', q: 'issue-2' }]
    })
    expect(wrapper.getComponent(SearchResultsSummary).props('searchQuery').filters[0]).toMatchObject({
      q: 'issue-2',
      items: [{ id: 'issue-2', label: 'issue-2' }]
    })

    route.params.issue_id = ''
    await flushPromises()
    expect(wrapper.findComponent(ListOfFindResponseItems).exists()).toBe(false)
    expect(service.find).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('displays the issue in the search summary without an unsupported selector', () => {
    const wrapper = shallowMount(SearchQuerySummary, {
      props: {
        searchQuery: {
          filters: [{ type: 'issue', q: 'issue-1', items: [{ id: 'issue-1', label: 'issue-1' }] }]
        }
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { FilterLabel: false }
      }
    })

    expect(wrapper.text()).toContain('include.issue')
    expect(wrapper.text()).toContain('issue-1')
    expect(wrapper.findComponent({ name: 'ItemSelector' }).exists()).toBe(false)
    wrapper.unmount()
  })
})
