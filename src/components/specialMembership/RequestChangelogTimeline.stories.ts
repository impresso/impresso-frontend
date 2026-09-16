import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { MockUserSpecialMembershipRequestReviews } from '.storybook/mockData/specialMembership'
import RequestChangelogTimeline from './RequestChangelogTimeline.vue'
import type { RequestChangelogTimelineProps } from './RequestChangelogTimeline.vue'

const meta: Meta<typeof RequestChangelogTimeline> = {
  title: 'specialMembership/RequestChangelogTimeline',
  component: RequestChangelogTimeline,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestChangelogTimeline
      },
      template: `
        <div style="padding: 16px; max-width: 480px">
          <RequestChangelogTimeline v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    changelog: MockUserSpecialMembershipRequestReviews[0].changelog
  } as RequestChangelogTimelineProps
}

export const OldestFirst: Story = {
  args: {
    changelog: MockUserSpecialMembershipRequestReviews[0].changelog,
    newestFirst: false
  } as RequestChangelogTimelineProps
}

/** A request that has not been touched since it was created. */
export const Empty: Story = {
  args: {
    changelog: []
  } as RequestChangelogTimelineProps
}
