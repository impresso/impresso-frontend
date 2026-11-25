import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { reactive } from 'vue'
import IssueViewer from '@/components/issue/IssueViewer.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer.vue'

const services = vi.hoisted(() => ({
  issues: { get: vi.fn() },
  contentItems: { find: vi.fn(), get: vi.fn() },
  replace: vi.fn()
}))
vi.mock('@/services', () => ({
  issues: services.issues,
  contentItems: services.contentItems
}))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => route,
  useRouter: () => ({ replace: services.replace })
}))

const route = reactive<{
  params: { issue_id: string }
  query: Record<string, string>
}>({ params: { issue_id: 'issue-1' }, query: {} })
const pages = [
  { id: 'page-1', num: 1, iiif: '/page-1/info.json' },
  { id: 'page-2', num: 2, iiif: '/page-2/info.json' }
]

const panelRestore = vi.hoisted(() => vi.fn())

const mountViewer = () =>
  shallowMount(IssueViewer, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        ModalDraggable: {
          template: '<div data-testid="article-panel"><slot name="header-actions" /><slot /></div>',
          methods: { restore: panelRestore }
        },
        RouterLink: RouterLinkStub
      }
    }
  })

describe('IssueViewer', () => {
  beforeEach(() => {
    route.params.issue_id = 'issue-1'
    route.query = {}
    services.issues.get.mockReset().mockResolvedValue({ id: 'issue-1', pages })
    services.contentItems.find.mockReset().mockImplementation(({ query }) =>
      Promise.resolve({
        data: [{
          id: 'article-1',
          facsimile: {
            pages: [{ id: query.filters[0].q, regionCoordinates: [[1, 2, 3, 4]] }]
          }
        }]
      })
    )
    services.contentItems.get.mockReset().mockImplementation((id: string) => Promise.resolve({ id }))
    services.replace.mockReset().mockResolvedValue(undefined)
  })

  it('uses the URL page and updates it when the viewer changes page', async () => {
    route.query = { p: '2', other: 'preserved' }
    const wrapper = mountViewer()
    await flushPromises()

    const viewer = wrapper.getComponent(OpenSeadragonArticleViewer)
    expect(viewer.props('pages')).toEqual(['/page-1/info.json', '/page-2/info.json'])
    expect(viewer.props('defaultCurrentPageIndex')).toBe(1)
    expect(viewer.props('regions')).toEqual([
      { articleId: 'article-1', pageId: 'page-2', coords: { x: 1, y: 2, w: 3, h: 4 } }
    ])
    expect(services.contentItems.find).toHaveBeenLastCalledWith({
      query: { filters: [{ type: 'page', q: 'page-2' }], limit: 500 }
    })

    viewer.vm.$emit('page-changed', 0)
    await flushPromises()
    expect(services.replace).toHaveBeenCalledWith({ query: { p: '1', other: 'preserved' } })

    route.query.p = '1'
    await flushPromises()
    expect(viewer.props('defaultCurrentPageIndex')).toBe(0)
    expect(viewer.props('regions')[0].pageId).toBe('page-1')
    wrapper.unmount()
  })

  it('discards stale issue and page-region responses', async () => {
    let resolveOldIssue!: (value: { id: string; pages: typeof pages }) => void
    services.issues.get.mockImplementationOnce(() => new Promise(resolve => {
      resolveOldIssue = resolve
    }))
    const wrapper = mountViewer()
    route.params.issue_id = 'issue-2'
    await flushPromises()
    resolveOldIssue({ id: 'issue-1', pages: [{ id: 'old', num: 1, iiif: '/old' }] })
    await flushPromises()
    expect(wrapper.getComponent(OpenSeadragonArticleViewer).props('pages')).toEqual([
      '/page-1/info.json',
      '/page-2/info.json'
    ])

    let resolveOldRegions!: (value: { data: unknown[] }) => void
    services.contentItems.find.mockImplementationOnce(() => new Promise(resolve => {
      resolveOldRegions = resolve
    }))
    route.query.p = '2'
    await flushPromises()
    route.query.p = '1'
    await flushPromises()
    resolveOldRegions({
      data: [{ id: 'stale', facsimile: { pages: [{ id: 'page-2', regionCoordinates: [[1, 1, 1, 1]] }] } }]
    })
    await flushPromises()
    expect(wrapper.getComponent(OpenSeadragonArticleViewer).props('regions')[0].pageId).toBe('page-1')
    wrapper.unmount()
  })

  it('shows an error when the issue cannot be loaded', async () => {
    services.issues.get.mockRejectedValueOnce(new Error('unavailable'))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountViewer()
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('issueError')
    expect(wrapper.findComponent(OpenSeadragonArticleViewer).exists()).toBe(false)
    expect(error).toHaveBeenCalled()
    error.mockRestore()
    wrapper.unmount()
  })

  it('opens and closes a linked panel for the selected article', async () => {
    route.query = { p: '2', articleId: 'old', other: 'preserved' }
    const wrapper = mountViewer()
    await flushPromises()
    const viewer = wrapper.getComponent(OpenSeadragonArticleViewer)
    expect(services.contentItems.get).toHaveBeenCalledWith('issue-1-old')

    viewer.vm.$emit('article-selected', 'issue-1-i0002')
    await flushPromises()
    expect(panelRestore).toHaveBeenCalled()
    expect(services.replace).toHaveBeenLastCalledWith({
      query: { p: '2', contentItemId: 'i0002', other: 'preserved' }
    })

    route.query = { p: '2', contentItemId: 'i0002', other: 'preserved' }
    await flushPromises()
    expect(viewer.props('article')).toEqual({ id: 'issue-1-i0002' })
    expect(services.contentItems.get).toHaveBeenLastCalledWith('issue-1-i0002')
    expect(wrapper.getComponent(ContentItem).props('contentItem')).toEqual({ id: 'issue-1-i0002' })

    await wrapper.get('button[aria-label="close"]').trigger('click')
    expect(services.replace).toHaveBeenLastCalledWith({ query: { p: '2', other: 'preserved' } })
    route.query = { p: '2', other: 'preserved' }
    await flushPromises()
    expect(wrapper.find('[data-testid="article-panel"]').exists()).toBe(false)
    expect(viewer.props('article')).toEqual({ id: null })
    wrapper.unmount()
  })

  it('shows loading, discards stale content items and reports errors', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const resolvers: Record<string, (v: unknown) => void> = {}
    services.contentItems.get.mockImplementation(
      (id: string) => new Promise(resolve => { resolvers[id] = resolve })
    )
    route.query = { contentItemId: 'a' }
    const wrapper = mountViewer()
    await flushPromises()
    expect(wrapper.findComponent(LoadingBlock).exists()).toBe(true)

    route.query = { contentItemId: 'b' }
    await flushPromises()
    resolvers['issue-1-b']({ id: 'issue-1-b' })
    await flushPromises()
    resolvers['issue-1-a']({ id: 'issue-1-a' })
    await flushPromises()
    expect(wrapper.getComponent(ContentItem).props('contentItem')).toEqual({ id: 'issue-1-b' })

    route.query = {}
    await flushPromises()
    services.contentItems.get.mockRejectedValueOnce(new Error('boom'))
    route.query = { contentItemId: 'c' }
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('contentItemError')
    error.mockRestore()
    wrapper.unmount()
  })
})
