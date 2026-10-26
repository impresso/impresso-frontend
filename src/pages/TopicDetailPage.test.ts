import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App } from 'vue'
import { createMemoryHistory, createRouter, type LocationQueryRaw } from 'vue-router'
import TopicDetailPage from './TopicDetailPage.vue'

const { getTopic } = vi.hoisted(() => ({
  getTopic: vi.fn()
}))
vi.mock('@/services', () => ({
  topics: { get: getTopic }
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

// Host that renders the matched route, so `TopicDetailPage` is mounted in its
// real position (with its own <router-view> resolving the nested child route).
const RootView = { name: 'RootView', template: '<router-view />' }

const TopicOverviewRoute = {
  name: 'TopicOverviewRoute',
  props: ['item', 'listFilters'],
  template: '<div class="route-overview" />'
}
const TopicMetadataRoute = {
  name: 'TopicMetadataRoute',
  props: ['item', 'listFilters'],
  template: '<div class="route-metadata" />'
}
const TopicContentItemsRoute = {
  name: 'TopicContentItemsRoute',
  props: ['item', 'listFilters'],
  template: '<div class="route-content-items" />'
}

interface MountOptions {
  id?: string
  routeName?: string
  query?: LocationQueryRaw
}

async function mountPage({ id = 'topic-1', routeName = 'topicOverview', query = {} }: MountOptions = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/topics', name: 'topics', component: { template: '<div />' } },
      {
        path: '/topics/:topic_id?',
        name: 'topic',
        component: TopicDetailPage,
        meta: { requiresAuth: false },
        children: [
          { path: '', name: 'topicOverview', component: TopicOverviewRoute },
          { path: 'metadata', name: 'topicMetadata', component: TopicMetadataRoute },
          { path: 'content-items', name: 'topicContentItems', component: TopicContentItemsRoute }
        ]
      },
      { path: '/search', name: 'search', component: { template: '<div />' } }
    ]
  })
  await router.push({ name: routeName, params: { topic_id: id }, query })
  const wrapper = mount(RootView, {
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
      stubs: {
        'i-layout-section': { template: '<div><slot name="header" /><slot /></div>' },
        PageNavbarHeading: {
          name: 'PageNavbarHeading',
          template:
            '<div><slot name="label" /><slot name="title" /><slot /><slot name="actions" /></div>'
        },
        TopicItem: {
          name: 'TopicItem',
          props: ['topic', 'showLink', 'showModel', 'showDescription', 'showLanguage', 'showId', 'showTitle'],
          template: '<div class="TopicItem" />'
        },
        OpenInSearchButton: {
          name: 'OpenInSearchButton',
          props: ['filters'],
          template: '<div class="OpenInSearchButton" />'
        },
        SearchFacetTimeline: {
          name: 'SearchFacetTimeline',
          props: ['facetType', 'searchIndex', 'title', 'height', 'filters', 'errorLoadingItemsMessage'],
          template: '<div class="SearchFacetTimeline" />'
        },
        LoadingBlock: {
          name: 'LoadingBlock',
          props: ['label', 'height'],
          template: '<div class="LoadingBlock" />'
        }
      }
    }
  })
  return { wrapper, router }
}

const mounted: Awaited<ReturnType<typeof mountPage>>[] = []
async function setup(options: MountOptions = {}) {
  const result = await mountPage(options)
  mounted.push(result)
  return result
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  getTopic.mockImplementation(id => Promise.resolve(topic(id)))
})
afterEach(() => {
  mounted.splice(0).forEach(({ wrapper }) => wrapper.unmount())
  vi.restoreAllMocks()
})

