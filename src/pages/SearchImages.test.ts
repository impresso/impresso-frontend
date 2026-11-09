import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import { nextTick, type App } from 'vue'
import SearchImages from './SearchImages.vue'
import FilterFactory from '@/models/FilterFactory'
import { serializeFilters } from '@/logic/filters'

const { findImages, findFacets, getImage } = vi.hoisted(() => ({
  findImages: vi.fn(),
  findFacets: vi.fn(),
  getImage: vi.fn()
}))

vi.mock('@/services', () => ({
  images: { find: findImages, get: getImage },
  searchFacetsImages: { find: findFacets }
}))
vi.mock('@/stores/user', () => ({ useUserStore: () => ({}) }))
vi.mock('@/components/modules/SearchSidebar.vue', () => ({
  default: { name: 'SearchSidebar', template: '<div />' }
}))
vi.mock('@/components/modules/FilterImageUpload.vue', () => ({ default: {} }))
vi.mock('@/components/modules/SearchResultsImageItem.vue', () => ({ default: {} }))
vi.mock('@/components/modules/SearchResultsSummary.vue', () => ({ default: {} }))
vi.mock('@/components/images/ImageContentItem.vue', () => ({ default: {} }))

function response(total = 100, offset = 0, limit = 12) {
  return { data: [], pagination: { total, offset, limit } }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => {
    resolve = done
  })
  return { promise, resolve }
}

async function mountSearch(query: LocationQueryRaw = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: SearchImages }]
  })
  await router.push({ path: '/', query })
  const wrapper = shallowMount(SearchImages, {
    global: {
      plugins: [
        router,
        (app: App) => {
          Object.assign(app.config.globalProperties, { $t: (key: string) => key })
        }
      ],
      renderStubDefaultSlot: true,
      stubs: {
        'i-layout': { template: '<div><slot /></div>' },
        'i-layout-section': { template: '<div><slot name="header" /><slot /></div>' },
        PageNavbarHeading: { template: '<div><slot name="actions" /></div>' },
        'b-button': {
          props: ['disabled'],
          template: '<button :disabled="disabled"><slot /></button>'
        },
        'b-navbar': true,
        'b-navbar-nav': true,
        'b-form-group': true,
        'b-form-checkbox': true,
        'i-dropdown': true
      }
    }
  })
  return { wrapper, router, button: () => wrapper.get('button') }
}

const mounted: Awaited<ReturnType<typeof mountSearch>>[] = []
async function setup(query: LocationQueryRaw = {}) {
  const result = await mountSearch(query)
  mounted.push(result)
  return result
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(Math, 'random').mockReturnValue(0.25)
  findImages.mockImplementation(({ query }) =>
    Promise.resolve(response(100, query.offset, query.limit))
  )
  findFacets.mockResolvedValue({ data: [] })
  getImage.mockResolvedValue({ id: 'image-1' })
})

afterEach(() => {
  mounted.splice(0).forEach(({ wrapper }) => wrapper.unmount())
  vi.restoreAllMocks()
})

