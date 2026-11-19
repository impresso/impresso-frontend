import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { MockUserSpecialMembershipRequestReviews } from '.storybook/mockData/specialMembership'
import RequestRow from './RequestRow.vue'
import type { RequestRowProps } from './RequestRow.vue'

const meta: Meta<typeof RequestRow> = {
  title: 'institutions-access/requests/RequestRow',
  component: RequestRow,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestRow
      },
      template: `
        <div class="container-fluid" style="padding: 0; background: #fff; max-width: 1100px">
          <RequestRow v-bind="args">
            <template #actions>
              <button class="btn btn-sm btn-outline-secondary">Review</button>
            </template>
          </RequestRow>
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
  } as RequestRowProps
}

/** The detail area holds the notes and the full review history. */
export const Expanded: Story = {
  args: {
    item: MockUserSpecialMembershipRequestReviews.find(item => item.status === 'approved'),
    initiallyExpanded: true
  } as RequestRowProps
}

/** Temporary access shows its expiry date in the dates column. */
export const Temporary: Story = {
  args: {
    item: MockUserSpecialMembershipRequestReviews.find(item => item.status === 'temporary')
  } as RequestRowProps
}

/** A request with no notes and no history yet. */
export const WithoutHistory: Story = {
  args: {
    item: {
      ...MockUserSpecialMembershipRequestReviews[0],
      notes: '',
      changelog: []
    },
    initiallyExpanded: true
  } as RequestRowProps
}
