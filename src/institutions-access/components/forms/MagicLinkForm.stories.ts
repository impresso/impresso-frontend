import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MagicLinkForm from './MagicLinkForm.vue'
import type { MagicLinkFormProps } from './MagicLinkForm.vue'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof MagicLinkForm> = {
  title: 'institutions-access/forms/MagicLinkForm',
  component: MagicLinkForm,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        MagicLinkForm
      },
      template: `
        <div style="width: 100%; max-width: 500px; margin: 0 auto;">
          <MagicLinkForm v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/api/magic-link/:token', async ({ params }) => {
          const { token } = params
          // Simulate token validation - only allow tokens starting with 'valid'
          if (token === 'valid-token-example') {
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
            return HttpResponse.json({
              id: 'token-id-123',
              token: token,
              verified: true,
              email: 'user@example.com'
            })
          }
          return HttpResponse.json(null, { status: 404 })
        })
      ]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default state of the Magic Link Form
 */
export const Default: Story = {
  args: {
    className: ''
  } as MagicLinkFormProps
}

/**
 * Magic Link Form with custom styling
 */
export const WithCustomClass: Story = {
  args: {
    className: 'custom-form-class'
  } as MagicLinkFormProps
}
