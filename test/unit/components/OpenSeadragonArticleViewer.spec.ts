import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer.vue'

const mocks = vi.hoisted(() => ({ createViewer: vi.fn() }))
vi.mock('@/services/openseadragon', () => ({
  createOpenSeadragon: mocks.createViewer,
  isAuthRequired: () => false,
  getAuthOptions: () => ({})
}))
vi.mock('openseadragon', () => ({
  default: {
    MouseTracker: class {},
    Rect: class {
      constructor(public x: number, public y: number, public width: number, public height: number) {}
    }
  }
}))

describe('OpenSeadragonArticleViewer page loading', () => {
  let addTiledImage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    addTiledImage = vi.fn()
    mocks.createViewer.mockReturnValue({
      addHandler: vi.fn(),
      addTiledImage,
      world: {
        addHandler: vi.fn(),
        removeAll: vi.fn(),
        getItemAt: vi.fn()
      }
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ width: 1000, height: 2000 })
    }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it.each([
    { pages: ['first'], index: 0, realPages: ['first'] },
    { pages: ['first', 'last'], index: 0, realPages: ['first', 'last'] },
    { pages: ['first', '2', '3', '4', 'last'], index: 4, realPages: ['3', '4', 'last'] },
    { pages: ['first', '2', '3', '4', 'last'], index: 0, realPages: ['first', '2', '3'] }
  ])('loads the initial page and its neighbours at index $index', async ({ pages, index, realPages }) => {
    const wrapper = shallowMount(OpenSeadragonArticleViewer, {
      props: { pages, defaultCurrentPageIndex: index, article: {} },
      global: { mocks: { $t: (key: string) => key } }
    })
    await flushPromises()

    expect(addTiledImage.mock.calls.map(([options]) => options.tileSource)
      .filter(source => typeof source === 'string')).toEqual(realPages)
    wrapper.unmount()
  })

  it('updates the active overlay when the selected article changes', async () => {
    const addOverlay = vi.fn()
    const image = {
      getBounds: () => ({ x: 0, y: 0, width: 10, height: 10 }),
      imageToViewportRectangle: () => ({})
    }
    mocks.createViewer.mockReturnValue({
      addHandler: vi.fn(),
      addTiledImage,
      addOverlay,
      removeOverlay: vi.fn(),
      world: { addHandler: vi.fn(), removeAll: vi.fn(), getItemAt: () => image }
    })
    const wrapper = shallowMount(OpenSeadragonArticleViewer, {
      props: {
        pages: ['page'],
        article: { id: null },
        regions: [{ articleId: 'item-1', pageId: 'page', coords: { x: 1, y: 2, w: 3, h: 4 } }]
      },
      global: { mocks: { $t: (key: string) => key } }
    })
    await flushPromises()
    addOverlay.mockClear()
    await wrapper.setProps({ article: { id: 'item-1' } })
    await flushPromises()
    const region = addOverlay.mock.calls.map(([element]) => element)
      .find(element => element.classList?.contains('overlay-region'))
    expect(region?.classList.contains('active')).toBe(true)
    wrapper.unmount()
  })

  it('loads the last page after dragging to it', async () => {
    const images = Array.from({ length: 5 }, (_, index) => ({
      getBounds: () => ({
        x: index,
        y: 0,
        width: 1,
        height: 1,
        getCenter: () => ({ x: index + 0.5, y: 0.5 })
      })
    }))
    mocks.createViewer.mockReturnValue({
      addHandler: vi.fn(),
      addTiledImage,
      addOverlay: vi.fn(),
      removeOverlay: vi.fn(),
      viewport: { getCenter: () => ({ x: 4.5 }), panTo: vi.fn() },
      world: {
        addHandler: vi.fn(),
        removeAll: vi.fn(),
        getItemAt: (index: number) => images[index],
        getItemCount: () => images.length
      }
    })
    const wrapper = shallowMount(OpenSeadragonArticleViewer, {
      props: { pages: ['first', '2', '3', '4', 'last'], article: {} },
      global: { mocks: { $t: (key: string) => key } }
    })
    await flushPromises()
    addTiledImage.mockClear()
    await wrapper.setData({ isDragging: true, currentPageIndex: 4 })
    expect(addTiledImage).not.toHaveBeenCalled()
    await wrapper.setData({ isDragging: false })
    await flushPromises()

    expect(addTiledImage).toHaveBeenCalledWith(expect.objectContaining({
      tileSource: 'last',
      index: 4,
      replace: true
    }))
    wrapper.unmount()
  })
})
