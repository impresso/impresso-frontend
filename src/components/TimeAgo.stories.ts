import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TimeAgo from './TimeAgo.vue'
import type { TimeAgoProps } from './TimeAgo.vue'
import { MockUserSpecialMembershipRequests } from '.storybook/mockData/specialMembership'
import {
  findSpecialMembershipAccessHandler,
  findUserSpecialMembershipRequestsHandler
} from '.storybook/mswHandlers'

const meta: Meta<typeof TimeAgo> = {
  title: 'components/TimeAgo',
  component: TimeAgo,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: { TimeAgo },
      template: '<div style="height: 500px; width: 100%"><TimeAgo v-bind="args"></TimeAgo></div>'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    date: new Date()
  } as TimeAgoProps
}
export const withISOString: Story = {
  args: {
    date: new Date().toISOString()
  } as TimeAgoProps
}

export const OneMinuteAgo: Story = {
  args: {
    date: new Date(Date.now() - 60000)
  } as TimeAgoProps
}

export const FiveMinutesAgo: Story = {
  args: {
    date: new Date(Date.now() - 5 * 60000)
  } as TimeAgoProps
}

export const OneHourAgo: Story = {
  args: {
    date: new Date(Date.now() - 60 * 60000)
  } as TimeAgoProps
}

export const OneDayAgo: Story = {
  args: {
    date: new Date(Date.now() - 24 * 60 * 60000)
  } as TimeAgoProps
}

export const OneWeekAgo: Story = {
  args: {
    date: new Date(Date.now() - 7 * 24 * 60 * 60000)
  } as TimeAgoProps
}
