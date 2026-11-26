import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi } from 'vitest'
import ShareContentItemModalButton from './ShareContentItemModalButton.vue'

const ModalStub = vi.hoisted(() => ({
  name: 'ShareContentItemModal',
  props: ['item', 'isVisible'],
  emits: ['dismiss'],
  template: '<div data-testid="modal-stub" :data-visible="String(!!isVisible)" />'
}))

vi.mock('@/components/modals/ShareContentItemModal.vue', () => ({ default: ModalStub }))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { share: 'Share', notSharable: 'Not sharable' } }
})

const mountButton = (copyright = 'pbl') =>
  mount(ShareContentItemModalButton, {
    props: { item: { id: 'abc', access: { copyright } } as any },
    global: {
      mocks: { $t: (key: string) => key },
      plugins: [i18n],
      stubs: {
        Icon: true,
        Teleport: true
      }
    }
  })

describe('ShareContentItemModalButton', () => {
  it('disables the button when the item is not public domain', () => {
    const wrapper = mountButton('in_cpy')
    const button = wrapper.find('[data-testid="share-content-item-button"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-label')).toContain('cannot be shared')
  })

  it('labels the button as share when the item is public domain', () => {
    const button = mountButton().find('[data-testid="share-content-item-button"]')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-label')).toBe('Share')
  })

  it('renders the modal hidden by default', () => {
    const wrapper = mountButton()
    expect(wrapper.find('[data-testid="share-content-item-button"]').exists()).toBe(true)
    expect(wrapper.findComponent(ModalStub).props('isVisible')).toBe(false)
  })

  it('opens the modal when clicked and closes on dismiss', async () => {
    const wrapper = mountButton()
    await wrapper.find('[data-testid="share-content-item-button"]').trigger('click')
    const modal = wrapper.findComponent(ModalStub)
    expect(modal.props('isVisible')).toBe(true)
    modal.vm.$emit('dismiss')
    await nextTick()
    expect(wrapper.findComponent(ModalStub).props('isVisible')).toBe(false)
  })
})
