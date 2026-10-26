import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App } from 'vue'
import { createMemoryHistory, createRouter, type LocationQueryRaw } from 'vue-router'
import TopicDetailPage from './TopicDetailPage.vue'
import { deserializeFilters, serializeFilters } from '@/logic/filters'
import FilterFactory from '@/models/FilterFactory'

const { getTopic, getFacet, findContentItems } = vi.hoisted(() => ({
  getTopic: vi.fn(),
  getFacet: vi.fn(),
  findContentItems: vi.fn()
}))
vi.mock('@/services', () => ({
  topics: { get: getTopic },
  searchFacets: { get: getFacet },
  contentItems: { find: findContentItems }
}))
vi.mock('@/components/modules/lists/ContentItem.vue', () => ({
  default: { name: 'ContentItem', props: ['contentItem'], template: '<div />' }
}))
vi.mock('@/components/modules/vis/StackedBarsPanel.vue', () => ({
  default: { name: 'StackedBarsPanel', props: ['buckets', 'facetType'], template: '<div />' }
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}
function topic(id = 'topic-1') {
  return {
    id,
    label: `Label ${id}`,
    language: 'en',
    words: [{ w: 'train', p: 0.8 }],
    contentItemsCount: 42
  }
}
function contentItems(offset = 0, total = 42) {
  return {
    data: [{ id: `item-${offset}`, text: { title: 'Canonical title' } }],
    pagination: { offset, limit: 10, total }
  }
}

async function mountPage(
  query: LocationQueryRaw = {},
  props: Record<string, unknown> = {},
  id = 'topic-1'
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/topics', name: 'topics', component: { template: '<div />' } },
      {
        path: '/topics/:topic_id?',
        name: 'topic',
        component: TopicDetailPage,
        meta: { requiresAuth: false }
      },
      { path: '/search', name: 'search', component: { template: '<div />' } }
    ]
  })
  await router.push({ name: 'topic', params: { topic_id: id }, query })
  const wrapper = shallowMount(TopicDetailPage, {
    props: { facetTypes: ['country'], ...props },
    global: {
      plugins: [
        router,
        (app: App) => {
          Object.assign(app.config.globalProperties, {
            $t: (key: string) => key,
            $n: String,
            $d: String
          })
        }
      ],
      renderStubDefaultSlot: true,
      stubs: {
        'i-layout-section': { template: '<div><slot name="header" /><slot /></div>' },
        'b-navbar': { template: '<div><slot /></div>' },
        'b-button': {
          props: ['disabled'],
          template: '<button :disabled="disabled"><slot /></button>'
        },
        'i-dropdown': { name: 'IDropdown', props: ['modelValue', 'options'], template: '<div />' },
        SearchFacetTimeline: {
          name: 'SearchFacetTimeline',
          props: ['facetType', 'searchIndex', 'title', 'height', 'filters'],
          template: '<div />'
        },
        RouterLink: false
      }
    }
  })
  return { wrapper, router }
}
const mounted: Awaited<ReturnType<typeof mountPage>>[] = []
async function setup(
  query: LocationQueryRaw = {},
  props: Record<string, unknown> = {},
  id = 'topic-1'
) {
  const result = await mountPage(query, props, id)
  mounted.push(result)
  return result
}
beforeEach(() => {
  vi.resetAllMocks()
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    clear: () => storage.clear()
  })
  localStorage.clear()
  getTopic.mockImplementation(id => Promise.resolve(topic(id)))
  getFacet.mockImplementation(type =>
    Promise.resolve({
      type,
      buckets: type === 'year' ? [{ value: '1900', count: 3 }] : []
    })
  )
  findContentItems.mockImplementation(({ query }) => Promise.resolve(contentItems(query.offset)))
})
afterEach(() => {
  mounted.splice(0).forEach(({ wrapper }) => wrapper.unmount())
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('TopicDetailPage', () => {
  it('shows loading and disables topic actions until the topic is available', async () => {
    const pending = deferred<ReturnType<typeof topic>>()
    getTopic.mockReturnValueOnce(pending.promise)
    const { wrapper } = await setup()
    expect(wrapper.findComponent({ name: 'LoadingBlock' }).exists()).toBe(true)
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(getFacet).not.toHaveBeenCalled()
    pending.resolve(topic())
    await flushPromises()
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.findComponent({ name: 'TopicItem' }).props('showLink')).toBe(false)
  })

  it.each([undefined, 'overview', 'invalid'])('loads the overview for tab=%s', async tab => {
    const { wrapper } = await setup({ tab })
    await flushPromises()
    expect(getTopic).toHaveBeenCalledExactlyOnceWith('topic-1')
    expect(getFacet).toHaveBeenCalledWith('country', {
      query: { filters: [{ type: 'topic', q: ['topic-1'] }] }
    })
    expect(wrapper.findComponent({ name: 'TopicWord' }).props('item').w).toBe('train')
    expect(wrapper.findComponent({ name: 'SearchFacetTimeline' }).props()).toMatchObject({
      facetType: 'year',
      searchIndex: 'search',
      filters: [{ type: 'topic', q: 'topic-1' }]
    })
    expect(findContentItems).not.toHaveBeenCalled()
  })

  it('preserves unrelated query parameters across tabs without refetching the topic', async () => {
    const { wrapper, router } = await setup({ sq: 'existing-query', q: 'train' })
    await flushPromises()
    const articlesLink = wrapper.findAll('a').find(link => link.text() === 'tabs.relatedArticles')!
    await articlesLink.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toMatchObject({
      sq: 'existing-query',
      q: 'train',
      tab: 'articles'
    })
    expect(getTopic).toHaveBeenCalledTimes(1)
    expect(findContentItems).toHaveBeenCalledTimes(1)
    await router.push({ query: { ...router.currentRoute.value.query, unrelated: 'value' } })
    await flushPromises()
    expect(getTopic).toHaveBeenCalledTimes(1)
    expect(findContentItems).toHaveBeenCalledTimes(1)
  })

  it('renders canonical content items and reads pagination totals', async () => {
    const { wrapper } = await setup({ tab: 'articles' })
    await flushPromises()
    expect(findContentItems).toHaveBeenCalledExactlyOnceWith({
      query: {
        filters: [{ type: 'topic', q: ['topic-1'] }],
        limit: 10,
        offset: 0,
        order_by: '-topicRelevance'
      }
    })
    expect(wrapper.findComponent({ name: 'ContentItem' }).props('contentItem')).toEqual(
      contentItems().data[0]
    )
    expect(wrapper.findComponent({ name: 'Pagination' }).props()).toMatchObject({
      currentPage: 1,
      totalRows: 42,
      perPage: 10
    })
    expect(getFacet).not.toHaveBeenCalled()
  })

  it('paginates and resets to page one on ordering changes without duplicate requests', async () => {
    const { wrapper } = await setup({ tab: 'articles' })
    await flushPromises()
    wrapper.findComponent({ name: 'Pagination' }).vm.$emit('change', 3)
    await flushPromises()
    expect(findContentItems).toHaveBeenCalledTimes(2)
    expect(findContentItems.mock.calls[1][0].query.offset).toBe(20)
    expect(wrapper.findComponent({ name: 'Pagination' }).props('currentPage')).toBe(3)
    wrapper.findComponent({ name: 'IDropdown' }).vm.$emit('update:modelValue', 'date')
    await flushPromises()
    expect(findContentItems).toHaveBeenCalledTimes(3)
    expect(findContentItems.mock.calls[2][0].query).toMatchObject({ offset: 0, order_by: 'date' })
    expect(wrapper.findComponent({ name: 'Pagination' }).props('currentPage')).toBe(1)
    expect(getTopic).toHaveBeenCalledTimes(1)
  })

  it('uses the returned offset to synchronize the displayed page', async () => {
    findContentItems.mockResolvedValueOnce(contentItems(20))
    const { wrapper } = await setup({ tab: 'articles' })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'Pagination' }).props('currentPage')).toBe(3)
  })

  it('resets pagination when navigating to a different topic', async () => {
    const { wrapper, router } = await setup({ tab: 'articles' })
    await flushPromises()
    wrapper.findComponent({ name: 'Pagination' }).vm.$emit('change', 3)
    await flushPromises()
    await router.push({
      name: 'topic',
      params: { topic_id: 'topic-2' },
      query: { tab: 'articles' }
    })
    await flushPromises()
    expect(findContentItems).toHaveBeenCalledTimes(3)
    expect(findContentItems.mock.calls[2][0].query).toMatchObject({
      offset: 0,
      filters: [{ type: 'topic', q: ['topic-2'] }]
    })
    expect(wrapper.findComponent({ name: 'Pagination' }).props('currentPage')).toBe(1)
  })

  it('ignores stale topic responses during quick navigation', async () => {
    const pending = deferred<ReturnType<typeof topic>>()
    getTopic.mockReturnValueOnce(pending.promise)
    const { wrapper, router } = await setup()
    await router.push({ name: 'topic', params: { topic_id: 'topic-2' } })
    await flushPromises()
    pending.resolve(topic('topic-1'))
    await flushPromises()
    expect(wrapper.findComponent({ name: 'TopicItem' }).props('topic').id).toBe('topic-2')
    expect(
      getFacet.mock.calls.every(([, params]) => params.query.filters[0].q[0] === 'topic-2')
    ).toBe(true)
  })

  it('ignores stale article responses belonging to the previous topic', async () => {
    const pending = deferred<ReturnType<typeof contentItems>>()
    findContentItems.mockReturnValueOnce(pending.promise)
    const { wrapper, router } = await setup({ tab: 'articles' })
    await flushPromises()
    await router.push({
      name: 'topic',
      params: { topic_id: 'topic-2' },
      query: { tab: 'articles' }
    })
    await flushPromises()
    pending.resolve(contentItems(90, 999))
    await flushPromises()
    expect(wrapper.findComponent({ name: 'ContentItem' }).props('contentItem').id).toBe('item-0')
    expect(wrapper.findComponent({ name: 'Pagination' }).props('totalRows')).toBe(42)
  })

  it('ignores overview responses after switching tabs', async () => {
    const pending = deferred<{ type: string; buckets: [] }>()
    getFacet.mockReturnValue(pending.promise)
    const { wrapper, router } = await setup()
    await flushPromises()
    await router.push({ query: { tab: 'articles' } })
    await flushPromises()
    pending.reject(new Error('Old overview error'))
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'ContentItem' }).exists()).toBe(true)
  })

  it('shows a topic error and clears loading when the topic cannot be loaded', async () => {
    getTopic.mockRejectedValueOnce(new Error('Not found'))
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('topicLoadError')
    expect(wrapper.findComponent({ name: 'LoadingBlock' }).exists()).toBe(false)
    expect(getFacet).not.toHaveBeenCalled()
  })

  it('handles a missing topic ID without requesting an invalid topic', async () => {
    const { wrapper } = await setup({}, {}, '')
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('topicLoadError')
    expect(getTopic).not.toHaveBeenCalled()
  })

  it('does not enable topic actions for an invalid topic payload', async () => {
    getTopic.mockResolvedValueOnce({})
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('topicLoadError')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(getFacet).not.toHaveBeenCalled()
  })

  it.each(['overview', 'articles'])('clears loading and shows errors for the %s tab', async tab => {
    if (tab === 'overview') getFacet.mockRejectedValue(new Error('Failed'))
    else findContentItems.mockRejectedValue(new Error('Failed'))
    const { wrapper } = await setup({ tab })
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe(
      tab === 'overview' ? 'overviewLoadError' : 'articlesLoadError'
    )
    expect(wrapper.findComponent({ name: 'LoadingBlock' }).exists()).toBe(false)
  })

  it('renders empty overview and article states', async () => {
    getTopic.mockResolvedValueOnce({ id: 'topic-1' })
    getFacet.mockResolvedValue({ buckets: [] })
    findContentItems.mockResolvedValue({ data: [], pagination: { offset: 0, limit: 10, total: 0 } })
    const { wrapper, router } = await setup({}, { facetTypes: [] })
    await flushPromises()
    expect(wrapper.text()).toContain('noWords')
    expect(wrapper.text()).toContain('noTimeline')
    expect(wrapper.text()).toContain('noFacets')
    await router.push({ query: { tab: 'articles' } })
    await flushPromises()
    expect(wrapper.text()).toContain('noArticles')
    expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(false)
  })

  it('preserves current filters, prevents duplicate topic filters, and builds a serialized search link', async () => {
    const existing = [
      FilterFactory.create({ type: 'language', q: ['en'] }),
      FilterFactory.create({ type: 'topic', q: ['topic-1'] })
    ]
    const { wrapper, router } = await setup({ sq: serializeFilters(existing), tab: 'articles' })
    await flushPromises()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    const filters = deserializeFilters(router.currentRoute.value.query.sq as string)
    expect(filters.filter(filter => filter.type === 'topic')).toHaveLength(1)
    expect(filters.find(filter => filter.type === 'language')?.q).toBe('en')
    expect(getTopic).toHaveBeenCalledTimes(1)
    expect(findContentItems).toHaveBeenCalledTimes(1)
    const searchLink = wrapper.findAll('a').find(link => link.text() === 'actions.searchMore')!
    const target = new URL(searchLink.attributes('href'), 'http://localhost')
    expect(target.pathname).toBe('/search')
    const searchFilters = deserializeFilters(target.searchParams.get('sq')!)
    expect(searchFilters).toHaveLength(1)
    expect(searchFilters[0].q).toBe('topic-1')
  })
})
