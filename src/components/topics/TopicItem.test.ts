import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import TopicItem from './TopicItem.vue'
import type { TopicItemProps } from './TopicItem.vue'
import Topic from '@/models/Topic'

function render(topic: TopicItemProps['topic'], props = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/topics/:topic_id', name: 'topic', component: { template: '<div />' } }]
  })
  return mount(TopicItem, {
    props: { topic, ...props },
    global: {
      plugins: [router],
      mocks: { $t: (_key: string, params: { n: string }) => `${params.n} articles`, $n: String }
    }
  })
}

describe('TopicItem', () => {
  it('renders topic metadata and links to the existing detail route', () => {
    const wrapper = render(
      new Topic({
        id: 'topic-1',
        label: 'Railways',
        language: 'en',
        model: 'model-1',
        contentItemsCount: 42,
        description: 'Transport coverage'
      }),
      { showDescription: true, showId: true }
    )
    expect(wrapper.get('a').text()).toBe('Railways')
    expect(wrapper.get('a').attributes('href')).toBe('/topics/topic-1')
    expect(wrapper.text()).toContain('en')
    expect(wrapper.text()).toContain('model-1')
    expect(wrapper.text()).toContain('42 articles')
    expect(wrapper.text()).toContain('Transport coverage')
    expect(wrapper.get('code').text()).toBe('topic-1')
  })

  it.each([
    { label: 'Short', longLabel: 'Long', expected: 'Short' },
    { longLabel: 'Long', expected: 'Long' },
    {
      words: [
        { w: 'train', p: 0.9 },
        { w: 'station', p: 0.5 }
      ],
      expected: 'train · station'
    },
    { expected: 'topic-1' }
  ])('falls back to $expected', ({ expected, ...payload }) => {
    const wrapper = render(new Topic({ id: 'topic-1', ...payload }))
    expect(wrapper.get('a').text()).toBe(expected)
    expect(wrapper.text()).not.toContain('undefined')
    expect(wrapper.text()).not.toContain('-1 articles')
  })

  it('supports plain payloads with missing optional fields and preserves zero counts', () => {
    const wrapper = render({ id: 'topic-1', contentItemsCount: 0 })
    expect(wrapper.text()).toContain('0 articles')
  })

  it('honors display controls and emits typed click data', async () => {
    const topic = new Topic({
      id: 'topic-1',
      label: 'Title',
      language: 'en',
      model: 'model-1',
      contentItemsCount: 2
    })
    const wrapper = render(topic, {
      showLink: false,
      showLanguage: false,
      showModel: false,
      showCount: false
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toBe('Title')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')?.[0]).toEqual([topic])
    await wrapper.setProps({ showTitle: false })
    expect(wrapper.text()).toBe('')
  })

  it('renders an actions slot and escapes labels as text', () => {
    const wrapper = mount(TopicItem, {
      props: { topic: { id: 'topic-1', label: '<b>Title</b>' }, showLink: false },
      slots: { actions: '<button>Action</button>' }
    })
    expect(wrapper.get('h2').text()).toBe('<b>Title</b>')
    expect(wrapper.find('b').exists()).toBe(false)
    expect(wrapper.get('button').text()).toBe('Action')
  })
})
