import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { MockUserSpecialMembershipRequestReviews } from '.storybook/mockData/specialMembership'
import SpecialMembershipRequestReviewItem from './SpecialMembershipRequestReviewItem.vue'
import type { SpecialMembershipRequestReviewItemProps } from './SpecialMembershipRequestReviewItem.vue'

const meta: Meta<typeof SpecialMembershipRequestReviewItem> = {
  title: 'lists/SpecialMembershipRequestReviewItem',
  component: SpecialMembershipRequestReviewItem,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        SpecialMembershipRequestReviewItem
      },
      template: `
        <div style="padding: 16px; max-width: 560px">
          <SpecialMembershipRequestReviewItem v-bind="args" />
        </div>
      `
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: {
    item: MockUserSpecialMembershipRequestReviews.find(item => item.status === 'pending')
  } as SpecialMembershipRequestReviewItemProps
}

export const Rejected: Story = {
  args: {
    item: MockUserSpecialMembershipRequestReviews.find(item => item.status === 'rejected')
  } as SpecialMembershipRequestReviewItemProps
}

/** A temporary grant, which also shows the expiry date. */
export const Temporary: Story = {
  args: {
    item: MockUserSpecialMembershipRequestReviews.find(item => item.status === 'temporary')
  } as SpecialMembershipRequestReviewItemProps
}

/** The requester left the affiliation field empty. */
export const WithoutAffiliation: Story = {
  args: {
    item: {
      ...MockUserSpecialMembershipRequestReviews[0],
      requester: {
        ...MockUserSpecialMembershipRequestReviews[0].requester,
        profile: {
          ...MockUserSpecialMembershipRequestReviews[0].requester.profile,
          affiliation: ''
        }
      }
    }
  } as SpecialMembershipRequestReviewItemProps
}
