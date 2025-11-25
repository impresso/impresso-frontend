import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SpecialMembershipButton from './SpecialMembershipButton.vue'
import type { SpecialMembershipButtonProps } from './SpecialMembershipButton.vue'
import { MockUserSpecialMembershipRequests } from '.storybook/mockData/specialMembership'
import {
  findSpecialMembershipAccessHandler,
  findUserSpecialMembershipRequestsHandler
} from '.storybook/mswHandlers'

const meta: Meta<typeof SpecialMembershipButton> = {
  title: 'specialMembership/SpecialMembershipButton',
  component: SpecialMembershipButton,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { SpecialMembershipButton },
      template:
        '<div style="height: 500px; width: 100%"><SpecialMembershipButton v-bind="args"></SpecialMembershipButton></div>'
    }
  },
  parameters: {
    msw: {
      handlers: [findUserSpecialMembershipRequestsHandler, findSpecialMembershipAccessHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    item: MockUserSpecialMembershipRequests[1].specialMembershipAccess
  } as SpecialMembershipButtonProps
}

export const withoutItem: Story = {
  args: {} as SpecialMembershipButtonProps
}
