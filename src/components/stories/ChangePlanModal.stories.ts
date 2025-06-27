import type { Meta, StoryObj } from '@storybook/vue3'
import ChangePlanModal from '@/components/ChangePlanModal.vue'
import { AvailablePlans, PlanLabels } from '@/constants'
import { UserChangePlanRequest } from '@/services/types'
import type { ChangePlanModalProps } from '@/components/ChangePlanModal.vue'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof ChangePlanModal> = {
  title: 'Components/ChangePlanModal',
  component: ChangePlanModal,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { ChangePlanModal },
      template:
        '<div style="height: 400px; width: 100%"><ChangePlanModal v-bind="args">Test</ChangePlanModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { show: true, title: 'Change your plan' } as ChangePlanModalProps,
  parameters: {
    msw: {
      handlers: {
        userChangePlanRequest: http.get('/api/user-change-plan-request', () => {
          return HttpResponse.json({ message: 'NotFound', code: 404 }, { status: 404 })
        })
      }
    }
  }
}
export const WithPendingRequest: Story = {
  args: {
    show: true,
    title: 'Change your plan'
  } as ChangePlanModalProps
}

export const WithRejectedRequest: Story = {
  args: {
    title: 'Change your plan',
    show: true
  },
  parameters: {
    msw: {
      handlers: {
        userChangePlanRequest: http.get('/api/user-change-plan-request', () => {
          return HttpResponse.json({
            id: 1,
            plan: {
              id: 2,
              name: AvailablePlans[1]
            },
            status: 'rejected',
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            changelog: []
          } as UserChangePlanRequest)
        })
      }
    }
  }
}

export const WithApprovedRequest: Story = {
  args: {
    title: 'Change your plan',
    show: true
  },
  parameters: {
    msw: {
      handlers: {
        userChangePlanRequest: http.get('/api/user-change-plan-request', () => {
          return HttpResponse.json({
            id: 1,
            plan: {
              id: 2,
              name: AvailablePlans[1]
            },
            status: 'approved',
            dateCreated: new Date().toISOString(),
            dateLastModified: new Date().toISOString(),
            changelog: []
          } as UserChangePlanRequest)
        })
      }
    }
  }
}
