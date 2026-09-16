import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { http, HttpResponse } from 'msw'
import { vueRouter } from 'storybook-vue3-router'
import { emailTemplatesHandlers } from '.storybook/mswHandlers'
import EmailTemplatesView from './EmailTemplatesView.vue'
import type { EmailTemplatesViewProps } from './EmailTemplatesView.vue'
import {
  createHttpEmailTemplatesClient,
  createLocalEmailTemplatesClient
} from '../services/emailTemplates'

const meta: Meta<typeof EmailTemplatesView> = {
  title: 'institutions-access/views/EmailTemplatesView',
  component: EmailTemplatesView,
  tags: ['autodocs'],
  decorators: [vueRouter()],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        EmailTemplatesView
      },
      template: `
        <div style="padding: 16px; background: var(--impresso-color-paper); min-height: 100vh">
          <EmailTemplatesView v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: emailTemplatesHandlers
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * How the app runs today: the auto-reply fragment is seeded from the default
 * and edits are kept in `localStorage`.
 */
export const LocalStorageClient: Story = {
  args: {
    client: createLocalEmailTemplatesClient({ delay: 0 })
  } as EmailTemplatesViewProps
}

/**
 * The HTTP client against the mocked `email-templates` endpoint, which is the
 * contract the backend is expected to implement.
 */
export const HttpClient: Story = {
  args: {
    client: createHttpEmailTemplatesClient()
  } as EmailTemplatesViewProps
}

export const LoadFailed: Story = {
  args: {
    client: createHttpEmailTemplatesClient()
  } as EmailTemplatesViewProps,
  parameters: {
    msw: {
      handlers: [
        http.get('/api/email-templates/:id', () =>
          HttpResponse.json({ error: 'Service unavailable' }, { status: 503 })
        )
      ]
    }
  }
}
