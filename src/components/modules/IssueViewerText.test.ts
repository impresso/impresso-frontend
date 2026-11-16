import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import IssueViewerText from '@/components/modules/IssueViewerText.vue'
import AnnotatedTextTree from '@/components/modules/AnnotatedTextTree.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'

const { getContentItem } = vi.hoisted(() => ({ getContentItem: vi.fn() }))

vi.mock('@/services', () => ({ contentItems: { get: getContentItem } }))
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ userData: null }) }))
vi.mock('@/stores/collections', () => ({ useCollectionsStore: () => ({}) }))
vi.mock('@/stores/notifications', () => ({ useNotificationsStore: () => ({}) }))
vi.mock('@/models/Article', () => ({
  default: {
    fromContentItem: () => ({
      isCC: true,
      regions: [{ pageId: 'page', coords: { x: 0, y: 0, w: 10, h: 10 } }],
      pages: [{ id: 'page', iiif: '' }]
    })
  }
}))

const item = (explore?: string): ContentItem => ({
  id: 'item',
  text: { content: 'London' },
  access: explore ? { dataDomain: 'pbl', copyright: 'pbl', accessBitmaps: { explore } } : undefined
})

describe('IssueViewerText explore access', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    getContentItem.mockReset()
  })

  it('passes reactive access from the provided or fetched content item to the tree', async () => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
    getContentItem.mockResolvedValue(item('AQ=='))
    const wrapper = shallowMount(IssueViewerText, {
      props: { article_id: 'item', withIIIFViewer: true },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { 'b-container': { template: '<div><slot /></div>' } }
      }
    })

    await flushPromises()
    expect(wrapper.getComponent(AnnotatedTextTree).props('hasExploreAccess')).toBe(true)

    await wrapper.setProps({ contentItem: item('Ag==') })
    expect(wrapper.getComponent(AnnotatedTextTree).props('hasExploreAccess')).toBe(false)

    await wrapper.setProps({ contentItem: item('AQ==') })
    expect(wrapper.getComponent(AnnotatedTextTree).props('hasExploreAccess')).toBe(true)

    await wrapper.setProps({ contentItem: item() })
    expect(wrapper.getComponent(AnnotatedTextTree).props('hasExploreAccess')).toBe(false)
    wrapper.unmount()
  })
})
