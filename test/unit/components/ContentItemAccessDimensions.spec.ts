import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ContentItemAccessDimensions from '@/components/ContentItemAccessDimensions.vue'
import ContentItemAccessBadge from '@/components/ContentItemAccessBadge.vue'

const user = vi.hoisted(() => ({ userData: false }))
vi.mock('@/stores/user', () => ({
  useUserStore: () => user
}))

const mountComponent = (props: {
  exploreGranted: boolean
  transcriptGranted: boolean
  facsimileGranted: boolean
  compact?: boolean
  teleport?: boolean
}) =>
  mount(ContentItemAccessDimensions, {
    props,
    global: {
      plugins: [createPinia(), createI18n({ legacy: true, locale: 'en', messages: { en: {} } })]
    }
  })

describe('ContentItemAccessDimensions', () => {
  beforeEach(() => {
    user.userData = false
  })

  it.each([
    [false, false, false, 'No access', 'No access'],
    [true, false, false, 'Web App access', 'Only Web App access'],
    [false, true, false, 'Transcript access', 'Partial access'],
    [false, false, true, 'Facsimile access', 'Partial access'],
    [true, true, false, 'Web App & transcript access', 'Partial access'],
    [true, false, true, 'Web App & facsimile access', 'Partial access'],
    [false, true, true, 'Transcript & facsimile access', 'Partial access'],
    [true, true, true, 'Web App, transcript & facsimile access', 'Full access']
  ])('summarizes compact access %#', async (explore, transcript, facsimile, label, tooltip) => {
    const wrapper = mountComponent({
      exploreGranted: explore,
      transcriptGranted: transcript,
      facsimileGranted: facsimile,
      compact: true
    })
    expect(wrapper.findAll('.compact-access-badge')).toHaveLength(1)
    expect(wrapper.findAllComponents(ContentItemAccessBadge)).toHaveLength(0)
    expect(wrapper.get('.compact-access-badge').text()).toBe('')
    expect(wrapper.get('.compact-access-badge').attributes('aria-label')).toBe(label)
    const dots = wrapper.findAll('.compact-access-badge__dot')
    expect(dots).toHaveLength(3)
    expect(dots.map(dot => dot.classes().includes('compact-access-badge__dot--granted'))).toEqual([
      explore,
      transcript,
      facsimile
    ])
    await wrapper.get('.info-button-trigger > div > div').trigger('mouseenter')
    expect(wrapper.get('[role="tooltip"]').text()).toBe(
      tooltip === 'No access' ? tooltip : `${tooltip}: ${label}`
    )
    wrapper.unmount()
  })

  it('updates the compact summary when access changes', async () => {
    const wrapper = mountComponent({
      exploreGranted: true,
      transcriptGranted: false,
      facsimileGranted: false,
      compact: true
    })
    await wrapper.setProps({ transcriptGranted: true, facsimileGranted: true })
    expect(wrapper.get('.compact-access-badge').attributes('aria-label')).toBe(
      'Web App, transcript & facsimile access'
    )
    await wrapper.get('.info-button-trigger > div > div').trigger('mouseenter')
    expect(wrapper.get('[role="tooltip"]').text()).toBe(
      'Full access: Web App, transcript & facsimile access'
    )
    wrapper.unmount()
  })

  it('opens combined guest-specific descriptions and supports keyboard activation', async () => {
    const wrapper = mountComponent({
      exploreGranted: true,
      transcriptGranted: false,
      facsimileGranted: true,
      compact: true
    })
    const trigger = wrapper.get('.info-button-trigger')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('keydown.enter')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    const popover = wrapper.get('.info-button-popover')
    expect(popover.text()).toContain('Web App: You can view this item')
    expect(popover.text()).toContain('Transcript: Log in or create an account')
    expect(popover.text()).toContain('Facsimile: You can view this item')
    await trigger.trigger('keydown.space')
    expect(wrapper.find('.info-button-popover').exists()).toBe(false)
    wrapper.unmount()
  })

  it('hides the hover tooltip when the popover opens', async () => {
    const wrapper = mountComponent({
      exploreGranted: true,
      transcriptGranted: false,
      facsimileGranted: false,
      compact: true
    })
    const anchor = wrapper.get('.info-button-trigger > div > div')
    await anchor.trigger('mouseenter')
    expect(wrapper.find('.b-tooltip').exists()).toBe(true)
    await wrapper.get('.compact-access-badge').trigger('click')
    expect(wrapper.find('.b-tooltip').exists()).toBe(false)
    expect(wrapper.find('.info-button-popover').exists()).toBe(true)
    await anchor.trigger('mouseleave')
    await anchor.trigger('mouseenter')
    expect(wrapper.find('.b-tooltip').exists()).toBe(false)
    await wrapper.get('.compact-access-badge').trigger('click')
    await anchor.trigger('mouseleave')
    await anchor.trigger('mouseenter')
    expect(wrapper.find('.b-tooltip').exists()).toBe(true)
    wrapper.unmount()
  })

  it('opens plan-specific descriptions for logged-in users and forwards teleport', async () => {
    user.userData = true
    const wrapper = mountComponent({
      exploreGranted: false,
      transcriptGranted: true,
      facsimileGranted: false,
      compact: true,
      teleport: true
    })
    await wrapper.get('.info-button-trigger').trigger('click')
    const popover = document.body.querySelector('.info-button-popover')
    expect(popover?.textContent).toContain('Web App: Your current user plan does not include')
    expect(popover?.textContent).toContain('Transcript: You can access and export')
    expect(popover?.textContent).toContain('Facsimile: Your current user plan does not include')
    wrapper.unmount()
  })

  it('keeps the existing individual badges by default', () => {
    const wrapper = mountComponent({
      exploreGranted: true,
      transcriptGranted: false,
      facsimileGranted: true,
      teleport: true
    })
    const badges = wrapper.findAllComponents(ContentItemAccessBadge)
    expect(badges).toHaveLength(3)
    expect(badges.map(badge => badge.props('granted'))).toEqual([true, false, true])
    expect(badges.every(badge => badge.props('teleport'))).toBe(true)
    expect(wrapper.find('.compact-access-badge').exists()).toBe(false)
    wrapper.unmount()
  })
})
