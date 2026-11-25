import { describe, expect, it, vi } from 'vitest'
import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import ContentItemPage from '@/pages/ContentItemPage.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'

vi.mock('@/services', () => ({
  contentItems: { path: 'content-items', find: vi.fn() },
  filtersItems: { find: vi.fn() }
}))
vi.mock('@/composables/useContentItem', () => ({
  useContentItem: () => ({ contentItem, fetchContentItem: vi.fn() })
}))
vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => ({ params: { content_item_id: 'issue-1-i0001' } })
}))

const contentItem = ref<ContentItem | null>(null)

describe('ContentItemPage issue link', () => {
  it('links to the current item and page in the new issue viewer', async () => {
    contentItem.value = {
      id: 'issue-1-i0001',
      issueId: 'issue-1',
      text: { title: 'First item' },
      facsimile: { pages: [{ number: 3 }] }
    }
    const wrapper = shallowMount(ContentItemPage, {
      props: { showSidebar: false },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          'i-layout': { template: '<div><slot /></div>' },
          'i-layout-section': { template: '<section><slot name="header" /><slot /></section>' },
          'b-navbar-nav': { template: '<nav><slot /></nav>' },
          RouterLink: RouterLinkStub
        }
      }
    })
    const issueLink = () =>
      wrapper.findAllComponents(RouterLinkStub).find(link => link.text().includes('actions.viewInIssue'))

    expect(issueLink()?.props('to')).toEqual({
      name: 'issuePageViewer',
      params: { issue_id: 'issue-1' },
      query: { contentItemId: 'i0001', p: 3 }
    })

    contentItem.value = { id: 'issue-2-i0002', issueId: 'issue-2', text: { title: 'Second' } }
    await wrapper.vm.$nextTick()
    expect(issueLink()?.props('to')).toEqual({
      name: 'issuePageViewer',
      params: { issue_id: 'issue-2' },
      query: { contentItemId: 'i0002', p: undefined }
    })

    contentItem.value = { id: 'no-issue', text: { title: 'No issue' } }
    await wrapper.vm.$nextTick()
    expect(issueLink()).toBeUndefined()
    wrapper.unmount()
  })
})
