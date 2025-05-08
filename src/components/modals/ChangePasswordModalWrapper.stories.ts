import type { Meta, StoryObj } from '@storybook/vue3'
import ChangePasswordModalWrapper from '@/components/modals/ChangePasswordModalWrapper.vue'
import type { ChangePasswordModalWrapperProps } from '@/components/modals/ChangePasswordModalWrapper.vue'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof ChangePasswordModalWrapper> = {
  title: 'modals/ChangePasswordModalWrapper',
  component: ChangePasswordModalWrapper,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ChangePasswordModalWrapper },
      template:
        '<div style="height: 500px; width: 100%"><ChangePasswordModalWrapper v-bind="args"></ChangePasswordModalWrapper></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    delay: 2000,
    isVisible: true
  } as ChangePasswordModalWrapperProps,
  parameters: {
    msw: {
      handlers: [
        // Mock the API response for the change password request
        http.post('/api/change-password', () => {
          console.log('Change password request received:')
          return HttpResponse.json({}, { status: 200 })
        }),
        http.post('/api/errors-collector', () => {
          console.log('Error collector request received:')
          return HttpResponse.json({})
        })
      ]
    }
  }
}

export const WithBadRequest: Story = {
  args: {
    delay: 2000,
    isVisible: true
  } as ChangePasswordModalWrapperProps,
  parameters: {
    msw: {
      handlers: [
        // Mock the API response for the change password request
        http.post('/api/change-password', () => {
          console.log('Current password is not correct for the user')
          return HttpResponse.json(
            {
              name: 'BadRequest',
              message: 'Previous password is incorrect',
              code: 400,
              className: 'bad-request'
            },
            { status: 400 }
          )
        })
      ]
    }
  }
}
