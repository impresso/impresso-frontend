import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import {
  findEmpty,
  findUserSpecialMembershipRequestsReviewsHandler
} from '.storybook/mswHandlers'
import RequestsTable from './RequestsTable.vue'
import type { RequestsTableProps } from './RequestsTable.vue'

const meta: Meta<typeof RequestsTable> = {
  title: 'institutions-access/requests/RequestsTable',
  component: RequestsTable,
  tags: ['autodocs'],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestsTable
      },
      template: `
        <div style="padding: 16px; background: #f5f4f3">
          <div class="bg-white">
            <RequestsTable v-bind="args">
              <template #actions>
                <button class="btn btn-sm btn-outline-secondary">Review</button>
              </template>
            </RequestsTable>
          </div>
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [findUserSpecialMembershipRequestsReviewsHandler]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  service: userSpecialMembershipRequestsReviewsService,
  emptyMessage: 'No requests yet.',
  errorMessage: 'Requests could not be loaded.'
}

export const Default: Story = {
  args: {
    ...baseArgs,
    params: { query: { limit: 25, offset: 0, order_by: '-dateLastModified', term: '' } }
  } as RequestsTableProps
}

/** Filtered to a single status, the way a status route renders it. */
export const PendingOnly: Story = {
  args: {
    ...baseArgs,
    params: {
      query: { limit: 25, offset: 0, order_by: '-dateLastModified', term: '', status: ['pending'] }
    }
  } as RequestsTableProps
}

export const Empty: Story = {
  args: {
    ...baseArgs,
    params: { query: { limit: 25, offset: 0, order_by: '-dateLastModified', term: '' } }
  } as RequestsTableProps,
  parameters: {
    msw: {
      handlers: [findEmpty(findUserSpecialMembershipRequestsReviewsHandler)]
    }
  }
}
