import axios from 'axios'
import { flushPromises, mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import MarkdownContent from '@/components/MarkdownContent.vue'

describe('announcement Markdown rendering', () => {
  let loadAnnouncement: typeof import('@/composables/useAnnouncement').loadAnnouncement
  let announcement: typeof import('@/composables/useAnnouncement').announcement

  beforeAll(async () => {
    vi.stubEnv('VITE_ANNOUNCEMENT_MD_URL', 'https://example.com/announcement.md')
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    ;({ loadAnnouncement, announcement } = await import('@/composables/useAnnouncement'))
  })

  afterAll(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    announcement.value = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['LF', '---\nid: maintenance\nseverity: warning\ndismissible: true\n---\n\n**Message**'],
    [
      'CRLF',
      '---\r\nid: maintenance\r\nseverity: warning\r\ndismissible: true\r\n---\r\n\r\n**Message**'
    ],
    ['BOM', '\uFEFF---\nid: maintenance\nseverity: warning\ndismissible: true\n---\n\n**Message**'],
    [
      'leading whitespace',
      '  \n---\nid: maintenance\nseverity: warning\ndismissible: true\n---\n\n**Message**'
    ]
  ])('renders only the parsed body for %s without fetching again', async (_format, data) => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data })
    await loadAnnouncement()

    expect(announcement.value).toMatchObject({
      id: 'maintenance',
      severity: 'warning',
      dismissible: true,
      body: '**Message**'
    })
    const wrapper = mount(MarkdownContent, { props: { markdown: announcement.value?.body } })
    await flushPromises()

    expect(wrapper.find('.MarkdownContent').html()).toContain('<strong>Message</strong>')
    expect(wrapper.text()).not.toContain('severity')
    expect(wrapper.text()).not.toContain('dismissible')
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('keeps URL-based loading and its existing front-matter handling', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({
      data: '---\ntitle: Terms\n---\n\n**Terms**'
    })
    const wrapper = mount(MarkdownContent, { props: { url: 'https://example.com/terms.md' } })
    await flushPromises()

    expect(get).toHaveBeenCalledOnce()
    expect(wrapper.find('.MarkdownContent').html()).toContain('<strong>Terms</strong>')
    expect(wrapper.text()).not.toContain('title: Terms')
  })

  it('does not strip horizontal rules from an already-parsed body', async () => {
    const wrapper = mount(MarkdownContent, {
      props: { markdown: '---\n\nFirst paragraph\n\n---\n\nSecond paragraph' }
    })
    await flushPromises()

    expect(wrapper.findAll('hr')).toHaveLength(2)
    expect(wrapper.text()).toContain('First paragraph')
    expect(wrapper.text()).toContain('Second paragraph')
  })

  it('does not replace newer Markdown with an earlier URL response', async () => {
    let resolveRequest: (response: { data: string }) => void = () => {
      throw new Error('URL request was not started')
    }
    vi.spyOn(axios, 'get').mockImplementation(
      () =>
        new Promise(resolve => {
          resolveRequest = resolve
        })
    )
    const wrapper = mount(MarkdownContent, { props: { url: 'https://example.com/old.md' } })
    await wrapper.setProps({ markdown: '**Current message**' })
    resolveRequest({ data: '**Old message**' })
    await flushPromises()

    expect(wrapper.text()).toContain('Current message')
    expect(wrapper.text()).not.toContain('Old message')
  })
})
