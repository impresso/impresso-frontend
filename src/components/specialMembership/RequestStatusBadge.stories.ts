import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { SpecialMembershipRequestStatuses } from '@/constants'
import RequestStatusBadge from './RequestStatusBadge.vue'
import type { RequestStatusBadgeProps } from './RequestStatusBadge.vue'

const meta: Meta<typeof RequestStatusBadge> = {
  title: 'specialMembership/RequestStatusBadge',
  component: RequestStatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: SpecialMembershipRequestStatuses
    }
  },
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestStatusBadge
      },
      template: `
        <div style="padding: 16px">
          <RequestStatusBadge v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: {
    status: 'pending'
  } as RequestStatusBadgeProps
}

export const Approved: Story = {
  args: {
    status: 'approved'
  } as RequestStatusBadgeProps
}

export const Rejected: Story = {
  args: {
    status: 'rejected'
  } as RequestStatusBadgeProps
}

/** Every status side by side, to check the variants stay distinguishable. */
export const AllStatuses: Story = {
  render: () => {
    return {
      setup() {
        return { statuses: SpecialMembershipRequestStatuses }
      },
      components: {
        RequestStatusBadge
      },
      template: `
        <div style="padding: 16px; display: flex; gap: 8px; flex-wrap: wrap">
          <RequestStatusBadge v-for="status in statuses" :key="status" :status="status" />
        </div>
      `
    }
  }
}
