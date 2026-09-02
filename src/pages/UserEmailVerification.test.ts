import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockCreate, mockResendCreate, mockRoute } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockResendCreate: vi.fn(),
  mockRoute: {
    query: {} as Record<string, string | string[] | undefined>
  }
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

vi.mock('@/services', () => ({
  userEmailVerification: {
    create: mockCreate
  },
  userEmailVerificationResend: {
    create: mockResendCreate
  }
}))

import UserEmailVerification from './UserEmailVerification.vue'

function mountComponent() {
  return mount(UserEmailVerification, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })
}

describe('UserEmailVerification', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockCreate.mockReset()
    mockResendCreate.mockReset()
  })

  it('shows success when the token is present and the service returns ok', async () => {
    mockRoute.query = { token: 'abc123' }
    mockCreate.mockResolvedValue({ result: 'ok' })

    const wrapper = mountComponent()
    await flushPromises()

    expect(mockCreate).toHaveBeenCalledWith({ token: 'abc123' }, { ignoreErrors: true })
    expect(wrapper.text()).toContain('successMessage')
    expect(wrapper.text()).not.toContain('errorMessage')
  })

  it('shows a generic error when the token is missing', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    expect(mockCreate).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('errorMessage')
    expect(wrapper.find('[data-testid="verification-resend-email-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="verification-resend-button"]').exists()).toBe(true)
  })

  it('does not call verification endpoint when token is blank or whitespace', async () => {
    mockRoute.query = { token: '   ' }

    const wrapper = mountComponent()
    await flushPromises()

    expect(mockCreate).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('errorMessage')
  })

  it('shows a generic error when the service rejects', async () => {
    mockRoute.query = { token: 'abc123' }
    mockCreate.mockRejectedValue(new Error('boom'))

    const wrapper = mountComponent()
    await flushPromises()

    expect(mockCreate).toHaveBeenCalledWith({ token: 'abc123' }, { ignoreErrors: true })
    expect(wrapper.text()).toContain('errorMessage')
  })

  it('resends verification email when user enters a valid email and backend responds ok', async () => {
    mockRoute.query = { token: 'abc123' }
    mockCreate.mockRejectedValue(new Error('invalid token'))
    mockResendCreate.mockResolvedValue({ result: 'ok' })

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper
      .get('[data-testid="verification-resend-email-input"]')
      .setValue('user@example.org')
    await wrapper.get('[data-testid="verification-resend-button"]').trigger('click')
    await flushPromises()

    expect(mockResendCreate).toHaveBeenCalledWith(
      { email: 'user@example.org' },
      { ignoreErrors: true }
    )
    expect(wrapper.text()).toContain('resendSuccessMessage')
  })

  it('shows wait state and disables resend button when backend responds with wait', async () => {
    mockRoute.query = { token: 'abc123' }
    mockCreate.mockRejectedValue(new Error('invalid token'))
    mockResendCreate.mockResolvedValue({ result: 'wait', retryAfterSeconds: 42 })

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper
      .get('[data-testid="verification-resend-email-input"]')
      .setValue('user@example.org')
    await wrapper.get('[data-testid="verification-resend-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('resendWaitMessage')
    expect(
      wrapper.get('[data-testid="verification-resend-button"]').attributes('disabled')
    ).toBeDefined()
  })

  it('shows resend error when resend endpoint rejects', async () => {
    mockRoute.query = { token: 'abc123' }
    mockCreate.mockRejectedValue(new Error('invalid token'))
    mockResendCreate.mockRejectedValue(new Error('server error'))

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper
      .get('[data-testid="verification-resend-email-input"]')
      .setValue('user@example.org')
    await wrapper.get('[data-testid="verification-resend-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('resendErrorMessage')
  })

  it('blocks resend call when email is invalid', async () => {
    mockRoute.query = { token: 'abc123' }
    mockCreate.mockRejectedValue(new Error('invalid token'))

    const wrapper = mountComponent()
    await flushPromises()

    await wrapper.get('[data-testid="verification-resend-email-input"]').setValue('not-an-email')
    await wrapper.get('[data-testid="verification-resend-button"]').trigger('click')
    await flushPromises()

    expect(mockResendCreate).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('invalidEmailMessage')
  })
})