describe('SearchImages pagination', () => {
  it.each([undefined, 'garbage', '0', '-2', '2abc', '1.5'])(
    'starts on the first page for p=%s',
    async p => {
      const { router } = await setup({ p })
      await flushPromises()
      expect(findImages).toHaveBeenCalledExactlyOnceWith({
        query: { filters: serializeFilters([]), order_by: '-date', limit: 12, offset: 0 }
      })
      expect(router.currentRoute.value.query.p).toBe('1')
    }
  )

  it('preserves positive page links', async () => {
    await setup({ p: '3', limit: '12' })
    await flushPromises()
    expect(findImages).toHaveBeenCalledTimes(1)
    expect(findImages.mock.calls[0][0].query.offset).toBe(24)
  })

  it('disables random loading until a positive total has loaded', async () => {
    const pending = deferred<ReturnType<typeof response>>()
    findImages.mockReturnValueOnce(pending.promise)
    const { wrapper, button } = await setup()
    expect(button().attributes('disabled')).toBeDefined()
    await (wrapper.vm as unknown as { loadRandomPage(): Promise<void> }).loadRandomPage()
    expect(findImages).toHaveBeenCalledTimes(1)

    pending.resolve(response(1))
    await flushPromises()
    expect(button().attributes('disabled')).toBeUndefined()
  })

  it('keeps the action disabled for zero results and guards the handler', async () => {
    findImages.mockResolvedValue(response(0))
    const { wrapper, button, router } = await setup()
    await flushPromises()
    expect(button().attributes('disabled')).toBeDefined()
    await (wrapper.vm as unknown as { loadRandomPage(): Promise<void> }).loadRandomPage()
    expect(findImages).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.query.p).toBe('1')
  })

  it('loads random pages only on clicks, synchronizes the URL, and supports repeat clicks', async () => {
    const { button, router, wrapper } = await setup({ similarTo: 'image-1', orderBy: 'date' })
    const filters = [FilterFactory.create({ type: 'isFront' })]
    await wrapper.setProps({ filtersWithItems: filters })
    await flushPromises()
    findImages.mockClear()

    await button().trigger('click')
    await flushPromises()
    expect(findImages).toHaveBeenCalledExactlyOnceWith({
      query: {
        filters: serializeFilters(filters),
        order_by: 'date',
        limit: 12,
        offset: 24,
        similar_to_image_id: 'image-1'
      }
    })
    expect(router.currentRoute.value.query.p).toBe('3')
    expect(wrapper.findComponent({ name: 'Pagination' }).props('currentPage')).toBe(3)

    await button().trigger('click')
    await flushPromises()
    expect(findImages).toHaveBeenCalledTimes(2)
    expect(findImages.mock.calls[1][0].query.offset).toBe(24)

    await router.push({ query: { ...router.currentRoute.value.query, p: '2' } })
    await flushPromises()
    expect(findImages).toHaveBeenCalledTimes(3)
    expect(findImages.mock.calls[2][0].query.offset).toBe(12)
  })

  it('allows another random click when the returned page is page one', async () => {
    const { button } = await setup()
    await flushPromises()
    vi.mocked(Math.random).mockReturnValue(0)
    await button().trigger('click')
    await flushPromises()
    await button().trigger('click')
    await flushPromises()
    expect(findImages).toHaveBeenCalledTimes(3)
    expect(findImages.mock.calls.slice(1).every(([{ query }]) => query.offset === 0)).toBe(true)
  })

  it.each([
    { total: 1, limit: 12, random: 0.99, offset: 0 },
    { total: 25, limit: 12, random: 0.99, offset: 24 },
    { total: 100, limit: 20, random: 0.99, offset: 80 },
    { total: 100, limit: 20, random: 0, offset: 0 }
  ])(
    'calculates an in-range random offset from $total items and limit $limit',
    async ({ total, limit, random, offset }) => {
      findImages.mockImplementation(({ query }) =>
        Promise.resolve(response(total, query.offset, query.limit))
      )
      vi.mocked(Math.random).mockReturnValue(random)
      const { button, router } = await setup({ limit: String(limit) })
      await flushPromises()
      await button().trigger('click')
      await flushPromises()
      expect(findImages).toHaveBeenCalledTimes(2)
      expect(findImages.mock.calls[1][0].query).toMatchObject({ limit, offset })
      expect(router.currentRoute.value.query.p).toBe(String(offset / limit + 1))
    }
  )

  it.each(['add', 'remove', 'edit'])(
    'resets to page one before fetching when filters %s',
    async change => {
      const { wrapper, router } = await setup({ p: '4' })
      const original = [FilterFactory.create({ type: 'title', q: 'original' })]
      await wrapper.setProps({ filtersWithItems: original })
      await flushPromises()
      await router.push({ query: { p: '4' } })
      await flushPromises()
      findImages.mockClear()

      const updated =
        change === 'remove'
          ? []
          : change === 'edit'
            ? [FilterFactory.create({ type: 'title', q: 'updated' })]
            : original.concat(FilterFactory.create({ type: 'isFront' }))
      await wrapper.setProps({ filtersWithItems: updated })
      await flushPromises()
      expect(findImages).toHaveBeenCalledExactlyOnceWith({
        query: { filters: serializeFilters(updated), order_by: '-date', limit: 12, offset: 0 }
      })
      expect(router.currentRoute.value.query.p).toBe('1')
    }
  )

  it('prevents additional random requests while a random page is loading', async () => {
    const { wrapper, button } = await setup()
    await flushPromises()
    const pending = deferred<ReturnType<typeof response>>()
    findImages.mockReturnValueOnce(pending.promise)
    await button().trigger('click')
    expect(button().attributes('disabled')).toBeDefined()
    await (wrapper.vm as unknown as { loadRandomPage(): Promise<void> }).loadRandomPage()
    expect(findImages).toHaveBeenCalledTimes(2)
    pending.resolve(response(100, 24))
    await flushPromises()
    expect(button().attributes('disabled')).toBeUndefined()
    expect(findImages).toHaveBeenCalledTimes(2)
  })

  it('disables random loading while a new search is pending', async () => {
    const { wrapper, button } = await setup()
    await flushPromises()
    const pending = deferred<ReturnType<typeof response>>()
    findImages.mockReturnValueOnce(pending.promise)
    await wrapper.setProps({ filtersWithItems: [FilterFactory.create({ type: 'isFront' })] })
    expect(button().attributes('disabled')).toBeDefined()
    await (wrapper.vm as unknown as { loadRandomPage(): Promise<void> }).loadRandomPage()
    expect(findImages).toHaveBeenCalledTimes(2)
    expect(findImages.mock.calls[1][0].query.offset).toBe(0)
    pending.resolve(response(0))
    await flushPromises()
    expect(button().attributes('disabled')).toBeDefined()
  })

  it('ignores a stale random response after a newer search has started', async () => {
    const { button, router } = await setup()
    await flushPromises()
    const pendingRandom = deferred<ReturnType<typeof response>>()
    const pendingSearch = deferred<ReturnType<typeof response>>()
    findImages.mockReturnValueOnce(pendingRandom.promise).mockReturnValueOnce(pendingSearch.promise)
    await button().trigger('click')
    await router.push({ query: { p: '2' } })
    await nextTick()
    pendingRandom.resolve(response(100, 48))
    await flushPromises()
    expect(router.currentRoute.value.query.p).toBe('2')
    expect(button().attributes('disabled')).toBeDefined()
    pendingSearch.resolve(response(100, 12))
    await flushPromises()
    expect(button().attributes('disabled')).toBeUndefined()
  })
})
