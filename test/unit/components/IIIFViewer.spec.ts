import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import IIIFViewer from '@/components/modules/IIIFViewer.vue'

const mocks = vi.hoisted(() => ({ createViewer: vi.fn() }))
vi.mock('@/services/openseadragon', () => ({
  createOpenSeadragon: mocks.createViewer,
  isAuthRequired: () => false,
  getAuthOptions: () => ({})
}))

const overlay = (x: number) => [{
  id: 'page',
  regions: [{ id: 'region', coords: { x, y: 100, w: 20, h: 30 } }]
}]

describe('IIIFViewer overlays', () => {
  let handlers: Record<string, () => void>
  let fitBounds: ReturnType<typeof vi.fn>
  let open: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handlers = {}
    fitBounds = vi.fn()
    open = vi.fn()
    mocks.createViewer.mockImplementation(({ element }) => ({
      element,
      open,
      destroy: vi.fn(),
      addHandler: (name: string, handler: () => void) => { handlers[name] = handler },
      clearOverlays: () => element.querySelectorAll('.overlay').forEach(el => el.remove()),
      addOverlay: (el: HTMLElement) => element.appendChild(el),
      world: {
        getItemAt: () => ({
          imageToViewportRectangle: (x: number, y: number, w: number, h: number) => ({ x, y, w, h }),
          getBounds: () => ({ x: 0, y: 0, width: 1000, height: 1000 })
        })
      },
      viewport: { fitBoundsWithConstraints: fitBounds }
    }))
  })

  it('refits changed overlays without reopening and preserves repeat-click reset', async () => {
    const wrapper = shallowMount(IIIFViewer, {
      props: { manifestUrls: ['page'], overlays: overlay(100), fitBoundsToOverlayIdx: [0, 0] },
      global: { mocks: { $t: (key: string) => key } }
    })
    handlers.open()
    await flushPromises()
    expect(fitBounds).toHaveBeenLastCalledWith({ x: 50, y: 50, w: 120, h: 130 }, false)

    await wrapper.setProps({ overlays: overlay(300), fitBoundsToOverlayIdx: [0, 0] })
    expect(open).toHaveBeenCalledTimes(1)
    expect(fitBounds).toHaveBeenLastCalledWith({ x: 250, y: 50, w: 120, h: 130 }, false)
    expect(wrapper.find('.overlay.active').exists()).toBe(true)

    await wrapper.setProps({ fitBoundsToOverlayIdx: [0, 0] })
    expect(fitBounds).toHaveBeenLastCalledWith({ x: -50, y: -50, width: 1100, height: 1100 }, false)

    await wrapper.setProps({ overlays: overlay(500) })
    expect(fitBounds).toHaveBeenLastCalledWith({ x: 450, y: 50, w: 120, h: 130 }, false)
    wrapper.unmount()
  })

  it('waits for new manifests before fitting changed overlays', async () => {
    const wrapper = shallowMount(IIIFViewer, {
      props: { manifestUrls: ['page'], overlays: overlay(100), fitBoundsToOverlayIdx: [0, 0] },
      global: { mocks: { $t: (key: string) => key } }
    })
    handlers.open()
    await flushPromises()
    fitBounds.mockClear()

    await wrapper.setProps({ manifestUrls: ['next-page'] })
    await wrapper.setProps({ overlays: overlay(300), fitBoundsToOverlayIdx: [0, 0] })
    expect(fitBounds).not.toHaveBeenCalled()
    handlers.open()
    await flushPromises()
    expect(fitBounds).toHaveBeenLastCalledWith({ x: 250, y: 50, w: 120, h: 130 }, false)
    wrapper.unmount()
  })
})
