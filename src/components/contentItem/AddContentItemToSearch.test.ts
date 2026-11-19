import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
            emits: ['close'],
            template:
              '<div v-if="show"><slot /><slot name="modal-footer" :close="() => $emit(\'close\')" /></div>'
          }
        },
        mocks: { $t: (key: string) => key }
      }
    })
  }
}

type Wrapper = ReturnType<typeof render>['wrapper']

const openButton = (wrapper: Wrapper) =>
  wrapper.get('[data-testid="add-content-item-to-search-button"]')
const confirmButton = (wrapper: Wrapper) =>
  wrapper.get('[data-testid="confirm-add-content-item-to-search-button"]')
const isConfirmDisabled = (wrapper: Wrapper) =>
  (confirmButton(wrapper).element as HTMLButtonElement).disabled
const cancelButton = (wrapper: Wrapper) => {
  const button = wrapper.findAll('button').find(b => b.text() === 'cancel')
  if (!button) throw new Error('Cancel button not found')
  return button
}

async function openModal(wrapper: Wrapper) {
  await openButton(wrapper).trigger('click')
}

async function goToContentItem(router: ReturnType<typeof render>['router']) {
  await router.push({ name: 'contentItem' })
  await router.isReady()
}

describe('AddContentItemToSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getContentItem.mockReset()
    // Component logs unexpected errors with console.error; keep test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches the embedding as soon as the modal opens and adds its filter to the current search', async () => {
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

    await goToContentItem(router)
    expect(getContentItem).not.toHaveBeenCalled()

    await openModal(wrapper)

    // Fetch starts on open, without waiting for the confirm click.
    expect(getContentItem).toHaveBeenCalledOnce()
    expect(getContentItem).toHaveBeenCalledWith('content-item-1', {
      query: { include_embeddings: true }
    })
    // While prefetching, the confirm button is disabled and shows progress,
    // but the "opening Search" message is not shown yet.
    expect(isConfirmDisabled(wrapper)).toBe(true)
    expect(confirmButton(wrapper).text()).toBe('preparing')
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.get('[data-testid="embedding-generation-message"]').text()).toBe(
      'confirmAddToSearch'
    )

    pendingContentItem.resolve({ semanticEnrichments: { embeddings: ['item-embedding'] } })
    await vi.waitFor(() => expect(isConfirmDisabled(wrapper)).toBe(false))
    expect(confirmButton(wrapper).text()).toBe('confirm')

    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    // The embedding was fetched only once.
    expect(getContentItem).toHaveBeenCalledOnce()

    const filters = deserializeFilters(router.currentRoute.value.query.sq as string)
    expect(filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'year', q: '1900' }),
        expect.objectContaining({ type: 'embedding', q: 'item-embedding' })
      ])
    )
    expect(filters).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'embedding', q: 'previous-item-embedding' })
      ])
    )
    await vi.waitFor(() =>
      expect(wrapper.find('[data-testid="embedding-generation-message"]').exists()).toBe(false)
    )
  })

  it('reports an unavailable embedding and offers a retry', async () => {
    getContentItem.mockResolvedValue({ semanticEnrichments: { embeddings: [] } })
    const { wrapper } = render()

    await openModal(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('noEmbeddingAvailable'))

    expect(wrapper.find('[data-testid="embedding-generation-message"]').exists()).toBe(false)
    expect(confirmButton(wrapper).text()).toBe('retry')

    // Retry fetches again instead of navigating.
    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(getContentItem).toHaveBeenCalledTimes(2))
    await vi.waitFor(() => expect(wrapper.text()).toContain('noEmbeddingAvailable'))
  })

  it('reports a failed fetch and recovers when retrying', async () => {
    getContentItem
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ semanticEnrichments: { embeddings: ['retried-embedding'] } })
    const { router, wrapper } = render()

    await goToContentItem(router)
    await openModal(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('embeddingFetchFailed'))

    expect(confirmButton(wrapper).text()).toBe('retry')
    expect(isConfirmDisabled(wrapper)).toBe(false)
    expect(router.currentRoute.value.name).toBe('contentItem')

    // Retry: the error clears and the embedding is loaded.
    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).not.toContain('embeddingFetchFailed'))
    await vi.waitFor(() => expect(confirmButton(wrapper).text()).toBe('confirm'))
    expect(getContentItem).toHaveBeenCalledTimes(2)
    expect(router.currentRoute.value.name).toBe('contentItem')

    // Confirming now navigates with the retried embedding.
    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))
    expect(deserializeFilters(router.currentRoute.value.query.sq as string)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'embedding', q: 'retried-embedding' })
      ])
    )
  })

  it('uses the supplied embedding without fetching and merges additional filters with the current search', async () => {
    useSearchQueriesStore().recordHash(
      serializeFilters([
        FilterFactory.create({ type: 'year', q: ['1900'] }),
        FilterFactory.create({ type: 'embedding', q: ['previous-item-embedding'] })
      ])
    )
    const additionalFilters = [FilterFactory.create({ type: 'mediaSource', q: ['newspaper-1'] })]
    const { router, wrapper } = render({ embedding: 'provided-embedding', additionalFilters })

    await goToContentItem(router)
    await openModal(wrapper)

    // Nothing to load: the confirm button is immediately usable.
    expect(getContentItem).not.toHaveBeenCalled()
    expect(isConfirmDisabled(wrapper)).toBe(false)

    await confirmButton(wrapper).trigger('click')
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

    await goToContentItem(router)
    await openModal(wrapper)
    await vi.waitFor(() => expect(isConfirmDisabled(wrapper)).toBe(false))
    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    expect(getContentItem).toHaveBeenCalledOnce()
    expect(deserializeFilters(router.currentRoute.value.query.sq as string)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'mediaSource', q: 'newspaper-1' }),
        expect.objectContaining({ type: 'embedding', q: 'fetched-embedding' })
      ])
    )
  })

  it('falls back to fetching when the supplied embedding is empty', async () => {
    getContentItem.mockResolvedValue({ semanticEnrichments: { embeddings: ['fetched-embedding'] } })
    const { router, wrapper } = render({ embedding: '' })

    await goToContentItem(router)
    await openModal(wrapper)

    expect(getContentItem).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(isConfirmDisabled(wrapper)).toBe(false))
    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    expect(deserializeFilters(router.currentRoute.value.query.sq as string)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'embedding', q: 'fetched-embedding' })
      ])
    )
  })

  it('reports an embedding in additional filters instead of creating an invalid query', async () => {
    const { router, wrapper } = render({
      embedding: 'provided-embedding',
      additionalFilters: [FilterFactory.create({ type: 'embedding', q: ['other-embedding'] })]
    })

    await goToContentItem(router)
    await openModal(wrapper)
    await confirmButton(wrapper).trigger('click')

    await vi.waitFor(() => expect(wrapper.text()).toContain('embeddingFilterNotAllowed'))
    expect(router.currentRoute.value.name).toBe('contentItem')
    expect(getContentItem).not.toHaveBeenCalled()
  })

  it('reports a failed navigation to the search page', async () => {
    const { router, wrapper } = render({ embedding: 'provided-embedding' })
    vi.spyOn(router, 'push').mockRejectedValue(new Error('Navigation failed'))

    await openModal(wrapper)
    await confirmButton(wrapper).trigger('click')

    await vi.waitFor(() => expect(wrapper.text()).toContain('searchFailed'))
    // The modal stays open and the user can try again.
    expect(isConfirmDisabled(wrapper)).toBe(false)
  })

  it('ignores a late response from a closed modal session', async () => {
    const firstRequest = deferred<any>()
    const secondRequest = deferred<any>()
    getContentItem
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)
    const { router, wrapper } = render()

    await goToContentItem(router)

    // Open, then cancel while the first request is still pending.
    await openModal(wrapper)
    expect(cancelButton(wrapper).element).toHaveProperty('disabled', false)
    await cancelButton(wrapper).trigger('click')
    expect(wrapper.find('[data-testid="confirm-add-content-item-to-search-button"]').exists()).toBe(
      false
    )

    // Reopen: a second request starts.
    await openModal(wrapper)
    expect(getContentItem).toHaveBeenCalledTimes(2)

    // The stale response must not enable the button or provide the embedding.
    firstRequest.resolve({ semanticEnrichments: { embeddings: ['stale-embedding'] } })
    await new Promise(resolve => setTimeout(resolve))
    expect(isConfirmDisabled(wrapper)).toBe(true)

    secondRequest.resolve({ semanticEnrichments: { embeddings: ['fresh-embedding'] } })
    await vi.waitFor(() => expect(isConfirmDisabled(wrapper)).toBe(false))
    await confirmButton(wrapper).trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('search'))

    const filters = deserializeFilters(router.currentRoute.value.query.sq as string)
    expect(filters).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'embedding', q: 'fresh-embedding' })])
    )
    expect(filters).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'embedding', q: 'stale-embedding' })])
    )
  })
})
