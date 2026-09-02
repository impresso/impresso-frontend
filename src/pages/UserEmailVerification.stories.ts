import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { userEvent, within } from 'storybook/test'

import UserEmailVerification from '@/pages/UserEmailVerification.vue'

const verifyOkHandler = http.post('/api/user-email-verification', async () => {
  return HttpResponse.json({ result: 'ok' })
})

const verifyErrorHandler = http.post('/api/user-email-verification', async () => {
  return HttpResponse.json(
    { name: 'GeneralError', message: 'Verification failed' },
    { status: 500 }
  )
})

const resendOkHandler = http.post('/api/user-email-verification-resend', async () => {
  return HttpResponse.json({ result: 'ok' })
})

const resendWaitHandler = http.post('/api/user-email-verification-resend', async () => {
  return HttpResponse.json({
    result: 'wait',
    retryAfterSeconds: 120
  })
})

const resendErrorHandler = http.post('/api/user-email-verification-resend', async () => {
  return HttpResponse.json({ name: 'GeneralError', message: 'Resend failed' }, { status: 500 })
})

const installRouter = async (initialQuery: Record<string, string> = {}) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/user/email-verification',
        name: 'userEmailVerification',
        component: UserEmailVerification
      }
    ]
  })

  await router.replace({
    name: 'userEmailVerification',
    query: initialQuery
  })
  await router.isReady()

  return router
}

const withRouter = (initialQuery: Record<string, string>) => {
  return (story: () => unknown) => ({
    components: { Story: story() },
    async setup() {
      setActivePinia(createPinia())
      const router = await installRouter(initialQuery)
      return { router }
    },
    template: '<Story />'
  })
}

const fillEmailAndClickResend = async (canvasElement: HTMLElement, email: string) => {
  const canvas = within(canvasElement)
  const emailInput = canvas.getByTestId('verification-resend-email-input').querySelector('input')
  if (!emailInput) {
    throw new Error('Resend email input was not found in story canvas')
  }

  await userEvent.clear(emailInput)
  await userEvent.type(emailInput, email)
  await userEvent.click(canvas.getByTestId('verification-resend-button'))
}

const meta: Meta<typeof UserEmailVerification> = {
  title: 'Pages/UserEmailVerification',
  component: UserEmailVerification,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  render: () => ({
    components: { UserEmailVerification },
    template: '<UserEmailVerification />'
  })
}

export default meta
type Story = StoryObj<typeof meta>

export const VerifySuccess: Story = {
  decorators: [withRouter({ token: 'valid-token' })],
  parameters: {
    msw: {
      handlers: [verifyOkHandler]
    }
  }
}

export const VerificationError: Story = {
  decorators: [withRouter({ token: 'invalid-token' })],
  parameters: {
    msw: {
      handlers: [verifyErrorHandler]
    }
  }
}

export const ResendSuccess: Story = {
  decorators: [withRouter({ token: 'invalid-token' })],
  parameters: {
    msw: {
      handlers: [verifyErrorHandler, resendOkHandler]
    }
  },
  play: async ({ canvasElement }) => {
    await fillEmailAndClickResend(canvasElement, 'user@example.org')
  }
}

export const ResendWait: Story = {
  decorators: [withRouter({ token: 'invalid-token' })],
  parameters: {
    msw: {
      handlers: [verifyErrorHandler, resendWaitHandler]
    }
  },
  play: async ({ canvasElement }) => {
    await fillEmailAndClickResend(canvasElement, 'user@example.org')
  }
}

export const ResendServerError: Story = {
  decorators: [withRouter({ token: 'invalid-token' })],
  parameters: {
    msw: {
      handlers: [verifyErrorHandler, resendErrorHandler]
    }
  },
  play: async ({ canvasElement }) => {
    await fillEmailAndClickResend(canvasElement, 'user@example.org')
  }
}
