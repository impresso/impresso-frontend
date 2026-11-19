import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddContentItemToSearch from './AddContentItemToSearch.vue'
import type { AddContentItemToSearchProps } from './AddContentItemToSearch.vue'
import FilterFactory from '@/models/FilterFactory'
import { deserializeFilters, serializeFilters } from '@/logic/filters'
import { useSearchQueriesStore } from '@/stores/searchQueries'

const { getContentItem } = vi.hoisted(() => ({ getContentItem: vi.fn() }))

vi.mock('@/services', () => ({
  contentItems: { get: getContentItem }
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(res => {
    resolve = res
  })
  return { promise, resolve }
}

function render(props: Partial<AddContentItemToSearchProps> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/content-item', name: 'contentItem', component: { template: '<div />' } },
      { path: '/search', name: 'search', component: { template: '<div />' } }
    ]
  })

  return {
    router,
    wrapper: mount(AddContentItemToSearch, {
      props: { contentItemId: 'content-item-1', ...props },
      global: {
        plugins: [router],
        stubs: {
          teleport: true,
          Modal: {
            props: ['show'],
            template:
              '<div v-if="show"><slot /><slot name="modal-footer" :close="() => {}" /></div>'
          }
        },
        mocks: { $t: (key: string) => key }
      }
    })
  }
}

describe('AddContentItemToSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getContentItem.mockReset()
  })

  it('shows progress, fetches the embedding, and adds its filter to the current search', async () => {
    const pendingContentItem = deferred<any>()
    getContentItem.mockReturnValue(pendingContentItem.promise)
    const searchQueriesStore = useSearchQueriesStore()
    searchQueriesStore.recordHash(
      serializeFilters([
        FilterFactory.create({ type: 'year', q: ['1900'] }),
        FilterFactory.create({ type: 'embedding', q: ['previous-item-embedding'] })
      ])
    )
    const { router, wrapper } = render()

    await router.push({ name: 'contentItem' })
    await router.isReady()
    await wrapper.get('[data-testid="add-content-item-to-search-button"]').trigger('click')

    expect(getContentItem).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="embedding-generation-message"]').text()).toBe(
      'confirmAddToSearch'
    )

    await wrapper
      .get('[data-testid="confirm-add-content-item-to-search-button"]')
      .trigger('click')

    expect(wrapper.get('[data-testid="embedding-generation-message"]').text()).toBe(
      'generatingSearchFilter'
    )
    expect(getContentItem).toHaveBeenCalledWith('content-item-1', {
      query: { include_embeddings: true }
    })

    pendingContentItem.resolve({ semanticEnrichments: { embeddings: ['item-embedding'] } })
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    const filters = deserializeFilters(router.currentRoute.value.query.sq as string)
    expect(filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'year', q: '1900' }),
        expect.objectContaining({ type: 'embedding', q: 'item-embedding' })
      ])
    )
    expect(filters).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'embedding', q: 'previous-item-embedding' })])
    )
    expect(wrapper.find('[data-testid="embedding-generation-message"]').exists()).toBe(false)
  })

  it('keeps the modal open and reports an unavailable embedding', async () => {
    getContentItem.mockResolvedValue({ semanticEnrichments: { embeddings: [] } })
    const { wrapper } = render()

    await wrapper.get('[data-testid="add-content-item-to-search-button"]').trigger('click')
    await wrapper
      .get('[data-testid="confirm-add-content-item-to-search-button"]')
      .trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).toContain('No semantic embedding is available'))

    expect(wrapper.find('[data-testid="embedding-generation-message"]').exists()).toBe(false)
  })

  it('uses the supplied embedding and merges additional filters with the current search', async () => {
    useSearchQueriesStore().recordHash(
      serializeFilters([
        FilterFactory.create({ type: 'year', q: ['1900'] }),
        FilterFactory.create({ type: 'embedding', q: ['previous-item-embedding'] })
      ])
    )
    const additionalFilters = [FilterFactory.create({ type: 'mediaSource', q: ['newspaper-1'] })]
    const { router, wrapper } = render({ embedding: 'provided-embedding', additionalFilters })

    await router.push({ name: 'contentItem' })
    await router.isReady()
    await wrapper.get('[data-testid="add-content-item-to-search-button"]').trigger('click')
    await wrapper
      .get('[data-testid="confirm-add-content-item-to-search-button"]')
      .trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    expect(getContentItem).not.toHaveBeenCalled()
    const filters = deserializeFilters(router.currentRoute.value.query.sq as string)
    expect(filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'year', q: '1900' }),
        expect.objectContaining({ type: 'mediaSource', q: 'newspaper-1' }),
        expect.objectContaining({ type: 'embedding', q: 'provided-embedding' })
      ])
    )
    expect(filters.filter(filter => filter.type === 'embedding')).toHaveLength(1)
  })

  it('applies additional filters when the embedding is fetched', async () => {
    getContentItem.mockResolvedValue({ semanticEnrichments: { embeddings: ['fetched-embedding'] } })
    const { router, wrapper } = render({
      additionalFilters: [FilterFactory.create({ type: 'mediaSource', q: ['newspaper-1'] })]
    })

    await router.push({ name: 'contentItem' })
    await router.isReady()
    await wrapper.get('[data-testid="add-content-item-to-search-button"]').trigger('click')
    await wrapper
      .get('[data-testid="confirm-add-content-item-to-search-button"]')
      .trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    expect(getContentItem).toHaveBeenCalledOnce()
    expect(deserializeFilters(router.currentRoute.value.query.sq as string)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'mediaSource', q: 'newspaper-1' }),
        expect.objectContaining({ type: 'embedding', q: 'fetched-embedding' })
      ])
    )
  })

  it('reports an empty supplied embedding without fetching', async () => {
    const { wrapper } = render({ embedding: '' })

    await wrapper.get('[data-testid="add-content-item-to-search-button"]').trigger('click')
    await wrapper
      .get('[data-testid="confirm-add-content-item-to-search-button"]')
      .trigger('click')
    expect(wrapper.text()).toContain('No semantic embedding is available')
    expect(getContentItem).not.toHaveBeenCalled()
  })

  it('reports an embedding in additional filters instead of creating an invalid query', async () => {
    const { router, wrapper } = render({
      embedding: 'provided-embedding',
      additionalFilters: [FilterFactory.create({ type: 'embedding', q: ['other-embedding'] })]
    })

    await router.push({ name: 'contentItem' })
    await router.isReady()
    await wrapper.get('[data-testid="add-content-item-to-search-button"]').trigger('click')
    await wrapper
      .get('[data-testid="confirm-add-content-item-to-search-button"]')
      .trigger('click')

    expect(wrapper.text()).toContain('Additional filters cannot contain an embedding filter.')
    expect(router.currentRoute.value.name).toBe('contentItem')
    expect(getContentItem).not.toHaveBeenCalled()
  })
})
