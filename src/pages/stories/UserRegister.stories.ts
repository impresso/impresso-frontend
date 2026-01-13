import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UserRegister from '../UserRegister.vue'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof UserRegister> = {
  title: 'Pages/UserRegister',
  component: UserRegister,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { UserRegister },
      template: `
        <div style="min-height: 100vh; width: 100%; background-color: #f8f9fa;">
          <UserRegister v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [
        // Mock successful user creation
        http.post('/api/users', async ({ request }) => {
          await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
          const body = await request.json()
          return HttpResponse.json({
            uid: 'test-user-123',
            email: body.email,
            firstname: body.firstname,
            lastname: body.lastname,
            username: body.username,
            plan: body.plan,
            isActive: false,
            isStaff: false,
            groups: []
          })
        })
      ]
    }
  }
} satisfies Meta<typeof UserRegister>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    allowUploadOfNDA: false
  }
}

export const WithConflictError: Story = {
  args: {
    allowUploadOfNDA: false
  },
  parameters: {
    msw: {
      handlers: [
        // Mock username conflict error
        http.post('/api/users', async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json(
            {
              name: 'Conflict',
              message: 'auth_user.username already exists',
              code: 409,
              className: 'conflict',
              errors: {}
            },
            { status: 409 }
          )
        })
      ]
    }
  }
}

export const WithNetworkError: Story = {
  args: {
    allowUploadOfNDA: false
  },
  parameters: {
    msw: {
      handlers: [
        // Mock network error
        http.post('/api/users', async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json(
            {
              name: 'GeneralError',
              message: 'Network error occurred',
              code: 500,
              className: 'general-error',
              errors: {}
            },
            { status: 500 }
          )
        })
      ]
    }
  }
}