describe('TopicDetailPage', () => {
  it('fetches the topic matching the current route param', async () => {
    await setup({ id: 'topic-9' })
    await flushPromises()
    expect(getTopic).toHaveBeenCalledExactlyOnceWith('topic-9')
  })

  it('shows loading and hides topic actions until the topic resolves', async () => {
    const pending = deferred<ReturnType<typeof topic>>()
    getTopic.mockReturnValueOnce(pending.promise)
    const { wrapper } = await setup()
    expect(wrapper.findComponent({ name: 'LoadingBlock' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'OpenInSearchButton' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'TopicItem' }).exists()).toBe(false)

    pending.resolve(topic())
    await flushPromises()
    expect(wrapper.findComponent({ name: 'LoadingBlock' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'TopicItem' }).props('topic')).toMatchObject({ id: 'topic-1' })
    expect(wrapper.findComponent({ name: 'TopicItem' }).props('showLink')).toBe(false)
    expect(wrapper.findComponent({ name: 'OpenInSearchButton' }).props('filters')).toEqual([
      { type: 'topic', q: 'topic-1' }
    ])
  })

  it('refetches when navigating to a different topic', async () => {
    const { router } = await setup()
    await flushPromises()
    await router.push({ name: 'topicContentItems', params: { topic_id: 'topic-2' } })
    await flushPromises()
    expect(getTopic).toHaveBeenCalledTimes(2)
    expect(getTopic).toHaveBeenLastCalledWith('topic-2')
  })

  it('ignores stale topic responses during quick navigation', async () => {
    const pending = deferred<ReturnType<typeof topic>>()
    getTopic.mockReturnValueOnce(pending.promise)
    const { wrapper, router } = await setup()
    await router.push({ name: 'topicContentItems', params: { topic_id: 'topic-2' } })
    await flushPromises()
    pending.resolve(topic('topic-1'))
    await flushPromises()
    expect(wrapper.findComponent({ name: 'TopicItem' }).props('topic')).toMatchObject({
      id: 'topic-2'
    })
    expect(wrapper.findComponent({ name: 'OpenInSearchButton' }).props('filters')).toEqual([
      { type: 'topic', q: 'topic-2' }
    ])
  })

  it('shows a topic error and clears loading when the topic cannot be loaded', async () => {
    getTopic.mockRejectedValueOnce(new Error('Not found'))
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('topicLoadError')
    expect(wrapper.findComponent({ name: 'LoadingBlock' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'OpenInSearchButton' }).exists()).toBe(false)
  })

  it('does not enable topic actions when the payload has no id', async () => {
    getTopic.mockResolvedValueOnce({})
    const { wrapper } = await setup()
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'OpenInSearchButton' }).exists()).toBe(false)
  })

  it('does not request a topic when the route has no topic id', async () => {
    const { wrapper } = await setup({ id: '' })
    await flushPromises()
    expect(getTopic).not.toHaveBeenCalled()
    // No id usually means we are leaving the route: stay silent, no error.
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(0)
    expect(wrapper.findComponent({ name: 'TopicOverviewRoute' }).exists()).toBe(false)
  })

  it('renders tabs that link to the nested topic routes with the topic id', async () => {
    const { wrapper } = await setup({ routeName: 'topicMetadata' })
    await flushPromises()
    const hrefs = wrapper.findAll('a').map(link => link.attributes('href'))
    expect(hrefs).toContain('/topics/topic-1')
    expect(hrefs).toContain('/topics/topic-1/metadata')
    expect(hrefs).toContain('/topics/topic-1/content-items')
  })

  it('marks the tab matching the current route as active', async () => {
    const { wrapper } = await setup({ routeName: 'topicMetadata' })
    await flushPromises()
    const metadataLink = wrapper.findAll('a').find(link => link.text() === 'route.metadata')!
    const overviewLink = wrapper.findAll('a').find(link => link.text() === 'route.overview')!
    expect(metadataLink.classes()).toContain('active')
    expect(overviewLink.classes()).not.toContain('active')
  })

  it.each(['topicOverview', 'topicMetadata'])(
    'renders the timeline scoped to the topic on the %s route',
    async routeName => {
      const { wrapper } = await setup({ routeName })
      await flushPromises()
      const timeline = wrapper.findComponent({ name: 'SearchFacetTimeline' })
      expect(timeline.exists()).toBe(true)
      expect(timeline.props()).toMatchObject({
        facetType: 'year',
        searchIndex: 'search',
        height: '85px',
        filters: [{ type: 'topic', q: 'topic-1' }]
      })
    }
  )

  it('does not render the timeline on the content items route', async () => {
    const { wrapper } = await setup({ routeName: 'topicContentItems' })
    await flushPromises()
    expect(wrapper.findComponent({ name: 'SearchFacetTimeline' }).exists()).toBe(false)
  })

  it('renders the nested route view for the matched tab', async () => {
    const overview = await setup({ routeName: 'topicOverview' })
    await flushPromises()
    expect(overview.wrapper.findComponent({ name: 'TopicOverviewRoute' }).exists()).toBe(true)

    const contentItems = await setup({ routeName: 'topicContentItems' })
    await flushPromises()
    expect(contentItems.wrapper.findComponent({ name: 'TopicContentItemsRoute' }).exists()).toBe(
      true
    )
    expect(contentItems.wrapper.findComponent({ name: 'TopicOverviewRoute' }).exists()).toBe(false)
  })

  it('passes the topic and topic filter down to the nested route view', async () => {
    const { wrapper } = await setup({ routeName: 'topicOverview' })
    await flushPromises()
    const routeView = wrapper.findComponent({ name: 'TopicOverviewRoute' })
    expect(routeView.props('item')).toMatchObject({ id: 'topic-1' })
    expect(routeView.props('listFilters')).toEqual([{ type: 'topic', q: 'topic-1' }])
  })
})
