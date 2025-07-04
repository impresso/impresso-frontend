import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse } from 'msw'
import AuthGate from './AuthGate.vue'
import { useUserStore } from '@/stores/user'

// Create MSW handlers for authentication states
const getMeHandlers = {
  authenticated: http.get('/api/me', () => {
    return HttpResponse.json({
      uid: 'user-1',
      username: 'testuser',
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      isActive: true,
      groups: [
        {
          name: 'ImpressoUser',
          label: 'Impresso User'
        }
      ],
      pattern: 'circuit-board',
      picture: 'https://avatars.githubusercontent.com/u/1234567'
    })
  }),
  unauthenticated: http.get('/api/me', () => {
    return HttpResponse.json({}, { status: 401 })
  })
}

const collectErrors = http.post('/api/errors-collector', () => {
  return HttpResponse.json({})
})

const meta = {
  title: 'Components/AuthGate',
  component: AuthGate,
  tags: ['autodocs'],
  decorators: [() => ({ template: '<div style="max-width: 600px;"><story /></div>' })],
  argTypes: {
    authenticated: {
      control: 'boolean',
      description: 'Whether the user is authenticated or not'
    }
  },
  args: {
    authenticated: false
  },
  parameters: {
    msw: {
      handlers: [getMeHandlers.unauthenticated, collectErrors]
    }
  }
} satisfies Meta<typeof AuthGate>

export default meta
type Story = StoryObj<typeof meta>

export const Unauthenticated: Story = {
  render: () => ({
    setup() {
      const userStore = useUserStore()
      userStore.$reset() // 👈 resets to initial state
      userStore.refreshUser().catch(() => {})
      return {}
    },
    components: { AuthGate },
    template: `
      <AuthGate>
        <template #authenticated>
          <div style="padding: 20px; background-color: #e6f7ff; border-radius: 4px;">
            <h3>Authenticated Content</h3>
            <p>This content is only visible to authenticated users.</p>
          </div>
        </template>
        <template #unauthenticated>
          <div style="padding: 20px; background-color: #fff1f0; border-radius: 4px;">
            <h3>Unauthenticated Content</h3>
            <p>This content is only visible to guests. Please sign in to see authenticated content.</p>
          </div>
        </template>
      </AuthGate>
    `
  }),
  parameters: {
    msw: {
      handlers: [getMeHandlers.unauthenticated, collectErrors]
    }
  }
}

export const Authenticated: Story = {
  ...Unauthenticated,
  parameters: {
    msw: {
      handlers: [getMeHandlers.authenticated, collectErrors]
    }
  }
}
