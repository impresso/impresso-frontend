import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ListOfSimilarContentItems from '@/components/ListOfSimilarContentItems.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'

const service = vi.hoisted(() => ({ get: vi.fn(), find: vi.fn() }))
vi.mock('@/services', () => ({ contentItems: service }))

const item = (id: string): ContentItem => ({
  id,
  meta: { date: '1900-06-15', sourceType: 'newspaper', sourceMedium: 'print' }
})

const mountComponent = (props: { contentItem?: ContentItem; loadOnMount?: boolean }) =>
  shallowMount(ListOfSimilarContentItems, {
    props,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        'b-form-checkbox': {
          props: ['modelValue', 'disabled'],
          template: '<input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.checked)" />'
        }
      }
    },
    slots: {
      default: '<template #default="{ items }">{{ items.map(item => item.id).join(",") }}</template>'
    }
  })

describe('ListOfSimilarContentItems automatic loading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    service.get.mockReset().mockResolvedValue({
      semanticEnrichments: { embeddings: ['embedding'] }
    })
    service.find.mockReset().mockResolvedValue({ data: [item('similar')] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads on mount and hides the button when enabled', async () => {
    const wrapper = mountComponent({ contentItem: item('first'), loadOnMount: true })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    await vi.advanceTimersByTimeAsync(500)
    expect(service.get).toHaveBeenCalledWith('first', { query: { include_embeddings: true } })
    expect(service.find).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('similar')
    wrapper.unmount()
  })

  it('allows manual loading by default', async () => {
    const wrapper = mountComponent({ contentItem: item('first') })
    await vi.advanceTimersByTimeAsync(500)
    expect(service.get).not.toHaveBeenCalled()
    await wrapper.get('button').trigger('click')
    await vi.advanceTimersByTimeAsync(500)
    expect(service.find).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('refreshes results when the timeframe switch changes in automatic mode', async () => {
    const wrapper = mountComponent({ contentItem: item('first'), loadOnMount: true })
    await vi.advanceTimersByTimeAsync(500)
    expect(service.find.mock.calls[0][0].query.filters).toContainEqual({
      type: 'year',
      q: ['1899', '1900', '1901']
    })
    await wrapper.get('input').setValue(false)
    await vi.advanceTimersByTimeAsync(500)
    expect(service.find).toHaveBeenCalledTimes(2)
    expect(service.get).toHaveBeenCalledOnce()
    expect(service.find.mock.calls[1][0].query.filters).toEqual([
      { type: 'embedding', q: 'embedding' }
    ])
    wrapper.unmount()
  })

  it('does not fetch when the timeframe changes in manual mode', async () => {
    const wrapper = mountComponent({ contentItem: item('first') })
    await wrapper.get('input').setValue(false)
    await vi.advanceTimersByTimeAsync(500)
    expect(service.get).not.toHaveBeenCalled()
    expect(wrapper.find('button').exists()).toBe(true)
    wrapper.unmount()
  })

  it('loads an item supplied after mount', async () => {
    const wrapper = mountComponent({ loadOnMount: true })
    await vi.advanceTimersByTimeAsync(500)
    expect(service.get).not.toHaveBeenCalled()
    await wrapper.setProps({ contentItem: item('first') })
    await vi.advanceTimersByTimeAsync(500)
    expect(service.get).toHaveBeenCalledWith('first', { query: { include_embeddings: true } })
    expect(service.find).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('ignores a previous item response after the item changes', async () => {
    let resolveFirst!: (value: { semanticEnrichments: { embeddings: string[] } }) => void
    service.get.mockImplementationOnce(() => new Promise(resolve => {
      resolveFirst = resolve
    }))
    const wrapper = mountComponent({ contentItem: item('first'), loadOnMount: true })
    await vi.advanceTimersByTimeAsync(500)
    await wrapper.setProps({ contentItem: item('second') })
    await vi.advanceTimersByTimeAsync(500)
    resolveFirst({ semanticEnrichments: { embeddings: ['stale'] } })
    await nextTick()
    expect(service.find).toHaveBeenCalledOnce()
    expect(service.find.mock.calls[0][0].query.filters).toContainEqual({
      type: 'embedding',
      q: 'embedding'
    })
    expect(wrapper.text()).toContain('similar')
    wrapper.unmount()
  })

  it('does not start a pending request after unmounting', async () => {
    const wrapper = mountComponent({ contentItem: item('first'), loadOnMount: true })
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(500)
    expect(service.get).not.toHaveBeenCalled()
  })

  it('shows a service error without reporting missing embeddings', async () => {
    service.get.mockRejectedValue(new Error('request failed'))
    const wrapper = mountComponent({ contentItem: item('first'), loadOnMount: true })
    await vi.advanceTimersByTimeAsync(500)
    expect(wrapper.findComponent({ name: 'FeathersErrorManager' }).exists()).toBe(true)
    expect(wrapper.text()).not.toContain('fetchingSimilarContentItems.noEmbeddingsForThisContentItem')
    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})
