import type { Meta, StoryObj } from '@storybook/vue3'
import ChangePlanModal from '@/components/ChangePlanModal.vue'
import { ref } from 'vue'
import { AvailablePlans, PlanLabels } from '@/constants'
import { UserChangePlanRequest } from '@/services/types'

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
        '<div style="height: 400px; width: 100%"><ChangePlanModal v-bind="args"></ChangePlanModal></div>'
    }
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    availablePlans: AvailablePlans,
    availablePlansLabels: PlanLabels,
    userPlan: AvailablePlans[0],
    isVisible: true,
    isLoading: true,
    title: 'Change your plan'
  }
}
export const WithPendingRequest: Story = {
  args: {
    availablePlans: AvailablePlans,
    availablePlansLabels: PlanLabels,
    userPlan: AvailablePlans[0],
    isVisible: true,
    isLoading: false,
    title: 'Change your plan',
    userChangePlanRequest: {
      id: 1,
      plan: {
        id: 2,
        name: AvailablePlans[1]
      },
      status: 'pending',
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
      changelog: []
    } as UserChangePlanRequest
  }
}

export const WithRejectedRequest: Story = {
  args: {
    availablePlans: AvailablePlans,
    availablePlansLabels: PlanLabels,
    userPlan: AvailablePlans[0],
    isVisible: true,
    isLoading: false,
    title: 'Change your plan',
    userChangePlanRequest: {
      id: 1,
      plan: {
        id: 2,
        name: AvailablePlans[1]
      },
      status: 'rejected',
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
      changelog: []
    } as UserChangePlanRequest
  }
}

export const WithApprovedRequest: Story = {
  args: {
    availablePlans: AvailablePlans,
    availablePlansLabels: PlanLabels,
    userPlan: AvailablePlans[1],
    isVisible: true,
    isLoading: false,
    title: 'Change your plan',
    userChangePlanRequest: {
      id: 1,
      plan: {
        id: 2,
        name: AvailablePlans[1]
      },
      status: 'approved',
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
      changelog: []
    } as UserChangePlanRequest
  }
}
