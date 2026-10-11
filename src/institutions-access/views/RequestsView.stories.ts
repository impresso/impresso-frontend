import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'
import {
  findEmpty,
  findUserSpecialMembershipRequestsReviewsHandler,
  patchUserSpecialMembershipRequestsReviewHandler
} from '.storybook/mswHandlers'
import RequestsView from './RequestsView.vue'
import type { RequestsViewProps } from './RequestsView.vue'
import { RoutesByRequestStatus } from '../router/routes'

/** The status tabs are links, so all status routes have to resolve. */
const statusRoutes = [
  ...RoutesByRequestStatus.map(([, path, name]) => ({
    path,
    name,
    component: () => Promise.resolve({ template: '<div />' })
  })),
  {
    path: '/special-membership-request/:id',
    name: 'SpecialMembershipRequest',
    component: () => Promise.resolve({ template: '<div />' })
  }
]

const meta: Meta<typeof RequestsView> = {
  title: 'institutions-access/views/RequestsView',
  component: RequestsView,
  tags: ['autodocs'],
  decorators: [vueRouter(statusRoutes)],
  render: args => {
    return {
      setup() {
        return { args }
      },
      components: {
        RequestsView
      },
      template: `
        <div style="padding: 16px; background: var(--impresso-color-paper); min-height: 100vh">
          <RequestsView v-bind="args" />
        </div>
      `
    }
  },
  parameters: {
    msw: {
      handlers: [
        findUserSpecialMembershipRequestsReviewsHandler,
        patchUserSpecialMembershipRequestsReviewHandler
      ]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const AllRequests: Story = {
  args: {
    status: 'all'
  } as RequestsViewProps
}

export const PendingRequests: Story = {
  args: {
    status: 'pending'
  } as RequestsViewProps
}

/** An unknown status falls back to the unfiltered list. */
export const UnknownStatus: Story = {
  args: {
    status: 'not-a-status'
  } as RequestsViewProps
}

export const EmptyQueue: Story = {
  args: {
    status: 'revoked'
  } as RequestsViewProps,
  parameters: {
    msw: {
      handlers: [findEmpty(findUserSpecialMembershipRequestsReviewsHandler)]
    }
  }
}
